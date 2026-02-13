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
        // 1. Variant ↔ Attribute junction table for structured mapping
        Schema::create('variant_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->foreignId('attribute_id')->constrained('product_attributes')->onDelete('cascade');
            $table->foreignId('option_id')->nullable()->constrained('product_attribute_options')->onDelete('set null');
            $table->string('custom_value')->nullable(); // For freetext attributes
            $table->timestamps();

            $table->unique(['variant_id', 'attribute_id'], 'variant_attr_unique');
        });

        // 2. Price history for tracking changes over time
        Schema::create('price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->integer('old_price');
            $table->integer('new_price');
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reason')->default('manual'); // manual, bulk_update, import, promotion
            $table->timestamp('created_at')->useCurrent();

            $table->index(['variant_id', 'created_at']);
        });

        // 3. Import logs for CSV audit trail
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_rows')->default(0);
            $table->integer('success_count')->default(0);
            $table->integer('error_count')->default(0);
            $table->json('error_details')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 4. Add variation_matrix_config to products for saved matrix settings
        Schema::table('products', function (Blueprint $table) {
            $table->json('variation_matrix_config')->nullable()->after('description');
        });

        // 5. Add pricing modifier fields to product_attributes
        Schema::table('product_attributes', function (Blueprint $table) {
            $table->boolean('pricing_modifier_enabled')->default(false)->after('is_active');
            $table->integer('default_modifier_amount')->default(0)->after('pricing_modifier_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_attribute_values');
        Schema::dropIfExists('price_history');
        Schema::dropIfExists('import_logs');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('variation_matrix_config');
        });

        Schema::table('product_attributes', function (Blueprint $table) {
            $table->dropColumn(['pricing_modifier_enabled', 'default_modifier_amount']);
        });
    }
};
