<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'sale_price' => $this->sale_price > 0 ? (float) $this->sale_price : null,
            'effective_price' => (float) ($this->sale_price > 0 ? $this->sale_price : $this->price),
            'is_on_sale' => $this->sale_price > 0 && $this->sale_price < $this->price,
            'discount_percent' => $this->sale_price > 0 && $this->price > 0 
                ? round((($this->price - $this->sale_price) / $this->price) * 100) 
                : 0,
            'sku' => $this->sku,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->stock_quantity > 0,
            'stock_status' => $this->stock_quantity > 10 ? 'in_stock' : ($this->stock_quantity > 0 ? 'low_stock' : 'out_of_stock'),
            'brand' => $this->whenLoaded('brand', function () {
                return [
                    'id' => $this->brand->id,
                    'name' => $this->brand->name,
                    'slug' => $this->brand->slug,
                    'logo' => $this->brand->logo,
                ];
            }),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(fn($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ]);
            }),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'alt_text' => $img->alt_text,
                    'is_primary' => $img->is_primary,
                ]);
            }),
            'primary_image' => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $primary ? $primary->url : null;
            }),
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(fn($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'name' => $v->name,
                    'price' => (float) $v->price,
                    'sale_price' => $v->sale_price > 0 ? (float) $v->sale_price : null,
                    'stock_quantity' => $v->stock_quantity,
                    'in_stock' => $v->stock_quantity > 0,
                    'attributes' => $v->attributes,
                    'image' => $v->image,
                ]);
            }),
            'average_rating' => (float) ($this->average_rating ?? 0),
            'review_count' => $this->review_count ?? 0,
            'is_active' => $this->is_active ?? true,
            'is_featured' => $this->is_featured ?? false,
            'is_bestseller' => $this->is_bestseller ?? false,
            'is_new' => $this->is_new ?? false,
            'nutrition_facts' => $this->nutrition_facts,
            'ingredients' => $this->ingredients,
            'benefits' => $this->benefits,
            'tags' => $this->tags,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            // New fields
            'is_digital' => $this->is_digital ?? false,
            'is_downloadable' => $this->is_downloadable ?? false,
            'has_customization' => $this->has_customization ?? false,
            'customization_fields' => $this->customization_fields ?? [],
            'custom_tabs' => $this->custom_tabs ?? [],
            'image_layout' => $this->image_layout ?? 'horizontal',
            'specifications' => $this->specifications,
            'addon_groups' => $this->whenLoaded('addonGroups', function () {
                return $this->addonGroups->map(fn($group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                    'selection_type' => $group->selection_type,
                    'is_required' => $group->is_required,
                    'min_selections' => $group->min_selections,
                    'max_selections' => $group->max_selections,
                    'options' => $group->options->map(fn($opt) => [
                        'id' => $opt->id,
                        'name' => $opt->name,
                        'price' => (float) $opt->price,
                        'is_default' => $opt->is_default,
                        'image' => $opt->image,
                    ]),
                ]);
            }),
            // Attribute swatches with images and configuration
            'attribute_swatches' => $this->getAttributeSwatches(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get attribute swatches with images and configuration for the storefront
     */
    private function getAttributeSwatches(): array
    {
        if (!$this->relationLoaded('variants') || $this->variants->isEmpty()) {
            return [];
        }

        // Get all unique attribute names from variants
        $attributeNames = collect();
        foreach ($this->variants as $variant) {
            $attrs = $variant->attributes;
            // Handle JSON string or array
            if (is_string($attrs)) {
                $attrs = json_decode($attrs, true) ?? [];
            }
            if (is_array($attrs)) {
                foreach (array_keys($attrs) as $attrName) {
                    $attributeNames->push($attrName);
                }
            }
        }
        $attributeNames = $attributeNames->unique()->values();

        // Fetch matching ProductAttribute records with their options
        $attributes = \App\Models\ProductAttribute::with('options')
            ->whereIn('name', $attributeNames)
            ->orWhereIn('slug', $attributeNames->map(fn($n) => \Str::slug($n)))
            ->get();

        $swatches = [];
        foreach ($attributeNames as $attrName) {
            // Find matching attribute definition
            $attribute = $attributes->first(fn($a) => 
                strcasecmp($a->name, $attrName) === 0 || 
                $a->slug === \Str::slug($attrName)
            );

            // Get unique values for this attribute from variants
            $values = $this->variants
                ->map(function ($v) use ($attrName) {
                    $attrs = $v->attributes;
                    if (is_string($attrs)) {
                        $attrs = json_decode($attrs, true) ?? [];
                    }
                    return $attrs[$attrName] ?? null;
                })
                ->filter()
                ->unique()
                ->values();

            $options = [];
            foreach ($values as $value) {
                $optionData = [
                    'value' => $value,
                    'label' => $value,
                    'image' => null,
                    'color_code' => null,
                ];

                // Match with attribute option if available
                if ($attribute) {
                    $option = $attribute->options->first(fn($o) => 
                        strcasecmp($o->value, $value) === 0 || 
                        strcasecmp($o->label, $value) === 0
                    );
                    if ($option) {
                        $optionData['image'] = $option->image;
                        $optionData['color_code'] = $option->color_code;
                    }
                }

                $options[] = $optionData;
            }

            $swatches[] = [
                'name' => $attrName,
                'type' => $attribute?->type ?? 'text',
                'show_price_diff' => $attribute?->show_price_diff ?? true,
                'options' => $options,
            ];
        }

        return $swatches;
    }
}
