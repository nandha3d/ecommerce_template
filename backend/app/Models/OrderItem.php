<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'product_name',
        'variant_name',
        'sku',
        'unit_price',
        'total_price',
        'quantity',
        'image',
    ];

    protected $casts = [
        'unit_price' => 'integer',
        'total_price' => 'integer',
        'price_snapshot' => 'array',
        'quantity' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // 🔒 IMMUTABILITY GUARD
        static::updating(function ($item) {
            $immutableFields = [
                'product_id', 'variant_id', 'sku', 
                'unit_price', 'total_price', 'quantity'
            ];

            foreach ($immutableFields as $field) {
                if ($item->isDirty($field)) {
                    \Log::critical("SECURITY: Attempt to mutate immutable order item", [
                        'item_id' => $item->id,
                        'order_id' => $item->order_id,
                        'field' => $field,
                        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5)
                    ]);
                    throw new \RuntimeException("Security Violation: Order Item field '{$field}' is immutable.");
                }
            }
        });

        static::deleting(function ($item) {
            if ($item->order && $item->order->status !== \App\Enums\OrderState::PENDING && $item->order->status !== \App\Enums\OrderState::FAILED) {
                 throw new \RuntimeException("Security Violation: Cannot delete item from processed order.");
            }
        });
    }

    /**
     * Get the order that owns the item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for this order item.
     */
    /**
     * Get the product for this order item.
     */
    public function product()
    {
        return $this->belongsTo(\Core\Product\Models\Product::class);
    }

    /**
     * Get the variant for this order item.
     */
    public function variant()
    {
        return $this->belongsTo(\App\Models\ProductVariant::class, 'variant_id');
    }

    /**
     * Get subtotal for this item.
     */
    public function getSubtotalAttribute()
    {
        return $this->unit_price * $this->quantity;
    }
}
