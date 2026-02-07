<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\Address;
use App\Models\ShippingMethod;
use App\Models\ShippingRate; // Assuming model exists or returning array/DTO
use Illuminate\Support\Collection;

class ShippingCalculationService
{
    /**
     * Get available shipping methods for a cart and address.
     */
    public function getAvailableMethods(Cart $cart, ?Address $address = null): Collection
    {
        if (!$address) {
            return collect([]);
        }

        // Logic to filter methods based on weight, total, country
        return ShippingMethod::where('is_active', true)
            // ->whereJsonContains('countries', $address->country) // if using JSON column
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Calculate shipping cost for a specific method.
     */
    public function calculateCost(Cart $cart, Address $address, ShippingMethod $method): float
    {
        // 1. Check free shipping eligibility
        if ($this->isFreeShippingEligible($cart, $method)) {
            return 0.0;
        }

        // 2. Calculate based on type
        if ($method->type === 'flat_rate') {
            return $method->pricing_config['rate'] ?? 0;
        } elseif ($method->type === 'price_based') {
            // traverse tiers
        }

        return 0.0; // Default
    }

    public function isFreeShippingEligible(Cart $cart, ShippingMethod $method): bool
    {
        // Check min order amount rule
        if ($method->min_order_amount && $cart->subtotal >= $method->min_order_amount) {
            return true;
        }
        return false;
    }
}
