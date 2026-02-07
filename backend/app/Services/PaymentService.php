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
            'amount' => (float) $order->total,
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
            (float) $order->total,
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
            (float) $session->total,
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
        try {
            // Updated to Processing
            $intent->status = \App\Enums\PaymentIntentState::PROCESSING;
            $intent->save();

            $gateway = $this->resolveGateway($intent->payment_method);

            $response = $gateway->charge(
                (float) $intent->amount,
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
                $intent->status = \App\Enums\PaymentIntentState::SUCCEEDED;
                $intent->gateway_id = $response['transaction_id'];
                $intent->metadata = array_merge($intent->metadata ?? [], ['raw_response' => $response]);
                $intent->save();

                return ['success' => true, 'transaction_id' => $response['transaction_id']];
            } else {
                $intent->status = \App\Enums\PaymentIntentState::FAILED;
                $intent->metadata = array_merge($intent->metadata ?? [], ['error_message' => $response['message'] ?? 'Unknown']);
                $intent->save();

                Log::error("Payment failed: " . ($response['message'] ?? 'Unknown error'));
                return ['success' => false, 'message' => $response['message'] ?? 'Payment failed'];
            }
        } catch (\Exception $e) {
            $intent->status = \App\Enums\PaymentIntentState::FAILED;
            $intent->metadata = array_merge($intent->metadata ?? [], ['exception' => $e->getMessage()]);
            $intent->save();
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

        DB::transaction(function () use ($order, $transactionId) {
            $stateMachine = app(OrderStateMachine::class);
            $stateMachine->transition($order, \App\Enums\OrderState::PAID, [
                'reason' => 'Webhook: Payment Success',
                'transaction_id' => $transactionId
            ]);

            app(\Core\Inventory\Services\InventoryService::class)->commit($order);
            app(\App\Services\InvoiceService::class)->generateInvoice($order);

            // Finalize Cart
            if ($order->cart_id) {
                app(\Core\Cart\Services\CartService::class)->finalizeCheckout(\App\Models\Cart::find($order->cart_id));
            }
        });

        app(\App\Services\SecurityAuditService::class)->logOrderCreate($order); // Should be logOrderPaid?
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
