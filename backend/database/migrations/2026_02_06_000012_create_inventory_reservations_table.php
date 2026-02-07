<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants'); // Link to Variant
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade'); // Link to Order
            $table->integer('quantity'); // Reserved amount
            $table->string('status')->default('reserved'); // reserved, committed, released
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['variant_id', 'status']); // Speed up availability checks
            $table->unique(['order_id', 'variant_id']); // One reservation per variant per order
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_reservations');
    }
};
