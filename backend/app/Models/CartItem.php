<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'variant_id',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product for this cart item.
     */
    public function product()
    {
        return $this->belongsTo(\Core\Product\Models\Product::class);
    }

    /**
     * Get subtotal for this item.
     */
    public function getSubtotalAttribute()
    {
        return $this->unit_price * $this->quantity;
    }

    /**
     * Get total price (alias for subtotal).
     */
    public function getTotalPriceAttribute()
    {
        return $this->subtotal;
    }

    /**
     * Get the variant for this cart item.
     */
    public function variant()
    {
        return $this->belongsTo(\App\Models\ProductVariant::class);
    }
}
