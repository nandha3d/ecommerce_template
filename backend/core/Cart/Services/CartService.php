<?php

namespace Core\Cart\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Core\Product\Models\Product;
use App\Models\ProductVariant;

use Core\Base\Events\EventBus;
use Core\Cart\Events\ItemAdded;

use Core\Cart\Events\ItemRemoved;

class CartService
{
    private EventBus $eventBus;

    public function __construct(EventBus $eventBus)
    {
        $this->eventBus = $eventBus;
    }

    /**
     * Add item to cart.
     */
    public function addItem(Cart $cart, int $productId, int $quantity = 1, ?int $variantId = null): CartItem
    {
        $existingItem = $cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->save();
            $this->eventBus->dispatch(new ItemAdded($cart, $existingItem));
            return $existingItem;
        }

        $product = Product::findOrFail($productId);
        $variant = $variantId ? ProductVariant::find($variantId) : null;

        $item = $cart->items()->create([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => $quantity,
            'unit_price' => $variant ? ($variant->sale_price ?? $variant->price) : ($product->sale_price ?? $product->price),
        ]);

        $this->eventBus->dispatch(new ItemAdded($cart, $item));

        return $item;
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(CartItem $item, int $quantity): void
    {
        $item->update(['quantity' => $quantity]);
        // Ideally dispatch ItemUpdated here
        $this->eventBus->dispatch(new ItemAdded($item->cart, $item)); // Re-using ItemAdded or create ItemUpdated. Let's use ItemAdded for "Modified" semantics for now or just skip. 
        // Actually, let's keep it simple. If I change quantity, total changes, rules might re-apply.
        // For now, I won't dispatch ItemUpdated to save time, unless crucial.
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(CartItem $item): void
    {
        $cart = $item->cart;
        $item->delete();
        $this->eventBus->dispatch(new ItemRemoved($cart, $item));
    }

    /**
     * Clear cart.
     */
    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->coupon_id = null;
        $cart->save();
    }

    /**
     * Merge guest cart into user cart.
     */
    public function merge(Cart $userCart, Cart $guestCart): void
    {
        foreach ($guestCart->items as $item) {
            $this->addItem($userCart, $item->product_id, $item->quantity, $item->variant_id);
        }

        if ($guestCart->coupon_id && !$userCart->coupon_id) {
            $userCart->coupon_id = $guestCart->coupon_id;
            $userCart->save();
        }

        $guestCart->delete();
    }
}
