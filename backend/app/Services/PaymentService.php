<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Order;
use App\Services\Payment\StripePaymentGateway;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private PaymentGatewayInterface $gateway;
    private ConfigurationService $config;

    public function __construct(ConfigurationService $config)
    {
        $this->config = $config;
        $this->gateway = $this->resolveGateway();
    }

    private function resolveGateway(): PaymentGatewayInterface
    {
        // Could be dynamic based on user selection or config
        // For now default to Stripe as per plan
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
        ]);

        try {
            // Update to Processing
            $intent->status = \App\Enums\PaymentIntentState::PROCESSING;
            $intent->save();

            $response = $this->gateway->charge(
                $order->total,
                $order->currency ?? 'USD',
                $source,
                [
                    'description' => "Order #{$order->order_number}",
                    'metadata' => [
                        'order_id' => $order->id,
                        'payment_intent_id' => $intent->id,
                    ],
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

                Log::error("Payment failed for Order #{$order->order_number}: " . ($response['message'] ?? 'Unknown error'));
                return ['success' => false, 'message' => $response['message'] ?? 'Payment failed'];
            }
        } catch (\Exception $e) {
            $intent->status = \App\Enums\PaymentIntentState::FAILED;
            $intent->metadata = array_merge($intent->metadata ?? [], ['exception' => $e->getMessage()]);
            $intent->save();
            throw $e;
        }
    }

    private function recordTransaction(Order $order, array $response): void
    {
        // Deprecated: Handled via PaymentIntent now.
    }
}
