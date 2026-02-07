<?php

namespace Core\Payment\Services;

use Core\Payment\Gateways\PaymentGatewayInterface;
use Core\Base\Events\EventBus;
// use Core\Order\Models\Order; // Ideally we use Order ID or Repo

class PaymentService
{
    private PaymentGatewayInterface $gateway;
    private EventBus $eventBus; // For dispatching PaymentSuccess event later

    public function __construct(PaymentGatewayInterface $gateway, EventBus $eventBus)
    {
        $this->gateway = $gateway;
        $this->eventBus = $eventBus;
    }

    /**
     * Create a payment intention/order at the gateway.
     */
    public function createPaymentOrder(float $totalAmount, string $currency, string $receiptId): array
    {
        return $this->gateway->initiatePayment($totalAmount, $currency, ['receipt_id' => $receiptId]);
    }

    /**
     * Verify payment and potentially capture/finalize order.
     */
    public function confirmPayment(string $paymentId, array $data): bool
    {
        return $this->gateway->verifyPayment($paymentId, $data);
    }
}
