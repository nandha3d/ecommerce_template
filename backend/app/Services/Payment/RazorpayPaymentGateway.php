<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Services\ConfigurationService;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;

class RazorpayPaymentGateway implements PaymentGatewayInterface
{
    protected $api;
    protected $currency;

    public function __construct(ConfigurationService $config)
    {
        $keyId = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');
        $this->currency = config('services.razorpay.currency', 'INR');

        if ($keyId && $keySecret) {
            $this->api = new Api($keyId, $keySecret);
        } else {
            Log::warning('Razorpay keys not configured.');
        }
    }

    public function createIntent(float $amount, string $currency, array $options = []): array
    {
        try {
            // Razorpay "Orders" are equivalent to PaymentIntents for the purpose of locking amount/receipt.
            // https://razorpay.com/docs/api/orders/
            
            $amountInSmallestUnit = $this->getAmountInSmallestUnit($amount, $currency);
            
            $orderData = [
                'receipt'         => $options['receipt'] ?? uniqid('rcpt_'),
                'amount'          => $amountInSmallestUnit,
                'currency'        => strtoupper($currency),
                'payment_capture' => 1, // Auto capture
                'notes'           => $options['metadata'] ?? []
            ];

            $order = $this->api->order->create($orderData);

            return [
                'success' => true,
                'client_secret' => $order->id, // For Razorpay, the order_id is the key identifier used on frontend
                'transaction_id' => $order->id,
                'status' => $order->status,
                'data' => $order->toArray()
            ];

        } catch (\Exception $e) {
            Log::error('Razorpay Create Order Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function charge(float $amount, string $currency, string $source, array $options = []): array
    {
        // For Razorpay Standard Layout, the "charge" is usually verifying the payment signature 
        // after the frontend success. 
        
        try {
            // Verify Signature if provided (Critical for security)
            if (isset($options['razorpay_signature']) && isset($options['razorpay_order_id'])) {
                $attributes = [
                    'razorpay_order_id' => $options['razorpay_order_id'],
                    'razorpay_payment_id' => $source,
                    'razorpay_signature' => $options['razorpay_signature']
                ];
                
                try {
                    $this->api->utility->verifyPaymentSignature($attributes);
                } catch (\Exception $e) {
                     Log::critical("Razorpay Signature Verification Failed: " . $e->getMessage());
                     throw new \Exception("Payment verification failed (Invalid Signature)");
                }
            }
            
            $payment = $this->api->payment->fetch($source);
            
            // If we need to capture manually:
            if ($payment->status === 'authorized') {
                $payment->capture(['amount' => $payment->amount, 'currency' => $payment->currency]);
            }

            return [
                'success' => $payment->status === 'captured',
                'transaction_id' => $payment->id,
                'status' => $payment->status,
                'data' => $payment->toArray(),
            ];
        } catch (\Exception $e) {
             Log::error('Razorpay Charge/Fetch Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function refund(string $transactionId, ?float $amount = null): array
    {
        try {
            $params = [];
            if ($amount !== null) {
                 // Razorpay expects amount in smallest unit
                 // We need to know currency logic, but usually it defaults to INR (paise)
                 // This might be risky if we don't know the original transaction currency
                 // But for now typical use case:
                 $params['amount'] = (int) ($amount * 100); 
            }

            $refund = $this->api->payment->fetch($transactionId)->refund($params);

            return [
                'success' => true,
                'transaction_id' => $refund->id,
                'status' => $refund->status,
                'data' => $refund->toArray(),
            ];

        } catch (\Exception $e) {
             Log::error('Razorpay Refund Failed: ' . $e->getMessage());
             return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function verify(string $paymentId): array
    {
        // This acts as a fetch/status check
        try {
            $payment = $this->api->payment->fetch($paymentId);
             return [
                'success' => $payment->status === 'captured',
                'status' => $payment->status,
                'data' => $payment->toArray(),
            ];
        } catch (\Exception $e) {
             return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
    
    public function verifySignature($attributes)
    {
        try {
            $this->api->utility->verifyPaymentSignature($attributes);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getAmountInSmallestUnit(float $amount, string $currency): int
    {
        // Razorpay supports mostly currencies where 1 unit = 100 subunits
        return (int) round($amount * 100);
    }
}
