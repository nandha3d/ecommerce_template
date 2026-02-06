<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'currency_code')) {
                $table->string('currency_code', 3)->default('USD')->after('session_id');
            }
            if (!Schema::hasColumn('carts', 'locale')) {
                $table->string('locale', 10)->default('en_US')->after('currency_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['currency_code', 'locale']);
        });
    }
};
