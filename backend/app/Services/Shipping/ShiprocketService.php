<?php

namespace App\Services\Shipping;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ShiprocketService
{
    protected string $baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    protected ?string $email;
    protected ?string $password;
    protected ?string $token;

    public function __construct()
    {
        $config = $this->getConfig();
        $this->email = $config['email'] ?? null;
        $this->password = $config['password'] ?? null;
        $this->token = Cache::get('shiprocket_token');
    }

    protected function getConfig(): array
    {
        $module = \App\Models\Module::where('slug', 'shipping_shiprocket')->first();
        return $module ? ($module->config ?? []) : [];
    }

    /**
     * Authenticate and get JWT token
     */
    public function login(): ?string
    {
        if (!$this->email || !$this->password) {
            throw new \Exception('Shiprocket credentials not configured');
        }

        $response = Http::withoutVerifying()->post("{$this->baseUrl}/auth/login", [
            'email' => $this->email,
            'password' => $this->password,
        ]);

        if ($response->successful()) {
            $token = $response->json()['token'];
            // Token valid for 10 days usually, cache for 9 days
            Cache::put('shiprocket_token', $token, 86400 * 9);
            $this->token = $token;
            return $token;
        }

        throw new \Exception('Shiprocket login failed: ' . $response->body());
    }

    /**
     * Get validated headers
     */
    protected function getHeaders(): array
    {
        if (!$this->token) {
            $this->login();
        }

        return [
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Check serviceable pincodes
     */
    public function checkServiceability(string $pickupPincode, string $deliveryPincode, float $weight, float $codAmount = 0): array
    {
        $response = Http::withoutVerifying()->withHeaders($this->getHeaders())
            ->get("{$this->baseUrl}/courier/serviceability", [
                'pickup_postcode' => $pickupPincode,
                'delivery_postcode' => $deliveryPincode,
                'weight' => $weight,
                'cod' => $codAmount > 0 ? 1 : 0,
            ]);

        return $response->json();
    }

    /**
     * Create a Custom Order in Shiprocket
     */
    public function createOrder(array $orderData): array
    {
        /*
         * Expected $orderData format:
         * [
         *   'order_id' => '12345',
         *   'order_date' => '2025-01-01 10:00',
         *   'pickup_location' => 'Primary',
         *   'billing_customer_name' => 'John',
         *   'billing_last_name' => 'Doe',
         *   'billing_address' => '...',
         *   'billing_city' => '...',
         *   'billing_pincode' => '...',
         *   'billing_state' => '...',
         *   'billing_country' => 'India',
         *   'billing_email' => '...',
         *   'billing_phone' => '...',
         *   'shipping_is_billing' => true,
         *   'order_items' => [...],
         *   'payment_method' => 'Prepaid',
         *   'sub_total' => 100,
         *   'length' => 10, 'breadth' => 10, 'height' => 10, 'weight' => 0.5
         * ]
         */
        
        $channelId = $this->getConfig()['channel_id'] ?? null;

        if ($channelId) {
            $orderData['channel_id'] = $channelId;
        }

        $response = Http::withoutVerifying()->withHeaders($this->getHeaders())
            ->post("{$this->baseUrl}/orders/create/adhoc", $orderData);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception('Create Order failed: ' . $response->body());
    }

    /**
     * Track Shipment
     */
    public function trackOrder(string $shipmentId): array
    {
        $response = Http::withoutVerifying()->withHeaders($this->getHeaders())
            ->get("{$this->baseUrl}/courier/track/shipment/{$shipmentId}");

        return $response->json();
    }
    
    /**
     * Validate Config
     */
    public function validateCredentials(string $email, string $password): bool
    {
         $response = Http::withoutVerifying()->post("{$this->baseUrl}/auth/login", [
            'email' => $email,
            'password' => $password,
        ]);
        
        return $response->successful();
    }
}
