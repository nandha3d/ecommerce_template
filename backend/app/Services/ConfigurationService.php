<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ConfigurationService
{
    private const CACHE_TTL = 3600; // 1 hour
    private const CACHE_PREFIX = 'config:';
    private const PUBLIC_CACHE_KEY = 'config:public_bundle';

    /**
     * Get a setting value by key with a default fallback.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember(self::CACHE_PREFIX . $key, self::CACHE_TTL, function () use ($key, $default) {
            $setting = DB::table('site_settings')->where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            return $this->castValue($setting->value, $setting->type);
        });
    }

    /**
     * Get an integer setting.
     */
    public function getInt(string $key, int $default = 0): int
    {
        return (int) $this->get($key, $default);
    }

    /**
     * Get a float setting.
     */
    public function getFloat(string $key, float $default = 0.0): float
    {
        return (float) $this->get($key, $default);
    }

    /**
     * Get a boolean setting.
     */
    public function getBool(string $key, bool $default = false): bool
    {
        return (bool) $this->get($key, $default);
    }

    /**
     * Get an array/json setting.
     */
    public function getArray(string $key, array $default = []): array
    {
        $value = $this->get($key, $default);
        if (is_array($value)) {
            return $value;
        }
        return json_decode(json_encode($value), true) ?? $default;
    }

    /**
     * Set a configuration value.
     */
    public function set(string $key, mixed $value, string $type = 'string', string $category = 'general', bool $isPublic = false): void
    {
        $encodedValue = $value;
        if ($type === 'json' || is_array($value)) {
            $encodedValue = json_encode($value);
            $type = 'json';
        } elseif ($type === 'boolean') {
            $encodedValue = $value ? '1' : '0';
        }

        DB::table('site_settings')->updateOrInsert(
            ['key' => $key],
            [
                'value' => $encodedValue,
                'type' => $type,
                'category' => $category, // mapped from 'group' if using alias logic, but DB calls it group/category?
                // Migration used 'group' in site_settings unless I renamed it? 
                // Wait, I updated site_settings migration to add columns but didn't rename 'group'. 
                // I added 'description' and 'updated_by'.
                // So the column is 'group'. I should use 'group' here or aliases.
                'group' => $category, 
                'is_public' => $isPublic,
                'updated_at' => now(),
            ]
        );

        $this->invalidateCache($key);
    }

    /**
    public function invalidateCache(string $key): void
    {
        Cache::forget(self::CACHE_PREFIX . $key);
        Cache::forget(self::PUBLIC_CACHE_KEY);
    }

    public function invalidateAll(): void
    {
        Cache::flush();
    }

    /**
     * Get all public settings for the frontend.
     */
    public function getPublicSettings(): array
    {
        return Cache::remember(self::PUBLIC_CACHE_KEY, 300, function () { // 5 mins
            $settings = DB::table('site_settings')->where('is_public', true)->get();
            
            $mapped = [];
            foreach ($settings as $setting) {
                $mapped[$setting->key] = $this->castValue($setting->value, $setting->type);
            }
            return $mapped;
        });
    }

    /**
     * Cast value based on type.
     */
    private function castValue($value, $type)
    {
        if (is_null($value)) return null;

        return match ($type) {
            'number' => is_numeric($value) ? $value + 0 : 0, // auto int/float
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            'encrypted' => decrypt($value),
            default => (string) $value,
        };
    }
}
