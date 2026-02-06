<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create license_tiers table
        if (!Schema::hasTable('license_tiers')) {
            Schema::create('license_tiers', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique(); // starter, professional, enterprise
                $table->string('name');
                $table->text('description')->nullable();
                $table->integer('max_products')->nullable();
                $table->integer('max_orders_monthly')->nullable();
                $table->integer('max_domains')->default(1);
                $table->integer('max_users')->nullable();
                $table->integer('max_storage_mb')->nullable();
                $table->json('features')->nullable(); // Enabled features
                $table->decimal('price_monthly', 10, 2)->nullable();
                $table->decimal('price_yearly', 10, 2)->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Seed License Tiers
        $tiers = [
            [
                'code' => 'starter',
                'name' => 'Starter',
                'description' => 'Perfect for small businesses',
                'max_products' => 100,
                'max_orders_monthly' => 50,
                'max_domains' => 1,
                'features' => json_encode(['products', 'orders', 'users', 'coupons']),
                'sort_order' => 1,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'code' => 'professional',
                'name' => 'Professional',
                'description' => 'For growing businesses',
                'max_products' => null,
                'max_orders_monthly' => null,
                'max_domains' => 1,
                'features' => json_encode(['variants', 'addons', 'bundles', 'payments']),
                'sort_order' => 2,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'code' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'For large organizations',
                'max_products' => null,
                'max_orders_monthly' => null,
                'max_domains' => 3,
                'features' => json_encode(['offers', 'customization', 'minimal-checkout']),
                'sort_order' => 3,
                'created_at' => now(), 'updated_at' => now()
            ]
        ];

        foreach ($tiers as $tier) {
            DB::table('license_tiers')->updateOrInsert(['code' => $tier['code']], $tier);
        }

        // 3. Seed Site Settings (Fraud, Payment, Cart, Checkout, etc.)
        $settings = array_merge(
            $this->fraudSettings(),
            $this->paymentSettings(),
            $this->cartSettings(),
            $this->checkoutSettings(),
            $this->taxSettings(),
            $this->shippingSettings()
        );

        foreach ($settings as $setting) {
             // Handle json encoding for value if needed, but array items are scalar mostly. 
             // Exception: arrays in value.
             if (is_array($setting['value'])) {
                 $setting['value'] = json_encode($setting['value']);
                 $setting['type'] = 'json'; // Ensure type is json
             }
             
             DB::table('site_settings')->updateOrInsert(
                 ['key' => $setting['key']],
                 array_merge($setting, ['created_at' => now(), 'updated_at' => now()])
             );
        }
    }

    private function fraudSettings(): array {
        return [
            ['key' => 'fraud.threshold.allow', 'value' => 30, 'type' => 'number', 'group' => 'fraud', 'description' => 'Fraud score below this = allow', 'is_public' => false],
            ['key' => 'fraud.threshold.block', 'value' => 70, 'type' => 'number', 'group' => 'fraud', 'description' => 'Fraud score above this = block', 'is_public' => false],
            ['key' => 'fraud.score.new_account', 'value' => 10, 'type' => 'number', 'group' => 'fraud', 'description' => 'Score for new accounts', 'is_public' => false],
            ['key' => 'fraud.score.high_amount', 'value' => 15, 'type' => 'number', 'group' => 'fraud', 'description' => 'Score for high value tx', 'is_public' => false],
            ['key' => 'fraud.amount.high_threshold', 'value' => 10000, 'type' => 'number', 'group' => 'fraud', 'description' => 'High value threshold', 'is_public' => false],
             ['key' => 'fraud.disposable_email_domains', 'value' => [
                'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com'
            ], 'type' => 'json', 'group' => 'fraud', 'description' => 'Disposable domains', 'is_public' => false],
        ];
    }

    private function paymentSettings(): array {
        return [
            ['key' => 'payment.velocity.window_hours', 'value' => 24, 'type' => 'number', 'group' => 'payment', 'description' => 'Velocity window', 'is_public' => false],
            ['key' => 'payment.velocity.limit.ip', 'value' => 10, 'type' => 'number', 'group' => 'payment', 'description' => 'Velocity IP limit', 'is_public' => false],
             ['key' => 'payment.velocity.limit.email', 'value' => 5, 'type' => 'number', 'group' => 'payment', 'description' => 'Velocity Email limit', 'is_public' => false],
        ];
    }
    
    private function cartSettings(): array
    {
        return [
            ['key' => 'cart.max_items', 'value' => 100, 'description' => 'Maximum items allowed in cart', 'type' => 'number', 'group' => 'cart', 'is_public' => true],
            ['key' => 'cart.max_quantity_per_item', 'value' => 10, 'description' => 'Maximum quantity per cart item', 'type' => 'number', 'group' => 'cart', 'is_public' => true],
        ];
    }
    
    private function checkoutSettings(): array
    {
        return [
            ['key' => 'checkout.guest_enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Allow guest checkout', 'group' => 'checkout', 'is_public' => true],
            ['key' => 'checkout.require_phone', 'value' => false, 'type' => 'boolean', 'description' => 'Phone number required', 'group' => 'checkout', 'is_public' => true],
        ];
    }
    
    private function taxSettings(): array
    {
        return [
            ['key' => 'tax.enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Enable tax calculation', 'group' => 'tax', 'is_public' => true],
            ['key' => 'tax.default_rate', 'value' => 0.18, 'description' => 'Default tax rate (decimal)', 'type' => 'number', 'group' => 'tax', 'is_public' => true],
        ];
    }
    
    private function shippingSettings(): array
    {
        return [
             ['key' => 'shipping.enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Enable shipping', 'group' => 'shipping', 'is_public' => true],
             ['key' => 'shipping.free_threshold', 'value' => 500, 'description' => 'Free shipping above this amount', 'type' => 'number', 'group' => 'shipping', 'is_public' => true],
        ];
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('license_tiers');
        // We generally don't delete settings on rollback unless specific requirements, 
        // but for strictness:
        // DB::table('site_settings')->whereIn('group', ['fraud', 'payment', 'cart', 'checkout', 'tax', 'shipping'])->delete();
    }
};
