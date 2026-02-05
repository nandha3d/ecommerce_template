<?php

namespace Core\Cart\Services;

use App\Models\Cart;
use Core\Pricing\Services\RuleEngine;

class CartPricingService
{
    private RuleEngine $ruleEngine;

    public function __construct(RuleEngine $ruleEngine)
    {
        $this->ruleEngine = $ruleEngine;
    }

    /**
     * Get subtotal.
     */
    public function getSubtotal(Cart $cart): float
    {
        return $cart->items->sum('total_price');
    }

    /**
     * Get discount amount.
     */
    public function getDiscount(Cart $cart): float
    {
        // 1. Calculate Rule-based discounts
        $ruleDiscount = $this->ruleEngine->calculateCartDiscount($cart);

        // 2. Calculate Coupon discounts (legacy/existing logic)
        $couponDiscount = 0;
        if ($cart->coupon) {
            $subtotal = $this->getSubtotal($cart);
            
            // Basic check, ideally Coupon logic should also be inside RuleEngine or separate Service
            if (!$cart->coupon->min_order_amount || $subtotal >= $cart->coupon->min_order_amount) {
                if ($cart->coupon->type === 'percentage') {
                    $couponDiscount = $subtotal * ($cart->coupon->value / 100);
                } else {
                    $couponDiscount = $cart->coupon->value;
                }

                if ($cart->coupon->max_discount) {
                    $couponDiscount = min($couponDiscount, $cart->coupon->max_discount);
                }
            }
        }

        return $ruleDiscount + $couponDiscount;
    }

    /**
     * Get shipping cost.
     */
    public function getShipping(Cart $cart): float
    {
        // Free shipping over $50
        return $this->getSubtotal($cart) >= 50 ? 0 : 5.99;
    }

    /**
     * Get tax amount.
     */
    public function getTax(Cart $cart): float
    {
        return ($this->getSubtotal($cart) - $this->getDiscount($cart)) * 0.08; // 8% tax
    }

    /**
     * Get total.
     */
    public function getTotal(Cart $cart): float
    {
        return $this->getSubtotal($cart) - $this->getDiscount($cart) + $this->getShipping($cart) + $this->getTax($cart);
    }
}
