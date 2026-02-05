<?php

namespace App\Livewire;

use Livewire\Component;
use Core\Product\Models\Product;

class AddToCart extends Component
{
    public $productId;
    public $quantity = 1;
    public $selectedVariant = null;
    
    public function mount($productId)
    {
        $this->productId = $productId;
    }
    
    public function increment()
    {
        $this->quantity++;
    }
    
    public function decrement()
    {
        if ($this->quantity > 1) {
            $this->quantity--;
        }
    }
    
    public function addToCart()
    {
        $product = Product::with('variants')->findOrFail($this->productId);
        
        // Get the effective price (sale price or regular price)
        $price = $product->sale_price ?? $product->price;
        $variantId = $this->selectedVariant;

        if ($variantId) {
            $variant = $product->variants->find($variantId);
            if ($variant) {
                $price = $variant->sale_price ?? $variant->price ?? $price;
            }
        }

        if (auth()->check()) {
            // Authenticated user - use database cart
            $cart = \App\Models\Cart::firstOrCreate(
                ['user_id' => auth()->id()],
                ['session_id' => null]
            );

            $existingItem = $cart->items()
                ->where('product_id', $this->productId)
                ->where('variant_id', $variantId)
                ->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $this->quantity
                ]);
            } else {
                $cart->items()->create([
                    'product_id' => $this->productId,
                    'variant_id' => $variantId,
                    'quantity' => $this->quantity,
                    'unit_price' => $price,
                ]);
            }
        } else {
            // Guest user - use session cart
            $cart = session()->get('cart', []);
            $key = $this->productId . '-' . ($variantId ?? 'null');
            
            if (isset($cart[$key])) {
                $cart[$key]['quantity'] += $this->quantity;
            } else {
                $cart[$key] = [
                    'product_id' => $this->productId,
                    'variant_id' => $variantId,
                    'quantity' => $this->quantity,
                    'unit_price' => $price,
                    'name' => $product->name,
                ];
            }
            session()->put('cart', $cart);
        }
        
        // Emit event to update cart count in header
        $this->dispatch('cart-updated');
        
        // Show success message
        session()->flash('message', 'Product added to cart successfully!');
    }
    
    public function render()
    {
        $product = Product::with('variants')->find($this->productId);
        return view('livewire.add-to-cart', compact('product'));
    }
}
