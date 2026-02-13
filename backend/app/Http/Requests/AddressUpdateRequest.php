<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|in:shipping,billing,both',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[0-9+\-\(\)\s]+$/',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|size:2', // ISO 2-letter code
            'is_default' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Address type must be shipping, billing, or both',
            'phone.regex' => 'Phone number format is invalid',
            'country.size' => 'Country must be a 2-letter ISO code',
        ];
    }
}
