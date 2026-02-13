<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckoutSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'user_id',
        'step',
        'shipping_address_id',
        'billing_address_id',
        'shipping_method_id',
        'payment_method_id',
        'data',
        'started_at',
        'completed_at',
        'abandoned_at',
        'expires_at',
        'subtotal',
        'discount',
        'tax_amount',
        'shipping_cost',
        'total',
        'currency',
    ];

    protected $casts = [
        'data' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'abandoned_at' => 'datetime',
        'expires_at' => 'datetime',
        'subtotal' => 'integer',
        'discount' => 'integer',
        'tax_amount' => 'integer',
        'shipping_cost' => 'integer',
        'total' => 'integer',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function billingAddress()
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }
}
