<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkout_sessions', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->nullable()->after('payment_method_id');
            $table->decimal('discount', 10, 2)->default(0)->after('subtotal');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('discount');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('tax_amount');
            $table->decimal('total', 10, 2)->nullable()->after('shipping_cost');
            $table->string('currency', 3)->default('USD')->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('checkout_sessions', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'discount', 'tax_amount', 'shipping_cost', 'total', 'currency']);
        });
    }
};
