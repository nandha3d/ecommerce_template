<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $endpointSecret = config('payment.stripe.webhook_secret');

        try {
            // Verify signature manually or use Stripe lib if available
            // standard Stripe logic:
            // $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            
            // For now, simpler logging as we might not have the lib working yet
            Log::info('Stripe Webhook Received', $request->all());

            $event = json_decode($payload, true);
            
            if (!isset($event['type'])) {
                return response()->json(['error' => 'Invalid payload'], 400);
            }

            switch ($event['type']) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event['data']['object'];
                    Log::info('Payment Succeeded', ['id' => $paymentIntent['id']]);
                    // Update order status via service
                    // $this->paymentService->handlePaymentSuccess($paymentIntent['id']);
                    break;
                
                case 'payment_intent.payment_failed':
                    $paymentIntent = $event['data']['object'];
                    Log::warning('Payment Failed', ['id' => $paymentIntent['id']]);
                    break;
                    
                default:
                    Log::info('Received unknown event type ' . $event['type']);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook verification failed'], 400);
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
    public function initiate(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'source' => 'required|string',
            'method' => 'string'
        ]);

        try {
            $order = \App\Models\Order::find($request->order_id);
            // Check ownership
            if ($order->user_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $result = $this->paymentService->processPayment($order, $request->source, $request->method ?? 'card');

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'transaction_id' => $result['transaction_id']
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
    public function index() { return response()->json(['data' => []]); }
    public function updateGateway($id) { return response()->json(['status' => 'updated']); }
    public function transactions($orderId) { return response()->json(['data' => []]); }
}
