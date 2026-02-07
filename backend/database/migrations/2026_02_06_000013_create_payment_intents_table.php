<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('gateway_id')->nullable()->index(); // e.g., Stripe PI ID
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('status')->default('created'); // created, processing, succeeded, failed
            $table->string('payment_method')->nullable(); // card, cod, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Index for fast lookups
            $table->index(['order_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_intents');
    }
};
