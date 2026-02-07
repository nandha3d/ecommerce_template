<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Iterate over all products
        // We use a cursor to handle large datasets efficiently
        DB::table('products')->orderBy('id')->chunk(100, function ($products) {
            foreach ($products as $product) {
                // Check if product already has variants
                $variantCount = DB::table('product_variants')
                    ->where('product_id', $product->id)
                    ->count();

                if ($variantCount === 0) {
                    // Create a "Default Variant" for this Simple Product
                    // SKU logic: Use Product SKU if available, else generate
                    $sku = $product->sku;
                    if (empty($sku)) {
                        $sku = 'PROD-' . $product->id . '-DEFAULT';
                    }
                    
                    // Check if this SKU already exists in variants (sanity check)
                    $skuExists = DB::table('product_variants')->where('sku', $sku)->exists();
                    if ($skuExists) {
                        $sku = $sku . '-V1'; // Fallback
                    }

                    DB::table('product_variants')->insert([
                        'product_id' => $product->id,
                        'name' => 'Default', // Default name for simple product variant
                        'sku' => $sku,
                        'price' => $product->price,
                        'sale_price' => $product->sale_price,
                        'stock_quantity' => $product->stock_quantity ?? 0,
                        'attributes' => json_encode([]), // Empty attributes for default
                        'is_active' => $product->is_active ?? true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        // 2. Make Product columns nullable to indicate deprecation
        // We do NOT drop them yet to allow rollback and temporary backwards compatibility reading
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->change();
            // sku might be needed for display or search still, but variant SKU is authoritative
            $table->string('sku')->nullable()->change(); 
            $table->integer('stock_quantity')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert columns to not nullable (this might fail if we have nulls now)
        // Strictly speaking, down migration for data modification is hard.
        // We will just make them nullable in up, so down could make them required again,
        // but we'd need to fill them back from variants.
        
        // For now, let's just reverse the schema change if possible, 
        // but data restoration is complex. We assume this is a forward-only architectural shift.
        
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable(false)->change();
            $table->string('sku')->nullable(false)->change();
            $table->integer('stock_quantity')->default(0)->change();
        });
    }
};
