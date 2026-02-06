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
        'status',
        'session_id',
        'currency_code',
        'locale',
        'coupon_id',
        'discount',
        'subtotal',
        'tax_amount',
        'shipping_cost',
        'total',
    ];

    protected $attributes = [
        'status' => 'active',
        'currency_code' => 'USD',
        'locale' => 'en_US',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cart) {
            if (!isset($cart->status)) {
                $cart->status = 'active';
            }
        });
    }

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
     * Get item count.
     */
    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }




}
