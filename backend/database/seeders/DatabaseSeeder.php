<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get credentials from environment
        $adminEmail = env('ADMIN_EMAIL', 'admin@shopkart.com');
        $adminPassword = env('ADMIN_PASSWORD', 'ChangeMe123!');
        $adminName = env('ADMIN_NAME', 'Admin User');
        
        $testCustomerEmail = env('TEST_CUSTOMER_EMAIL', 'customer@shopkart.com');
        $testCustomerPassword = env('TEST_CUSTOMER_PASSWORD', 'customer123');

        // Create Admin User
        $adminId = DB::table('users')->insertGetId([
            'name' => $adminName,
            'email' => $adminEmail,
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Test Customer
        DB::table('users')->insert([
            'name' => 'John Doe',
            'email' => $testCustomerEmail,
            'password' => Hash::make($testCustomerPassword),
            'role' => 'customer',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Categories
        $categories = [
            ['name' => 'Protein', 'slug' => 'protein', 'description' => 'Protein supplements for muscle building'],
            ['name' => 'Pre-Workout', 'slug' => 'pre-workout', 'description' => 'Energy boosters before workout'],
            ['name' => 'Vitamins & Minerals', 'slug' => 'vitamins-minerals', 'description' => 'Essential vitamins and minerals'],
            ['name' => 'Weight Loss', 'slug' => 'weight-loss', 'description' => 'Fat burners and weight management'],
            ['name' => 'Amino Acids', 'slug' => 'amino-acids', 'description' => 'BCAAs and amino acid supplements'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert(array_merge($category, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Create Brands
        $brands = [
            ['name' => 'Optimum Nutrition', 'slug' => 'optimum-nutrition'],
            ['name' => 'MuscleTech', 'slug' => 'muscletech'],
            ['name' => 'BSN', 'slug' => 'bsn'],
            ['name' => 'Cellucor', 'slug' => 'cellucor'],
            ['name' => 'MyProtein', 'slug' => 'myprotein'],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->insert(array_merge($brand, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Create Products
        $products = [
            [
                'name' => 'Gold Standard Whey Protein',
                'slug' => 'gold-standard-whey-protein',
                'description' => 'The world\'s best-selling whey protein powder. 24g of protein per serving.',
                'short_description' => '24g protein, 5.5g BCAAs per serving',
                'price' => 5999.00,
                'sale_price' => 4999.00,
                'sku' => 'ON-WHEY-001',
                'stock_quantity' => 100,
                'brand_id' => 1,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'C4 Original Pre-Workout',
                'slug' => 'c4-original-pre-workout',
                'description' => 'America\'s #1 selling pre-workout. Explosive energy and performance.',
                'short_description' => 'Energy, focus, and pump',
                'price' => 2999.00,
                'sale_price' => null,
                'sku' => 'CEL-C4-001',
                'stock_quantity' => 75,
                'brand_id' => 4,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Nitro-Tech Whey Gold',
                'slug' => 'nitro-tech-whey-gold',
                'description' => 'Premium whey protein isolate with added creatine for muscle building.',
                'short_description' => '24g protein, pure whey isolate',
                'price' => 6499.00,
                'sale_price' => 5499.00,
                'sku' => 'MT-NITRO-001',
                'stock_quantity' => 50,
                'brand_id' => 2,
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'BCAA Energy',
                'slug' => 'bcaa-energy',
                'description' => 'BCAAs with natural caffeine for energy and recovery.',
                'short_description' => '5g BCAAs + Natural Energy',
                'price' => 1999.00,
                'sale_price' => null,
                'sku' => 'EVL-BCAA-001',
                'stock_quantity' => 120,
                'brand_id' => 3,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Impact Whey Protein',
                'slug' => 'impact-whey-protein',
                'description' => 'High-quality whey protein at an affordable price. Multiple flavors available.',
                'short_description' => '21g protein per serving',
                'price' => 3999.00,
                'sale_price' => 3499.00,
                'sku' => 'MP-IMPACT-001',
                'stock_quantity' => 200,
                'brand_id' => 5,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Syntha-6 Protein',
                'slug' => 'syntha-6-protein',
                'description' => 'Ultra-premium protein matrix with amazing taste.',
                'short_description' => '22g protein, tastes like a milkshake',
                'price' => 5499.00,
                'sale_price' => null,
                'sku' => 'BSN-SYN6-001',
                'stock_quantity' => 60,
                'brand_id' => 3,
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            $productId = DB::table('products')->insertGetId(array_merge($product, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            // Link products to categories
            DB::table('category_product')->insert([
                'product_id' => $productId,
                'category_id' => rand(1, 5),
            ]);
        }

        // Create a coupon
        DB::table('coupons')->insert([
            'code' => 'WELCOME10',
            'description' => '10% off on your first order',
            'type' => 'percentage',
            'value' => 10.00,
            'min_order_amount' => 1000.00,
            'max_uses' => 1000,
            'used_count' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Admin Credentials:');
        $this->command->info('  Email: ' . env('ADMIN_EMAIL', 'admin@shopkart.com'));
        $this->command->warn('  Password: (set in ADMIN_PASSWORD env variable)');
        $this->command->info('');
        $this->command->info('Customer Credentials:');
        $this->command->info('  Email: ' . env('TEST_CUSTOMER_EMAIL', 'customer@shopkart.com'));
        $this->command->warn('  Password: (set in TEST_CUSTOMER_PASSWORD env variable)');
    }
}
