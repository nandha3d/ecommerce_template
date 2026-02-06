<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class SystemSettingService
{
    protected const CACHE_KEY = 'system_settings.all';
    protected const PUBLIC_CACHE_KEY = 'system_settings.public';

    /**
     * Get a setting value by key, with default fallback
     */
    public function get(string $key, $default = null)
    {
        $settings = $this->getAllCached();
        return $settings[$key] ?? $default;
    }

    /**
     * Set a setting value
     */
    public function set(string $key, $value): void
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if ($setting) {
            $setting->value = $value;
            $setting->save();
        } else {
            // Determine type from value if possible, or default to string
            $type = 'string';
            if (is_int($value)) $type = 'integer';
            if (is_bool($value)) $type = 'boolean';
            if (is_array($value)) $type = 'json';
            
            SystemSetting::create([
                'key' => $key,
                'value' => $value,
                'type' => $type,
                'group' => 'general', // Default group
            ]);
        }

        $this->clearCache();
    }

    /**
     * Get all public settings (safe for frontend)
     */
    public function getPublicSettings(): array
    {
        return Cache::rememberForever(self::PUBLIC_CACHE_KEY, function () {
            return SystemSetting::where('is_public', true)
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->key => $item->value];
                })
                ->toArray();
        });
    }

    /**
     * Get all settings from cache or DB
     */
    protected function getAllCached(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return SystemSetting::all()
                ->mapWithKeys(function ($item) {
                    return [$item->key => $item->value];
                })
                ->toArray();
        });
    }

    /**
     * Clear settings cache
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::PUBLIC_CACHE_KEY);
    }
}
