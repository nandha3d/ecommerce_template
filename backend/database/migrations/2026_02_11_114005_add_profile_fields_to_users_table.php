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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->text('bio')->nullable();
            $table->string('company')->nullable();
            $table->string('website')->nullable();
            $table->string('timezone', 50)->nullable()->default('UTC');
            $table->string('locale', 5)->nullable()->default('en');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_email_verified')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('password_changed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'date_of_birth',
                'gender',
                'bio',
                'company',
                'website',
                'timezone',
                'locale',
                'is_active',
                'is_email_verified',
                'last_login_at',
                'last_login_ip',
                'password_changed_at',
            ]);
        });
    }
};
