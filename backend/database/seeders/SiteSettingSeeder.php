<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site.name', 'value' => 'UltraPro Supplements', 'group' => 'general', 'is_public' => true],
            ['key' => 'site.description', 'value' => 'Premium Performance Supplements', 'group' => 'general', 'is_public' => true],
            ['key' => 'contact.email', 'value' => 'support@ultrapro.com', 'group' => 'general', 'is_public' => true],
            
            // Default theme (Rose Quartz)
            ['key' => 'theme.preset_id', 'value' => 'rose', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.primary', 'value' => '#e11d7c', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.bg', 'value' => '#fff7fb', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.surface', 'value' => '#ffffff', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.border', 'value' => '#f1dbe8', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.text', 'value' => '#2a0f1d', 'group' => 'theme', 'is_public' => true],
            ['key' => 'theme.muted', 'value' => '#6e4a5a', 'group' => 'theme', 'is_public' => true],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
