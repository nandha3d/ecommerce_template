<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use Core\Product\Models\Product;

class WishlistController extends Controller
{
    public function index()
    {
        $products = [];
        
        if (auth()->check()) {
            $wishlistItems = Wishlist::with('product.primaryImage', 'product.brand')
                ->where('user_id', auth()->id())
                ->latest()
                ->get();
                
            $products = $wishlistItems->map(fn($item) => $item->product);
        } else {
            $wishlistIds = session()->get('wishlist', []);
            if (!empty($wishlistIds)) {
                $products = Product::whereIn('id', $wishlistIds)
                    ->with('primaryImage', 'brand')
                    ->get();
            }
        }
        
        return view('wishlist.index', compact('products'));
    }
}
