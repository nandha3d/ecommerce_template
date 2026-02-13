<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;
    
    protected $appends = ['profit_margin'];

    protected $fillable = [
        'product_id',
        'sku',
        'manufacturer_code',
        'barcode',
        'name',
        'price',
        'sale_price',
        'cost_price',
        'stock_quantity',
        'low_stock_threshold',
        'attributes',
        'image',
        'weight',
        'length',
        'breadth',
        'height',
        'is_active',
    ];

    protected $casts = [
        'price' => 'integer',
        'sale_price' => 'integer',
        'cost_price' => 'integer',
        'low_stock_threshold' => 'integer',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'breadth' => 'decimal:2',
        'height' => 'decimal:2',
        'attributes' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: Inventory Ledger
     */
    public function inventoryLedger()
    {
        return $this->hasMany(InventoryLedger::class, 'variant_id');
    }

    /**
     * Relationship: Cost Breakdown
     */
    public function costBreakdown()
    {
        return $this->hasOne(VariantCostBreakdown::class, 'variant_id');
    }

    /**
     * Boot the model with cascade deletion guards.
     */
    protected static function boot()
    {
        parent::boot();

        // 🔒 H7: CASCADE DELETION GUARD
        static::deleting(function ($variant) {
            // Check active cart references
            if (\App\Models\CartItem::where('variant_id', $variant->id)->exists()) {
                throw new \RuntimeException(
                    "Cannot delete variant (SKU: {$variant->sku}): Referenced in active carts."
                );
            }

            // Check order references (historical integrity)
            if (\App\Models\OrderItem::where('variant_id', $variant->id)->exists()) {
                throw new \RuntimeException(
                    "Cannot delete variant (SKU: {$variant->sku}): Referenced in order history. " .
                    "Consider deactivating instead."
                );
            }
        });
    }

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
     * Get profit margin.
     * Logic: (Price - Total Cost) / Price * 100
     */
    public function getProfitMarginAttribute()
    {
        $totalCost = $this->costBreakdown?->total_cost ?? $this->cost_price;
        if (!$totalCost || !$this->price) return 0;

        return round((($this->price - $totalCost) / $this->price) * 100, 2);
    }

    /**
     * Adjust stock and record in ledger.
     */
    public function adjustStock(int $change, string $reason, ?int $orderId = null, ?int $userId = null)
    {
        $newQuantity = $this->stock_quantity + $change;
        
        $this->update(['stock_quantity' => $newQuantity]);

        return $this->inventoryLedger()->create([
            'quantity_change' => $change,
            'new_quantity' => $newQuantity,
            'reason' => $reason,
            'order_id' => $orderId,
            'user_id' => $userId,
        ]);
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
