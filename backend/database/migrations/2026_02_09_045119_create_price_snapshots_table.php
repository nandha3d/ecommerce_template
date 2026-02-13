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
        Schema::create('price_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            
            // Base pricing
            $table->unsignedBigInteger('subtotal')->comment('In smallest currency unit (paisa/cents)');
            $table->string('currency', 3)->default('INR');
            
            // Discounts breakdown
            $table->json('discount_breakdown')->nullable()->comment('Array of applied discounts');
            $table->unsignedBigInteger('total_discount')->default(0);
            
            // Tax breakdown
            $table->json('tax_breakdown')->nullable()->comment('Tax calculations per line item');
            $table->unsignedBigInteger('total_tax')->default(0);
            
            // Shipping
            $table->unsignedBigInteger('shipping_cost')->default(0);
            
            // Final amount
            $table->unsignedBigInteger('final_amount')->comment('Final payable amount');
            
            // Audit fields
            $table->string('calculation_version', 10)->default('1.0')->comment('Pricing engine version');
            $table->json('calculation_metadata')->nullable()->comment('Additional calculation context');
            
            // Immutability guarantee
            $table->timestamp('locked_at')->nullable()->comment('Once locked, cannot be modified');
            
            $table->timestamps();
            
            // Indexes
            $table->index('order_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_snapshots');
    }
};
