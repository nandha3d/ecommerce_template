<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Set all products to active (published)
        DB::table('products')->update(['is_active' => true]);
    }

    public function down(): void
    {
        // No rollback needed
    }
};
