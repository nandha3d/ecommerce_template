<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_id',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the applied coupon.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get subtotal.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum('total_price');
    }

    /**
     * Get discount amount.
     */
    public function getDiscountAttribute(): float
    {
        if (!$this->coupon) {
            return 0;
        }

        $subtotal = $this->subtotal;

        if ($this->coupon->min_order_amount && $subtotal < $this->coupon->min_order_amount) {
            return 0;
        }

        if ($this->coupon->type === 'percentage') {
            $discount = $subtotal * ($this->coupon->value / 100);
        } else {
            $discount = $this->coupon->value;
        }

        if ($this->coupon->max_discount) {
            $discount = min($discount, $this->coupon->max_discount);
        }

        return $discount;
    }

    /**
     * Get shipping cost.
     */
    public function getShippingAttribute(): float
    {
        // Free shipping over $50
        return $this->subtotal >= 50 ? 0 : 5.99;
    }

    /**
     * Get tax amount.
     */
    public function getTaxAttribute(): float
    {
        return ($this->subtotal - $this->discount) * 0.08; // 8% tax
    }

    /**
     * Get total.
     */
    public function getTotalAttribute(): float
    {
        return $this->subtotal - $this->discount + $this->shipping + $this->tax;
    }

    /**
     * Get item count.
     */
    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Add item to cart.
     */
    public function addItem(int $productId, int $quantity = 1, ?int $variantId = null): CartItem
    {
        $existingItem = $this->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->save();
            return $existingItem;
        }

        $product = Product::findOrFail($productId);
        $variant = $variantId ? ProductVariant::find($variantId) : null;

        return $this->items()->create([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => $quantity,
            'unit_price' => $variant ? ($variant->sale_price ?? $variant->price) : ($product->sale_price ?? $product->price),
        ]);
    }

    /**
     * Clear cart.
     */
    public function clear(): void
    {
        $this->items()->delete();
        $this->coupon_id = null;
        $this->save();
    }

    /**
     * Merge guest cart into user cart.
     */
    public function merge(Cart $guestCart): void
    {
        foreach ($guestCart->items as $item) {
            $this->addItem($item->product_id, $item->quantity, $item->variant_id);
        }

        if ($guestCart->coupon_id && !$this->coupon_id) {
            $this->coupon_id = $guestCart->coupon_id;
            $this->save();
        }

        $guestCart->delete();
    }
}
