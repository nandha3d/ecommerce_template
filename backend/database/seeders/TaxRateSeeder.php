<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TaxRate;

class TaxRateSeeder extends Seeder
{
    public function run(): void
    {
        $taxRates = [
            // India GST
            [
                'country' => 'IN',
                'state' => null,
                'tax_type' => 'GST',
                'rate' => 18.00,
                'effective_from' => '2017-07-01',
                'effective_until' => null,
                'is_active' => true,
                'metadata' => [
                    'jurisdiction' => 'Central',
                    'law_reference' => 'GST Act 2017',
                ],
            ],
            // US - California
            [
                'country' => 'US',
                'state' => 'California',
                'tax_type' => 'Sales Tax',
                'rate' => 7.25,
                'effective_from' => '2020-01-01',
                'effective_until' => null,
                'is_active' => true,
                'metadata' => [
                    'jurisdiction' => 'State',
                ],
            ],
        ];
        
        foreach ($taxRates as $rate) {
            TaxRate::create($rate);
        }
    }
}
