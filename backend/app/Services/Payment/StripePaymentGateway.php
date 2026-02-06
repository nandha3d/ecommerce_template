<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Services\ConfigurationService;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Log;

class StripePaymentGateway implements PaymentGatewayInterface
{
    private $stripe;

    public function __construct(ConfigurationService $config)
    {
        $apiKey = $config->get('payment.stripe.secret_key');
        if (empty($apiKey)) {
            // Log warning or throw exception if critical
            Log::warning('Stripe secret key not configured.');
        }

        if (class_exists(StripeClient::class)) {
            $this->stripe = new StripeClient($apiKey ?? 'sk_test_placeholder');
        } else {
             Log::error('StripeClient class not found. Install stripe/stripe-php.');
        }
    }

    public function charge(float $amount, string $currency, string $source, array $options = []): array
    {
        try {
            // Convert amount to smallest currency unit (cents/paise)
            $amountInSmallestUnit = $this->getAmountInSmallestUnit($amount, $currency);

            $chargeParams = [
                'amount' => $amountInSmallestUnit,
                'currency' => strtolower($currency),
                'source' => $source,
                'description' => $options['description'] ?? 'Order Payment',
                'metadata' => $options['metadata'] ?? [],
            ];
            
            // If strictly using PaymentIntents (recommended for SCA)
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $amountInSmallestUnit,
                'currency' => strtolower($currency),
                'payment_method' => $source,
                'confirm' => true,
                'return_url' => $options['return_url'] ?? route('checkout.success'),
                'description' => $options['description'] ?? 'Order Payment',
                'metadata' => $options['metadata'] ?? [],
            ]);

            return [
                'success' => $paymentIntent->status === 'succeeded',
                'transaction_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'data' => $paymentIntent->toArray(),
            ];

        } catch (\Exception $e) {
            Log::error('Stripe Charge Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'error_code' => $e->getCode(),
            ];
        }
    }

    public function refund(string $transactionId, ?float $amount = null): array
    {
        try {
            $params = ['payment_intent' => $transactionId];
            if ($amount !== null) {
                // Refunds might need currency check for decimal conversion too, usually assumed same as original
                // For simplicity here assume full refund or provide amount in smallest unit if needed. 
                // Stripe expects amount in cents.
                // NOTE: We'd need original currency to convert $amount correctly. 
                // For now, assuming full refund if amount is not passed.
                // If amount is passed, we might need to store currency with transaction or pass it here.
                 $params['amount'] = (int) ($amount * 100); 
            }

            $refund = $this->stripe->refunds->create($params);

            return [
                'success' => $refund->status === 'succeeded' || $refund->status === 'pending',
                'transaction_id' => $refund->id,
                'status' => $refund->status,
                'data' => $refund->toArray(),
            ];
        } catch (\Exception $e) {
             Log::error('Stripe Refund Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function verify(string $paymentId): array
    {
        try {
            $intent = $this->stripe->paymentIntents->retrieve($paymentId);
            return [
                'success' => $intent->status === 'succeeded',
                'status' => $intent->status,
                'data' => $intent->toArray(),
            ];
        } catch (\Exception $e) {
             Log::error('Stripe Verify Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function getAmountInSmallestUnit(float $amount, string $currency): int
    {
        $zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
        if (in_array(strtoupper($currency), $zeroDecimalCurrencies)) {
            return (int) $amount;
        }
        return (int) round($amount * 100);
    }
}
