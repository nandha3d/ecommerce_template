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
        Schema::create('security_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 50); // cart_mutation, checkout_start, order_create, payment_attempt
            $table->string('entity_type', 50)->nullable(); // Cart, Order, Payment
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable(); // Additional context
            $table->timestamp('created_at')->useCurrent();

            // Indexes for efficient querying
            $table->index(['action', 'created_at']);
            $table->index('user_id');
            $table->index(['entity_type', 'entity_id']);
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_audit_logs');
    }
};
