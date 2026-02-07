<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tier_settings', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'starter', 'professional', 'enterprise'
            $table->string('name');
            $table->json('limits')->nullable(); // { "max_products": 100, "max_orders": 50 }
            $table->json('features')->nullable(); // { "variants": false, "coupons": true }
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tier_settings');
    }
};
