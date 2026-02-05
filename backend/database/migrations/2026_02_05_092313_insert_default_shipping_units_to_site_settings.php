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
        DB::table('site_settings')->insertOrIgnore([
            [
                'key' => 'shipping_weight_unit',
                'value' => 'kg',
                'group' => 'shipping',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'shipping_dimension_unit',
                'value' => 'cm',
                'group' => 'shipping',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')
            ->whereIn('key', ['shipping_weight_unit', 'shipping_dimension_unit'])
            ->delete();
    }
};
