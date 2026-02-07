<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Create all modular e-commerce tables
     * This migration is idempotent - safe to run multiple times
     */
    public function up(): void
    {
        // ============================================
        // MODULES SYSTEM
        // ============================================
        if (!Schema::hasTable('modules')) {
            Schema::create('modules', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('version')->default('1.0.0');
                $table->string('icon')->nullable();
                $table->boolean('is_core')->default(false);
                $table->boolean('is_active')->default(true);
                $table->json('config')->nullable();
                $table->json('dependencies')->nullable();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // ============================================
        // PRODUCT VARIATIONS
        // ============================================
        if (!Schema::hasTable('product_attributes')) {
            Schema::create('product_attributes', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Size, Flavor, Color
                $table->string('slug')->unique();
                $table->enum('type', ['select', 'color', 'button', 'radio'])->default('select');
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('product_attribute_options')) {
            Schema::create('product_attribute_options', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attribute_id')->constrained('product_attributes')->onDelete('cascade');
                $table->string('value'); // 5lb, Chocolate, Red
                $table->string('label')->nullable();
                $table->string('color_code')->nullable(); // For color type
                $table->decimal('price_modifier', 10, 2)->default(0);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // product_variants - may already exist from base migration
        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->string('sku')->unique();
                $table->string('name')->nullable();
                $table->decimal('price', 10, 2);
                $table->decimal('sale_price', 10, 2)->nullable();
                $table->decimal('cost_price', 10, 2)->nullable();
                $table->integer('stock_quantity')->default(0);
                $table->json('attributes');
                $table->string('image')->nullable();
                $table->decimal('weight', 8, 2)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            // Add missing columns to existing table
            Schema::table('product_variants', function (Blueprint $table) {
                if (!Schema::hasColumn('product_variants', 'cost_price')) {
                    $table->decimal('cost_price', 10, 2)->nullable()->after('sale_price');
                }
                if (!Schema::hasColumn('product_variants', 'image')) {
                    $table->string('image')->nullable()->after('attributes');
                }
                if (!Schema::hasColumn('product_variants', 'weight')) {
                    $table->decimal('weight', 8, 2)->nullable()->after('image');
                }
                if (!Schema::hasColumn('product_variants', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('weight');
                }
            });
        }

        // ============================================
        // PRODUCT ADD-ONS
        // ============================================
        if (!Schema::hasTable('product_addons')) {
            Schema::create('product_addons', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->decimal('price', 10, 2);
                $table->string('image')->nullable();
                $table->boolean('is_required')->default(false);
                $table->integer('max_quantity')->default(1);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('product_addon_product')) {
            Schema::create('product_addon_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->foreignId('addon_id')->constrained('product_addons')->onDelete('cascade');
                $table->integer('sort_order')->default(0);
                $table->unique(['product_id', 'addon_id']);
            });
        }

        // ============================================
        // PRODUCT BUNDLES / COMBOS
        // ============================================
        if (!Schema::hasTable('product_bundles')) {
            Schema::create('product_bundles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('image')->nullable();
                $table->decimal('regular_price', 10, 2);
                $table->decimal('bundle_price', 10, 2);
                $table->decimal('savings_amount', 10, 2)->nullable();
                $table->integer('savings_percent')->nullable();
                $table->date('starts_at')->nullable();
                $table->date('ends_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('product_bundle_items')) {
            Schema::create('product_bundle_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('bundle_id')->constrained('product_bundles')->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
                $table->integer('quantity')->default(1);
                $table->integer('sort_order')->default(0);
            });
        }

        // ============================================
        // PRICE OFFERS / PROMOTIONS
        // ============================================
        if (!Schema::hasTable('price_offers')) {
            Schema::create('price_offers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->enum('type', ['flash_sale', 'bulk_discount', 'bogo', 'tiered', 'percentage', 'fixed']);
                $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
                $table->decimal('discount_value', 10, 2);
                $table->json('conditions')->nullable();
                $table->decimal('min_order_amount', 10, 2)->nullable();
                $table->integer('max_uses')->nullable();
                $table->integer('used_count')->default(0);
                $table->datetime('starts_at')->nullable();
                $table->datetime('ends_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('price_offer_products')) {
            Schema::create('price_offer_products', function (Blueprint $table) {
                $table->id();
                $table->foreignId('offer_id')->constrained('price_offers')->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->unique(['offer_id', 'product_id']);
            });
        }

        // ============================================
        // PAYMENT GATEWAYS
        // ============================================
        if (!Schema::hasTable('payment_gateways')) {
            Schema::create('payment_gateways', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('provider');
                $table->text('description')->nullable();
                $table->string('logo')->nullable();
                $table->json('config')->nullable();
                $table->json('supported_currencies')->nullable();
                $table->decimal('transaction_fee', 5, 2)->default(0);
                $table->enum('fee_type', ['percentage', 'fixed'])->default('percentage');
                $table->boolean('is_test_mode')->default(true);
                $table->boolean('is_active')->default(false);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('payment_transactions')) {
            Schema::create('payment_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('gateway_id')->constrained('payment_gateways');
                $table->string('transaction_id')->unique();
                $table->string('gateway_transaction_id')->nullable();
                $table->decimal('amount', 10, 2);
                $table->string('currency', 3)->default('INR');
                $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
                $table->json('gateway_response')->nullable();
                $table->text('failure_reason')->nullable();
                $table->timestamps();
            });
        }

        // ============================================
        // PRODUCT CUSTOMIZATION / IMAGE UPLOAD
        // ============================================
        if (!Schema::hasTable('product_customizations')) {
            Schema::create('product_customizations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('order_item_id')->nullable();
                $table->string('session_id')->nullable();
                $table->string('uploaded_image');
                $table->string('preview_image')->nullable();
                $table->json('customization_data')->nullable();
                $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        // ============================================
        // CHECKOUT SETTINGS
        // ============================================
        if (!Schema::hasTable('checkout_settings')) {
            Schema::create('checkout_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->string('type')->default('string');
                $table->string('group')->default('general');
                $table->timestamps();
            });

            // Seed default checkout settings
            DB::table('checkout_settings')->insert([
                ['key' => 'distraction_free_mode', 'value' => 'true', 'type' => 'boolean', 'group' => 'layout', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'guest_checkout', 'value' => 'true', 'type' => 'boolean', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'show_order_summary', 'value' => 'true', 'type' => 'boolean', 'group' => 'layout', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'require_phone', 'value' => 'true', 'type' => 'boolean', 'group' => 'fields', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // ============================================
        // SEED DEFAULT DATA (only if empty)
        // ============================================
        
        // Seed default modules
        if (Schema::hasTable('modules') && DB::table('modules')->count() === 0) {
            DB::table('modules')->insert([
                ['name' => 'Products', 'slug' => 'products', 'description' => 'Core product management', 'is_core' => true, 'is_active' => true, 'icon' => 'package', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Orders', 'slug' => 'orders', 'description' => 'Order processing and tracking', 'is_core' => true, 'is_active' => true, 'icon' => 'shopping-cart', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Users', 'slug' => 'users', 'description' => 'Customer accounts', 'is_core' => true, 'is_active' => true, 'icon' => 'users', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Coupons', 'slug' => 'coupons', 'description' => 'Discount codes and promotions', 'is_core' => false, 'is_active' => true, 'icon' => 'ticket', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Product Add-ons', 'slug' => 'addons', 'description' => 'Optional extras for products', 'is_core' => false, 'is_active' => true, 'icon' => 'plus-circle', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Bundles & Combos', 'slug' => 'bundles', 'description' => 'Product bundles with discounts', 'is_core' => false, 'is_active' => true, 'icon' => 'gift', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Price Offers', 'slug' => 'offers', 'description' => 'Flash sales and bulk pricing', 'is_core' => false, 'is_active' => true, 'icon' => 'percent', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Payment Gateways', 'slug' => 'payments', 'description' => 'Multiple payment providers', 'is_core' => false, 'is_active' => true, 'icon' => 'credit-card', 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Custom Image Upload', 'slug' => 'customization', 'description' => 'Product personalization', 'is_core' => false, 'is_active' => true, 'icon' => 'image', 'sort_order' => 9, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Distraction-Free Checkout', 'slug' => 'minimal-checkout', 'description' => 'Clean checkout experience', 'is_core' => false, 'is_active' => true, 'icon' => 'minimize', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Seed default payment gateways
        if (Schema::hasTable('payment_gateways') && DB::table('payment_gateways')->count() === 0) {
            DB::table('payment_gateways')->insert([
                ['name' => 'Razorpay', 'slug' => 'razorpay', 'provider' => 'razorpay', 'description' => 'Pay with cards, UPI, netbanking', 'is_test_mode' => true, 'is_active' => false, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Stripe', 'slug' => 'stripe', 'provider' => 'stripe', 'description' => 'International card payments', 'is_test_mode' => true, 'is_active' => false, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'PayPal', 'slug' => 'paypal', 'provider' => 'paypal', 'description' => 'PayPal checkout', 'is_test_mode' => true, 'is_active' => false, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Cash on Delivery', 'slug' => 'cod', 'provider' => 'cod', 'description' => 'Pay when you receive', 'is_test_mode' => false, 'is_active' => true, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Seed default product attributes
        if (Schema::hasTable('product_attributes') && DB::table('product_attributes')->count() === 0) {
            DB::table('product_attributes')->insert([
                ['name' => 'Size', 'slug' => 'size', 'type' => 'button', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Flavor', 'slug' => 'flavor', 'type' => 'select', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Color', 'slug' => 'color', 'type' => 'color', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkout_settings');
        Schema::dropIfExists('product_customizations');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payment_gateways');
        Schema::dropIfExists('price_offer_products');
        Schema::dropIfExists('price_offers');
        Schema::dropIfExists('product_bundle_items');
        Schema::dropIfExists('product_bundles');
        Schema::dropIfExists('product_addon_product');
        Schema::dropIfExists('product_addons');
        // Don't drop product_variants as it may be from base migration
        Schema::dropIfExists('product_attribute_options');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('modules');
    }
};
