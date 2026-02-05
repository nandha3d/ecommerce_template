<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use Core\Product\Models\Product;
use App\Http\Resources\WishlistResource;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist.
     */
    public function index()
    {
        $wishlistItems = Wishlist::with(['product.primaryImage', 'product.brand'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => WishlistResource::collection($wishlistItems)
        ]);
    }

    /**
     * Add product to wishlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $productId = $request->input('product_id');
        $userId = Auth::id();

        // Check if already exists
        $exists = Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => true,
                'message' => 'Product is already in your wishlist',
            ]);
        }

        $wishlistItem = Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist',
            'data' => new WishlistResource($wishlistItem->load('product'))
        ]);
    }

    /**
     * Remove product from wishlist.
     */
    public function destroy($productId)
    {
        $deleted = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Product not found in wishlist',
        ], 404);
    }

    /**
     * Check if product is in wishlist.
     */
    public function check($productId)
    {
        $exists = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'success' => true,
            'in_wishlist' => $exists
        ]);
    }
}
