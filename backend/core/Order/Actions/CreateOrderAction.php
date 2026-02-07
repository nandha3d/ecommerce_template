<?php

namespace Core\Order\Actions;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Cart;
use Core\Base\Events\EventBus;
use Core\Order\Events\OrderCreated;
use Core\Cart\Services\CartService;

use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    private EventBus $eventBus;
    private CartService $cartService;
    public function __construct(
        EventBus $eventBus, 
        CartService $cartService
    )
    {
        $this->eventBus = $eventBus;
        $this->cartService = $cartService;
    }

    public function execute(User $user, Cart $cart, array $data, ?\App\Models\CheckoutSession $session = null): Order
    {
        // STRICT RULE: Snapshot Required
        if (!$session) {
            throw new \LogicException("Order creation requires a valid CheckoutSession snapshot.");
        }

        $billingAddressId = $data['billing_address_id'] ?? null;
        $shippingAddressId = $data['shipping_address_id'] ?? null;

        // Handle Addresses (Address creation is allowed, assumed validated by request)
        if (isset($data['billing_address'])) {
            $billingAddress = Address::create([
                'user_id' => $user->id,
                'type' => 'billing',
                ...$data['billing_address'],
            ]);
            $billingAddressId = $billingAddress->id;
        }

        if ($data['same_as_billing'] ?? false) {
            $shippingAddressId = $billingAddressId;
        } elseif (isset($data['shipping_address'])) {
            $shippingAddress = Address::create([
                'user_id' => $user->id,
                'type' => 'shipping',
                ...$data['shipping_address'],
            ]);
            $shippingAddressId = $shippingAddress->id;
        }

        // Create Order using SNAPSHOT strictly
        // Do NOT read from Cart for financials
        
        $order = Order::create([
            'user_id' => $user->id,
            'status' => \App\Enums\OrderState::PENDING,
            'payment_status' => \App\Enums\OrderState::PAYMENT_PENDING, // Always starts pending (Strict Rule 2)
            'payment_method' => $data['payment_method'] ?? 'card', // Should validate vs snapshot payment_method_id?
            'billing_address_id' => $billingAddressId,
            'shipping_address_id' => $shippingAddressId,
            'subtotal' => $session->subtotal,
            'discount' => $session->discount,
            'shipping' => $session->shipping_cost,
            'tax' => $session->tax_amount,
            'total' => $session->total, 
            'currency' => $session->currency ?? 'JPY', // Hardcode default if missing, or USD
            'coupon_id' => $session->data['coupon_id'] ?? null,
            'notes' => $data['notes'] ?? null,
            'idempotency_key' => $data['idempotency_key'] ?? null,
            // 'checkout_session_id' => $session->id, // Ideally link back
        ]);

        // Order Items Snapshot from Session Data
        $itemsData = $session->data['items'] ?? [];
        if (empty($itemsData)) {
            // Fallback? NO. Strict Mode.
            throw new \LogicException("CheckoutSession snapshot is missing items data.");
        }

        foreach ($itemsData as $itemSnapshot) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $itemSnapshot['product_id'],
                'variant_id' => $itemSnapshot['variant_id'],
                'product_name' => $itemSnapshot['product_name'],
                'variant_name' => $itemSnapshot['variant_name'],
                'sku' => $itemSnapshot['sku'], // Snapshot SKU
                'quantity' => $itemSnapshot['quantity'],
                'unit_price' => $itemSnapshot['unit_price'], // Stored Price
                'total_price' => $itemSnapshot['total'],     // Stored Total
                'image' => $itemSnapshot['image'] ?? null,
            ]);
        }

        // Dispatch Order Created Event
        $this->eventBus->dispatch(new OrderCreated($order));

        // Coupon Usage increment (still touch usage stats, is OK)
        if ($session->data['coupon_id']) {
            \App\Models\Coupon::where('id', $session->data['coupon_id'])->increment('used_count');
        }

        return $order;
    }
}
