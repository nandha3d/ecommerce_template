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
    public function calculate(Cart $cart, ?Address $address = null): int
    {
        if (!$address) {
            // If no address, return 0 or default tax?
            // Usually 0 until address is provided, or estimate based on IP/Store location.
            // For now, return 0.
            return 0;
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
    public function calculateItemTax(CartItem $item, Address $address): int
    {
        // ... (find rules logic)
        $rate = 0;
        foreach (TaxRule::where('is_active', true)->where('country_code', $address->country)->get() as $rule) {
            if ($this->isApplicable($item, $rule)) {
                $rate += $rule->tax_rate;
            }
        }

        // Simple calculation (exclusive tax)
        return (int) round($item->total_price * ($rate / 100)); // rate is percentage (e.g. 18.0)
    }

    private function isApplicable(CartItem $item, TaxRule $rule): bool
    {
        if ($rule->applies_to === 'all') return true;
        // Check category logic if loaded
        return false;
    }
}
