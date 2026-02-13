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
        $tables = [
            'products' => ['price' => false, 'sale_price' => true],
            'product_variants' => ['price' => false, 'sale_price' => true],
            'orders' => ['subtotal' => false, 'discount' => false, 'shipping' => false, 'tax' => false, 'total' => false],
            'order_items' => ['unit_price' => false, 'total_price' => false],
            'cart_items' => ['unit_price' => false, 'sale_price' => true, 'tax_amount' => false, 'discount_amount' => false, 'subtotal' => false, 'total' => false],
            'checkout_sessions' => ['subtotal' => false, 'discount' => false, 'tax_amount' => false, 'shipping_cost' => false, 'total' => false],
            'coupons' => ['value' => false, 'min_order_amount' => true],
            'shipping_methods' => ['min_order_amount' => true, 'max_order_amount' => true],
            'payment_methods' => ['min_amount' => true, 'max_amount' => true, 'transaction_fee_value' => false],
            'abandoned_carts' => ['cart_value' => false],
            'cart_recovery_templates' => ['discount_value' => true],
        ];

        foreach ($tables as $table => $columns) {
            if (!Schema::hasTable($table)) continue;

            // 1. Scale existing data
            foreach ($columns as $column => $isNullable) {
                if (Schema::hasColumn($table, $column)) {
                    DB::table($table)->update([
                        $column => DB::raw("ROUND(COALESCE({$column}, 0) * 100)")
                    ]);
                }
            }

            // 2. Change column type
            Schema::table($table, function (Blueprint $tableObj) use ($columns, $table) {
                foreach ($columns as $column => $isNullable) {
                    if (Schema::hasColumn($table, $column)) {
                        $col = $tableObj->unsignedBigInteger($column);
                        if ($isNullable) {
                            $col->nullable()->change();
                        } else {
                            $col->default(0)->change();
                        }
                    }
                }
            });
        }

        // 3. Add Price Snapshot to order_items for auditability
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'price_snapshot')) {
                $table->json('price_snapshot')->nullable()->after('total_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'products' => ['price', 'sale_price'],
            'product_variants' => ['price', 'sale_price'],
            'orders' => ['subtotal', 'discount', 'shipping', 'tax', 'total'],
            'order_items' => ['unit_price', 'total_price'],
            'cart_items' => ['unit_price', 'sale_price', 'tax_amount', 'discount_amount', 'subtotal', 'total'],
            'checkout_sessions' => ['subtotal', 'discount', 'tax_amount', 'shipping_cost', 'total'],
            'coupons' => ['value', 'min_order_amount'],
            'shipping_methods' => ['min_order_amount', 'max_order_amount'],
            'payment_methods' => ['min_amount', 'max_amount', 'transaction_fee_value'],
            'abandoned_carts' => ['cart_value'],
            'cart_recovery_templates' => ['discount_value'],
        ];

        foreach ($tables as $table => $columns) {
            if (!Schema::hasTable($table)) continue;

            // 1. Change type back to decimal
            Schema::table($table, function (Blueprint $tableObj) use ($columns, $table) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($table, $column)) {
                        $tableObj->decimal($column, 15, 2)->default(0)->change();
                    }
                }
            });

            // 2. Scale back down
            foreach ($columns as $column) {
                if (Schema::hasColumn($table, $column)) {
                    DB::table($table)->update([
                        $column => DB::raw("{$column} / 100")
                    ]);
                }
            }
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('price_snapshot');
        });
    }
};
