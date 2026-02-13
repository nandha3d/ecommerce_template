<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\PaymentService;
use App\Enums\ApiErrorCode;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Handle Stripe Webhook
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('payment.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET');

        if (!$sigHeader || !$endpointSecret) {
            Log::error('Stripe Webhook Error: Missing signature or endpoint secret');
            return $this->error('Webhook configuration missing', ApiErrorCode::WEBHOOK_CONFIG_MISSING->value, 400);
        }

        try {
            $gateway = app(\App\Services\Payment\StripePaymentGateway::class);
            if (!$gateway->verifyWebhookSignature($payload, $sigHeader, $endpointSecret)) {
                return $this->error('Invalid signature', ApiErrorCode::INVALID_SIGNATURE->value, 400);
            }

            $event = json_decode($payload);
            Log::info('Stripe Webhook Verified: ' . $event->type);

            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                default:
                    Log::info('Received verified unknown event type ' . $event->type);
            }

            return $this->success(null, 'Webhook processed');

        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            return $this->error('Webhook processing failed', ApiErrorCode::WEBHOOK_FAILED->value, 400);
        }
    }

    private function handlePaymentIntentSucceeded(object $paymentIntent): void
    {
        Log::info('Handling Payment Success', ['id' => $paymentIntent->id]);

        $orderId = $paymentIntent->metadata->order_id ?? null;
        if ($orderId) {
            $order = \App\Models\Order::find($orderId);
            if ($order) {
                $this->paymentService->handlePaymentSuccess($order, $paymentIntent->id);
            }
        }
    }

    private function handlePaymentIntentFailed(object $paymentIntent): void
    {
        Log::warning('Handling Payment Failure', ['id' => $paymentIntent->id]);

        $orderId = $paymentIntent->metadata->order_id ?? null;
        if ($orderId) {
            $order = \App\Models\Order::find($orderId);
            if ($order) {
                $this->paymentService->handlePaymentFailure($order, $paymentIntent->last_payment_error->message ?? 'Payment failed');
            }
        }
    }

    /**
     * Get available payment gateways
     */
    public function gateways(): JsonResponse
    {
        return $this->success([
            [
                'id' => 'stripe',
                'name' => 'Stripe',
                'enabled' => (bool) config('payment.stripe.enabled', true),
                'icon' => 'card'
            ],
            [
                'id' => 'razorpay',
                'name' => 'Razorpay',
                'enabled' => (bool) config('payment.razorpay.enabled', true),
                'icon' => 'credit-card'
            ],
            [
                'id' => 'cod',
                'name' => 'Cash on Delivery',
                'enabled' => true,
                'icon' => 'truck'
            ]
        ]);
    }

    /**
     * Initiate a payment
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'checkout_id' => 'required_without:order_id|exists:checkout_sessions,id',
            'order_id' => 'required_without:checkout_id|exists:orders,id',
            'source' => 'nullable|string', 
            'method' => 'string',
            'razorpay_order_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string'
        ]);

        try {
            if ($request->checkout_id) {
                $session = \App\Models\CheckoutSession::findOrFail($request->checkout_id);

                if ($session->user_id !== auth()->id()) {
                    return $this->error('Unauthorized', ApiErrorCode::UNAUTHORIZED->value, 403);
                }

                if ($session->expires_at && $session->expires_at->isPast()) {
                    return $this->error('Checkout session expired', ApiErrorCode::SESSION_EXPIRED->value, 400);
                }

                if (empty($request->source)) {
                    $result = $this->paymentService->createCheckoutIntent($session, $request->method ?? 'card');
                } else {
                    $options = [];
                    if ($request->has('razorpay_signature')) {
                        $options['razorpay_signature'] = $request->razorpay_signature;
                        $options['razorpay_order_id'] = $request->razorpay_order_id;
                    }
                    $result = $this->paymentService->processCheckoutPayment($session, $request->source, $request->method ?? 'card', $options);
                }
            } else {
                $order = \App\Models\Order::findOrFail($request->order_id);
                if ($order->user_id !== auth()->id()) {
                    return $this->error('Unauthorized', ApiErrorCode::UNAUTHORIZED->value, 403);
                }

                if (empty($request->source)) {
                    return $this->error('Source required for legacy order payment', ApiErrorCode::SOURCE_REQUIRED->value, 400);
                }

                $result = $this->paymentService->processPayment($order, $request->source, $request->method ?? 'card');
            }

            if ($result['success']) {
                return $this->success([
                    'transaction_id' => $result['transaction_id'],
                    'client_secret' => $result['client_secret'] ?? null,
                ], 'Payment initiated');
            } else {
                return $this->error($result['message'], ApiErrorCode::PAYMENT_FAILED->value, 400);
            }
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::PAYMENT_ERROR->value, 500);
        }
    }

    /**
     * Verify a payment
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['payment_id' => 'required|string']);

        $success = $this->paymentService->verifyPayment($request->payment_id);

        return $this->success(['success' => $success]);
    }

    /**
     * Handle failed payment frontend callback
     */
    public function failed(Request $request): JsonResponse
    {
        Log::info('Payment reported failed by frontend', $request->all());
        return $this->success(null, 'Failure logged');
    }

    // Admin Methods Stubs
    public function index(): JsonResponse
    {
        return $this->success([]);
    }
    public function updateGateway($id): JsonResponse
    {
        return $this->success(null, 'Gateway updated');
    }
    public function transactions($orderId): JsonResponse
    {
        return $this->success([]);
    }
}
