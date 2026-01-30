<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'discount_type',
        'discount_value',
        'conditions',
        'min_order_amount',
        'max_uses',
        'used_count',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'conditions' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    const TYPE_FLASH_SALE = 'flash_sale';
    const TYPE_BULK_DISCOUNT = 'bulk_discount';
    const TYPE_BOGO = 'bogo';
    const TYPE_TIERED = 'tiered';
    const TYPE_PERCENTAGE = 'percentage';
    const TYPE_FIXED = 'fixed';

    /**
     * Get products with this offer
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'price_offer_products', 'offer_id', 'product_id');
    }

    /**
     * Check if offer is currently valid
     */
    public function getIsValidAttribute()
    {
        if (!$this->is_active) return false;
        
        $now = now();
        if ($this->starts_at && $this->starts_at->gt($now)) return false;
        if ($this->ends_at && $this->ends_at->lt($now)) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        
        return true;
    }

    /**
     * Calculate discount for given price and quantity
     */
    public function calculateDiscount(float $price, int $quantity = 1): float
    {
        if (!$this->is_valid) return 0;

        switch ($this->type) {
            case self::TYPE_PERCENTAGE:
            case self::TYPE_FLASH_SALE:
                return $price * ($this->discount_value / 100);
            
            case self::TYPE_FIXED:
                return min($this->discount_value, $price);
            
            case self::TYPE_BULK_DISCOUNT:
                $minQty = $this->conditions['min_qty'] ?? 1;
                if ($quantity >= $minQty) {
                    return $price * ($this->discount_value / 100);
                }
                return 0;
            
            case self::TYPE_BOGO:
                $buy = $this->conditions['buy'] ?? 2;
                $get = $this->conditions['get'] ?? 1;
                $freeItems = floor($quantity / ($buy + $get)) * $get;
                return ($price / $quantity) * $freeItems;
            
            default:
                return 0;
        }
    }

    /**
     * Get time remaining for the offer
     */
    public function getTimeRemainingAttribute()
    {
        if (!$this->ends_at) return null;
        return now()->diff($this->ends_at);
    }

    /**
     * Scope for active and valid offers
     */
    public function scopeValid($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses');
            });
    }
}
