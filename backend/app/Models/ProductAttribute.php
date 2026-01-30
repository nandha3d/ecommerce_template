<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory;

    // Swatch type constants
    const TYPE_TEXT = 'text';
    const TYPE_COLOR = 'color';
    const TYPE_IMAGE = 'image';
    const TYPE_SELECT = 'select';
    const TYPE_BUTTON = 'button';
    const TYPE_RADIO = 'radio';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'is_active',
        'show_price_diff',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_price_diff' => 'boolean',
    ];

    /**
     * Get the options for this attribute
     */
    public function options()
    {
        return $this->hasMany(ProductAttributeOption::class, 'attribute_id')
            ->orderBy('sort_order');
    }

    /**
     * Scope for active attributes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get swatch type display name
     */
    public function getSwatchTypeDisplayAttribute()
    {
        return match($this->type) {
            self::TYPE_TEXT => 'Text',
            self::TYPE_COLOR => 'Color Swatch',
            self::TYPE_IMAGE => 'Image Swatch',
            self::TYPE_SELECT => 'Dropdown',
            self::TYPE_BUTTON => 'Button',
            self::TYPE_RADIO => 'Radio',
            default => ucfirst($this->type),
        };
    }

    /**
     * Check if attribute uses visual swatches
     */
    public function usesVisualSwatches(): bool
    {
        return in_array($this->type, [self::TYPE_COLOR, self::TYPE_IMAGE]);
    }
}
