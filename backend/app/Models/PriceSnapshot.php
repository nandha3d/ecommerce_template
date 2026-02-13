<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'subtotal',
        'currency',
        'discount_breakdown',
        'total_discount',
        'tax_breakdown',
        'total_tax',
        'shipping_cost',
        'final_amount',
        'calculation_version',
        'calculation_metadata',
        'locked_at',
    ];

    protected $casts = [
        'discount_breakdown' => 'array',
        'tax_breakdown' => 'array',
        'calculation_metadata' => 'array',
        'locked_at' => 'datetime',
        'subtotal' => 'integer',
        'total_discount' => 'integer',
        'total_tax' => 'integer',
        'shipping_cost' => 'integer',
        'final_amount' => 'integer',
    ];

    // Relationship
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Immutability enforcement
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($snapshot) {
            if ($snapshot->isDirty('locked_at') && $snapshot->getOriginal('locked_at') === null) {
                return; // Allow initial locking
            }
            if ($snapshot->getOriginal('locked_at') !== null) {
                throw new \RuntimeException('Cannot modify locked price snapshot');
            }
        });

        static::deleting(function ($snapshot) {
            if ($snapshot->locked_at !== null) {
                throw new \RuntimeException('Cannot delete locked price snapshot');
            }
        });
    }

    // Lock the snapshot (make immutable)
    public function lock(): void
    {
        $this->locked_at = now();
        $this->save();
    }

    // Helper to convert to main unit for display
    public function getFinalAmountFormattedAttribute(): string
    {
        return ($this->final_amount / 100) . ' ' . $this->currency;
    }
}
