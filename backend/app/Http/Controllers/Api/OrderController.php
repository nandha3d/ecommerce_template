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

class OrderController extends Controller
{
    private CreateOrderAction $createOrderAction;
    private InventoryService $inventoryService;

    public function __construct(
        CreateOrderAction $createOrderAction,
        InventoryService $inventoryService
    )
    {
        $this->createOrderAction = $createOrderAction;
        $this->inventoryService = $inventoryService;
    }

    /**
     * List user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'billingAddress', 'shippingAddress'])
                       ->where('user_id', auth()->id())
                       ->orderBy('created_at', 'desc')
                       ->paginate(10);

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
        $order = Order::with(['items.product', 'billingAddress', 'shippingAddress', 'coupon'])
                      ->where('user_id', auth()->id())
                      ->findOrFail($id);

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
        $order = Order::with(['items.product', 'billingAddress', 'shippingAddress'])
                      ->where('order_number', $orderNumber)
                      ->where('user_id', auth()->id())
                      ->firstOrFail();

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
        $cart = Cart::where('user_id', $user->id)
                    ->with(['items.product', 'items.variant', 'coupon'])
                    ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
            ], 400);
        }

        DB::beginTransaction();

        try {
            $order = $this->createOrderAction->execute($user, $cart, $request->all());

            DB::commit();

            $order->load(['items.product', 'billingAddress', 'shippingAddress']);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => new OrderResource($order),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
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
        $order = Order::where('user_id', auth()->id())
                      ->whereIn('status', [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])
                      ->findOrFail($id);

        DB::beginTransaction();

        try {
            // Restore stock
            foreach ($order->items as $item) {
                $this->inventoryService->incrementStock($item->product, $item->quantity);
            }

            $order->updateStatus(Order::STATUS_CANCELLED);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => new OrderResource($order),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
            ], 500);
        }
    }
}
