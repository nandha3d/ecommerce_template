<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAddon extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'image',
        'is_required',
        'max_quantity',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get products that have this addon
     */
    public function products()
    {
        return $this->belongsToMany(\Core\Product\Models\Product::class, 'product_addon_product', 'addon_id', 'product_id')
            ->withPivot('sort_order');
    }

    /**
     * Scope for active addons
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for required addons
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }
}
