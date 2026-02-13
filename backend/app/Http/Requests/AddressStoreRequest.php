<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:shipping,billing,both',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|regex:/^[0-9+\-\(\)\s]+$/',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|size:2', // ISO 2-letter code
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
