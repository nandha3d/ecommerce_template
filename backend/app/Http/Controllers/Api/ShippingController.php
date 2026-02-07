<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Shipping\ShiprocketService;
use App\Services\ModuleManager;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected ShiprocketService $shiprocket;
    protected ModuleManager $moduleManager;

    public function __construct(ShiprocketService $shiprocket, ModuleManager $moduleManager)
    {
        $this->shiprocket = $shiprocket;
        $this->moduleManager = $moduleManager;
    }

    /**
     * Update Shipping Configuration
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'channel_id' => 'nullable|string',
            'pickup_location' => 'nullable|string'
        ]);

        // Validate credentials with Shiprocket
        if (!$this->shiprocket->validateCredentials($validated['email'], $validated['password'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Shiprocket credentials'
            ], 400);
        }

        // Save config
        $this->moduleManager->updateConfig('shipping_shiprocket', $validated);

        return response()->json([
            'success' => true,
            'message' => 'Shiprocket configuration updated successfully'
        ]);
    }

    /**
     * Test Connection / Get Account Info
     */
    public function testConnection()
    {
        try {
            $token = $this->shiprocket->login();
            return response()->json([
                'success' => true,
                'message' => 'Connection successful',
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Create Shipment Order
     */
    public function createShipment(Request $request)
    {
        // For now, accepting raw order data to support the mock frontend
        // In production, this should ideally take an order_id and fetch from DB
        
        $orderData = $request->all();

        // Basic validation or mapping if needed
        // If the frontend sends 'id' as 'ORD-001', we might need to adapt it
        // But Shiprocket expects specific structure. 
        // Let's assume the Service handles mapping or we pass data directly if it matches.
        
        // If we want to use the mapOrder method from service, we need an Order model.
        // Since we are using mock data, we will try to pass the data directly to createOrder
        // assuming the frontend or a helper maps it, OR we modify mapOrder to accept array.
        
        // Let's look at ShiprocketService::createOrder. It calls mapOrder internally?
        // No, createOrder($order) in service likely calls mapOrder.
        // Let's rely on the service to handle it.
        
        try {
            // For testing with mock data, we interpret the request as the payload
            // In a real scenario: $order = Order::findOrFail($request->order_id);
            // $response = $this->shiprocket->createOrder($order);
            
            // Temporary Logic for Mock Data:
            $mockOrder = new \App\Models\Order($orderData); 
            // We force ID to be integer if needed, or handle string ID.
            // Shiprocket requires 'order_id' to be unique.
            
            // To make it work with the current mock frontend which sends {id: 'ORD-001', ...}
            // We need to map this to what Shiprocket expects.
            
            // Fetch config for defaults
            $module = \App\Models\Module::where('slug', 'shipping_shiprocket')->first();
            $config = $module ? ($module->config ?? []) : [];
            $pickupLocation = $config['pickup_location'] ?? 'Primary';

            // Let's manually construct the payload expected by Shiprocket here for the mock data
            $payload = [
                'order_id' => ($orderData['id'] ?? uniqid()) . '-' . time(), // Unique ID for testing
                'order_date' => date('Y-m-d H:i'), // Current date to avoid "too old" error
                'pickup_location' => $pickupLocation,
                'billing_customer_name' => $orderData['customer'] ?? 'Test User',
                'billing_last_name' => '',
                'billing_address' => 'Test Address',
                'billing_city' => 'Test City',
                'billing_pincode' => '110001',
                'billing_state' => 'New Delhi', // TODO: Map strictly from order
                'billing_country' => 'India',
                // CRITICAL FIX: Removed hardcoded fallback 'test@example.com'
                // We MUST have a valid email for the shipment.
                'billing_email' => $orderData['email'] ?? throw new \InvalidArgumentException("Billing email is required for shipment creation."),
                'billing_phone' => $orderData['phone'] ?? '9876543210', // TODO: Enforce phone
                'shipping_is_billing' => true,
                'order_items' => [
                    [
                        'name' => 'Test Product',
                        'sku' => 'TEST-001',
                        'units' => 1,
                        'selling_price' => $orderData['total'] ?? 100,
                    ]
                ],
                'payment_method' => ($orderData['payment'] ?? 'Paid') === 'Paid' ? 'Prepaid' : 'COD',
                'sub_total' => $orderData['total'] ?? 100,
                'length' => 10,
                'breadth' => 10,
                'height' => 10,
                'weight' => 0.5
            ];

            // Direct API call using the service's client
            $response = $this->shiprocket->createOrder($payload);

            return response()->json([
                'success' => true,
                'message' => 'Shipment created successfully',
                'data' => $response
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Shipment creation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
