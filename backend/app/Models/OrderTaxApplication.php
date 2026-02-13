<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderTaxApplication extends Model
{
    protected $fillable = [
        'order_id',
        'tax_rate_id',
        'jurisdiction',
        'rate_applied',
        'tax_type',
        'taxable_amount',
        'tax_amount',
        'is_inclusive',
        'metadata',
    ];

    protected $casts = [
        'rate_applied' => 'float',
        'taxable_amount' => 'integer',
        'tax_amount' => 'integer',
        'is_inclusive' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Tax application records are IMMUTABLE.
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($record) {
            throw new \RuntimeException('Order tax application records are immutable and cannot be updated.');
        });
        
        static::deleting(function ($record) {
             // In a strict prod env, we might even block deletions
            // throw new \RuntimeException('Order tax application records cannot be deleted.');
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function taxRate(): BelongsTo
    {
        return $this->belongsTo(TaxRate::class);
    }
}
