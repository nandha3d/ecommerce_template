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

    public function __construct(OrderService $orderService, \Core\Cart\Services\CartService $cartService)
    {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
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

            $order = $this->orderService->createOrder($user, $cart, $orderData);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => new OrderResource($order),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
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
