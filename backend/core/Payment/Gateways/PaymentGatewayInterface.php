<?php

namespace Core\Payment\Gateways;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment request.
     * 
     * @param float $amount Amount in base currency units (e.g., USD, INR)
     * @param string $currency Currency code
     * @param array $options Additional options (receipt id, notes, etc.)
     * @return array Response payload (order_id, etc.)
     */
    public function initiatePayment(float $amount, string $currency, array $options = []): array;

    /**
     * Verify a payment signature/completion.
     * 
     * @param string $paymentId
     * @param array $data Verification data (signature, order_id)
     * @return bool
     */
    public function verifyPayment(string $paymentId, array $data): bool;
}
