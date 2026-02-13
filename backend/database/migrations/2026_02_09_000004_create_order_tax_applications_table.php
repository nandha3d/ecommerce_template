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
        Schema::create('order_tax_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('tax_rate_id')->nullable();
            $table->string('jurisdiction');
            $table->decimal('rate_applied', 5, 2); // Actual percentage (e.g., 18.00)
            $table->string('tax_type', 50); // GST, VAT, Sales Tax, etc.
            $table->integer('taxable_amount'); // Amount in minor units
            $table->integer('tax_amount'); // Amount in minor units
            $table->boolean('is_inclusive')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('tax_rate_id')->references('id')->on('tax_rates')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_tax_applications');
    }
};
