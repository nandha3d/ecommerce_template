<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        $cartItems = [];
        $subtotal = 0;

        if (auth()->check()) {
            $cart = \App\Models\Cart::with(['items.product', 'items.variant'])->where('user_id', auth()->id())->first();
            if ($cart) {
                $cartItems = $cart->items;
                $subtotal = $cart->items->sum(function($item) {
                    return $item->unit_price * $item->quantity;
                });
            }
        } else {
            $sessionCart = session()->get('cart', []);
            // Convert session array to object-like structure for consistent view handling
            foreach ($sessionCart as $key => $item) {
                // We need to fetch product details for the image/slug
                $product = \Core\Product\Models\Product::find($item['product_id']);
                if ($product) {
                    $cartItem = new \stdClass();
                    $cartItem->id = $key; // Session key as ID
                    $cartItem->product = $product;
                    $cartItem->product_id = $item['product_id'];
                    $cartItem->variant_id = $item['variant_id'];
                    $cartItem->quantity = $item['quantity'];
                    $cartItem->unit_price = $item['unit_price'];
                    $cartItem->variant = $item['variant_id'] ? \App\Models\ProductVariant::find($item['variant_id']) : null;
                    
                    $cartItems[] = $cartItem;
                    $subtotal += $item['unit_price'] * $item['quantity'];
                }
            }
        }

        return view('cart.index', compact('cartItems', 'subtotal'));
    }
}
