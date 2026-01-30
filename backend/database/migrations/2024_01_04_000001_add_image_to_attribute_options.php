<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add image field for image swatches
        if (!Schema::hasColumn('product_attribute_options', 'image')) {
            Schema::table('product_attribute_options', function (Blueprint $table) {
                $table->string('image')->nullable()->after('color_code');
            });
        }

        // Update type enum to include 'image' and 'text'
        // SQLite doesn't support modifying enums, so we only do this for MySQL
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE product_attributes MODIFY COLUMN type ENUM('text', 'select', 'color', 'image', 'button', 'radio') DEFAULT 'text'");
        }
    }

    public function down(): void
    {
        Schema::table('product_attribute_options', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
