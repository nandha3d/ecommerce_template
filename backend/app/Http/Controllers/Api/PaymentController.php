<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

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
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('payment.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET');

        if (!$sigHeader || !$endpointSecret) {
            Log::error('Stripe Webhook Error: Missing signature or endpoint secret');
            return response()->json(['error' => 'Webhook configuration missing'], 400);
        }

        try {
            // Task 1.2: Cryptographic Signature Verification (Refactored to Gateway)
            $gateway = app(\App\Services\Payment\StripePaymentGateway::class);
            if (!$gateway->verifyWebhookSignature($payload, $sigHeader, $endpointSecret)) {
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            // Using standard Stripe event decoding after manual signature check if needed
            // or just using the constructEvent indirectly. 
            // Here we know signature is valid, so we can decode.
            $event = json_decode($payload);

            Log::info('Stripe Webhook Verified: ' . $event->type);

            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;
                    $this->handlePaymentIntentSucceeded($paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    $this->handlePaymentIntentFailed($paymentIntent);
                    break;

                default:
                    Log::info('Received verified unknown event type ' . $event->type);
            }

            return response()->json(['status' => 'success']);

        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe Webhook Signature Verification Failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 400);
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        Log::info('Handling Payment Success', ['id' => $paymentIntent->id]);

        $orderId = $paymentIntent->metadata->order_id ?? null;
        if ($orderId) {
            $order = \App\Models\Order::find($orderId);
            if ($order) {
                // Task 2.2: State Machine enforcement via PaymentService
                $this->paymentService->handlePaymentSuccess($order, $paymentIntent->id);
            }
        }
    }

    private function handlePaymentIntentFailed($paymentIntent)
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
    public function gateways()
    {
        // For now, return hardcoded list or fetch from config
        return response()->json([
            'data' => [
                [
                    'id' => 'stripe',
                    'name' => 'Stripe',
                    'enabled' => (bool) config('payment.stripe.enabled', true), // fetch from ConfigService ideally
                    'icon' => 'card'
                ]
            ]
        ]);
    }

    /**
     * Initiate a payment
     */
    /**
     * Initiate a payment (Strict Flow: CheckoutSession / Legacy: Order)
     */
    /**
     * Initiate a payment (Strict Flow: CheckoutSession / Legacy: Order)
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'checkout_id' => 'required_without:order_id|exists:checkout_sessions,id',
            'order_id' => 'required_without:checkout_id|exists:orders,id',
            'source' => 'nullable|string', // Optional for Payment Element (Intent Creation)
            'method' => 'string',
            'razorpay_order_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string'
        ]);

        try {
            if ($request->checkout_id) {
                // STRICT FLOW: Pay against immutable CheckoutSession
                $session = \App\Models\CheckoutSession::findOrFail($request->checkout_id);

                // Verify ownership
                if ($session->user_id !== auth()->id()) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                if ($session->expires_at && $session->expires_at->isPast()) {
                    return response()->json(['error' => 'Checkout session expired'], 400);
                }

                if (empty($request->source)) {
                    // MODE 1: Create Intent (Payment Element Flow)
                    $result = $this->paymentService->createCheckoutIntent($session, $request->method ?? 'card');
                } else {
                    // MODE 2: Capture/Confirm (Token Flow)
                    $options = [];
                    if ($request->has('razorpay_signature')) {
                        $options['razorpay_signature'] = $request->razorpay_signature;
                        $options['razorpay_order_id'] = $request->razorpay_order_id;
                    }

                    $result = $this->paymentService->processCheckoutPayment($session, $request->source, $request->method ?? 'card', $options);
                }

            } else {
                // LEGACY / REPAYMENT FLOW
                $order = \App\Models\Order::findOrFail($request->order_id);
                // Check ownership
                if ($order->user_id !== auth()->id()) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                // Legacy flow currently requires source, but if we wanted to support Intent creation for orders, we could here.
                // For now, enforce source for legacy orders or throw error if missing.
                if (empty($request->source)) {
                    // TODO: Implement createOrderIntent if needed.
                    return response()->json(['error' => 'Source required for legacy order payment'], 400);
                }

                $result = $this->paymentService->processPayment($order, $request->source, $request->method ?? 'card');
            }

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'transaction_id' => $result['transaction_id'],
                    'client_secret' => $result['client_secret'] ?? null, // Return secret if created
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify a payment
     */
    public function verify(Request $request)
    {
        $request->validate(['payment_id' => 'required|string']);

        $success = $this->paymentService->verifyPayment($request->payment_id);

        return response()->json(['success' => $success]);
    }

    /**
     * Handle failed payment frontend callback
     */
    public function failed(Request $request)
    {
        Log::info('Payment reported failed by frontend', $request->all());
        return response()->json(['status' => 'logged']);
    }

    // Admin Methods Stubs
    public function index()
    {
        return response()->json(['data' => []]);
    }
    public function updateGateway($id)
    {
        return response()->json(['status' => 'updated']);
    }
    public function transactions($orderId)
    {
        return response()->json(['data' => []]);
    }
}
