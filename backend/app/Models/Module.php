<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'version',
        'icon',
        'is_core',
        'is_active',
        'config',
        'dependencies',
        'sort_order',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_active' => 'boolean',
        'config' => 'array',
        'dependencies' => 'array',
    ];

    /**
     * Check if module can be toggled (non-core modules only)
     */
    public function canToggle(): bool
    {
        return !$this->is_core;
    }

    /**
     * Check if module has unmet dependencies
     */
    public function hasUnmetDependencies(): bool
    {
        if (!$this->dependencies) {
            return false;
        }

        foreach ($this->dependencies as $dependency) {
            $depModule = self::where('slug', $dependency)->first();
            if (!$depModule || !$depModule->is_active) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get modules that depend on this one
     */
    public function getDependentModules()
    {
        return self::where('is_active', true)
            ->get()
            ->filter(function ($module) {
                return $module->dependencies && in_array($this->slug, $module->dependencies);
            });
    }

    /**
     * Scope for active modules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for toggleable (non-core) modules
     */
    public function scopeToggleable($query)
    {
        return $query->where('is_core', false);
    }
}
