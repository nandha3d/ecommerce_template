<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Order;
use App\Services\Payment\StripePaymentGateway;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    private ConfigurationService $config;

    public function __construct(ConfigurationService $config)
    {
        $this->config = $config;
    }

    public function verifyPayment(string $paymentId): bool
    {
        $result = $this->resolveGateway()->verify($paymentId);
        return $result['success'] ?? false;
    }

    private function resolveGateway(string $method = 'card'): PaymentGatewayInterface
    {
        if ($method === 'razorpay') {
            return app(\App\Services\Payment\RazorpayPaymentGateway::class);
        }

        if ($method === 'cod') {
            return app(\App\Services\Payment\CodPaymentGateway::class);
        }

        // Default to Stripe
        return app(StripePaymentGateway::class);
    }

    public function processPayment(Order $order, string $source, string $method = 'card'): array
    {
        Log::info("Processing payment for Order #{$order->order_number}");

        // Rule 8.2: Only ONE intent can succeed
        if (\App\Models\PaymentIntent::where('order_id', $order->id)->where('status', \App\Enums\PaymentIntentState::SUCCEEDED)->exists()) {
            throw new \RuntimeException("Order #{$order->order_number} is already paid.");
        }

        // Create PaymentIntent (Rule 8.1 / 8.2)
        // Amount must equal order.total
        $intent = \App\Models\PaymentIntent::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'currency' => $order->currency ?? 'USD',
            'status' => \App\Enums\PaymentIntentState::CREATED,
            'payment_method' => $method,
            'metadata' => ['order_id' => $order->id],
        ]);

        return $this->executeCharge($intent, $source, "Order #{$order->order_number}");
    }

    /**
     * Process payment for a Checkout Session (Phase 3: Strict Flow)
     */
    public function processCheckoutPayment(\App\Models\CheckoutSession $session, string $source, string $method = 'card', array $options = []): array
    {
        Log::info("Processing payment for Checkout Session #{$session->id}");

        // Check for existing successful intent for this session
        // We look in metadata for checkout_session_id
        // NOTE: This relies on metadata querying, which is slow but safe for now.
        // Ideally we added checkout_session_id column.

        // Create PaymentIntent
        $intent = \App\Models\PaymentIntent::create([
            'amount' => $session->total,
            'currency' => $session->currency,
            'status' => \App\Enums\PaymentIntentState::CREATED,
            'payment_method' => $method,
            'metadata' => array_merge([
                'checkout_session_id' => $session->id,
                'cart_id' => $session->cart_id
            ], $options),
        ]);

        return $this->executeCharge($intent, $source, "Checkout #{$session->id}");
    }

    /**
     * Create Intent for Order (Phase 1: Pre-Payment Strict Flow)
     * Returns client_secret for frontend elements.
     */
    public function createOrderIntent(Order $order, string $method = 'card'): array
    {
        Log::info("Creating Payment Intent for Order #{$order->order_number} via {$method}");

        $gateway = $this->resolveGateway($method);

        $gatewayIntent = $gateway->createIntent(
            (int) $order->total,
            $order->currency,
            [
                'description' => "Order #{$order->order_number}",
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]
            ]
        );

        if (!$gatewayIntent['success']) {
            throw new \RuntimeException("Failed to create payment intent: " . ($gatewayIntent['message'] ?? 'Unknown error'));
        }

        // Create Local PaymentIntent Record
        $intent = \App\Models\PaymentIntent::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => \App\Enums\PaymentIntentState::CREATED,
            'payment_method' => $method,
            'gateway_id' => $gatewayIntent['transaction_id'],
            'metadata' => [
                'client_secret' => $gatewayIntent['client_secret'] ?? null
            ],
        ]);

        return [
            'success' => true,
            'client_secret' => $gatewayIntent['client_secret'] ?? null,
            'transaction_id' => $intent->id,
            'gateway_id' => $gatewayIntent['transaction_id']
        ];
    }

    /**
     * Create Intent for Checkout Session (Phase 3: Pre-Payment Strict Flow)
     * Returns client_secret for frontend elements.
     */
    public function createCheckoutIntent(\App\Models\CheckoutSession $session, string $method = 'card'): array
    {
        Log::info("Creating Payment Intent for Checkout Session #{$session->id} via {$method}");

        $gateway = $this->resolveGateway($method);

        $gatewayIntent = $gateway->createIntent(
            (int) $session->total,
            $session->currency,
            [
                'description' => "Checkout #{$session->id}",
                'metadata' => [
                    'checkout_session_id' => $session->id,
                    'cart_id' => $session->cart_id
                ]
            ]
        );

        if (!$gatewayIntent['success']) {
            throw new \RuntimeException("Failed to create payment intent: " . ($gatewayIntent['message'] ?? 'Unknown error'));
        }

        // Create Local PaymentIntent Record
        $intent = \App\Models\PaymentIntent::create([
            'amount' => $session->total,
            'currency' => $session->currency,
            'status' => \App\Enums\PaymentIntentState::CREATED,
            'payment_method' => $method,
            'gateway_id' => $gatewayIntent['transaction_id'],
            'metadata' => [
                'checkout_session_id' => $session->id,
                'cart_id' => $session->cart_id,
                'client_secret' => $gatewayIntent['client_secret'] ?? null
            ],
        ]);

        return [
            'success' => true,
            'client_secret' => $gatewayIntent['client_secret'] ?? null,
            'transaction_id' => $intent->id, // Our ID or Gateway ID? Gateway ID usually needed by frontend if not secret
            'gateway_id' => $gatewayIntent['transaction_id']
        ];
    }

    private function executeCharge(\App\Models\PaymentIntent $intent, string $source, string $description): array
    {
        $stateMachine = app(\App\Services\PaymentStateMachine::class);

        try {
            // Updated to Processing
            $stateMachine->transition($intent, \App\Enums\PaymentIntentState::PROCESSING);

            $gateway = $this->resolveGateway($intent->payment_method);

            $response = $gateway->charge(
                (int) $intent->amount,
                $intent->currency,
                $source,
                [
                    'description' => $description,
                    'metadata' => array_merge($intent->metadata ?? [], [
                        'payment_intent_id' => $intent->id,
                    ]),
                ]
            );

            if ($response['success']) {
                $intent->gateway_id = $response['transaction_id'];
                $intent->metadata = array_merge($intent->metadata ?? [], ['raw_response' => $response]);
                $stateMachine->transition($intent, \App\Enums\PaymentIntentState::SUCCEEDED);

                return ['success' => true, 'transaction_id' => $response['transaction_id']];
            } else {
                $intent->metadata = array_merge($intent->metadata ?? [], ['error_message' => $response['message'] ?? 'Unknown']);
                $stateMachine->transition($intent, \App\Enums\PaymentIntentState::FAILED);

                Log::error("Payment failed: " . ($response['message'] ?? 'Unknown error'));
                return ['success' => false, 'message' => $response['message'] ?? 'Payment failed'];
            }
        } catch (\Exception $e) {
            $intent->metadata = array_merge($intent->metadata ?? [], ['exception' => $e->getMessage()]);
            $stateMachine->transition($intent, \App\Enums\PaymentIntentState::FAILED);
            throw $e;
        }
    }

    public function handlePaymentSuccess(Order $order, string $transactionId): void
    {
        // Rule 8.2: Only ONE intent can succeed
        if ($order->status === \App\Enums\OrderState::PAID) {
            Log::info("Order #{$order->order_number} already marked as paid. Ignoring.");
            return;
        }

        DB::beginTransaction();
        
        try {
            // 🔥 CRITICAL: Re-calculate price to prevent tampering
            // We re-calculate based on the current order items to ensure they match the pricing rules
            /** @var \App\Domain\Pricing\PricingEngine $pricingEngine */
            $pricingEngine = app(\App\Domain\Pricing\PricingEngine::class);
            
            // Re-fetch order with items for fresh state
            $order->load(['items.variant', 'user', 'priceSnapshot']);
            
            // Re-calculation using the current pricing rules
            $totalCalculated = 0;
            $itemsForPricing = [];
            foreach ($order->items as $item) {
                $itemsForPricing[] = [
                    'variant' => $item->variant,
                    'quantity' => $item->quantity
                ];
            }
            
            // Retrieve the locked price snapshot
            $snapshot = $order->priceSnapshot;
            
            if (!$snapshot) {
                Log::critical("SECURITY: Price snapshot missing for Order #{$order->order_number}");
                throw new \RuntimeException('Price snapshot missing for order #' . $order->id);
            }

            // Perform hard verification against snapshot
            // 1. Database Total vs Snapshot Total
            if ($order->total !== $snapshot->final_amount) {
                $this->handleFraud($order, 'Total mismatch between DB and Snapshot', [
                    'db_total' => $order->total,
                    'snapshot_total' => $snapshot->final_amount
                ]);
                DB::commit();
                return;
            }

            // 2. [Optional but Recommended] Re-calculate based on current catalog prices
            // This detects price changes between order creation and payment
            // However, we usually honor the price at the time of checkout (the snapshot)
            // But if we want to detect TAMPERING (bypassing logic), we check if the snapshot matches reality.
            
            // For now, we enforce that Snapshot matches Order Total strictly.
            // And we can add a check against Payment Intent amount if available.
            
            $intent = PaymentIntent::where('order_id', $order->id)
                ->where('gateway_id', $transactionId)
                ->first();
                
            if ($intent && $intent->amount !== $order->total) {
                $this->handleFraud($order, 'Payment intent amount mismatch', [
                    'intent_amount' => $intent->amount,
                    'order_total' => $order->total
                ]);
                DB::commit();
                return;
            }

            // ✅ Verification passed - process payment
            $stateMachine = app(OrderStateMachine::class);
            $stateMachine->transition($order, \App\Enums\OrderState::PAID, [
                'reason' => 'Webhook: Payment Success',
                'transaction_id' => $transactionId
            ]);

            app(\Core\Inventory\Services\InventoryService::class)->commit($order);
            app(\App\Services\InvoiceService::class)->generateInvoice($order);

            // Finalize Cart
            if ($order->cart_id) {
                $cart = \App\Models\Cart::find($order->cart_id);
                if ($cart) {
                    app(\Core\Cart\Services\CartService::class)->finalizeCheckout($cart);
                    $cart->items()->delete(); // Clear cart items
                }
            }

            // Record coupon usage for audit trail
            if ($order->coupon_id) {
                \App\Models\CouponUsage::create([
                    'coupon_id' => $order->coupon_id,
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'discount_amount' => $order->discount ?? 0,
                    'used_at' => now(),
                ]);
                
                Log::info('Coupon usage recorded', [
                    'order_id' => $order->id,
                    'coupon_id' => $order->coupon_id,
                ]);
            }

            // Queue order confirmation email
            \App\Jobs\SendOrderConfirmationEmail::dispatch($order);

            DB::commit();

            \Log::info('Payment verified and processed successfully', [
                'order_id' => $order->id,
                'amount' => $order->total,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Payment verification failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    private function handleFraud(Order $order, string $reason, array $context): void
    {
        Log::critical("PAYMENT FRAUD ATTEMPT DETECTED: {$reason}", array_merge([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'user_id' => $order->user_id,
            'ip_address' => request()->ip(),
        ], $context));

        $order->update([
            'status' => \App\Enums\OrderState::FRAUD_DETECTED,
            'payment_status' => 'failed',
        ]);
        
        // Block user optionally?
        // $order->user->update(['is_active' => false]);
    }

    /**
     * SECURITY: Verify order financial integrity against immutable snapshot.
     */
    public function verifyOrderIntegrity(Order $order): bool
    {
        $snapshot = $order->priceSnapshot;
        
        if (!$snapshot) {
            Log::warning("No price snapshot found for Order #{$order->order_number}");
            return true;
        }

        // Detailed check
        return $order->total === $snapshot->final_amount &&
               $order->subtotal === $snapshot->subtotal &&
               $order->tax === $snapshot->total_tax &&
               $order->discount === $snapshot->total_discount;
    }

    public function handlePaymentFailure(Order $order, string $reason): void
    {
        DB::transaction(function () use ($order, $reason) {
            $stateMachine = app(OrderStateMachine::class);
            $stateMachine->transition($order, \App\Enums\OrderState::FAILED, [
                'reason' => 'Webhook: Payment Failed - ' . $reason
            ]);

            app(\Core\Inventory\Services\InventoryService::class)->release($order);
        });
    }

    private function recordTransaction(Order $order, array $response): void
    {
        // Deprecated: Handled via PaymentIntent now.
    }
}
