<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttributeOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'attribute_id',
        'value',
        'label',
        'color_code',
        'image',
        'price_modifier',
        'sort_order',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
    ];

    protected $appends = ['swatch_value'];

    /**
     * Get the attribute this option belongs to
     */
    public function attribute()
    {
        return $this->belongsTo(ProductAttribute::class, 'attribute_id');
    }

    /**
     * Get display label (falls back to value)
     */
    public function getDisplayLabelAttribute()
    {
        return $this->label ?? $this->value;
    }

    /**
     * Get the swatch value based on attribute type
     */
    public function getSwatchValueAttribute()
    {
        $attribute = $this->relationLoaded('attribute') ? $this->attribute : null;
        
        if (!$attribute) {
            return $this->color_code ?? $this->image ?? null;
        }

        return match($attribute->type) {
            ProductAttribute::TYPE_COLOR => $this->color_code,
            ProductAttribute::TYPE_IMAGE => $this->image,
            default => null,
        };
    }

    /**
     * Get formatted display data for frontend
     */
    public function toSwatchArray(): array
    {
        return [
            'id' => $this->id,
            'value' => $this->value,
            'label' => $this->display_label,
            'color_code' => $this->color_code,
            'image' => $this->image,
            'price_modifier' => (float) $this->price_modifier,
        ];
    }
}
