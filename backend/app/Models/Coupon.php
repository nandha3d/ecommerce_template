<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'min_order_amount',
        'usage_limit',
        'max_uses_per_user',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'integer',
        'usage_limit' => 'integer',
        'max_uses_per_user' => 'integer',
        'min_order_amount' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Check if the coupon is valid.
     */
    public function isValid(?User $user = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        if ($this->starts_at && $this->starts_at->gt($now)) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->lt($now)) {
            return false;
        }

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($user && $this->max_uses_per_user) {
            $userUsage = Order::where('user_id', $user->id)
                ->where('coupon_id', $this->id)
                ->whereNotIn('status', ['cancelled'])
                ->count();
            
            if ($userUsage >= $this->max_uses_per_user) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate discount for an order amount.
     */
    public function calculateDiscount(float $orderAmount): float
    {
        if ($this->type === 'percentage') {
            return $orderAmount * ($this->value / 100);
        }

        return min($this->value, $orderAmount);
    }

    /**
     * Scope for active and valid coupons.
     */
    public function scopeValid($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            });
    }
}
