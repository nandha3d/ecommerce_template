<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Services\ConfigurationService;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class RazorpayPaymentGateway implements PaymentGatewayInterface
{
    private ?Client $client = null;
    private ?string $keyId = null;
    private ?string $keySecret = null;
    private string $baseUrl = 'https://api.razorpay.com/v1/';

    public function __construct(ConfigurationService $config)
    {
        $this->keyId = config('services.razorpay.key_id');
        $this->keySecret = config('services.razorpay.key_secret');

        if (empty($this->keyId) || empty($this->keySecret)) {
            if (config('app.env') === 'production') {
                throw new \RuntimeException('Razorpay API keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
            }
            Log::warning('Razorpay keys not configured — payment processing will fail.');
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'auth' => [$this->keyId ?? '', $this->keySecret ?? ''],
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'verify' => config('app.env') === 'production',
        ]);
    }

    public function createIntent(int $amount, string $currency, array $options = []): array
    {
        try {
            $amountInSmallestUnit = $amount;
            
            $response = $this->client->post('orders', [
                'json' => [
                    'receipt'         => $options['receipt'] ?? uniqid('rcpt_'),
                    'amount'          => $amountInSmallestUnit,
                    'currency'        => strtoupper($currency),
                    'payment_capture' => 1,
                    'notes'           => $options['metadata'] ?? []
                ]
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'client_secret' => $data['id'],
                'transaction_id' => $data['id'],
                'status' => $data['status'],
                'data' => $data
            ];

        } catch (\Exception $e) {
            Log::error('Razorpay Create Order Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function charge(int $amount, string $currency, string $source, array $options = []): array
    {
        try {
            // Verify Signature manually if provided
            if (isset($options['razorpay_signature']) && isset($options['razorpay_order_id'])) {
                $expectedSignature = hash_hmac('sha256', $options['razorpay_order_id'] . '|' . $source, $this->keySecret);
                if (!hash_equals($expectedSignature, $options['razorpay_signature'])) {
                    Log::critical("Razorpay Signature Verification Failed");
                    throw new \Exception("Payment verification failed (Invalid Signature)");
                }
            }
            
            $response = $this->client->get("payments/{$source}");
            $payment = json_decode($response->getBody()->getContents(), true);
            
            if ($payment['status'] === 'authorized') {
                $response = $this->client->post("payments/{$source}/capture", [
                    'json' => [
                        'amount' => $payment['amount'], 
                        'currency' => $payment['currency']
                    ]
                ]);
                $payment = json_decode($response->getBody()->getContents(), true);
            }

            return [
                'success' => $payment['status'] === 'captured',
                'transaction_id' => $payment['id'],
                'status' => $payment['status'],
                'data' => $payment,
            ];
        } catch (\Exception $e) {
             Log::error('Razorpay Charge/Fetch Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function refund(string $transactionId, ?int $amount = null): array
    {
        try {
            $params = [];
            if ($amount !== null) {
                 $params['amount'] = $amount; 
            }

            $response = $this->client->post("payments/{$transactionId}/refund", [
                'json' => $params
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'transaction_id' => $data['id'],
                'status' => $data['status'],
                'data' => $data,
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
        try {
            $response = $this->client->get("payments/{$paymentId}");
            $data = json_decode($response->getBody()->getContents(), true);

             return [
                'success' => $data['status'] === 'captured',
                'status' => $data['status'],
                'data' => $data,
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
        $expectedSignature = hash_hmac('sha256', $attributes['razorpay_order_id'] . '|' . $attributes['razorpay_payment_id'], $this->keySecret);
        return hash_equals($expectedSignature, $attributes['razorpay_signature']);
    }

    /**
     * @deprecated Use integers directly
     */
    private function getAmountInSmallestUnit(int $amount, string $currency): int
    {
        return $amount;
    }
}
