<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * GlobalizationSeeder
 * 
 * STRICT RULE: No hardcoded currencies or timezones.
 * All currencies and timezones must be added via the Admin Panel.
 * 
 * This seeder is intentionally empty to enforce the
 * "no hardcoded data" principle. Admins must configure
 * currencies and timezones through:
 * 
 * Admin Panel -> Settings -> Currency & Timezone
 */
class GlobalizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // NO HARDCODED DATA
        // Currencies and Timezones must be added via Admin Panel
        // 
        // To add currencies/timezones:
        // 1. Login to Admin Panel
        // 2. Go to Settings -> Currency & Timezone
        // 3. Click "Add Currency" or "Add Timezone"
    }
}
