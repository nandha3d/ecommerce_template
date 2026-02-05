<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FailedPayment;
use App\Services\FraudDetectionService;
use Core\Payment\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    private PaymentService $paymentService;
    private FraudDetectionService $fraudService;

    public function __construct(PaymentService $paymentService, FraudDetectionService $fraudService)
    {
        $this->paymentService = $paymentService;
        $this->fraudService = $fraudService;
    }

    /**
     * Initiate a payment with fraud detection.
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'receipt_id' => 'sometimes|string',
            'email' => 'sometimes|email',
        ]);

        try {
            // Run fraud detection
            $fraudResult = $this->fraudService->evaluate([
                'email' => $validated['email'] ?? auth()->user()?->email,
                'ip_address' => $request->ip(),
                'user_id' => auth()->id(),
                'amount' => (float) $validated['amount'],
                'user_agent' => $request->userAgent(),
            ]);

            // Block if fraud detected
            if (!$fraudResult['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction could not be processed. Please contact support.',
                    'error_code' => 'TRANSACTION_BLOCKED',
                ], 403);
            }

            // Add fraud check ID to receipt for tracking
            $receiptId = $validated['receipt_id'] ?? 'rcpt_' . uniqid();
            
            $data = $this->paymentService->createPaymentOrder(
                (float)$validated['amount'], 
                $validated['currency'], 
                $receiptId
            );
            
            // Include fraud score in response (for review cases)
            $data['fraud_score'] = $fraudResult['score'];
            $data['fraud_check_id'] = $fraudResult['fraud_check_id'];
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify a payment.
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => 'required|string',
            'order_id' => 'required|string', 
            'signature' => 'required|string'
        ]);

        $success = $this->paymentService->confirmPayment($validated['payment_id'], [
            'provder_order_id' => $validated['order_id'],
            'signature' => $validated['signature']
        ]);

        if ($success) {
            // Record successful payment for velocity tracking
            $email = auth()->user()?->email ?? $request->input('email');
            if ($email) {
                $this->fraudService->recordSuccess($email, $request->ip());
            }
            
            return response()->json(['success' => true, 'message' => 'Payment verified successfully']);
        }

        return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
    }

    /**
     * Get available payment gateways.
     */
    public function gateways(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 'razorpay',
                    'name' => 'Razorpay',
                    'logo' => 'https://cdn.razorpay.com/logos/Razorpay_Logo_Color.png',
                    'is_active' => true
                ]
            ]
        ]);
    }

    /**
     * Handle failed payment - track for recovery.
     */
    public function failed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id' => 'sometimes|string',
            'razorpay_payment_id' => 'sometimes|string',
            'error_code' => 'sometimes|string',
            'error_description' => 'sometimes|string',
            'amount' => 'sometimes|numeric',
            'email' => 'sometimes|email',
        ]);

        $email = $validated['email'] ?? auth()->user()?->email;
        
        // Record failure for velocity tracking
        if ($email) {
            $this->fraudService->recordFailure($email, $request->ip());
        }

        // Create failed payment record for recovery
        FailedPayment::create([
            'user_id' => auth()->id(),
            'email' => $email,
            'razorpay_order_id' => $validated['razorpay_order_id'] ?? null,
            'razorpay_payment_id' => $validated['razorpay_payment_id'] ?? null,
            'amount' => $validated['amount'] ?? 0,
            'currency' => 'INR',
            'failure_reason' => $validated['error_description'] ?? 'Unknown error',
            'failure_code' => $validated['error_code'] ?? null,
            'recovery_status' => 'pending',
            'metadata' => [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        ]);

        return response()->json(['success' => true, 'message' => 'Failure logged for recovery']);
    }
}

