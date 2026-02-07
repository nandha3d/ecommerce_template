<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TierSetting;

class TierSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'slug' => 'starter',
                'name' => 'Starter Plan',
                'limits' => [
                    'max_products' => 100,
                    'max_orders_monthly' => 50,
                    'max_domains' => 1,
                ],
                'features' => [
                    'products' => true,
                    'orders' => true,
                    'variants' => false,
                    'coupons' => false,
                ],
                'sort_order' => 1,
            ],
            [
                'slug' => 'professional',
                'name' => 'Professional Plan',
                'limits' => [
                    'max_products' => null, // Unlimited
                    'max_orders_monthly' => null,
                    'max_domains' => 1,
                ],
                'features' => [
                    'products' => true,
                    'orders' => true,
                    'variants' => true,
                    'coupons' => true,
                    'payments' => true,
                ],
                'sort_order' => 2,
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise Plan',
                'limits' => [
                    'max_products' => null,
                    'max_orders_monthly' => null,
                    'max_domains' => 3,
                ],
                'features' => [
                    'products' => true,
                    'orders' => true,
                    'variants' => true,
                    'coupons' => true,
                    'payments' => true,
                    'offers' => true,
                    'customization' => true,
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($tiers as $tier) {
            TierSetting::updateOrCreate(
                ['slug' => $tier['slug']],
                $tier
            );
        }
    }
}
