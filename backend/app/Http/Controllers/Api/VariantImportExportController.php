<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VariantImportExportController extends Controller
{
    /**
     * Export variants as CSV with optional filters.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = ProductVariant::with('product:id,name');

        // Apply filters
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int)$request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int)$request->max_price);
        }

        $variants = $query->orderBy('product_id')->orderBy('id')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="variants_export_' . now()->format('Y-m-d_His') . '.csv"',
        ];

        return response()->stream(function () use ($variants) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'id', 'product_id', 'product_name', 'sku', 'name',
                'price', 'sale_price', 'cost_price', 'stock_quantity',
                'low_stock_threshold', 'barcode', 'manufacturer_code',
                'weight', 'is_active', 'attributes',
            ]);

            foreach ($variants as $variant) {
                fputcsv($handle, [
                    $variant->id,
                    $variant->product_id,
                    $variant->product?->name ?? '',
                    $variant->sku,
                    $variant->name ?? '',
                    $variant->price,
                    $variant->sale_price ?? '',
                    $variant->cost_price ?? '',
                    $variant->stock_quantity,
                    $variant->low_stock_threshold ?? 10,
                    $variant->barcode ?? '',
                    $variant->manufacturer_code ?? '',
                    $variant->weight ?? '',
                    $variant->is_active ? '1' : '0',
                    json_encode($variant->attributes ?? []),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Import variants from CSV — validates and returns preview or commits.
     *
     * Step 1: POST with file + preview=true → returns parsed rows with errors
     * Step 2: POST with file + preview=false → commits valid rows
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'preview' => 'sometimes|boolean',
        ]);

        $preview = $request->boolean('preview', true);
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!$handle) {
            return response()->json(['success' => false, 'message' => 'Cannot read file.'], 400);
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            return response()->json(['success' => false, 'message' => 'Empty CSV file.'], 400);
        }

        // Normalise headers
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);
        $requiredHeaders = ['sku', 'price', 'stock_quantity'];
        $missing = array_diff($requiredHeaders, $headers);
        if (!empty($missing)) {
            fclose($handle);
            return response()->json([
                'success' => false,
                'message' => 'Missing required columns: ' . implode(', ', $missing),
            ], 422);
        }

        $rows = [];
        $errors = [];
        $rowNumber = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $rowNumber++;
            $row = array_combine($headers, $data);

            $validator = Validator::make($row, [
                'sku' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'product_id' => 'sometimes|exists:products,id',
                'sale_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'name' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $rowNumber,
                    'sku' => $row['sku'] ?? 'unknown',
                    'errors' => $validator->errors()->toArray(),
                ];
                continue;
            }

            $rows[] = $row;
        }
        fclose($handle);

        // Preview mode — return parsed data and errors
        if ($preview) {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_rows' => count($rows) + count($errors),
                    'valid_rows' => count($rows),
                    'error_rows' => count($errors),
                    'errors' => $errors,
                    'preview' => array_slice($rows, 0, 20),
                ],
            ]);
        }

        // Commit mode — insert/update variants
        $created = 0;
        $updated = 0;

        DB::transaction(function () use ($rows, &$created, &$updated) {
            foreach ($rows as $row) {
                $existing = ProductVariant::where('sku', $row['sku'])->first();

                $data = [
                    'price' => (int)$row['price'],
                    'stock_quantity' => (int)$row['stock_quantity'],
                    'sale_price' => isset($row['sale_price']) && $row['sale_price'] !== '' ? (int)$row['sale_price'] : null,
                    'cost_price' => isset($row['cost_price']) && $row['cost_price'] !== '' ? (int)$row['cost_price'] : null,
                    'name' => $row['name'] ?? null,
                    'barcode' => $row['barcode'] ?? null,
                    'manufacturer_code' => $row['manufacturer_code'] ?? null,
                ];

                if ($existing) {
                    $existing->update($data);
                    $updated++;
                } elseif (isset($row['product_id'])) {
                    ProductVariant::create(array_merge($data, [
                        'sku' => $row['sku'],
                        'product_id' => (int)$row['product_id'],
                        'attributes' => json_decode($row['attributes'] ?? '{}', true) ?: [],
                    ]));
                    $created++;
                }
            }
        });

        // Log the import
        DB::table('import_logs')->insert([
            'filename' => $file->getClientOriginalName(),
            'status' => 'completed',
            'total_rows' => count($rows) + count($errors),
            'success_count' => $created + $updated,
            'error_count' => count($errors),
            'user_id' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Import complete: {$created} created, {$updated} updated, " . count($errors) . " errors.",
            'data' => [
                'created' => $created,
                'updated' => $updated,
                'errors' => $errors,
            ],
        ]);
    }
}
