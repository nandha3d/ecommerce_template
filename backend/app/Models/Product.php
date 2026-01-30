<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'sale_price',
        'sku',
        'stock_quantity',
        'stock_status',
        'brand_id',
        'nutrition_facts',
        'ingredients',
        'benefits',
        'tags',
        'average_rating',
        'review_count',
        'is_featured',
        'is_bestseller',
        'is_new',
        'is_active',
        'seo_title',
        'seo_description',
        // New fields
        'is_digital',
        'is_downloadable',
        'download_limit',
        'download_expiry_days',
        'has_customization',
        'customization_fields',
        'custom_tabs',
        'image_layout',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'nutrition_facts' => 'array',
        'benefits' => 'array',
        'tags' => 'array',
        'average_rating' => 'decimal:2',
        'review_count' => 'integer',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'is_new' => 'boolean',
        'is_active' => 'boolean',
        // New casts
        'is_digital' => 'boolean',
        'is_downloadable' => 'boolean',
        'download_limit' => 'integer',
        'download_expiry_days' => 'integer',
        'has_customization' => 'boolean',
        'customization_fields' => 'array',
        'custom_tabs' => 'array',
    ];

    /**
     * Get the brand that owns the product.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * The categories that belong to the product.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Get the images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the variants for the product.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get addon groups for this product.
     */
    public function addonGroups(): HasMany
    {
        return $this->hasMany(ProductAddonGroup::class)->orderBy('sort_order');
    }

    /**
     * Get downloads for this product (digital products).
     */
    public function downloads(): HasMany
    {
        return $this->hasMany(ProductDownload::class)->orderBy('sort_order');
    }

    // ============================================
    // MODULAR RELATIONSHIPS
    // ============================================

    /**
     * Get the add-ons available for this product.
     */
    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(ProductAddon::class, 'product_addon_product', 'product_id', 'addon_id')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /**
     * Get bundles that include this product.
     */
    public function bundles(): BelongsToMany
    {
        return $this->belongsToMany(ProductBundle::class, 'product_bundle_items', 'product_id', 'bundle_id')
            ->withPivot(['variant_id', 'quantity', 'sort_order']);
    }

    /**
     * Get active price offers for this product.
     */
    public function offers(): BelongsToMany
    {
        return $this->belongsToMany(PriceOffer::class, 'price_offer_products', 'product_id', 'offer_id');
    }

    /**
     * Get active offers (currently valid date range).
     */
    public function activeOffers(): BelongsToMany
    {
        return $this->offers()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * Get customizations for this product.
     */
    public function customizations(): HasMany
    {
        return $this->hasMany(ProductCustomization::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope for featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_active', true);
    }

    /**
     * Scope for bestseller products.
     */
    public function scopeBestSellers($query)
    {
        return $query->where('is_bestseller', true)->where('is_active', true);
    }

    /**
     * Scope for new products.
     */
    public function scopeNew($query)
    {
        return $query->where('is_new', true)->where('is_active', true);
    }

    /**
     * Scope for active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for search.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Get the current price (sale price if available).
     */
    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Get the discount percentage.
     */
    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->sale_price || $this->sale_price >= $this->price) {
            return 0;
        }
        return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    /**
     * Check if product is in stock.
     */
    public function getIsInStockAttribute(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Get best available offer discount.
     */
    public function getBestOfferAttribute(): ?PriceOffer
    {
        return $this->activeOffers()->orderByDesc('discount_value')->first();
    }

    // ============================================
    // METHODS
    // ============================================

    /**
     * Update stock status based on quantity.
     */
    public function updateStockStatus(): void
    {
        if ($this->stock_quantity <= 0) {
            $this->stock_status = 'out_of_stock';
        } elseif ($this->stock_quantity <= 10) {
            $this->stock_status = 'low_stock';
        } else {
            $this->stock_status = 'in_stock';
        }
        $this->save();
    }

    /**
     * Calculate and update average rating.
     */
    public function updateRating(): void
    {
        $this->average_rating = $this->reviews()->where('is_approved', true)->avg('rating') ?? 0;
        $this->review_count = $this->reviews()->where('is_approved', true)->count();
        $this->save();
    }

    /**
     * Calculate final price with offers applied.
     */
    public function getFinalPrice(int $quantity = 1): float
    {
        $basePrice = $this->current_price;
        $offer = $this->best_offer;

        if (!$offer) {
            return $basePrice * $quantity;
        }

        return $offer->calculateDiscount($basePrice, $quantity);
    }
}
