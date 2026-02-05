<?php

namespace App\Livewire;

use Livewire\Component;

class CartIndicator extends Component
{
    public $cartCount = 0;

    protected $listeners = ['cart-updated' => 'updateCartCount'];

    public function mount()
    {
        $this->updateCartCount();
    }

    public function updateCartCount()
    {
        if (auth()->check()) {
            $cart = \App\Models\Cart::where('user_id', auth()->id())->first();
            $this->cartCount = $cart ? $cart->items()->sum('quantity') : 0;
        } else {
            $cart = session()->get('cart', []);
            $this->cartCount = array_sum(array_column($cart, 'quantity'));
        }
    }

    public function render()
    {
        return view('livewire.cart-indicator');
    }
}
