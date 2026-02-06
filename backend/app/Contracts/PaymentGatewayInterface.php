<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    /**
     * Charge a payment source
     *
     * @param float $amount Amount to charge
     * @param string $currency Currency code (e.g., 'USD', 'INR')
     * @param string $source Payment source token (or Method ID)
     * @param array $options Additional options (metadata, description, etc.)
     * @return array Response data
     */
    public function charge(float $amount, string $currency, string $source, array $options = []): array;

    /**
     * Refund a transaction
     *
     * @param string $transactionId Transaction ID to refund
     * @param float|null $amount Amount to refund (null for full refund)
     * @return array Response data
     */
    public function refund(string $transactionId, ?float $amount = null): array;

    /**
     * Verify a payment intent or transaction
     *
     * @param string $paymentId
     * @return array Response data
     */
    public function verify(string $paymentId): array;
}
