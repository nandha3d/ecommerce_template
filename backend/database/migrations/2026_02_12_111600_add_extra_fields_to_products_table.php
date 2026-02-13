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
        Schema::table('products', function (Blueprint $table) {
            // Media
            if (!Schema::hasColumn('products', 'video_link')) {
                $table->string('video_link')->nullable()->after('description');
            }

            // Social Media Meta Tags
            if (!Schema::hasColumn('products', 'og_title')) {
                $table->string('og_title')->nullable()->after('seo_description');
                $table->text('og_description')->nullable()->after('og_title');
                $table->string('og_image')->nullable()->after('og_description');
            }

            if (!Schema::hasColumn('products', 'twitter_title')) {
                $table->string('twitter_title')->nullable()->after('og_image');
                $table->text('twitter_description')->nullable()->after('twitter_title');
                $table->string('twitter_image')->nullable()->after('twitter_description');
            }

            // Sitemap Settings
            if (!Schema::hasColumn('products', 'include_in_sitemap')) {
                $table->boolean('include_in_sitemap')->default(true)->after('twitter_image');
                $table->decimal('sitemap_priority', 2, 1)->default(0.5)->after('include_in_sitemap');
                $table->string('sitemap_change_frequency')->default('weekly')->after('sitemap_priority');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'video_link',
                'og_title',
                'og_description',
                'og_image',
                'twitter_title',
                'twitter_description',
                'twitter_image',
                'include_in_sitemap',
                'sitemap_priority',
                'sitemap_change_frequency',
            ]);
        });
    }
};
