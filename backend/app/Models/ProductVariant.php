<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',
        'sale_price',
        'cost_price',
        'stock_quantity',
        'attributes',
        'image',
        'weight',
        'length',
        'breadth',
        'height',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'breadth' => 'decimal:2',
        'height' => 'decimal:2',
        'attributes' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product this variant belongs to
     */
    public function product()
    {
        return $this->belongsTo(\Core\Product\Models\Product::class);
    }

    /**
     * Get the effective price (sale price if set, otherwise regular)
     */
    public function getEffectivePriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Check if variant is on sale
     */
    public function getIsOnSaleAttribute()
    {
        return $this->sale_price && $this->sale_price < $this->price;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentAttribute()
    {
        if (!$this->is_on_sale) {
            return 0;
        }
        return round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    /**
     * Check if in stock
     */
    public function getInStockAttribute()
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Get attribute display string
     */
    public function getAttributeStringAttribute()
    {
        if (!$this->attributes) {
            return '';
        }
        return collect($this->attributes)->map(fn($v, $k) => "$k: $v")->join(', ');
    }

    /**
     * Scope for active variants
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for in-stock variants
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}
