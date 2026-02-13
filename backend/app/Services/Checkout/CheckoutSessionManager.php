<?php

namespace App\Services\Checkout;

use App\Models\CheckoutSession;
use App\Models\Cart;
use App\Models\Address;
use App\Models\ShippingMethod;
use App\Models\PaymentMethod;
use App\Domain\Pricing\PricingEngine;
use App\Services\Cart\ShippingCalculationService;
use Core\Cart\Services\CartService;
use Illuminate\Support\Str;

class CheckoutSessionManager
{
    private ShippingCalculationService $shippingService;
    private PricingEngine $pricingEngine;
    private CartService $cartService;

    public function __construct(
        ShippingCalculationService $shippingService,
        PricingEngine $pricingEngine,
        CartService $cartService
    ) {
        $this->shippingService = $shippingService;
        $this->pricingEngine = $pricingEngine;
        $this->cartService = $cartService;
    }

    /**
     * Start or Retrieve a checkout session for a cart.
     */
    public function start(Cart $cart, ?int $userId = null): CheckoutSession
    {
        if ($cart->status !== 'active' && $cart->status !== 'locked') {
             throw new \RuntimeException("Cart is not valid for checkout (Status: {$cart->status}).");
        }

        $session = CheckoutSession::where('cart_id', $cart->id)
            ->whereNull('completed_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$session) {
            if ($cart->status === 'active') {
                $this->cartService->recalculate($cart);
                $cart->status = 'locked';
                $cart->save();
            }

            // SNAPSHOT: Capture keys item details
            $itemsSnapshot = $cart->items->map(function ($item) use ($cart) {
                // Use PricingEngine to get authoritative data for snapshot
                $result = $this->pricingEngine->calculate(
                    $item->variant,
                    $item->quantity,
                    $cart->coupon,
                    null, // No address yet
                    $cart->user
                );

                return [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant?->name,
                    'sku' => $item->variant?->sku ?? $item->product->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $result['unit_price'],
                    'subtotal' => $result['subtotal'],
                    'discount' => $result['discount'],
                    'tax' => $result['tax'],
                    'total' => $result['total'],
                    'price_snapshot' => $result, // Store FULL audit trail
                    'image' => $item->product->images->first()?->url,
                ];
            })->toArray();

            $session = CheckoutSession::create([
                'cart_id' => $cart->id,
                'user_id' => $userId ?? $cart->user_id,
                'step' => 'cart',
                'expires_at' => now()->addHours(2),
                'subtotal' => $cart->subtotal,
                'discount' => $cart->discount,
                'tax_amount' => $cart->tax_amount,
                'shipping_cost' => 0,
                'total' => $cart->total,
                'currency' => $cart->currency_code ?? 'USD',
                'data' => [
                    'items' => $itemsSnapshot,
                    'coupon_id' => $cart->coupon_id,
                    'coupon_code' => $cart->coupon?->code
                ], 
            ]);
        }

        return $session;
    }

    /**
     * Set Shipping Address step.
     */
    public function setAddress(CheckoutSession $session, Address $shippingAddress, ?Address $billingAddress = null): CheckoutSession
    {
        if ($session->completed_at) throw new \Exception("Session already completed");

        $session->shipping_address_id = $shippingAddress->id;
        $session->billing_address_id = $billingAddress ? $billingAddress->id : $shippingAddress->id;
        $session->step = 'shipping';
        
        // RECALCULATE TAX BASED ON ADDRESS
        $this->recalculateSessionWithAddress($session, $shippingAddress);
        
        $session->save();
        return $session;
    }

    private function recalculateSessionWithAddress(CheckoutSession $session, Address $address)
    {
        $itemsSnapshot = $session->data['items'] ?? [];
        $totalTax = 0;
        $totalDiscount = 0;
        $totalSubtotal = 0;

        foreach ($itemsSnapshot as &$item) {
            $variant = \App\Models\ProductVariant::find($item['variant_id']);
            $coupon = $session->data['coupon_id'] ? \App\Models\Coupon::find($session->data['coupon_id']) : null;
            
            $result = $this->pricingEngine->calculate(
                $variant,
                $item['quantity'],
                $coupon,
                $address,
                $session->user
            );

            $item['tax'] = $result['tax'];
            $item['discount'] = $result['discount'];
            $item['total'] = $result['total'];
            $item['price_snapshot'] = $result;

            $totalTax += $result['tax'];
            $totalDiscount += $result['discount'];
            $totalSubtotal += $result['subtotal'];
        }

        $session->tax_amount = $totalTax;
        $session->discount = $totalDiscount;
        $session->subtotal = $totalSubtotal;
        
        $data = $session->data;
        $data['items'] = $itemsSnapshot;
        $session->data = $data;

        $session->total = $session->subtotal - $session->discount + $session->tax_amount + ($session->shipping_cost ?? 0);
    }

    /**
     * Set Shipping Method step.
     */
    public function setShippingMethod(CheckoutSession $session, ShippingMethod $method): CheckoutSession
    {
        if ($session->completed_at) throw new \Exception("Session already completed");
        
        $session->load('cart');
        $address = $session->shippingAddress;
        
        // Calculate cost (standardized to minor units)
        $cost = (int) round($this->shippingService->calculateCost($session->cart, $address, $method) * 100);

        $session->shipping_method_id = $method->id;
        $session->step = 'payment'; 
        $session->shipping_cost = $cost;
        
        $session->total = $session->subtotal - $session->discount + $session->tax_amount + $cost;
        $session->save();

        return $session;
    }

    /**
     * Set Payment Method step.
     */
    public function setPaymentMethod(CheckoutSession $session, PaymentMethod $method): CheckoutSession
    {
        $session->payment_method_id = $method->id;
        $session->step = 'review';
        $session->save();

        return $session;
    }

    /**
     * Complete Session.
     */
    public function complete(CheckoutSession $session): void
    {
        $session->completed_at = now();
        $session->step = 'complete';
        $session->save();
    }
}
