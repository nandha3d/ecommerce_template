<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBundle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'regular_price',
        'bundle_price',
        'savings_amount',
        'savings_percent',
        'starts_at',
        'ends_at',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'regular_price' => 'decimal:2',
        'bundle_price' => 'decimal:2',
        'savings_amount' => 'decimal:2',
        'starts_at' => 'date',
        'ends_at' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get bundle items
     */
    public function items()
    {
        return $this->hasMany(ProductBundleItem::class, 'bundle_id')
            ->orderBy('sort_order');
    }

    /**
     * Get products in this bundle
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_bundle_items', 'bundle_id', 'product_id')
            ->withPivot(['variant_id', 'quantity', 'sort_order']);
    }

    /**
     * Check if bundle is currently valid
     */
    public function getIsValidAttribute()
    {
        if (!$this->is_active) return false;
        
        $now = now()->startOfDay();
        if ($this->starts_at && $this->starts_at->gt($now)) return false;
        if ($this->ends_at && $this->ends_at->lt($now)) return false;
        
        return true;
    }

    /**
     * Calculate savings
     */
    public function calculateSavings()
    {
        $this->savings_amount = $this->regular_price - $this->bundle_price;
        $this->savings_percent = $this->regular_price > 0 
            ? round(($this->savings_amount / $this->regular_price) * 100) 
            : 0;
        return $this;
    }

    /**
     * Scope for active and valid bundles
     */
    public function scopeValid($query)
    {
        $now = now()->startOfDay();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            });
    }
}
