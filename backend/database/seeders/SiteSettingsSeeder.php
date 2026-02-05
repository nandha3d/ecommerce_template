<?php

namespace Database\Seeders;

use Core\System\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site.name', 'value' => 'ShopKart', 'group' => 'general', 'is_public' => true],
            ['key' => 'site.description', 'value' => 'Your trusted source for premium products.', 'group' => 'general', 'is_public' => true],
            
            // Contact
            ['key' => 'contact.email', 'value' => 'support@shopkart.com', 'group' => 'contact', 'is_public' => true],
            ['key' => 'contact.phone', 'value' => '1-800-SHOPKART', 'group' => 'contact', 'is_public' => true],
            ['key' => 'contact.address', 'value' => '123 Supplement Street, Health City, HC 12345', 'group' => 'contact', 'is_public' => true],
            
            // Social
            ['key' => 'social.facebook', 'value' => '#', 'group' => 'social', 'is_public' => true],
            ['key' => 'social.twitter', 'value' => '#', 'group' => 'social', 'is_public' => true],
            ['key' => 'social.instagram', 'value' => '#', 'group' => 'social', 'is_public' => true],
            
            // Features -> Flags for future use
            ['key' => 'feature.wishlist', 'value' => 'true', 'group' => 'feature', 'is_public' => true],
            ['key' => 'feature.coupons', 'value' => 'true', 'group' => 'feature', 'is_public' => true],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
