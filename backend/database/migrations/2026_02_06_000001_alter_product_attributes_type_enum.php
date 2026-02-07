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
        // We need to modify the enum column. 
        // Since Laravel's modify() for enums can be tricky depending on DB driver,
        // we will use a raw statement for MySQL which is the target DB.
        
        // Full list from Model: text, color, image, select, button, radio
        DB::statement("ALTER TABLE product_attributes MODIFY COLUMN type ENUM('text', 'color', 'image', 'select', 'button', 'radio') NOT NULL DEFAULT 'select'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original list if needed: select, color, button, radio
        // WARNING: This depends on data not using new types.
        DB::statement("ALTER TABLE product_attributes MODIFY COLUMN type ENUM('select', 'color', 'button', 'radio') NOT NULL DEFAULT 'select'");
    }
};
