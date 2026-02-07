<?php

namespace App\Services;

use App\Models\Module;
use Illuminate\Support\Facades\Cache;

class ModuleManager
{
    protected array $loadedModules = [];
    protected ?LicenseManager $licenseManager = null;
    
    const CACHE_KEY = 'active_modules';
    // Removed const CACHE_TTL

    public function __construct(private ConfigurationService $config)
    {
        // Lazy load to avoid circular dependencies
        $this->licenseManager = app(LicenseManager::class);
    }

    private function getCacheTTL(): int
    {
        return $this->config->getInt('cache.ttl.modules', 3600);
    }

    /**
     * Get all modules with license status
     */
    public function all()
    {
        $modules = Module::orderBy('sort_order')->get();
        
        return $modules->map(function ($module) {
            $module->is_licensed = $this->isLicensed($module->slug);
            return $module;
        });
    }

    /**
     * Active modules (both enabled and licensed)
     */
    public function active()
    {
        return Cache::remember(self::CACHE_KEY, $this->getCacheTTL(), function () {
            return Module::active()->orderBy('sort_order')->get()->filter(function ($module) {
                return $this->isLicensed($module->slug);
            });
        });
    }

    /**
     * Check if module is licensed
     */
    public function isLicensed(string $slug): bool
    {
        // Core modules are always licensed
        $coreModules = ['products', 'orders', 'users'];
        if (in_array($slug, $coreModules)) {
            return true;
        }

        return $this->licenseManager->hasModule($slug);
    }

    /**
     * Check if module is active (enabled AND licensed)
     */
    public function isActive(string $slug): bool
    {
        // First check if licensed
        if (!$this->isLicensed($slug)) {
            return false;
        }

        // Then check if enabled in database
        $modules = Module::where('slug', $slug)->where('is_active', true)->exists();
        return $modules;
    }

    /**
     * Check if module is enabled (database setting only)
     */
    public function isEnabled(string $slug): bool
    {
        return Module::where('slug', $slug)->where('is_active', true)->exists();
    }

    /**
     * Enable a module
     */
    public function enable(string $slug): bool
    {
        $module = Module::where('slug', $slug)->first();
        
        if (!$module) {
            throw new \Exception("Module not found: {$slug}");
        }

        if ($module->is_core) {
            throw new \Exception("Cannot modify core module");
        }

        // Check if licensed before enabling
        if (!$this->isLicensed($slug)) {
            throw new \Exception("Module not licensed. Please upgrade your license to enable {$module->name}.");
        }

        // Check dependencies
        if ($module->hasUnmetDependencies()) {
            throw new \Exception("Module has unmet dependencies");
        }

        $module->update(['is_active' => true]);
        $this->clearCache();
        
        return true;
    }

    /**
     * Disable a module
     */
    public function disable(string $slug): bool
    {
        $module = Module::where('slug', $slug)->first();
        
        if (!$module) {
            throw new \Exception("Module not found: {$slug}");
        }

        if ($module->is_core) {
            throw new \Exception("Cannot disable core module");
        }

        // Check if other modules depend on this
        $dependents = $module->getDependentModules();
        if ($dependents->isNotEmpty()) {
            $names = $dependents->pluck('name')->join(', ');
            throw new \Exception("Cannot disable: required by {$names}");
        }

        $module->update(['is_active' => false]);
        $this->clearCache();
        
        return true;
    }

    /**
     * Toggle module state
     */
    public function toggle(string $slug): array
    {
        $module = Module::where('slug', $slug)->first();
        
        if (!$module) {
            throw new \Exception("Module not found: {$slug}");
        }

        // Check license first
        if (!$this->isLicensed($slug) && !$module->is_active) {
            return [
                'success' => false,
                'licensed' => false,
                'message' => "Upgrade your license to enable {$module->name}",
                'upgrade_url' => config('supplepro.upgrade_url'),
            ];
        }

        if ($module->is_active) {
            $this->disable($slug);
            return [
                'success' => true,
                'is_active' => false,
                'message' => "{$module->name} disabled",
            ];
        } else {
            $this->enable($slug);
            return [
                'success' => true,
                'is_active' => true,
                'message' => "{$module->name} enabled",
            ];
        }
    }

    /**
     * Get module configuration
     */
    public function getConfig(string $slug): array
    {
        $module = Module::where('slug', $slug)->first();
        return $module ? ($module->config ?? []) : [];
    }

    /**
     * Update module configuration
     */
    public function updateConfig(string $slug, array $config): bool
    {
        $module = Module::where('slug', $slug)->first();
        
        if (!$module) {
            throw new \Exception("Module not found: {$slug}");
        }

        $module->update(['config' => array_merge($module->config ?? [], $config)]);
        $this->clearCache();
        
        return true;
    }

    /**
     * Clear module cache
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Get module features for frontend (with license status)
     */
    public function getFeatureFlags(): array
    {
        $modules = Module::all();
        $flags = [];

        foreach ($modules as $module) {
            $key = str_replace('-', '_', $module->slug);
            $flags[$key] = [
                'enabled' => $module->is_active,
                'licensed' => $this->isLicensed($module->slug),
                'active' => $module->is_active && $this->isLicensed($module->slug),
            ];
        }

        return $flags;
    }

    /**
     * Get all modules with full status for admin
     */
    public function getModulesForAdmin(): array
    {
        $modules = Module::orderBy('sort_order')->get();
        $license = $this->licenseManager->getLicense();

        return $modules->map(function ($module) use ($license) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'description' => $module->description,
                'icon' => $module->icon,
                'version' => $module->version,
                'is_core' => $module->is_core,
                'is_enabled' => $module->is_active,
                'is_licensed' => $this->isLicensed($module->slug),
                'is_active' => $module->is_active && $this->isLicensed($module->slug),
                'can_toggle' => !$module->is_core && $this->isLicensed($module->slug),
                'requires_upgrade' => !$module->is_core && !$this->isLicensed($module->slug),
                'required_tier' => $this->getRequiredTier($module->slug),
            ];
        })->toArray();
    }

    /**
     * Get required tier for a module
     */
    protected function getRequiredTier(string $slug): string
    {
        $tiers = config('supplepro.module_tiers', []);
        return $tiers[$slug] ?? 'professional';
    }
}
