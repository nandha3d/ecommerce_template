<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Domain\Pricing\PricingEngine;
use Illuminate\Support\Facades\Log;

class PricingEngineService
{
    private PricingEngine $domainEngine;

    public function __construct(PricingEngine $domainEngine)
    {
        $this->domainEngine = $domainEngine;
    }

    /**
     * Apply all active pricing rules to the cart
     */
    public function applyRules(Cart $cart): Cart
    {
        // For now, domain engine handles basic pricing. 
        // We'll expand it to handle complex rules as we implement DiscountEngine fully.
        return $this->recalculateTotals($cart);
    }

    public function recalculateTotals(Cart $cart): Cart
    {
        $cart->load(['items.variant', 'coupon']);
        
        $subtotal = 0;
        $totalDiscount = 0;
        $totalTax = 0;

        foreach ($cart->items as $item) {
            if (!$item->variant) continue;

            $result = $this->domainEngine->calculate(
                $item->variant,
                $item->quantity,
                $cart->coupon,
                null, // address from cart/session
                $cart->user
            );

            $item->unit_price = $result['unit_price'];
            $item->subtotal = $result['subtotal'];
            $item->discount_amount = $result['discount'];
            $item->tax_amount = $result['tax'];
            $item->total = $result['total'];
            $item->save();

            $subtotal += $item->subtotal;
            $totalDiscount += $item->discount_amount;
            $totalTax += $item->tax_amount;
        }

        $cart->subtotal = $subtotal;
        $cart->discount = $totalDiscount;
        $cart->tax_amount = $totalTax;
        
        $shipping = $cart->shipping_cost ?? 0;
        $cart->total = $subtotal - $totalDiscount + $totalTax + $shipping;
        
        $cart->save();

        return $cart;
    }
}
