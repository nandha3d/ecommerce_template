<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantCostBreakdown extends Model
{
    use HasFactory;

    protected $table = 'variant_cost_breakdown';

    protected $fillable = [
        'variant_id',
        'cogs',
        'shipping_cost',
        'platform_fees',
        'tax_amount',
        'total_cost',
    ];

    /**
     * Relationship: Variant
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
