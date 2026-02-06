<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\SystemSettingService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class SettingServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(SystemSettingService::class, function ($app) {
            return new SystemSettingService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(SystemSettingService $settingService): void
    {
        // Safety check: Don't try to query if migration hasn't run
        // This prevents crash during 'php artisan migrate'
        if (!Schema::hasTable('system_settings')) {
            return;
        }

        try {
            // Load all settings and injecting them into config
            // Key format in DB: 'inventory.low_stock' -> config('inventory.low_stock')
            
            // We use the service to get raw key-value pairs
            // Note: getAllCached() is protected in service, but get() usage it.
            // For bootstrapping, we might want a public method or just iterate known keys.
            // But actually, the best pattern is to just let the service handle it on demand?
            // NO, for config() helper to work with DB values transparently, we must SET config here.
            
            // Let's reflect into the service or add a method to get raw array.
            // Since we just wrote the service, let's assume we can access a method or added one.
            // Wait, I didn't add a public `getAll` method returning the raw map. 
            // I should have. Let's fix that via simple reflection or assume I can Usage ReflectionClass here 
            // OR better, just use the Model directly here for Bootstrapping to avoid circular deps.
            
            // Using DB/Cache directly here is often safer for Bootstrapping.
            
            $settings = \Illuminate\Support\Facades\Cache::rememberForever('system_settings.boot', function () {
               return \App\Models\SystemSetting::all()->mapWithKeys(function ($item) {
                   return [$item->key => $item->getValueAttribute($item->value)];
               })->toArray();
            });

            foreach ($settings as $key => $value) {
                config([$key => $value]);
            }
            
        } catch (\Exception $e) {
            // If DB connection fails (e.g. during install), don't crash everything
            Log::error('Failed to boot system settings: ' . $e->getMessage());
        }
    }
}
