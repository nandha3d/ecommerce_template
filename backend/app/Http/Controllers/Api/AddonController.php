<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductAddon;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AddonController extends Controller
{
    /**
     * Get all addons
     */
    public function index(): JsonResponse
    {
        $addons = ProductAddon::active()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
        ]);
    }

    /**
     * Get addons for a specific product
     */
    public function forProduct(int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $addons = $product->addons()->active()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $addons,
        ]);
    }

    /**
     * Store a new addon
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:product_addons,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_required' => 'boolean',
            'max_quantity' => 'integer|min:1',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $addon = ProductAddon::create($validated);

        if (!empty($validated['product_ids'])) {
            $addon->products()->attach($validated['product_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Addon created successfully',
            'data' => $addon->load('products'),
        ], 201);
    }

    /**
     * Update an addon
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $addon = ProductAddon::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:product_addons,slug,' . $id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|string',
            'is_required' => 'boolean',
            'max_quantity' => 'integer|min:1',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $addon->update($validated);

        if (isset($validated['product_ids'])) {
            $addon->products()->sync($validated['product_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Addon updated successfully',
            'data' => $addon->load('products'),
        ]);
    }

    /**
     * Delete an addon
     */
    public function destroy(int $id): JsonResponse
    {
        $addon = ProductAddon::findOrFail($id);
        $addon->products()->detach();
        $addon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Addon deleted successfully',
        ]);
    }

    /**
     * Attach addon to products
     */
    public function attachToProducts(Request $request, int $id): JsonResponse
    {
        $addon = ProductAddon::findOrFail($id);
        
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $addon->products()->syncWithoutDetaching($validated['product_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Products attached successfully',
            'data' => $addon->load('products'),
        ]);
    }
}
