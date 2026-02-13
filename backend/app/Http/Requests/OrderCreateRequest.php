<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address_id' => 'required_without:shipping_address|integer|exists:addresses,id',
            'billing_address_id' => 'required_without:billing_address|integer|exists:addresses,id',
            'shipping_address' => 'nullable|array',
            'billing_address' => 'nullable|array',
            'same_as_billing' => 'nullable|boolean',
            'payment_method' => 'required|in:razorpay,stripe,cod,card,paypal',
            'coupon_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_address_id.exists' => 'Shipping address not found',
            'billing_address_id.exists' => 'Billing address not found',
            'payment_method.in' => 'Invalid payment method selected',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Verify addresses belong to the authenticated user
            $user = auth()->user();
            
            if ($user) {
                $shippingAddress = \App\Models\Address::find($this->shipping_address_id);
                if ($shippingAddress && $shippingAddress->user_id !== $user->id) {
                    $validator->errors()->add('shipping_address_id', 'Unauthorized access to this address');
                }
                
                $billingAddress = \App\Models\Address::find($this->billing_address_id);
                if ($billingAddress && $billingAddress->user_id !== $user->id) {
                    $validator->errors()->add('billing_address_id', 'Unauthorized access to this address');
                }
            }
        });
    }
}
