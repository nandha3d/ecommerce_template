<?php

namespace App\Domain\Pricing;

use App\Models\User;
use App\Models\Address;
use App\Models\Coupon;
use Core\Product\Models\Product;
use App\Models\ProductVariant;
use App\Models\TaxRate;

class PricingEngine
{
    private TaxEngine $taxEngine;
    private DiscountEngine $discountEngine;

    public function __construct(TaxEngine $taxEngine, DiscountEngine $discountEngine)
    {
        $this->taxEngine = $taxEngine;
        $this->discountEngine = $discountEngine;
    }

    /**
     * Calculate full pricing breakdown for a product/variant.
     */
    public function calculate(
        ProductVariant $variant,
        int $quantity = 1,
        ?Coupon $coupon = null,
        ?Address $shippingAddress = null,
        ?User $user = null
    ): array {
        $basePrice = $variant->price;
        $salePrice = $variant->sale_price ?? $basePrice;
        $initialSubtotal = $salePrice * $quantity;

        // 1. Calculate Discounts
        $discountAmount = 0;
        if ($coupon) {
            $discountAmount = $this->discountEngine->calculate($initialSubtotal, $coupon, $user);
        }

        $afterDiscount = $initialSubtotal - $discountAmount;

        // 2. Calculate Taxes (assuming taxes are calculated on discounted price)
        $taxAmount = $this->taxEngine->calculate($afterDiscount, $shippingAddress);

        $total = $afterDiscount + $taxAmount;

        return [
            'base_price' => $basePrice,
            'unit_price' => $salePrice,
            'quantity' => $quantity,
            'subtotal' => $initialSubtotal,
            'discount' => $discountAmount,
            'tax' => $taxAmount,
            'total' => $total,
            'currency' => config('app.currency', 'USD'), // Default or from setting
            'snapshot' => [
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'tax_rule_id' => null, // Could be enriched by TaxEngine
                'coupon_code' => $coupon?->code,
            ]
        ];
    }

    /**
     * Calculate total for an entire cart.
     */
    public function calculateCartTotal(\App\Models\Cart $cart): array
    {
        try {
            $subtotal = 0;
            $itemsBreakdown = [];
            $taxItems = [];

            foreach ($cart->items as $item) {
                $basePrice = $item->variant->price;
                $salePrice = $item->variant->sale_price ?? $basePrice;
                $itemSubtotal = $salePrice * $item->quantity;
                
                $subtotal += $itemSubtotal;
                
                $taxItems[] = [
                    'id' => $item->variant->id,
                    'name' => $item->variant->product->name ?? 'Product',
                    'price' => $itemSubtotal
                ];
            }

            // 1. Calculate Coupons (Global or item-based)
            $discountAmount = 0;
            if ($cart->coupon) {
                $discountAmount = $this->discountEngine->calculate($subtotal, $cart->coupon, $cart->user);
            }

            $afterDiscount = $subtotal - $discountAmount;

            // 2. Calculate Taxes
            $shippingAddress = $cart->shippingAddress ?? null;
            $taxResult = [
                'total_tax' => 0,
                'breakdown' => [],
                'jurisdiction' => null,
                'rate_applied' => 0,
            ];

            if ($shippingAddress) {
                $taxResult = $this->taxEngine->calculateGranular($taxItems, $shippingAddress->country_code, $shippingAddress->state_code);
            }

            $finalAmount = $afterDiscount + $taxResult['total_tax'] + ($cart->shipping_cost ?? 0);
            
            // Round final amount if configured
            $finalAmount = $this->round($finalAmount);

            return [
                'subtotal' => $subtotal,
                'total_discount' => $discountAmount,
                'total_tax' => $taxResult['total_tax'],
                'tax_breakdown' => $taxResult['breakdown'],
                'tax_jurisdiction' => $taxResult['jurisdiction'],
                'tax_rate_applied' => $taxResult['rate_applied'],
                'tax_rate_id' => $taxResult['tax_rate_id'] ?? null,
                'shipping_cost' => $cart->shipping_cost ?? 0,
                'final_amount' => $finalAmount,
                'currency' => config('app.currency', 'INR'),
                'calculation_version' => config('pricing.calculation_version', '1.0.0'),
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::critical('Pricing calculation failed', [
                'cart_id' => $cart->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // FAIL SAFELY: Return conservative estimate without discounts
            $fallbackSubtotal = $cart->items->sum(fn($i) => ($i->variant->price * $i->quantity));
            $fallbackTax = (int) ceil($fallbackSubtotal * 0.18); // Default 18% GST (worst case)
            
            return [
                'subtotal' => $fallbackSubtotal,
                'total_discount' => 0,
                'total_tax' => $fallbackTax,
                'tax_breakdown' => [['name' => 'Safe Fallback Tax', 'amount' => $fallbackTax]],
                'tax_jurisdiction' => 'FALLBACK',
                'tax_rate_applied' => 18.00,
                'tax_rate_id' => null,
                'shipping_cost' => $cart->shipping_cost ?? 0,
                'final_amount' => $fallbackSubtotal + $fallbackTax + ($cart->shipping_cost ?? 0),
                'currency' => config('app.currency', 'INR'),
                'calculation_version' => 'FALLBACK',
                'error' => 'Calculation error - using safety fallback',
            ];
        }
    }

    private function round(int $amount): int
    {
        $mode = config('pricing.rounding_mode', 'half_up');
        $timing = config('pricing.rounding_timing', 'final_only');

        if ($timing === 'final_only') {
            return match($mode) {
                'half_up' => (int) round($amount, 0, PHP_ROUND_HALF_UP),
                'half_down' => (int) round($amount, 0, PHP_ROUND_HALF_DOWN),
                'half_even' => (int) round($amount, 0, PHP_ROUND_HALF_EVEN),
                default => $amount,
            };
        }

        return $amount;
    }
}
