<?php

namespace App\Services;

use App\Models\User;
use App\Models\Cart;
use App\Models\Order;
use App\Models\CheckoutSession;
use App\Services\Checkout\CheckoutSessionManager;
use Core\Order\Actions\CreateOrderAction;
use Core\Inventory\Services\InventoryService;
use App\Services\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutService
{
    private CheckoutSessionManager $sessionManager;
    private CreateOrderAction $createOrderAction;
    private InventoryService $inventoryService;
    private PaymentService $paymentService;

    public function __construct(
        CheckoutSessionManager $sessionManager,
        CreateOrderAction $createOrderAction,
        InventoryService $inventoryService,
        PaymentService $paymentService
    ) {
        $this->sessionManager = $sessionManager;
        $this->createOrderAction = $createOrderAction;
        $this->inventoryService = $inventoryService;
        $this->paymentService = $paymentService;
    }

    /**
     * Execute Atomic Checkout Process (Task 1.1)
     */
    public function placeOrder(User $user, Cart $cart, array $data): array
    {
        // 0. Idempotency Check (Task 1.2)
        $idempotencyKey = $data['idempotency_key'] ?? \Illuminate\Support\Str::uuid()->toString();
        if ($idempotencyKey) {
            $existingOrder = \App\Models\Order::where('idempotency_key', $idempotencyKey)
                ->where('user_id', $user->id)
                ->first();

            if ($existingOrder) {
                // Find existing client_secret if possible
                $intent = \App\Models\PaymentIntent::where('order_id', $existingOrder->id)
                    ->where('status', \App\Enums\PaymentIntentState::CREATED)
                    ->latest()
                    ->first();

                return [
                    'order' => $existingOrder,
                    'client_secret' => $intent->metadata['client_secret'] ?? null,
                    'transaction_id' => $intent->gateway_id ?? null,
                    'is_idempotent' => true,
                ];
            }
        }

        return DB::transaction(function () use ($user, $cart, $data) {
            // 1. Validate Cart (Ensure snapshot-ready)
            $cart->load(['items.product', 'items.variant']);
            if ($cart->items->isEmpty()) {
                throw new \RuntimeException("Cannot checkout with an empty cart.");
            }

            // 2. Create/Update Checkout Session (Snapshot)
            $session = $this->sessionManager->start($cart, $user->id);

            // 3. Create Order Record (Linked to Snapshot)
            // Rule: No financials read from Cart, only from Session
            $order = $this->createOrderAction->execute($user, $cart, $data, $session);

            // 4. Lock Inventory (Temporary Reservation)
            // This performs SELECT ... FOR UPDATE on Variants
            $this->inventoryService->reserve($order);

            // 5. Create Payment Intent
            // Ensure amount exactly matches order total
            $paymentMethod = $data['payment_method'] ?? 'card';

            // Logic for Intent creation (e.g., Stripe client_secret)
            // If the payment method is COD, we might skip intent.
            $clientSecret = null;
            $transactionId = null;

            if ($paymentMethod !== 'cod') {
                $intentResult = $this->paymentService->createOrderIntent($order, $paymentMethod);
                $clientSecret = $intentResult['client_secret'] ?? null;
                $transactionId = $intentResult['gateway_id'] ?? null;
            }

            return [
                'order' => $order,
                'client_secret' => $clientSecret,
                'transaction_id' => $transactionId,
                'checkout_id' => $session->id,
            ];
        });
    }

    /**
     * Validate order before creation (Phase 1: Order Validation Contract).
     */
    public function validateOrder(User $user, ?string $sessionId): array
    {
        $cart = app(\Core\Cart\Services\CartService::class)->getCart($user->id, $sessionId);
        $cart->load(['items.product', 'items.variant', 'coupon']);

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException("Cart is empty");
        }

        // 1. Recalculate Totals (authoritative) via PricingEngine
        // This ensures frontend never dictates the price.
        $this->recalculateTotals($cart);

        // 2. Create authoritative session snapshot
        $session = $this->sessionManager->start($cart, $user->id);

        // 3. Return authoritative data in structure FE expects
        $currency = \App\Models\Currency::where('is_base', true)->firstOr(function () {
            $code = config('pricing.default_currency_code', 'INR');
            $symbols = ['INR' => '₹', 'USD' => '$', 'EUR' => '€', 'GBP' => '£'];
            return new \App\Models\Currency([
                'code' => $code,
                'symbol' => $symbols[$code] ?? $code,
                'decimal_places' => 2,
            ]);
        });

        $format = function($amount) use ($currency) {
            $val = $amount / 100;
            return $currency->symbol . number_format($val, $currency->decimal_places ?? 2);
        };

        return [
            'checkout_id' => $session->id,
            'pricing' => [
                'subtotal' => [
                    'base' => $session->subtotal,
                    'display' => ['formatted' => $format($session->subtotal)]
                ],
                'tax' => [
                    'base' => $session->tax_amount,
                    'display' => ['formatted' => $format($session->tax_amount)]
                ],
                'shipping' => [
                    'base' => $session->shipping_cost,
                    'display' => ['formatted' => $format($session->shipping_cost)]
                ],
                'discount' => [
                    'base' => $session->discount,
                    'display' => ['formatted' => $format($session->discount)]
                ],
                'total' => [
                    'base' => $session->total,
                    'display' => [
                        'formatted' => $format($session->total),
                        'currency' => $currency->code
                    ]
                ],
            ],
            'currency' => [
                'code' => $currency->code,
                'symbol' => $currency->symbol,
                'precision' => $currency->decimal_places ?? 2,
            ],
            'valid' => true,
            'validation_status' => 'valid',
            'expires_at' => $session->expires_at->toIso8601String(),
        ];
    }
}
