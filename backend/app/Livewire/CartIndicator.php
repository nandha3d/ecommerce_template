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
            $cart = \App\Models\Cart::where('user_id', auth()->id())
                ->where('status', 'active')
                ->latest()
                ->first();
        } else {
            $cart = \App\Models\Cart::where('session_id', session()->getId())
                ->where('status', 'active')
                ->latest()
                ->first();
        }

        $this->cartCount = $cart ? $cart->items()->sum('quantity') : 0;
    }

    public function render()
    {
        return view('livewire.cart-indicator');
    }
}
