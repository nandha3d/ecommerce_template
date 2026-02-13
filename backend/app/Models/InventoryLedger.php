<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLedger extends Model
{
    use HasFactory;

    protected $table = 'inventory_ledger';

    protected $fillable = [
        'variant_id',
        'quantity_change',
        'new_quantity',
        'reason',
        'order_id',
        'user_id',
    ];

    /**
     * Relationship: Variant
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Relationship: User (Operator)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Order (Context)
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
