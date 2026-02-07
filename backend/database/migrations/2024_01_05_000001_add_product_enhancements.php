<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new fields to products table
        Schema::table('products', function (Blueprint $table) {
            // Product type
            $table->boolean('is_digital')->default(false)->after('is_bestseller');
            $table->boolean('is_downloadable')->default(false)->after('is_digital');
            $table->integer('download_limit')->nullable()->after('is_downloadable');
            $table->integer('download_expiry_days')->nullable()->after('download_limit');
            
            // Customization
            $table->boolean('has_customization')->default(false)->after('download_expiry_days');
            $table->json('customization_fields')->nullable()->after('has_customization');
            
            // Custom tabs (dynamic tabs like Nutrition, Ingredients, etc.)
            $table->json('custom_tabs')->nullable()->after('customization_fields');
            
            // Image layout preference
            $table->enum('image_layout', ['horizontal', 'vertical'])->default('horizontal')->after('custom_tabs');
        });

        // Product Add-on Groups
        Schema::create('product_addon_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->enum('selection_type', ['single', 'multiple'])->default('multiple');
            $table->boolean('is_required')->default(false);
            $table->integer('min_selections')->default(0);
            $table->integer('max_selections')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Product Add-on Options
        Schema::create('product_addon_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('addon_group_id')->constrained('product_addon_groups')->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Product Downloads (for digital products)
        Schema::create('product_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_downloads');
        Schema::dropIfExists('product_addon_options');
        Schema::dropIfExists('product_addon_groups');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_digital',
                'is_downloadable',
                'download_limit',
                'download_expiry_days',
                'has_customization',
                'customization_fields',
                'custom_tabs',
                'image_layout',
            ]);
        });
    }
};
