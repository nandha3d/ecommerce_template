<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Core\System\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Theme Settings Controller
 * Manages storefront theme colors from admin panel
 */
class ThemeSettingsController extends Controller
{
    /**
     * Theme keys that can be stored and are public
     */
    protected array $themeKeys = [
        'theme.preset_id',
        'theme.primary',
        'theme.bg',
        'theme.surface',
        'theme.border',
        'theme.text',
        'theme.muted',
    ];

    /**
     * Default theme (Rose Quartz preset)
     */
    protected array $defaults = [
        'theme.preset_id' => 'rose',
        'theme.primary' => '#e11d7c',
        'theme.bg' => '#fff7fb',
        'theme.surface' => '#ffffff',
        'theme.border' => '#f1dbe8',
        'theme.text' => '#2a0f1d',
        'theme.muted' => '#6e4a5a',
    ];

    /**
     * Get current theme settings
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::whereIn('key', $this->themeKeys)
            ->get()
            ->mapWithKeys(fn($s) => [$s->key => $s->value]);

        // Merge with defaults for any missing keys
        $theme = array_merge($this->defaults, $settings->toArray());

        return response()->json([
            'success' => true,
            'data' => $theme,
        ]);
    }

    /**
     * Update theme settings
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preset_id' => 'nullable|string|max:50',
            'primary' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'bg' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'surface' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'border' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'text' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'muted' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        $updated = [];

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                $fullKey = 'theme.' . $key;
                
                SiteSetting::updateOrCreate(
                    ['key' => $fullKey],
                    [
                        'value' => $value,
                        'group' => 'theme',
                        'is_public' => true,
                    ]
                );
                
                $updated[$fullKey] = $value;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Theme settings updated',
            'data' => $updated,
        ]);
    }

    /**
     * Reset theme to defaults
     */
    public function reset(): JsonResponse
    {
        foreach ($this->defaults as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'group' => 'theme',
                    'is_public' => true,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Theme reset to defaults',
            'data' => $this->defaults,
        ]);
    }
}
