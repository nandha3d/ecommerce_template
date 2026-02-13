<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product; // Assuming Product model exists
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['variants']); // Assuming variants relation

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('low_stock')) {
            // Filter products where any variant has stock <= threshold (e.g., 5)
            // Or if simple product, check its stock
            $query->whereHas('variants', function ($q) {
                $q->where('stock', '<=', 5); 
            })->orWhere(function ($q) {
                $q->doesntHave('variants')->where('stock', '<=', 5);
            });
        }

        $products = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show($id): JsonResponse
    {
        $product = Product::with(['variants', 'images', 'attributes'])->find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        // Simplified update for stock/price/status
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }
    
    // Additional methods (store, destroy) can be added as needed
}
