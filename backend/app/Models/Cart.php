<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Core\Cart\Services\CartPricingService;

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
        return app(CartPricingService::class)->getSubtotal($this);
    }

    /**
     * Get discount amount.
     */
    public function getDiscountAttribute(): float
    {
        return app(CartPricingService::class)->getDiscount($this);
    }

    /**
     * Get shipping cost.
     */
    public function getShippingAttribute(): float
    {
        return app(CartPricingService::class)->getShipping($this);
    }

    /**
     * Get tax amount.
     */
    public function getTaxAttribute(): float
    {
        return app(CartPricingService::class)->getTax($this);
    }

    /**
     * Get total.
     */
    public function getTotalAttribute(): float
    {
        return app(CartPricingService::class)->getTotal($this);
    }

    /**
     * Get item count.
     */
    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }


}
