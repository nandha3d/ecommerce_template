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
        Schema::table('products', function (Blueprint $table) {
            $table->string('fssai_license')->nullable()->after('brand_id');
            $table->string('batch_no')->nullable()->after('fssai_license');
            $table->date('manufacturing_date')->nullable()->after('batch_no');
            $table->date('expiry_date')->nullable()->after('manufacturing_date');
            $table->string('origin_country')->default('India')->after('expiry_date');
            $table->string('hs_code')->nullable()->after('origin_country');
            $table->boolean('is_returnable')->default(false)->after('hs_code');
            $table->integer('return_policy_days')->default(0)->after('is_returnable');
            $table->integer('stock_threshold')->default(5)->after('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'fssai_license',
                'batch_no',
                'manufacturing_date',
                'expiry_date',
                'origin_country',
                'hs_code',
                'is_returnable',
                'return_policy_days',
                'stock_threshold'
            ]);
        });
    }
};
