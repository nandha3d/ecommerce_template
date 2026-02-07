<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Address;
use App\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Core\Order\Actions\CreateOrderAction;
use Core\Inventory\Services\InventoryService;
use App\Services\OrderService;

class OrderController extends Controller
{
    private OrderService $orderService;
    private \Core\Cart\Services\CartService $cartService;
    private \App\Services\CheckoutService $checkoutService;

    public function __construct(
        OrderService $orderService,
        \Core\Cart\Services\CartService $cartService,
        \App\Services\CheckoutService $checkoutService
    ) {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
        $this->checkoutService = $checkoutService;
    }

    // ... (index, show, showByNumber methods remain the same) ...

    /**
     * List user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getUserOrders(auth()->user());

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Show single order.
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id, auth()->user());

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Get order by order number.
     */
    public function showByNumber(string $orderNumber): JsonResponse
    {
        $order = $this->orderService->getOrderByNumber($orderNumber, auth()->user());

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Create new order.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string|in:card,paypal,cod',
            'billing_address_id' => 'sometimes|exists:addresses,id',
            'shipping_address_id' => 'sometimes|exists:addresses,id',
            'billing_address' => 'sometimes|array',
            'billing_address.name' => 'required_with:billing_address|string',
            'billing_address.phone' => 'required_with:billing_address|string',
            'billing_address.address_line_1' => 'required_with:billing_address|string',
            'billing_address.city' => 'required_with:billing_address|string',
            'billing_address.state' => 'required_with:billing_address|string',
            'billing_address.postal_code' => 'required_with:billing_address|string',
            'billing_address.country' => 'required_with:billing_address|string',
            'same_as_billing' => 'sometimes|boolean',
            'notes' => 'sometimes|string|max:500',
        ]);

        $user = auth()->user();

        // --- IDEMPOTENCY CHECK (Rule 9) ---
        $idempotencyKey = $request->header('Idempotency-Key');
        if ($idempotencyKey) {
            $existingOrder = $this->orderService->getOrderByIdempotencyKey($idempotencyKey, $user);
            if ($existingOrder) {
                return response()->json([
                    'success' => true,
                    'message' => 'Order already processed (Idempotent)',
                    'data' => new OrderResource($existingOrder),
                ], 200);
            }
        }

        // Use CartService to fetch the cart, handling both User ID and Session ID
        // This ensures pending guest carts (not yet merged) are found if the session ID is present
        $sessionId = $request->header('X-Cart-Session');
        $cart = $this->cartService->getCart($user->id, $sessionId);

        // Eager load items for validation
        $cart->load(['items.product', 'items.variant', 'coupon']);

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
            ], 400);
        }

        try {
            $orderData = $request->all();
            if ($idempotencyKey) {
                $orderData['idempotency_key'] = $idempotencyKey;
            }

            $result = $this->checkoutService->placeOrder($user, $cart, $orderData);
            $order = $result['order'];

            return response()->json([
                'success' => true,
                'message' => isset($result['is_idempotent']) ? 'Order already processed (Idempotent)' : 'Order placed successfully',
                'data' => new OrderResource($order->load(['items.product', 'billingAddress', 'shippingAddress'])),
                'client_secret' => $result['client_secret'] ?? null,
            ], $order->wasRecentlyCreated ? 201 : 200);

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate order before creation (Phase 1: Order Validation Contract).
     */
    public function validateOrder(Request $request): JsonResponse
    {
        $user = auth()->user();
        $sessionId = $request->header('X-Cart-Session');
        $cart = $this->cartService->getCart($user->id, $sessionId);

        $cart->load(['items.product', 'items.variant', 'coupon']);

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false, // validation_status: invalid
                'validation_status' => 'invalid',
                'reasons' => ['Cart is empty'],
            ], 422);
        }

        // 1. Validate Inventory & Prices (Recalculate)
        $reasons = [];
        $healedSubtotal = 0;
        $hashItems = [];

        foreach ($cart->items as $item) {
            // Price Check
            $unitPrice = (float) $item->unit_price;
            if ($unitPrice <= 0) {
                if ($item->variant) {
                    $unitPrice = (float) ($item->variant->sale_price > 0 ? $item->variant->sale_price : $item->variant->price);
                } elseif ($item->product) {
                    $defaultVariant = $item->product->variants->first();
                    if ($defaultVariant) {
                        $unitPrice = (float) ($defaultVariant->sale_price > 0 ? $defaultVariant->sale_price : $defaultVariant->price);
                    }
                }
            }
            // Check for Price Drift (Optional: if we want to enforce it matched exactly what was in DB)
            // For now, we trust the 'healed' price as the Authoritative Price.

            // Stock Check
            $stock = 0;
            if ($item->variant) {
                $stock = $item->variant->stock; // Assuming stock field exists
            }

            if ($stock < $item->quantity) {
                $reasons[] = "Item '{$item->product_name}' is out of stock (Requested: {$item->quantity}, Available: {$stock})";
            }

            $healedSubtotal += $unitPrice * $item->quantity;
            $hashItems[] = $item->id . ':' . $item->quantity . ':' . $unitPrice;
        }

        if (!empty($reasons)) {
            return response()->json([
                'success' => false,
                'validation_status' => 'invalid',
                'reasons' => $reasons,
            ], 422);
        }

        // 2. Calculate Totals Authoritatively
        $discount = (float) $cart->discount; // Recalculate if coupon is applied? Ideally yes.
        $shipping = (float) $cart->shipping; // Recalculate via ShippingService? Ideally yes.
        $tax = (float) ($healedSubtotal * 0.18); // Example fixed tax, replace with TaxService later
        // Note: For Phase 1 strictness, we should use what's in Cart or Recalculate. 
        // Using Cart values for now but assuming they are refreshed by CartService previously.
        // Actually, let's trust $cart values for shipping/tax but 'healedSubtotal' for price.

        $total = $healedSubtotal + $cart->shipping + $cart->tax - $discount;

        // 3. Currency Authority
        $currency = \App\Models\Currency::where('is_base', true)->firstOr(function () {
            return new \App\Models\Currency(['code' => 'USD', 'symbol' => '$', 'decimal_places' => 2]);
        });

        // 4. Create/Update Checkout Lock (Phase 2: Checkout Lock)
        // We Snapshot EVERYTHING.

        $sessionData = [
            'items' => array_map(function ($item) {
                // Determine price again or use healed price from above
                $unitPrice = (float) $item->unit_price;
                if ($unitPrice <= 0) {
                    if ($item->variant) {
                        $unitPrice = (float) ($item->variant->sale_price > 0 ? $item->variant->sale_price : $item->variant->price);
                    } elseif ($item->product) {
                        $defaultVariant = $item->product->variants->first();
                        if ($defaultVariant) {
                            $unitPrice = (float) ($defaultVariant->sale_price > 0 ? $defaultVariant->sale_price : $defaultVariant->price);
                        }
                    }
                }

                return [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name ?? 'Unknown',
                    'variant_name' => $item->variant->name ?? null,
                    'sku' => $item->variant->sku ?? null,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'total' => $unitPrice * $item->quantity,
                    'image' => $item->product->images->first()->url ?? null,
                ];
            }, $cart->items->all()),
            'coupon_id' => $cart->coupon_id,
            'coupon_code' => $cart->coupon->code ?? null,
        ];

        // Create or Update Session
        // We use the cart's session_id as a reference or create a new unique checkout session
        $checkoutSession = \App\Models\CheckoutSession::updateOrCreate(
            ['cart_id' => $cart->id, 'step' => 'validation'], // Simple state tracking
            [
                'user_id' => $user->id,
                'subtotal' => $healedSubtotal,
                'discount' => $discount,
                'shipping_cost' => $shipping,
                'tax_amount' => $tax,
                'total' => $total,
                'currency' => $currency->code,
                'data' => $sessionData,
                'expires_at' => now()->addMinutes(15),
                'started_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'validation_status' => 'valid',
            'checkout_id' => $checkoutSession->id, // The LOCK ID
            'recalculated_totals' => [
                'subtotal' => $healedSubtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'discount' => $discount,
                'total' => $total,
            ],
            'locked_currency' => [
                'code' => $currency->code,
                'symbol' => $currency->symbol,
                'precision' => $currency->decimal_places ?? 2,
            ],
            'expires_at' => $checkoutSession->expires_at->toIso8601String(),
        ]);
    }

    /**
     * Cancel order.
     */
    public function cancel(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id, auth()->user());

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        try {
            $order = $this->orderService->cancelOrder($order);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => new OrderResource($order),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
