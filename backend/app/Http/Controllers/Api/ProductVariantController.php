<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\Product\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use App\Models\VariantCostBreakdown;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductVariantController extends Controller
{
    /**
     * Get attributes for variant creation
     */
    public function attributes(): JsonResponse
    {
        $attributes = ProductAttribute::active()
            ->with('options')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attributes,
        ]);
    }

    /**
     * Get variants for a product
     */
    public function index(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $variants = $product->variants()->active()->get();

        return response()->json([
            'success' => true,
            'data' => $variants,
        ]);
    }

    /**
     * Create a new variant
     */
    public function store(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'sku' => 'required|string|unique:product_variants,sku',
            'name' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'attributes' => 'required|array',
            'image' => 'nullable|string',
            'weight' => 'nullable|numeric|min:0',
        ]);

        $variant = $product->variants()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Variant created successfully',
            'data' => $variant,
        ], 201);
    }

    /**
     * Update a variant
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $variant = ProductVariant::findOrFail($id);

        $validated = $request->validate([
            'sku' => 'sometimes|string|unique:product_variants,sku,' . $id,
            'name' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'attributes' => 'sometimes|array',
            'image' => 'nullable|string',
            'weight' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $variant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Variant updated successfully',
            'data' => $variant,
        ]);
    }

    /**
     * Delete a variant
     */
    public function destroy(int $id): JsonResponse
    {
        $variant = ProductVariant::findOrFail($id);
        $variant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Variant deleted successfully',
        ]);
    }

    /**
     * Bulk update variant stock
     */
    public function bulkUpdateStock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.change' => 'required|integer',
            'variants.*.reason' => 'required|string',
        ]);

        foreach ($validated['variants'] as $item) {
            $variant = ProductVariant::findOrFail($item['id']);
            $variant->adjustStock($item['change'], $item['reason'], null, auth()->id());
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
        ]);
    }

    /**
     * Bulk update price
     */
    public function bulkUpdatePrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.price' => 'required|integer|min:0',
            'variants.*.sale_price' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['variants'] as $item) {
                $variant = ProductVariant::findOrFail($item['id']);

                // Record price history before updating
                if ($variant->price !== $item['price']) {
                    DB::table('price_history')->insert([
                        'variant_id' => $variant->id,
                        'old_price' => $variant->price,
                        'new_price' => $item['price'],
                        'changed_by' => auth()->id(),
                        'reason' => 'bulk_update',
                        'created_at' => now(),
                    ]);
                }

                $variant->update([
                    'price' => $item['price'],
                    'sale_price' => $item['sale_price'] ?? $variant->sale_price,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Prices updated successfully',
        ]);
    }

    /**
     * Bulk update cost — fixes crash (route existed, method was missing)
     */
    public function bulkUpdateCost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.cost_price' => 'required|integer|min:0',
            'variants.*.cogs' => 'nullable|integer|min:0',
            'variants.*.shipping_cost' => 'nullable|integer|min:0',
            'variants.*.platform_fees' => 'nullable|integer|min:0',
            'variants.*.tax_amount' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['variants'] as $item) {
                $variant = ProductVariant::findOrFail($item['id']);
                $variant->update(['cost_price' => $item['cost_price']]);

                // Upsert cost breakdown
                VariantCostBreakdown::updateOrCreate(
                    ['variant_id' => $variant->id],
                    [
                        'cogs' => $item['cogs'] ?? $item['cost_price'],
                        'shipping_cost' => $item['shipping_cost'] ?? 0,
                        'platform_fees' => $item['platform_fees'] ?? 0,
                        'tax_amount' => $item['tax_amount'] ?? 0,
                        'total_cost' => ($item['cogs'] ?? $item['cost_price'])
                            + ($item['shipping_cost'] ?? 0)
                            + ($item['platform_fees'] ?? 0)
                            + ($item['tax_amount'] ?? 0),
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Costs updated successfully',
        ]);
    }

    /**
     * Get variants below their low-stock threshold
     */
    public function lowStock(Request $request): JsonResponse
    {
        $variants = ProductVariant::where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->with('product:id,name,slug')
            ->orderBy('stock_quantity')
            ->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $variants,
        ]);
    }

    /**
     * Cost analysis with profit margins for a product
     */
    public function costAnalysis(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $variants = $product->variants()
            ->with('costBreakdown')
            ->get()
            ->map(function ($variant) {
                $sellingPrice = $variant->sale_price ?: $variant->price;
                $totalCost = $variant->costBreakdown?->total_cost ?? $variant->cost_price ?? 0;
                $margin = $sellingPrice > 0 ? round(($sellingPrice - $totalCost) / $sellingPrice * 100, 2) : 0;

                return [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
                    'name' => $variant->name,
                    'selling_price' => $sellingPrice,
                    'cost_price' => $variant->cost_price,
                    'cost_breakdown' => $variant->costBreakdown,
                    'total_cost' => $totalCost,
                    'profit' => $sellingPrice - $totalCost,
                    'margin_percent' => $margin,
                    'margin_status' => $margin < 10 ? 'danger' : ($margin < 25 ? 'warning' : 'healthy'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variants' => $variants,
                'avg_margin' => $variants->avg('margin_percent'),
            ],
        ]);
    }

    /**
     * Bulk duplicate multiple variants
     */
    public function bulkDuplicate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:product_variants,id',
        ]);

        $created = [];
        DB::transaction(function () use ($validated, &$created) {
            foreach ($validated['ids'] as $id) {
                $original = ProductVariant::findOrFail($id);
                $new = $original->replicate();
                $new->sku = $original->sku . '-COPY-' . strtoupper(bin2hex(random_bytes(2)));
                $new->stock_quantity = 0;
                $new->save();
                $created[] = $new;
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($created) . ' variants duplicated successfully',
            'data' => $created,
        ]);
    }

    /**
     * Persist matrix — create multiple variants from generated combinations
     */
    public function persistMatrix(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.sku' => 'required|string',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.attributes' => 'required|array',
        ]);

        $created = 0;
        foreach ($validated['variants'] as $vData) {
            // Skip if SKU already exists
            if (ProductVariant::where('sku', $vData['sku'])->exists()) continue;

            $product->variants()->create($vData);
            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully created $created new variants.",
        ]);
    }

    /**
     * Duplicate a variant
     */
    public function duplicate(int $id): JsonResponse
    {
        $original = ProductVariant::findOrFail($id);
        $new = $original->replicate();
        
        // Append '-COPY' to SKU and reset stock
        $new->sku = $original->sku . '-COPY-' . strtoupper(bin2hex(random_bytes(2)));
        $new->stock_quantity = 0;
        $new->save();

        return response()->json([
            'success' => true,
            'message' => 'Variant duplicated successfully',
            'data' => $new,
        ]);
    }

    /**
     * Bulk Delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:product_variants,id',
        ]);

        try {
            ProductVariant::whereIn('id', $validated['ids'])->delete();
            return response()->json([
                'success' => true,
                'message' => 'Selected variants deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Generate variant combinations from attributes
     */
    public function generateMatrix(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'attributes' => 'required|array',
            'base_price' => 'required|numeric|min:0',
            'base_sku' => 'required|string',
        ]);

        $combinations = $this->generateCombinations($validated['attributes']);
        $variants = [];

        foreach ($combinations as $index => $combo) {
            $sku = $validated['base_sku'] . '-' . implode('-', array_values($combo));
            $variants[] = [
                'sku' => strtoupper($sku),
                'price' => (int)$validated['base_price'],
                'stock_quantity' => 0,
                'attributes' => $combo,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $variants,
        ]);
    }

    /**
     * Generate all combinations of attributes
     */
    private function generateCombinations(array $attributes): array
    {
        $result = [[]];

        foreach ($attributes as $key => $values) {
            $newResult = [];
            foreach ($result as $combo) {
                foreach ($values as $value) {
                    $newResult[] = array_merge($combo, [$key => $value]);
                }
            }
            $result = $newResult;
        }

        return $result;
    }
}

