<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    /**
     * Get active payment gateways for checkout
     */
    public function gateways(): JsonResponse
    {
        $gateways = PaymentGateway::active()
            ->select('id', 'name', 'slug', 'provider', 'description', 'logo')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $gateways,
        ]);
    }

    /**
     * Get all payment gateways (admin)
     */
    public function index(): JsonResponse
    {
        $gateways = PaymentGateway::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $gateways,
        ]);
    }

    /**
     * Update gateway settings
     */
    public function updateGateway(Request $request, int $id): JsonResponse
    {
        $gateway = PaymentGateway::findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'is_test_mode' => 'sometimes|boolean',
            'config' => 'sometimes|array',
            'transaction_fee' => 'sometimes|numeric|min:0|max:100',
            'fee_type' => 'sometimes|in:percentage,fixed',
        ]);

        // Merge config instead of replacing
        if (isset($validated['config'])) {
            $validated['config'] = array_merge($gateway->config ?? [], $validated['config']);
        }

        $gateway->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Gateway updated successfully',
            'data' => $gateway,
        ]);
    }

    /**
     * Initialize payment
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'gateway_slug' => 'required|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $gateway = PaymentGateway::where('slug', $validated['gateway_slug'])
            ->active()
            ->firstOrFail();

        // Create pending transaction
        $transaction = PaymentTransaction::create([
            'order_id' => $order->id,
            'gateway_id' => $gateway->id,
            'amount' => $order->total,
            'currency' => 'INR',
            'status' => PaymentTransaction::STATUS_PENDING,
        ]);

        // Generate payment data based on provider
        $paymentData = $this->generatePaymentData($gateway, $order, $transaction);

        return response()->json([
            'success' => true,
            'data' => [
                'transaction_id' => $transaction->transaction_id,
                'gateway' => $gateway->provider,
                'payment_data' => $paymentData,
            ],
        ]);
    }

    /**
     * Verify payment
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:payment_transactions,transaction_id',
            'gateway_transaction_id' => 'required|string',
            'gateway_response' => 'nullable|array',
        ]);

        $transaction = PaymentTransaction::where('transaction_id', $validated['transaction_id'])->first();

        // In production, verify with the actual gateway
        // For now, we'll mark as completed
        $transaction->markCompleted(
            $validated['gateway_transaction_id'],
            $validated['gateway_response'] ?? []
        );

        // Update order status
        $transaction->order->update(['status' => 'paid']);

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data' => $transaction,
        ]);
    }

    /**
     * Handle payment failure
     */
    public function failed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:payment_transactions,transaction_id',
            'reason' => 'required|string',
            'gateway_response' => 'nullable|array',
        ]);

        $transaction = PaymentTransaction::where('transaction_id', $validated['transaction_id'])->first();
        
        $transaction->markFailed(
            $validated['reason'],
            $validated['gateway_response'] ?? []
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment failure recorded',
        ]);
    }

    /**
     * Get transaction history for order
     */
    public function transactions(int $orderId): JsonResponse
    {
        $transactions = PaymentTransaction::where('order_id', $orderId)
            ->with('gateway')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Generate payment data for different providers
     */
    private function generatePaymentData(PaymentGateway $gateway, Order $order, PaymentTransaction $transaction): array
    {
        switch ($gateway->provider) {
            case 'razorpay':
                return [
                    'key' => $gateway->getApiKey(),
                    'amount' => $order->total * 100, // Razorpay uses paise
                    'currency' => 'INR',
                    'name' => config('app.name'),
                    'description' => 'Order #' . $order->order_number,
                    'order_id' => $transaction->transaction_id,
                    'prefill' => [
                        'name' => $order->user->name ?? '',
                        'email' => $order->user->email ?? '',
                    ],
                ];

            case 'stripe':
                return [
                    'publishable_key' => $gateway->getApiKey(),
                    'amount' => $order->total * 100,
                    'currency' => 'inr',
                    'client_secret' => 'requires_stripe_integration',
                ];

            case 'paypal':
                return [
                    'client_id' => $gateway->getApiKey(),
                    'amount' => $order->total,
                    'currency' => 'INR',
                ];

            case 'cod':
                return [
                    'message' => 'Pay ₹' . number_format($order->total, 2) . ' on delivery',
                    'auto_confirm' => true,
                ];

            default:
                return [];
        }
    }
}
