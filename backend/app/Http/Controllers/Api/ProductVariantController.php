<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ]);

        foreach ($validated['variants'] as $item) {
            ProductVariant::where('id', $item['id'])
                ->update(['stock_quantity' => $item['stock_quantity']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
        ]);
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
                'price' => $validated['base_price'],
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
