<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class License extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_key',
        'license_token',
        'tier',
        'enabled_modules',
        'domain',
        'hardware_id',
        'max_products',
        'max_orders_monthly',
        'issued_at',
        'expires_at',
        'support_until',
        'last_validated_at',
        'validation_response',
        'is_active',
    ];

    protected $casts = [
        'enabled_modules' => 'array',
        'validation_response' => 'array',
        'issued_at' => 'date',
        'expires_at' => 'date',
        'support_until' => 'date',
        'last_validated_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Check if a specific module is licensed
     */
    public function hasModule(string $moduleSlug): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $modules = $this->enabled_modules ?? [];
        
        // Wildcard means all modules
        if (in_array('*', $modules)) {
            return true;
        }

        return in_array($moduleSlug, $modules);
    }

    /**
     * Check if license is expired
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false; // Lifetime license
        }

        return $this->expires_at->isPast();
    }

    /**
     * Check if support has expired
     */
    public function isSupportExpired(): bool
    {
        if (!$this->support_until) {
            return true;
        }

        return $this->support_until->isPast();
    }

    /**
     * Check if license is currently valid
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Get tier display name
     */
    public function getTierDisplayAttribute(): string
    {
        return match($this->tier) {
            'starter' => 'Starter',
            'professional' => 'Professional',
            'enterprise' => 'Enterprise',
            default => ucfirst($this->tier),
        };
    }

    /**
     * Get licensed module count
     */
    public function getModuleCountAttribute(): int
    {
        $modules = $this->enabled_modules ?? [];
        
        if (in_array('*', $modules)) {
            return -1; // Unlimited
        }

        return count($modules);
    }

    /**
     * Check product limit
     */
    public function canAddProduct(int $currentCount): bool
    {
        if ($this->max_products === null) {
            return true; // Unlimited
        }

        return $currentCount < $this->max_products;
    }

    /**
     * Check monthly order limit
     */
    public function canProcessOrder(int $monthlyCount): bool
    {
        if ($this->max_orders_monthly === null) {
            return true; // Unlimited
        }

        return $monthlyCount < $this->max_orders_monthly;
    }

    /**
     * Get status badge class
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'revoked';
        }

        if ($this->isExpired()) {
            return 'expired';
        }

        return 'active';
    }
}
