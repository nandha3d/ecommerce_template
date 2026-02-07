<?php

namespace App\Services\Shipping;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Services\ConfigurationService;

class ShiprocketService
{
    private $baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    private $email;
    private $password;
    private $configService;

    public function __construct(ConfigurationService $configService)
    {
        $this->configService = $configService;
        $this->email = config('services.shiprocket.email');
        $this->password = config('services.shiprocket.password');
    }

    /**
     * Authenticate and get token
     */
    public function getToken()
    {
        return Cache::remember('shiprocket_token', 86400, function () {
            $response = Http::post("{$this->baseUrl}/auth/login", [
                'email' => $this->email,
                'password' => $this->password,
            ]);

            if ($response->successful()) {
                return $response->json()['token'];
            }

            Log::error('Shiprocket Login Failed: ' . $response->body());
            return null;
        });
    }

    /**
     * Check service availability for pincodes
     */
    public function checkServiceability($pickupPostcode, $deliveryPostcode, $weight, $cod = 0)
    {
        $token = $this->getToken();
        if (!$token) return null;

        $response = Http::withToken($token)->get("{$this->baseUrl}/courier/serviceability", [
            'pickup_postcode' => $pickupPostcode,
            'delivery_postcode' => $deliveryPostcode,
            'weight' => $weight,
            'cod' => $cod,
        ]);

        return $response->json();
    }

    /**
     * Create a forward shipment order
     */
    public function createOrder(array $orderData)
    {
        $token = $this->getToken();
        if (!$token) return null;

        $response = Http::withToken($token)->post("{$this->baseUrl}/orders/create/adhoc", $orderData);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('Shiprocket Create Order Failed: ' . $response->body());
        return ['error' => $response->json()];
    }

    /**
     * Track a shipment
     */
    public function trackShipment($awb)
    {
        $token = $this->getToken();
        if (!$token) return null;

        $response = Http::withToken($token)->get("{$this->baseUrl}/courier/track/awb/{$awb}");

        return $response->json();
    }
}
