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
    /**
     * Create a payment intent (without confirming immediately)
     *
     * @param int $amount Amount to charge in minor units
     * @param string $currency Currency code
     * @param array $options Additional options
     * @return array Response data (including client_secret)
     */
    public function createIntent(int $amount, string $currency, array $options = []): array;

    /**
     * Charge a payment source
     *
     * @param int $amount Amount to charge in minor units
     * @param string $currency Currency code (e.g., 'USD', 'INR')
     * @param string $source Payment source token (or Method ID)
     * @param array $options Additional options (metadata, description, etc.)
     * @return array Response data
     */
    public function charge(int $amount, string $currency, string $source, array $options = []): array;

    /**
     * Refund a transaction
     *
     * @param string $transactionId Transaction ID to refund
     * @param int|null $amount Amount to refund in minor units (null for full refund)
     * @return array Response data
     */
    public function refund(string $transactionId, ?int $amount = null): array;

    /**
     * Verify a payment intent or transaction
     *
     * @param string $paymentId
     * @return array Response data
     */
    public function verify(string $paymentId): array;
}
