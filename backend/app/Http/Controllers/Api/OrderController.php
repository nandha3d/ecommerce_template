<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\OrderService;
use App\Services\CheckoutService;
use Illuminate\Support\Facades\Log;
use App\Enums\ApiErrorCode;


class OrderController extends Controller
{
    private OrderService $orderService;
    private CheckoutService $checkoutService;

    public function __construct(
        OrderService $orderService,
        CheckoutService $checkoutService
    ) {
        $this->orderService = $orderService;
        $this->checkoutService = $checkoutService;
    }

    /**
     * List user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);
        
        $orders = $this->orderService->getUserOrders(auth()->user());

        return $this->success(OrderResource::collection($orders), 'Orders retrieved', 200, [
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
        $order = $this->orderService->getOrderById($id);

        if (!$order) {
            return $this->error('Order not found', ApiErrorCode::ORDER_NOT_FOUND->value, 404);
        }

        $this->authorize('view', $order);

        return $this->success(new OrderResource($order));
    }

    /**
     * Get order by order number.
     */
    public function showByNumber(string $orderNumber): JsonResponse
    {
        $order = $this->orderService->getOrderByNumber($orderNumber);

        if (!$order) {
            return $this->error('Order not found', ApiErrorCode::ORDER_NOT_FOUND->value, 404);
        }

        $this->authorize('view', $order);

        return $this->success(new OrderResource($order));
    }

    /**
     * Create new order.
     */
    public function store(\App\Http\Requests\OrderCreateRequest $request): JsonResponse
    {
        $this->authorize('create', Order::class);

        $validated = $request->validated();

        $user = auth()->user();
        $idempotencyKey = $request->header('Idempotency-Key');

        if ($idempotencyKey) {
            $existingOrder = $this->orderService->getOrderByIdempotencyKey($idempotencyKey, $user);
            if ($existingOrder) {
                return $this->success(new OrderResource($existingOrder), 'Order already processed (Idempotent)');
            }
        }

        $sessionId = $request->header('X-Cart-Session');
        $cart = app(\Core\Cart\Services\CartService::class)->getCart($user->id, $sessionId);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Cart is empty', ApiErrorCode::CART_EMPTY->value, 400);
        }

        try {
            $orderData = $validated;
            if ($idempotencyKey) {
                $orderData['idempotency_key'] = $idempotencyKey;
            }

            $result = $this->checkoutService->placeOrder($user, $cart, $orderData);
            $order = $result['order'];

            return $this->success([
                'order' => new OrderResource($order->load(['items.product', 'billingAddress', 'shippingAddress'])),
                'client_secret' => $result['client_secret'] ?? null,
            ], isset($result['is_idempotent']) ? 'Order already processed (Idempotent)' : 'Order placed successfully', 201);

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return $this->error('Failed to create order: ' . $e->getMessage(), ApiErrorCode::ORDER_ALREADY_EXISTS->value, 500);
        }
    }

    /**
     * Validate order before creation.
     */
    public function validateOrder(Request $request): JsonResponse
    {
        $this->authorize('create', Order::class);

        try {
            $result = $this->checkoutService->validateOrder(auth()->user(), $request->header('X-Cart-Session'));
            return $this->success($result, 'Order validated');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), ApiErrorCode::VALIDATION_ERROR->value, 422);
        } catch (\Exception $e) {
            Log::error('Order validation error', ['error' => $e->getMessage()]);
            return $this->error('Internal server error', ApiErrorCode::SERVER_ERROR->value, 500);
        }
    }

    /**
     * Cancel order.
     */
    public function cancel(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);

        if (!$order) {
            return $this->error('Order not found', ApiErrorCode::ORDER_NOT_FOUND->value, 404);
        }

        $this->authorize('cancel', $order);

        try {
            $order = $this->orderService->cancelOrder($order);
            return $this->success(new OrderResource($order), 'Order cancelled successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::INTERNAL_ERROR->value, 400);
        }
    }
}

