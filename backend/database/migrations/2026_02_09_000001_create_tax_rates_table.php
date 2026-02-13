<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->string('country', 2)->comment('ISO 2-letter code (IN, US, etc.)');
            $table->string('state', 100)->nullable()->comment('State/Province');
            $table->string('tax_type', 50)->comment('GST, VAT, Sales Tax, etc.');
            $table->decimal('rate', 5, 2)->comment('Percentage (e.g., 18.00 for 18%)');
            $table->date('effective_from')->comment('When this rate becomes active');
            $table->date('effective_until')->nullable()->comment('When this rate expires (null = current)');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable()->comment('Additional tax rules, exemptions');
            $table->timestamps();
            
            // Indexes for fast lookup
            $table->index(['country', 'state', 'is_active']);
            $table->index('effective_from');
            $table->index(['effective_from', 'effective_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
