<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@shopkart.com');
        $adminPassword = env('ADMIN_PASSWORD', 'ChangeMe123!');
        $adminName = env('ADMIN_NAME', 'Admin');

        User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("Admin user created: {$adminEmail}");
        $this->command->warn('Password is set from ADMIN_PASSWORD env variable');
    }
}

