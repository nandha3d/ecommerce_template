<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('price_snapshots', function (Blueprint $table) {
            $table->string('tax_jurisdiction', 100)->nullable()->after('total_tax')
                ->comment('Country/State where tax was calculated');
            $table->decimal('tax_rate_applied', 5, 2)->nullable()->after('tax_jurisdiction')
                ->comment('Tax rate percentage used');
            $table->timestamp('tax_calculated_at')->nullable()->after('tax_rate_applied')
                ->comment('When tax was calculated');
        });
    }

    public function down(): void
    {
        Schema::table('price_snapshots', function (Blueprint $table) {
            $table->dropColumn(['tax_jurisdiction', 'tax_rate_applied', 'tax_calculated_at']);
        });
    }
};
