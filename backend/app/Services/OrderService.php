<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Cart;
use App\Enums\OrderState;
use App\Repositories\OrderRepositoryInterface;
use Core\Order\Actions\CreateOrderAction;
use Core\Inventory\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\PaymentService;
use App\Services\InvoiceService;
use App\Services\SecurityAuditService;

class OrderService
{
    private CreateOrderAction $createOrderAction;
    private InventoryService $inventoryService;
    private OrderRepositoryInterface $orderRepository;
    private PaymentService $paymentService;
    private InvoiceService $invoiceService;
    private \App\Services\Checkout\CheckoutSessionManager $checkoutSessionManager;
    private SecurityAuditService $auditService;
    private OrderStateMachine $stateMachine;
    private \Core\Cart\Services\CartService $cartService;

    public function __construct(
        CreateOrderAction $createOrderAction,
        InventoryService $inventoryService,
        OrderRepositoryInterface $orderRepository,
        PaymentService $paymentService,
        InvoiceService $invoiceService,
        \App\Services\Checkout\CheckoutSessionManager $checkoutSessionManager,
        SecurityAuditService $auditService,
        OrderStateMachine $stateMachine,
        \Core\Cart\Services\CartService $cartService
    ) {
        $this->createOrderAction = $createOrderAction;
        $this->inventoryService = $inventoryService;
        $this->orderRepository = $orderRepository;
        $this->paymentService = $paymentService;
        $this->invoiceService = $invoiceService;
        $this->checkoutSessionManager = $checkoutSessionManager;
        $this->auditService = $auditService;
        $this->stateMachine = $stateMachine;
        $this->cartService = $cartService;
    }

    public function getUserOrders(User $user, int $perPage = 10)
    {
        return $this->orderRepository->findByUser($user, $perPage);
    }

    public function getOrderById(int $id, User $user): ?Order
    {
        $order = $this->orderRepository->findById($id);

        if (!$order || $order->user_id !== $user->id) {
            return null;
        }

        return $order->load(['items.product', 'billingAddress', 'shippingAddress', 'coupon']);
    }

    public function getOrderByIdempotencyKey(string $key, User $user): ?Order
    {
        $order = $this->orderRepository->findByIdempotencyKey($key);

        if (!$order || $order->user_id !== $user->id) {
            return null;
        }

        return $order->load(['items.product', 'billingAddress', 'shippingAddress']);
    }

    public function getOrderByNumber(string $orderNumber, User $user): ?Order
    {
        $order = $this->orderRepository->findByOrderNumber($orderNumber);

        if (!$order || $order->user_id !== $user->id) {
            return null;
        }

        return $order->load(['items.product', 'billingAddress', 'shippingAddress', 'coupon']);
    }

    public function createOrder(User $user, Cart $cart, array $data): Order
    {
        // STRICT RULE 9.1: Idempotency Check
        if (!empty($data['idempotency_key'])) {
            $existingOrder = $this->orderRepository->findByIdempotencyKey($data['idempotency_key']);
            if ($existingOrder) {
                if ($existingOrder->user_id !== $user->id) {
                    throw new \RuntimeException("Security Violation: Idempotency key conflict.");
                }
                return $existingOrder->load(['items.product', 'billingAddress', 'shippingAddress']);
            }
        }

        // 0. LOCK CART & SNAPSHOT (Rule 6)
        // Must be done before transaction to ensure session is accessible? 
        // Session creation writes to DB.
        $session = $this->checkoutSessionManager->start($cart, $user->id);

        try {
            // 1. ATOMIC: CREATE & RESERVE
            $order = DB::transaction(function () use ($user, $cart, $data, $session) {
                // Create Order (Snapshot Mode)
                $order = $this->createOrderAction->execute($user, $cart, $data, $session);

                // Reserve Inventory (Rule 7.1)
                $this->inventoryService->reserve($order);

                return $order;
            });

            // 2. PROCESS PAYMENT (Outside Create Transaction)
            if (!empty($data['payment_source'])) {
                try {
                    $paymentResult = $this->paymentService->processPayment($order, $data['payment_source']);

                    if ($paymentResult['success']) {
                        // 3. SUCCESS: COMMIT & FINALIZE
                        DB::transaction(function () use ($order, $cart, $paymentResult) {
                            $this->stateMachine->transition($order, OrderState::PAID, [
                                'reason' => 'Payment Success',
                                'transaction_id' => $paymentResult['transaction_id'] ?? null
                            ]);

                            $this->inventoryService->commit($order);
                            $this->invoiceService->generateInvoice($order);

                            // Successful Order -> Finalize Cart
                            $this->cartService->finalizeCheckout($cart);
                            $this->checkoutSessionManager->complete($order->checkoutSession ?? null); // If link exists
                        });
                    } else {
                        // Soft Failure handled in catch
                        throw new \Exception("Payment Failed: " . $paymentResult['message']);
                    }
                } catch (\Exception $e) {
                    // 4. FAILURE: ROLLBACK LOGIC (Rule 10.1 & 7.2)
                    // Order exists (Committed in Step 1). Move to FAILED.
                    DB::transaction(function () use ($order, $cart) {
                        $this->stateMachine->transition($order, OrderState::FAILED, [
                            'reason' => 'Payment Processing Error'
                        ]);
                        $this->inventoryService->release($order);

                        // Unlock Cart for Retry?
                        // If we fail, we want user to retry using SAME cart.
                        $cart->status = 'active';
                        $cart->save();
                    });

                    // Re-throw to inform controller
                    throw $e;
                }
            } else {
                // COD / No Payment
                DB::transaction(function () use ($cart) {
                    $this->cartService->finalizeCheckout($cart);
                });
            }

            // AUDIT: Log order creation (Success)
            $this->auditService->logOrderCreate($order);

            return $order->load(['items.product', 'billingAddress', 'shippingAddress']);

        } catch (\Exception $e) {
            Log::error('Order processing failed: ' . $e->getMessage());
            // If exception happened during Step 1 (Create/Reserve), Order doesn't exist (Rolled back by inner DB::transaction implicit? No, explicit usage).
            // DB::transaction re-throws.
            // If exception allowed to bubble, generic catch blocks handles it.
            // But we have custom Try/Catch around Step 2.
            throw $e;
        }
    }

    public function cancelOrder(Order $order): Order
    {
        // State validation handled by StateMachine

        DB::beginTransaction();
        try {
            // Release Stock (Rule 7.2)
            // If order was PAID/COMMITTED, release() might need to increment?
            // InventoryService::release just sets status=RELEASED.
            // But if it was COMMITTED, stock was already deducted.
            // If we are cancelling a PAID order, we MUST increment physical stock.
            // Step 10.1: Payment Failure -> Inventory Released.
            // Cancellation logic:
            if ($order->status === OrderState::PAID) {
                // Strict Rule: Paid -> Cancelled is BLOCKED.
                // So this branch theoretically unreachable if StateMachine enforces blocking.
                // But CancelOrder is calling transition().
                // If StateMachine blocks it, we throw there.
                // If Order is PENDING/PAYMENT_PENDING, stock is RESERVED (not deducted).
                // So release() is sufficient (makes reservation inactive, stock calc ignores it).
                $this->inventoryService->release($order);
            } else {
                $this->inventoryService->release($order);
            }

            // Use StateMachine strictly
            $this->stateMachine->transition($order, OrderState::CANCELLED, ['reason' => 'User Request']);

            DB::commit();

            // AUDIT: Log order cancellation
            $this->auditService->logOrderCancel($order);

            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order cancellation failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
