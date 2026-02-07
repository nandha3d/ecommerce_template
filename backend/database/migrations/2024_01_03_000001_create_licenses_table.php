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
        if (!Schema::hasTable('licenses')) {
            Schema::create('licenses', function (Blueprint $table) {
                $table->id();
                $table->string('license_key', 64)->nullable();
                $table->text('license_token')->nullable();
                $table->enum('tier', ['starter', 'professional', 'enterprise'])->default('starter');
                $table->json('enabled_modules')->nullable();
                $table->string('domain')->nullable();
                $table->string('hardware_id')->nullable();
                $table->integer('max_products')->nullable();
                $table->integer('max_orders_monthly')->nullable();
                $table->date('issued_at')->nullable();
                $table->date('expires_at')->nullable();
                $table->date('support_until')->nullable();
                $table->timestamp('last_validated_at')->nullable();
                $table->json('validation_response')->nullable();
                $table->boolean('is_active')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
