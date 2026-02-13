<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authentication handled by middleware
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'required|integer|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:100',
            'addons' => 'nullable|array',
            'addons.*' => 'integer|exists:product_addon_options,id',
            'customizations' => 'nullable|array',
            'customizations.*.key' => 'required|string|max:255',
            'customizations.*.value' => 'required|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'product_id.exists' => 'Product not found',
            'variant_id.required' => 'Product variant is required',
            'variant_id.exists' => 'Product variant not found',
            'quantity.min' => 'Quantity must be at least 1',
            'quantity.max' => 'Quantity cannot exceed 100',
            'addons.*.exists' => 'Invalid addon selected',
        ];
    }
}
