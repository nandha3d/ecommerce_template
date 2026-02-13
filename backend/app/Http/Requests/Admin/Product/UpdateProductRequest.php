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
        $param = $this->route('product') ?? $this->route('id');
        $id = is_object($param) ? $param->id : $param;

        return [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $id,
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
            'video_link' => 'nullable|string|max:255',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|string|max:255',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string|max:500',
            'twitter_image' => 'nullable|string|max:255',
            'include_in_sitemap' => 'boolean',
            'sitemap_priority' => 'nullable|numeric|min:0|max:1',
            'sitemap_change_frequency' => 'nullable|string|in:always,hourly,daily,weekly,monthly,yearly,never',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation()
    {
        // Sanitize description HTML before validation
        if ($this->has('description')) {
            $this->merge([
                'description' => strip_tags(
                    $this->description,
                    '<p><br><strong><em><u><h1><h2><h3><ul><ol><li><a><blockquote><code><pre><div><span><table><thead><tbody><tr><th><td>'
                )
            ]);
        }

        // Sanitize custom tabs content
        if ($this->has('custom_tabs') && is_array($this->custom_tabs)) {
            $tabs = $this->custom_tabs;
            foreach ($tabs as &$tab) {
                if (isset($tab['content'])) {
                    $tab['content'] = strip_tags(
                        $tab['content'],
                        '<p><br><strong><em><u><h1><h2><h3><ul><ol><li><a><blockquote><code><pre><div><span><table><thead><tbody><tr><th><td>'
                    );
                }
            }
            $this->merge(['custom_tabs' => $tabs]);
        }
    }
}
