<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Log;

class CodPaymentGateway implements PaymentGatewayInterface
{
    private int $maxCodAmount;

    public function __construct()
    {
        // Max COD amount in minor units (paise/cents). Default: ₹50,000 = 5000000 paise
        $this->maxCodAmount = (int) config('pricing.max_cod_amount', 5000000);
    }

    public function createIntent(int $amount, string $currency, array $options = []): array
    {
        if ($amount > $this->maxCodAmount) {
            Log::warning('COD order rejected: amount exceeds limit.', [
                'amount' => $amount,
                'max' => $this->maxCodAmount,
            ]);
            return [
                'success' => false,
                'message' => 'Cash on Delivery is not available for orders above ' . number_format($this->maxCodAmount / 100, 2) . '.',
            ];
        }

        return [
            'success' => true,
            'client_secret' => 'cod_virtual_secret_' . uniqid(),
            'transaction_id' => 'cod_' . uniqid(),
            'status' => 'pending',
            'data' => []
        ];
    }

    public function charge(int $amount, string $currency, string $source, array $options = []): array
    {
        if ($amount > $this->maxCodAmount) {
            return [
                'success' => false,
                'message' => 'COD amount exceeds the maximum allowed limit.',
            ];
        }

        return [
            'success' => true,
            'transaction_id' => $source ?: 'cod_' . uniqid(),
            'status' => 'pending',
            'data' => []
        ];
    }

    public function refund(string $transactionId, ?int $amount = null): array
    {
        return [
            'success' => true,
            'message' => 'COD Refund handled manually/offline',
            'data' => []
        ];
    }

    public function verify(string $paymentId): array
    {
        return [
            'success' => true,
            'status' => 'pending',
            'data' => []
        ];
    }
}
