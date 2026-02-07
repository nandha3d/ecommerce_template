<?php

namespace Core\Payment\Gateways;

use Razorpay\Api\Api;
use Exception;

class RazorpayGateway implements PaymentGatewayInterface
{
    private Api $api;
    private string $currency;

    public function __construct(string $keyId, string $keySecret, string $currency = 'INR')
    {
        $this->api = new Api($keyId, $keySecret);
        $this->currency = $currency;
    }

    /**
     * Initiate a payment request using Razorpay Orders API.
     */
    public function initiatePayment(float $amount, string $currency, array $options = []): array
    {
        // Razorpay expects amount in paise (1 INR = 100 paise)
        $amountInPaise = $amount * 100;

        $orderData = [
            'receipt'         => $options['receipt_id'] ?? uniqid(),
            'amount'          => $amountInPaise,
            'currency'        => $currency,
            'payment_capture' => 1 // Auto capture
        ];

        try {
            $razorpayOrder = $this->api->order->create($orderData);
            
            return [
                'provider_order_id' => $razorpayOrder->id,
                'amount' => $amount,
                'currency' => $currency,
                'key_id' => $this->api->getKey(), // Safe to expose Key ID to frontend
            ];
        } catch (Exception $e) {
            // Log error in production context (via injected logger if available)
            throw new Exception("Razorpay Order Creation Failed: " . $e->getMessage());
        }
    }

    /**
     * Verify a payment signature.
     */
    public function verifyPayment(string $paymentId, array $data): bool
    {
        try {
            $attributes = [
                'razorpay_order_id' => $data['provder_order_id'],
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $data['signature']
            ];

            $this->api->utility->verifyPaymentSignature($attributes);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
