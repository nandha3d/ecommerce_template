<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBundleItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'bundle_id',
        'product_id',
        'variant_id',
        'quantity',
        'sort_order',
    ];

    /**
     * Get the bundle
     */
    public function bundle()
    {
        return $this->belongsTo(ProductBundle::class, 'bundle_id');
    }

    /**
     * Get the product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant (if specific variant selected)
     */
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
