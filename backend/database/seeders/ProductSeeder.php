<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use Core\Product\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeOption;
use App\Models\ProductAddon;
use App\Models\ProductBundle;
use App\Models\ProductBundleItem;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\PriceOffer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ========================================
        // 1. SYNC GLOBAL ATTRIBUTES
        // ========================================
        
        // Size Attribute
        $sizeAttr = ProductAttribute::firstOrCreate(
            ['slug' => 'size'],
            [
                'name' => 'Size',
                'type' => 'text',
                'is_active' => true,
                'show_price_diff' => true,
                'sort_order' => 1,
            ]
        );

        $sizeOptions = ['1 lb', '2 lb', '5 lb', 'S', 'M', 'L', 'XL', '180 Tabs', '90 Caps'];
        foreach ($sizeOptions as $idx => $val) {
            ProductAttributeOption::firstOrCreate(
                ['attribute_id' => $sizeAttr->id, 'value' => $val],
                ['label' => $val, 'sort_order' => $idx + 1]
            );
        }

        // Flavor Attribute
        $flavorAttr = ProductAttribute::firstOrCreate(
            ['slug' => 'flavor'],
            [
                'name' => 'Flavor',
                'type' => 'text', // Using text/button for flavor now
                'is_active' => true,
                'show_price_diff' => false,
                'sort_order' => 2,
            ]
        );

        $flavorOptions = [
            'Double Rich Chocolate', 'Vanilla Ice Cream', 'Strawberry', 
            'Blue Raspberry', 'Fruit Punch', 'Watermelon', 'Green Apple', 'Unflavored'
        ];
        foreach ($flavorOptions as $idx => $val) {
            ProductAttributeOption::firstOrCreate(
                ['attribute_id' => $flavorAttr->id, 'value' => $val],
                ['label' => $val, 'sort_order' => $idx + 1]
            );
        }

        // Color Attribute (example for apparel)
        $colorAttr = ProductAttribute::firstOrCreate(
            ['slug' => 'color'],
            [
                'name' => 'Color',
                'type' => 'color',
                'is_active' => true,
                'show_price_diff' => false,
                'sort_order' => 3,
            ]
        );

        $colors = [
            ['Red', '#ef4444'], 
            ['Blue', '#3b82f6'], 
            ['Black', '#000000'], 
            ['White', '#ffffff'],
            ['Green', '#22c55e']
        ];
        foreach ($colors as $idx => $c) {
            ProductAttributeOption::firstOrCreate(
                ['attribute_id' => $colorAttr->id, 'value' => $c[0]],
                ['label' => $c[0], 'color_code' => $c[1], 'sort_order' => $idx + 1]
            );
        }

        $this->command->info('✅ Synced Global Attributes (Size, Flavor, Color)');

        // Create Categories
        $supplements = Category::firstOrCreate(
            ['slug' => 'supplements'],
            [
                'name' => 'Supplements',
                'description' => 'Health and fitness supplements',
                'image' => 'https://images.unsplash.com/photo-1544991875-5dc1b686-b96f?w=400',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $protein = Category::firstOrCreate(
            ['slug' => 'protein'],
            [
                'name' => 'Protein',
                'description' => 'High quality protein powders',
                'parent_id' => $supplements->id,
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $preworkout = Category::firstOrCreate(
            ['slug' => 'pre-workout'],
            [
                'name' => 'Pre-Workout',
                'description' => 'Energy and performance boosters',
                'parent_id' => $supplements->id,
                'image' => 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $vitamins = Category::firstOrCreate(
            ['slug' => 'vitamins-minerals'],
            [
                'name' => 'Vitamins & Minerals',
                'description' => 'Essential nutrients for overall health',
                'parent_id' => $supplements->id,
                'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $weightLoss = Category::firstOrCreate(
            ['slug' => 'weight-loss'],
            [
                'name' => 'Weight Loss',
                'description' => 'Support your weight management goals',
                'parent_id' => $supplements->id,
                'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
                'is_active' => true,
                'sort_order' => 4,
            ]
        );

        // Create Brands
        $optimumNutrition = Brand::firstOrCreate(
            ['slug' => 'optimum-nutrition'],
            [
                'name' => 'Optimum Nutrition',
                'description' => 'The World\'s #1 Selling Whey Protein Brand',
                'logo' => 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Optimum_Nutrition_logo.svg/200px-Optimum_Nutrition_logo.svg.png',
                'is_active' => true,
            ]
        );

        $musclePharm = Brand::firstOrCreate(
            ['slug' => 'musclepharm'],
            [
                'name' => 'MusclePharm',
                'description' => 'Premium Sports Nutrition',
                'logo' => 'https://www.musclepharm.com/cdn/shop/files/mp-logo.png',
                'is_active' => true,
            ]
        );

        // ========================================
        // PRODUCT 1: Gold Standard Whey
        // ========================================
        $wheyProduct = Product::firstOrCreate(
            ['slug' => 'gold-standard-whey-protein'],
            [
                'name' => 'Gold Standard 100% Whey Protein',
                'sku' => 'ON-GS-WHEY-001',
                'description' => 'The World\'s Best Selling Whey Protein Powder. Each serving provides 24g of protein.',
                'short_description' => '24g Protein per serving, 5.5g BCAAs',
                'price' => 79.99,
                'sale_price' => 74.99,
                'brand_id' => $optimumNutrition->id,
                'stock_quantity' => 150,
                'is_active' => true,
                'is_featured' => true,
                'is_new' => true,
                'seo_title' => 'Gold Standard Whey Protein',
                'seo_description' => 'Buy Gold Standard 100% Whey Protein',
            ]
        );

        // Link to categories via pivot table (handles BelongsToMany)
        if (method_exists($wheyProduct, 'categories')) {
            $wheyProduct->categories()->syncWithoutDetaching([$protein->id]);
        }

        // Images
        ProductImage::firstOrCreate(
            ['product_id' => $wheyProduct->id, 'sort_order' => 0],
            [
                'url' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
                'alt_text' => 'Gold Standard Whey Protein',
                'is_primary' => true,
            ]
        );

        // Variants
        $variants = [
            ['flavor' => 'Double Rich Chocolate', 'size' => '1 lb', 'price' => 34.99, 'stock' => 25],
            ['flavor' => 'Double Rich Chocolate', 'size' => '2 lb', 'price' => 54.99, 'stock' => 30],
            ['flavor' => 'Double Rich Chocolate', 'size' => '5 lb', 'price' => 79.99, 'stock' => 20],
            ['flavor' => 'Vanilla Ice Cream', 'size' => '1 lb', 'price' => 34.99, 'stock' => 20],
            ['flavor' => 'Vanilla Ice Cream', 'size' => '2 lb', 'price' => 54.99, 'stock' => 25],
            ['flavor' => 'Vanilla Ice Cream', 'size' => '5 lb', 'price' => 79.99, 'stock' => 15],
        ];

        foreach ($variants as $v) {
            $sku = 'ON-GS-' . Str::slug($v['flavor']) . '-' . Str::slug($v['size']);
            ProductVariant::firstOrCreate(
                ['product_id' => $wheyProduct->id, 'sku' => $sku],
                [
                    'name' => $v['flavor'] . ' - ' . $v['size'],
                    'price' => $v['price'],
                    'stock_quantity' => $v['stock'],
                    'attributes' => ['Flavor' => $v['flavor'], 'Size' => $v['size']],
                    'is_active' => true,
                ]
            );
        }

        // Addons
        $shakerAddon = ProductAddon::firstOrCreate(
            ['slug' => 'shaker-bottle'],
            [
                'name' => 'Shaker Bottle',
                'description' => 'Premium BPA-free shaker bottle',
                'price' => 9.99,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
        
        if (method_exists($wheyProduct, 'addons')) {
            $wheyProduct->addons()->syncWithoutDetaching([$shakerAddon->id => ['sort_order' => 1]]);
        }

        // ========================================
        // PRODUCT 2: Combat Pre-Workout
        // ========================================
        $preworkoutProduct = Product::firstOrCreate(
            ['slug' => 'combat-pre-workout'],
            [
                'name' => 'Combat Pre-Workout Energy Boost',
                'sku' => 'MP-COMBAT-PRE-001',
                'description' => 'Explosive energy and focus formula. 200mg caffeine for maximum performance.',
                'short_description' => '200mg Caffeine, Intense Focus & Energy',
                'price' => 39.99,
                'sale_price' => 34.99,
                'brand_id' => $musclePharm->id,
                'stock_quantity' => 85,
                'is_active' => true,
                'is_featured' => true,
                'is_bestseller' => true,
                'seo_title' => 'Combat Pre-Workout',
                'seo_description' => 'MusclePharm Combat Pre-Workout',
            ]
        );

        if (method_exists($preworkoutProduct, 'categories')) {
            $preworkoutProduct->categories()->syncWithoutDetaching([$preworkout->id]);
        }

        ProductImage::firstOrCreate(
            ['product_id' => $preworkoutProduct->id, 'sort_order' => 0],
            [
                'url' => 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800',
                'alt_text' => 'Combat Pre-Workout',
                'is_primary' => true,
            ]
        );

        // Variants
        foreach (['Blue Raspberry', 'Fruit Punch', 'Watermelon'] as $flavor) {
            $sku = 'MP-COMBAT-' . Str::slug($flavor);
            ProductVariant::firstOrCreate(
                ['product_id' => $preworkoutProduct->id, 'sku' => $sku],
                [
                    'name' => $flavor,
                    'price' => 39.99,
                    'stock_quantity' => rand(20, 40),
                    'attributes' => ['Flavor' => $flavor],
                    'is_active' => true,
                ]
            );
        }

        // ========================================
        // BUNDLE: Stack Deal (correct columns)
        // ========================================
        $bundle = ProductBundle::firstOrCreate(
            ['slug' => 'ultimate-muscle-stack'],
            [
                'name' => 'Ultimate Muscle Stack',
                'description' => 'Save 20% when you buy together!',
                'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
                'regular_price' => 119.98,  // 79.99 + 39.99
                'bundle_price' => 95.98,    // 20% off
                'savings_amount' => 23.99,
                'savings_percent' => 20,
                'is_active' => true,
                'starts_at' => now()->toDateString(),
                'ends_at' => now()->addMonths(3)->toDateString(),
                'sort_order' => 1,
            ]
        );

        ProductBundleItem::firstOrCreate(
            ['bundle_id' => $bundle->id, 'product_id' => $wheyProduct->id],
            ['quantity' => 1, 'sort_order' => 1]
        );
        ProductBundleItem::firstOrCreate(
            ['bundle_id' => $bundle->id, 'product_id' => $preworkoutProduct->id],
            ['quantity' => 1, 'sort_order' => 2]
        );

        // ========================================
        // PRICE OFFER (correct columns)
        // ========================================
        $offer = PriceOffer::firstOrCreate(
            ['slug' => 'new-year-sale'],
            [
                'name' => 'New Year Sale - 15% Off Protein',
                'description' => 'Start the new year strong!',
                'type' => 'flash_sale',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'min_order_amount' => 50,
                'max_uses' => 100,
                'used_count' => 0,
                'starts_at' => now(),
                'ends_at' => now()->addDays(30),
                'is_active' => true,
            ]
        );

        // Link offer to products if pivot table exists
        if (method_exists($offer, 'products')) {
            $offer->products()->syncWithoutDetaching([$wheyProduct->id]);
        }

        // ========================================
        // PRODUCT 3: Multivitamin
        // ========================================
        $multivitamin = Product::firstOrCreate(
            ['slug' => 'daily-multivitamin'],
            [
                'name' => 'Opti-Men Multivitamin',
                'sku' => 'ON-OPTI-MEN-001',
                'description' => 'Comprehensive nutrient optimization system for active men.',
                'short_description' => '75+ Active Ingredients',
                'price' => 29.99,
                'brand_id' => $optimumNutrition->id,
                'stock_quantity' => 100,
                'is_active' => true,
                'is_featured' => true,
                'seo_title' => 'Opti-Men Multivitamin',
            ]
        );

        if (method_exists($multivitamin, 'categories')) {
            $multivitamin->categories()->syncWithoutDetaching([$vitamins->id]);
        }

        ProductImage::firstOrCreate(
            ['product_id' => $multivitamin->id, 'sort_order' => 0],
            ['url' => 'https://images.unsplash.com/photo-1550572017-4fcd95616d73?w=800', 'is_primary' => true]
        );

        // ========================================
        // PRODUCT 4: Fish Oil
        // ========================================
        $fishOil = Product::firstOrCreate(
            ['slug' => 'omega-3-fish-oil'],
            [
                'name' => 'Platinum 100% Fish Oil',
                'sku' => 'MT-FISHOIL-001',
                'description' => 'Ultra-pure omega-3 fatty acids for heart and joint health.',
                'short_description' => '300mg Omega-3s per serving',
                'price' => 19.99,
                'brand_id' => $musclePharm->id,
                'stock_quantity' => 200,
                'is_active' => true,
                'is_bestseller' => true,
                'seo_title' => 'Platinum Fish Oil',
            ]
        );

        if (method_exists($fishOil, 'categories')) {
            $fishOil->categories()->syncWithoutDetaching([$vitamins->id]);
        }

        ProductImage::firstOrCreate(
            ['product_id' => $fishOil->id, 'sort_order' => 0],
            ['url' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800', 'is_primary' => true]
        );

        // ========================================
        // PRODUCT 5: Fat Burner
        // ========================================
        $fatBurner = Product::firstOrCreate(
            ['slug' => 'shred-fat-burner'],
            [
                'name' => 'Hyper Shred Fat Burner',
                'sku' => 'BSN-SHRED-001',
                'description' => 'Thermodynamic metabolic activator for weight management.',
                'short_description' => 'Energy, Focus, Weight Management',
                'price' => 44.99,
                'sale_price' => 39.99,
                'brand_id' => $optimumNutrition->id,
                'stock_quantity' => 60,
                'is_active' => true,
                'is_new' => true,
                'seo_title' => 'Hyper Shred Fat Burner',
            ]
        );

        if (method_exists($fatBurner, 'categories')) {
            $fatBurner->categories()->syncWithoutDetaching([$weightLoss->id]);
        }

        ProductImage::firstOrCreate(
            ['product_id' => $fatBurner->id, 'sort_order' => 0],
            ['url' => 'https://images.unsplash.com/photo-1576091160550-21733e6373db?w=800', 'is_primary' => true]
        );

        // ========================================
        // PRODUCT 6: Creatine
        // ========================================
        $creatine = Product::firstOrCreate(
            ['slug' => 'micronized-creatine'],
            [
                'name' => 'Micronized Creatine Powder',
                'sku' => 'ON-CREATINE-001',
                'description' => 'Pure creatine monohydrate for muscle strength and power.',
                'short_description' => '5g Creatine Monohydrate per serving',
                'price' => 24.99,
                'brand_id' => $optimumNutrition->id,
                'stock_quantity' => 300,
                'is_active' => true,
                'is_bestseller' => true,
                'seo_title' => 'Micronized Creatine',
            ]
        );

        if (method_exists($creatine, 'categories')) {
            $creatine->categories()->syncWithoutDetaching([$supplements->id]);
        }

        ProductImage::firstOrCreate(
            ['product_id' => $creatine->id, 'sort_order' => 0],
            ['url' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800', 'is_primary' => true]
        );

        $this->command->info('✅ Created additional sample products (Vitamins, Fish Oil, Fat Burner, Creatine)!');

        $this->command->info('✅ Created 2 products with variants, addons, bundle, and price offer!');
    }
}
