<?php

namespace App\Livewire;

use Livewire\Component;
use Core\Product\Models\Product;
use Core\Cart\Services\CartService;
use Illuminate\Support\Str;

class AddToCart extends Component
{
    public $productId;
    public $quantity = 1;
    public $selectedVariant = null;
    public $errorMessage = null;
    
    public function mount($productId)
    {
        $this->productId = $productId;
        
        // Pre-select default variant for simple products
        $product = Product::with('variants')->find($productId);
        if ($product && $product->variants->count() === 1) {
            $this->selectedVariant = $product->variants->first()->id;
        }
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
        $this->errorMessage = null;
        
        $product = Product::with('variants')->findOrFail($this->productId);
        
        // For variable products with multiple variants, require selection
        if ($product->variants->count() > 1 && !$this->selectedVariant) {
            $this->addError('selectedVariant', 'Please select an option.');
            return;
        }
        
        try {
            /** @var CartService $cartService */
            $cartService = app(CartService::class);
            
            // Get or create cart
            $userId = auth()->id();
            $sessionId = session()->get('cart_session_id');
            
            if (!$userId && !$sessionId) {
                $sessionId = 'cart_' . Str::random(40);
                session()->put('cart_session_id', $sessionId);
            }
            
            $cart = $cartService->getCart($userId, $sessionId);
            
            // CartService handles default variant resolution for simple products
            // Pass selectedVariant (null is OK for simple products - service resolves it)
            $cartService->addItem(
                $cart,
                $this->productId,
                $this->quantity,
                $this->selectedVariant
            );
            
            // Emit event to update cart count in header
            $this->dispatch('cart-updated');
            
            // Show success message
            session()->flash('message', 'Product added to cart successfully!');
            
        } catch (\InvalidArgumentException $e) {
            $this->errorMessage = $e->getMessage();
        } catch (\Core\Cart\Exceptions\PriceChangedException $e) {
            $this->errorMessage = 'Prices have changed. Please refresh and try again.';
        } catch (\Exception $e) {
            $this->errorMessage = 'Unable to add to cart. Please try again.';
            \Log::error('AddToCart Error: ' . $e->getMessage(), ['product_id' => $this->productId]);
        }
    }
    
    public function render()
    {
        $product = Product::with('variants')->find($this->productId);
        return view('livewire.add-to-cart', compact('product'));
    }
}
