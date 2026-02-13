<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Services\ConfigurationService;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class StripePaymentGateway implements PaymentGatewayInterface
{
    private ?Client $client = null;
    private ?string $apiKey = null;
    private string $baseUrl = 'https://api.stripe.com/v1/';

    public function __construct(ConfigurationService $config)
    {
        $this->apiKey = config('services.stripe.secret') ?? $config->get('payment.stripe.secret_key');
        if (empty($this->apiKey)) {
            if (config('app.env') === 'production') {
                throw new \RuntimeException('Stripe secret key is not configured. Set STRIPE_SECRET in .env');
            }
            Log::warning('Stripe secret key not configured — payment processing will fail.');
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . ($this->apiKey ?? ''),
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Stripe-Version' => '2023-10-16',
            ],
            'verify' => config('app.env') === 'production',
        ]);
    }

    public function createIntent(float $amount, string $currency, array $options = []): array
    {
        try {
            $amountInSmallestUnit = $this->getAmountInSmallestUnit($amount, $currency);

            $response = $this->client->post('payment_intents', [
                'form_params' => [
                    'amount' => $amountInSmallestUnit,
                    'currency' => strtolower($currency),
                    'automatic_payment_methods' => ['enabled' => 'true'],
                    'description' => $options['description'] ?? 'Order Payment',
                    'metadata' => $options['metadata'] ?? [],
                ]
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'client_secret' => $data['client_secret'],
                'transaction_id' => $data['id'],
                'status' => $data['status'],
                'data' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Stripe Intent Creation Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function charge(float $amount, string $currency, string $source, array $options = []): array
    {
        try {
            $amountInSmallestUnit = $this->getAmountInSmallestUnit($amount, $currency);

            $params = [
                'amount' => $amountInSmallestUnit,
                'currency' => strtolower($currency),
                'payment_method' => $source,
                'confirm' => 'true',
                'return_url' => $options['return_url'] ?? route('checkout.success'),
                'description' => $options['description'] ?? 'Order Payment',
                'metadata' => $options['metadata'] ?? [],
            ];

            $response = $this->client->post('payment_intents', [
                'form_params' => $params
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => $data['status'] === 'succeeded',
                'transaction_id' => $data['id'],
                'status' => $data['status'],
                'data' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Stripe Charge Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function refund(string $transactionId, ?float $amount = null): array
    {
        try {
            $params = ['payment_intent' => $transactionId];
            if ($amount !== null) {
                $params['amount'] = (int) ($amount * 100);
            }

            $response = $this->client->post('refunds', [
                'form_params' => $params
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => in_array($data['status'], ['succeeded', 'pending']),
                'transaction_id' => $data['id'],
                'status' => $data['status'],
                'data' => $data,
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
            $response = $this->client->get('payment_intents/' . $paymentId);
            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => $data['status'] === 'succeeded',
                'status' => $data['status'],
                'data' => $data,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe Verify Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify Stripe Webhook Signature (Manual implementation)
     */
    /**
     * Verify Stripe Webhook Signature with replay attack protection.
     * Validates HMAC-SHA256 and enforces a 5-minute timestamp tolerance.
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $parts = explode(',', $signature);
        $timestamp = null;
        $v1Signature = null;

        foreach ($parts as $part) {
            if (strpos($part, 't=') === 0) {
                $timestamp = substr($part, 2);
            } elseif (strpos($part, 'v1=') === 0) {
                $v1Signature = substr($part, 3);
            }
        }

        if (!$timestamp || !$v1Signature) {
            Log::warning('Stripe webhook: missing timestamp or signature component.');
            return false;
        }

        // Replay attack protection: reject webhooks older than 5 minutes
        $tolerance = 300; // 5 minutes in seconds
        if (abs(time() - (int) $timestamp) > $tolerance) {
            Log::warning('Stripe webhook: timestamp outside tolerance window.', [
                'webhook_time' => $timestamp,
                'server_time' => time(),
            ]);
            return false;
        }

        $signedPayload = $timestamp . '.' . $payload;
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $v1Signature);
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
