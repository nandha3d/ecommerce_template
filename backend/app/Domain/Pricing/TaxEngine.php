<?php

namespace App\Domain\Pricing;

use App\Models\TaxRule;
use App\Models\Address;

class TaxEngine
{
    /**
     * Calculate tax for a given amount and location.
     * Returns tax amount in minor units.
     */
    public function calculate(int $amount, ?Address $address = null): int
    {
        if (!$address) {
            return 0;
        }

        $taxRate = TaxRate::getCurrentRate($address->country_code, $address->state_code);
        if (!$taxRate) {
            return 0;
        }

        return (int) round($amount * ($taxRate->rate / 100));
    }

    /**
     * Calculate granular tax for items.
     */
    public function calculateGranular(array $items, string $country, ?string $state = null): array
    {
        $taxRate = TaxRate::getCurrentRate($country, $state);
        
        if (!$taxRate) {
            \Log::warning('No tax rate found', [
                'country' => $country,
                'state' => $state,
            ]);
            
            return [
                'breakdown' => [],
                'total_tax' => 0,
                'jurisdiction' => null,
                'rate_applied' => 0,
                'tax_type' => null,
            ];
        }
        
        $taxBreakdown = [];
        $totalTax = 0;
        
        foreach ($items as $item) {
            // $item should have 'price' and 'name' and 'id'
            $itemTax = (int) round($item['price'] * ($taxRate->rate / 100));
            
            $taxBreakdown[] = [
                'item_id' => $item['id'] ?? null,
                'product_name' => $item['name'] ?? 'Item',
                'taxable_amount' => $item['price'],
                'tax_rate' => $taxRate->rate,
                'tax_amount' => $itemTax,
                'tax_type' => $taxRate->tax_type,
            ];
            
            $totalTax += $itemTax;
        }
        
        return [
            'breakdown' => $taxBreakdown,
            'total_tax' => $totalTax,
            'jurisdiction' => ($state ? "{$country}/{$state}" : $country),
            'rate_applied' => $taxRate->rate,
            'tax_rate_id' => $taxRate->id,
            'tax_type' => $taxRate->tax_type,
        ];
    }
}
