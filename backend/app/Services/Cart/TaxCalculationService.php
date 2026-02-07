<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Address;
use App\Models\TaxRule;
use Illuminate\Support\Collection;

class TaxCalculationService
{
    /**
     * Calculate tax for the entire cart based on address.
     */
    public function calculate(Cart $cart, ?Address $address = null): float
    {
        if (!$address) {
            // If no address, return 0 or default tax?
            // Usually 0 until address is provided, or estimate based on IP/Store location.
            // For now, return 0.
            return 0.0;
        }

        $totalTax = 0;

        foreach ($cart->items as $item) {
            $taxAmount = $this->calculateItemTax($item, $address);
            $item->tax_amount = $taxAmount;
            $item->save();
            $totalTax += $taxAmount;
        }

        return $totalTax;
    }

    /**
     * Calculate tax for a single item.
     */
    public function calculateItemTax(CartItem $item, Address $address): float
    {
        // 1. Find applicable rules
        // e.g. Country match, State match, Zip match
        $rules = TaxRule::where('is_active', true)
            ->where('country_code', $address->country) // Assuming country is code
            ->where(function($q) use ($address) {
                $q->whereNull('state_code')->orWhere('state_code', $address->state);
            })
            // ->where zip...
            ->orderBy('priority', 'desc')
            ->get();

        $rate = 0;
        foreach ($rules as $rule) {
            // Check category exemption/applicability
            if ($this->isApplicable($item, $rule)) {
                $rate += $rule->tax_rate;
            }
        }

        // Simple calculation (exclusive tax)
        // If inclusive, we'd back-calculate. 
        // Assuming exclusive for now based on 'tax_amount' field addition logic.
        return $item->total * $rate; // Tax on discounted total? Yes usually.
    }

    private function isApplicable(CartItem $item, TaxRule $rule): bool
    {
        if ($rule->applies_to === 'all') return true;
        // Check category logic if loaded
        return false;
    }
}
