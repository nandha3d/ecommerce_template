<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('modules')->insert([
            'name' => 'Shiprocket Shipping',
            'slug' => 'shipping_shiprocket',
            'description' => 'Integrate Shiprocket for automated shipping, labels, and tracking.',
            'icon' => 'truck',
            'version' => '1.0.0',
            'is_core' => false,
            'is_active' => false,
            'config' => json_encode([
                'email' => '',
                'password' => '',
                'pickup_location' => 'Primary'
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('modules')->where('slug', 'shipping_shiprocket')->delete();
    }
};
