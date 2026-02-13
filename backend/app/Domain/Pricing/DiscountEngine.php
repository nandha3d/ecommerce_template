<?php

namespace App\Domain\Pricing;

use App\Models\Coupon;
use App\Models\User;

class DiscountEngine
{
    /**
     * Calculate discount for a given amount and coupon.
     * Returns discount amount in minor units.
     */
    public function calculate(int $amount, ?Coupon $coupon, ?User $user = null): int
    {
        if (!$coupon || !$coupon->isValid($user)) {
            return 0;
        }

        // Additional check for minimum order amount
        if ($coupon->min_order_amount > 0 && $amount < $coupon->min_order_amount) {
            return 0;
        }

        if ($coupon->type === 'percentage') {
            $discount = (int) round($amount * ($coupon->value / 100));
        } else {
            $discount = $coupon->value;
        }

        return min($discount, $amount);
    }

    /**
     * Apply a coupon to a cart atomically.
     */
    public function applyCoupon(string $code, \App\Models\Cart $cart, ?User $user = null): array
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($code, $cart, $user) {
            // 🔒 CRITICAL: Find coupon with row-level lock
            $coupon = Coupon::where('code', $code)
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })
                ->lockForUpdate()
                ->first();

            if (!$coupon) {
                return ['success' => false, 'message' => 'Invalid or expired coupon code'];
            }

            // check global usage limit
            if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
                return ['success' => false, 'message' => 'Coupon usage limit reached'];
            }

            // check per-user usage limit
            if ($user && $coupon->max_uses_per_user) {
                $userUsage = \App\Models\CouponUsage::where('user_id', $user->id)
                    ->where('coupon_id', $coupon->id)
                    ->lockForUpdate()
                    ->count();

                if ($userUsage >= $coupon->max_uses_per_user) {
                    return ['success' => false, 'message' => 'You have reached the limit for this coupon'];
                }
            }

            // Calculate potential discount
            $discount = $this->calculate($cart->subtotal, $coupon, $user);

            if ($coupon->min_order_amount && $cart->subtotal < $coupon->min_order_amount) {
                 return ['success' => false, 'message' => "Minimum order amount of " . ($coupon->min_order_amount / 100) . " required"];
            }

            return [
                'success' => true,
                'coupon' => $coupon,
                'discount_amount' => $discount
            ];
        });
    }
}
