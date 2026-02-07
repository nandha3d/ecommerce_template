<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('product'); // Handle explicit ID or route model binding

        return [
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'nutrition_facts' => 'nullable|array',
            'ingredients' => 'nullable|string',
            'benefits' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_digital' => 'boolean',
            'is_downloadable' => 'boolean',
            'download_limit' => 'nullable|integer|min:1',
            'download_expiry_days' => 'nullable|integer|min:1',
            'has_customization' => 'boolean',
            'customization_fields' => 'nullable|array',
            'custom_tabs' => 'nullable|array',
            'image_layout' => 'nullable|in:horizontal,vertical',
            'addon_groups' => 'nullable|array',
            'specifications' => 'nullable|array',
            'images' => 'nullable|array',
            'variants' => 'nullable|array',
            'fssai_license' => 'nullable|string|max:255',
            'batch_no' => 'nullable|string|max:255',
            'manufacturing_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:manufacturing_date',
            'origin_country' => 'nullable|string|max:255',
            'hs_code' => 'nullable|string|max:255',
            'is_returnable' => 'boolean',
            'return_policy_days' => 'nullable|integer|min:0',
            'stock_threshold' => 'integer|min:0',
        ];
    }
}
