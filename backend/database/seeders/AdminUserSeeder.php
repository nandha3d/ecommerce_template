<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');
        $adminName = env('ADMIN_NAME', 'Admin');

        if (!$adminEmail || !$adminPassword) {
            throw new \RuntimeException("AdminUserSeeder requires ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
        }

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

