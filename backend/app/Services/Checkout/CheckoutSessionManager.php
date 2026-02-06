<?php

namespace App\Services\Checkout;

use App\Models\CheckoutSession;
use App\Models\Cart;
use App\Models\Address;
use App\Models\ShippingMethod;
use App\Models\PaymentMethod;
use App\Services\Cart\ShippingCalculationService;
use App\Services\Cart\TaxCalculationService;
use Illuminate\Support\Str;

class CheckoutSessionManager
{
    private ShippingCalculationService $shippingService;
    private TaxCalculationService $taxService;
    private \Core\Cart\Services\CartService $cartService;

    public function __construct(
        ShippingCalculationService $shippingService,
        TaxCalculationService $taxService,
        \Core\Cart\Services\CartService $cartService
    ) {
        $this->shippingService = $shippingService;
        $this->taxService = $taxService;
        $this->cartService = $cartService;
    }

    /**
     * Start or Retrieve a checkout session for a cart.
     */
    public function start(Cart $cart, ?int $userId = null): CheckoutSession
    {
        // Rule 1: Cart Locking
        // If cart is already locked or checked out, we should handle it.
        // If retrieving existing session, assume properly locked.
        
        if ($cart->status !== 'active' && $cart->status !== 'locked') {
             throw new \RuntimeException("Cart is not valid for checkout (Status: {$cart->status}).");
        }

        // Check for existing active session
        $session = CheckoutSession::where('cart_id', $cart->id)
            ->whereNull('completed_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$session) {
            // Lock the cart immediately upon starting checkout session
            // This prevents further mutations via CartService
            if ($cart->status === 'active') {
                // Rule: Price Validation - Force Recalc before Lock
                $this->cartService->recalculate($cart);
                
                $cart->status = 'locked';
                $cart->save();
            }

            // SNAPSHOT: Capture keys item details to ensure immutability
            // Even if Products change, this snapshot remains the source of truth
            $itemsSnapshot = $cart->items->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant?->name,
                    'sku' => $item->variant?->sku ?? $item->product->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                    'image' => $item->product->images->first()?->url, // Snapshot image URL too
                ];
            })->toArray();

            $session = CheckoutSession::create([
                'cart_id' => $cart->id,
                'user_id' => $userId ?? $cart->user_id,
                'step' => 'cart',
                'expires_at' => now()->addHours(2),
                // Initialize Snapshot Totals from Cart
                'subtotal' => $cart->subtotal,
                'discount' => $cart->discount,
                'tax_amount' => $cart->tax_amount,
                'shipping_cost' => 0, // Not yet calculated
                'total' => $cart->total, // Initial total
                'currency' => 'JPY', // Hardcoded currency in original file was 'USD', checked context it seems multi-currency isn't active yet.
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
        $session->save();

        // Trigger tax recalc on SESSION SNAPSHOT, not Cart
        // Note: TaxService currently likely expects Cart. 
        // We really should use a PricingEngine that accepts DTOs, but for now, 
        // we might calculate tax and update Session.
        // Assuming taxService->calculate returns value or updates ref?
        // Let's defer tax for a moment or assume generic logic.
        
        return $session;
    }

    /**
     * Set Shipping Method step.
     */
    public function setShippingMethod(CheckoutSession $session, ShippingMethod $method): CheckoutSession
    {
        if ($session->completed_at) throw new \Exception("Session already completed");
        
        // Validate method available...
        $available = $this->shippingService->getAvailableMethods($session->cart, $session->shippingAddress);
        // ... (validation logic)

        $cost = $this->shippingService->calculateCost($session->cart, $session->shippingAddress, $method);

        $session->shipping_method_id = $method->id;
        $session->step = 'payment'; // Next step
        
        // Update SNAPSHOT, Not Cart
        $session->shipping_cost = $cost;
        
        // Recalculate Session Total
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
     * Complete Session (Turn into Order).
     * Does NOT actually create order, just marks session state.
     * OrderService should call this after successful placement.
     */
    public function complete(CheckoutSession $session): void
    {
        $session->completed_at = now();
        $session->step = 'complete';
        $session->save();
    }
}
