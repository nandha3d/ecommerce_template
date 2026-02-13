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
        // 1. Extend Product Variants
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('manufacturer_code')->nullable()->after('sku');
            $table->string('barcode')->nullable()->after('manufacturer_code');
            $table->integer('low_stock_threshold')->default(10)->after('stock_quantity');
        });

        // 2. Inventory Ledger for Auditing
        Schema::create('inventory_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->integer('quantity_change');
            $table->integer('new_quantity');
            $table->string('reason'); // adjustment, purchase, order_fulfillment, return, cancel
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 3. Cost Breakdown for Margin Analysis
        Schema::create('variant_cost_breakdown', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->unique()->constrained('product_variants')->onDelete('cascade');
            $table->integer('cogs')->default(0);
            $table->integer('shipping_cost')->default(0);
            $table->integer('platform_fees')->default(0);
            $table->integer('tax_amount')->default(0);
            $table->integer('total_cost')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_cost_breakdown');
        Schema::dropIfExists('inventory_ledger');
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['manufacturer_code', 'barcode', 'low_stock_threshold']);
        });
    }
};
