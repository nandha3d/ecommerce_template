<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Blocked Entities - Store blocked IPs, emails, cards, devices
        Schema::create('blocked_entities', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['ip', 'email', 'card', 'device'])->index();
            $table->string('value', 255)->index();
            $table->string('reason', 500)->nullable();
            $table->foreignId('blocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            
            $table->unique(['type', 'value']);
        });

        // Fraud Checks - Audit trail for all fraud evaluations
        Schema::create('fraud_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email', 255)->nullable()->index();
            $table->string('ip_address', 45)->nullable()->index();
            $table->string('device_fingerprint', 64)->nullable()->index();
            $table->unsignedTinyInteger('score')->default(0)->comment('0-100, higher = riskier');
            $table->enum('result', ['allow', 'review', 'block'])->index();
            $table->json('risk_factors')->nullable()->comment('Array of triggered risk factors');
            $table->json('metadata')->nullable()->comment('Additional context data');
            $table->timestamps();
            
            $table->index(['created_at', 'result']);
        });

        // Payment Velocity - Track transaction frequency
        Schema::create('payment_velocities', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['ip', 'email', 'card', 'user'])->index();
            $table->string('value', 255)->index();
            $table->unsignedInteger('attempt_count')->default(1);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failure_count')->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestamp('window_start')->useCurrent();
            $table->timestamps();
            
            $table->unique(['type', 'value']);
            $table->index('window_start');
        });

        // Failed Payments - Track for recovery
        Schema::create('failed_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email', 255)->index();
            $table->string('razorpay_order_id', 100)->nullable()->index();
            $table->string('razorpay_payment_id', 100)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('INR');
            $table->string('failure_reason', 255)->nullable();
            $table->string('failure_code', 50)->nullable();
            $table->enum('recovery_status', ['pending', 'email_sent', 'recovered', 'expired', 'cancelled'])->default('pending')->index();
            $table->unsignedTinyInteger('recovery_attempts')->default(0);
            $table->timestamp('last_recovery_email_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->string('recovery_token', 64)->nullable()->unique();
            $table->timestamp('recovery_token_expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['recovery_status', 'created_at']);
        });

        // Refund Requests - Approval workflow
        Schema::create('refund_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('reason', 500);
            $table->enum('status', ['pending', 'approved', 'rejected', 'processed'])->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->string('razorpay_refund_id', 100)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refund_requests');
        Schema::dropIfExists('failed_payments');
        Schema::dropIfExists('payment_velocities');
        Schema::dropIfExists('fraud_checks');
        Schema::dropIfExists('blocked_entities');
    }
};
