<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Wishlist;
use Core\Product\Models\Product;

class WishlistButton extends Component
{
    public $productId;
    public $isInWishlist = false;
    
    public function mount($productId)
    {
        $this->productId = $productId;
        $this->checkWishlistStatus();
    }
    
    public function checkWishlistStatus()
    {
        if (auth()->check()) {
            $this->isInWishlist = Wishlist::where('user_id', auth()->id())
                ->where('product_id', $this->productId)
                ->exists();
        } else {
            // For guests, check session wishlist
            $wishlist = session()->get('wishlist', []);
            $this->isInWishlist = in_array($this->productId, $wishlist);
        }
    }
    
    public function toggleWishlist()
    {
        if (auth()->check()) {
            // Authenticated user - use database
            $existing = Wishlist::where('user_id', auth()->id())
                ->where('product_id', $this->productId)
                ->first();

            if ($existing) {
                $existing->delete();
                $this->isInWishlist = false;
                session()->flash('message', 'Removed from wishlist');
            } else {
                Wishlist::create([
                    'user_id' => auth()->id(),
                    'product_id' => $this->productId,
                ]);
                $this->isInWishlist = true;
                session()->flash('message', 'Added to wishlist!');
            }
        } else {
            // Guest user - use session
            $wishlist = session()->get('wishlist', []);
            
            if (in_array($this->productId, $wishlist)) {
                $wishlist = array_diff($wishlist, [$this->productId]);
                $this->isInWishlist = false;
                session()->flash('message', 'Removed from wishlist');
            } else {
                $wishlist[] = $this->productId;
                $this->isInWishlist = true;
                session()->flash('message', 'Added to wishlist!');
            }
            
            session()->put('wishlist', $wishlist);
        }
        
        $this->dispatch('wishlist-updated');
    }
    
    public function render()
    {
        return view('livewire.wishlist-button');
    }
}
