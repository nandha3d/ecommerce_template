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
            $table->decimal('weight', 8, 2)->default(0.5)->after('stock_status'); // kg
            $table->decimal('length', 8, 2)->default(10)->after('weight'); // cm
            $table->decimal('breadth', 8, 2)->default(10)->after('length'); // cm
            $table->decimal('height', 8, 2)->default(10)->after('breadth'); // cm
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // weight already exists in product_variants, checking first just in case or modifying
            if (!Schema::hasColumn('product_variants', 'weight')) {
                $table->decimal('weight', 8, 2)->default(0.5)->after('stock_quantity');
            }
            $table->decimal('length', 8, 2)->default(10)->after('weight');
            $table->decimal('breadth', 8, 2)->default(10)->after('length');
            $table->decimal('height', 8, 2)->default(10)->after('breadth');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['weight', 'length', 'breadth', 'height']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['length', 'breadth', 'height']);
             // We don't drop weight from variants as it might have existed before, or we drop it if we added it. 
             // Safest is to leave it or check. usage context implies it might be new for some contexts but existing in model. 
             // The model had it in fillable, let's assume it might not be in DB or is safe to keep.
        });
    }
};
