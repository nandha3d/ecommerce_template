<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'discount')) {
                $table->decimal('discount', 10, 2)->default(0)->after('coupon_id');
            }
            if (!Schema::hasColumn('carts', 'subtotal')) {
                $table->decimal('subtotal', 10, 2)->default(0)->after('discount');
            }
            if (!Schema::hasColumn('carts', 'tax_amount')) {
                $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');
            }
            if (!Schema::hasColumn('carts', 'shipping_cost')) {
                $table->decimal('shipping_cost', 10, 2)->default(0)->after('tax_amount');
            }
            if (!Schema::hasColumn('carts', 'total')) {
                $table->decimal('total', 10, 2)->default(0)->after('shipping_cost');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['discount', 'subtotal', 'tax_amount', 'shipping_cost', 'total']);
        });
    }
};
