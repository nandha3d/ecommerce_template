<?php

namespace Core\Payment\Gateways;

class NullPaymentGateway implements PaymentGatewayInterface
{
    public function initiatePayment(float $amount, string $currency, array $metadata = []): array
    {
        return [
            'id' => 'pay_null_' . uniqid(),
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'created',
            'client_secret' => 'null_secret',
        ];
    }

    public function verifyPayment(string $paymentId, array $data): bool
    {
        return true;
    }
}
