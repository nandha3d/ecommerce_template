<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('discount_amount')->comment('Amount saved in smallest unit');
            $table->timestamp('used_at');
            
            // Prevent duplicate usage in same order
            $table->unique(['coupon_id', 'order_id']);
            
            // Indexes for performance
            $table->index(['user_id', 'coupon_id']);
            $table->index('used_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
    }
};
