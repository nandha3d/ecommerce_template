<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductBundle;
use App\Models\ProductBundleItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BundleController extends Controller
{
    /**
     * Get all bundles
     */
    public function index(): JsonResponse
    {
        $bundles = ProductBundle::with(['items.product', 'items.variant'])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bundles,
        ]);
    }

    /**
     * Get valid (active) bundles for customers
     */
    public function active(): JsonResponse
    {
        $bundles = ProductBundle::valid()
            ->with(['items.product', 'items.variant'])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bundles,
        ]);
    }

    /**
     * Get a single bundle
     */
    public function show(int $id): JsonResponse
    {
        $bundle = ProductBundle::with(['items.product.images', 'items.variant'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $bundle,
        ]);
    }

    /**
     * Create a new bundle
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:product_bundles,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'bundle_price' => 'required|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'items' => 'required|array|min:2',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Calculate regular price from items
        $regularPrice = 0;
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            $price = $product->sale_price ?? $product->price;
            $regularPrice += $price * $item['quantity'];
        }

        $bundle = ProductBundle::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'regular_price' => $regularPrice,
            'bundle_price' => $validated['bundle_price'],
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
        ]);

        $bundle->calculateSavings()->save();

        // Add items
        foreach ($validated['items'] as $index => $item) {
            ProductBundleItem::create([
                'bundle_id' => $bundle->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'quantity' => $item['quantity'],
                'sort_order' => $index,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bundle created successfully',
            'data' => $bundle->load(['items.product', 'items.variant']),
        ], 201);
    }

    /**
     * Update a bundle
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $bundle = ProductBundle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:product_bundles,slug,' . $id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'bundle_price' => 'sometimes|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_active' => 'boolean',
            'items' => 'sometimes|array|min:2',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
        ]);

        $bundle->update($validated);

        if (isset($validated['items'])) {
            // Recalculate regular price
            $regularPrice = 0;
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                $price = $product->sale_price ?? $product->price;
                $regularPrice += $price * $item['quantity'];
            }
            $bundle->regular_price = $regularPrice;
            $bundle->calculateSavings()->save();

            // Update items
            $bundle->items()->delete();
            foreach ($validated['items'] as $index => $item) {
                ProductBundleItem::create([
                    'bundle_id' => $bundle->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bundle updated successfully',
            'data' => $bundle->load(['items.product', 'items.variant']),
        ]);
    }

    /**
     * Delete a bundle
     */
    public function destroy(int $id): JsonResponse
    {
        $bundle = ProductBundle::findOrFail($id);
        $bundle->items()->delete();
        $bundle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bundle deleted successfully',
        ]);
    }
}
