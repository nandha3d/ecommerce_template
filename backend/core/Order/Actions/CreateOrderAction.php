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
use Core\Cart\Services\CartPricingService;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    private EventBus $eventBus;
    private CartService $cartService;
    private CartPricingService $pricingService;

    public function __construct(
        EventBus $eventBus, 
        CartService $cartService,
        CartPricingService $pricingService
    )
    {
        $this->eventBus = $eventBus;
        $this->cartService = $cartService;
        $this->pricingService = $pricingService;
    }

    public function execute(User $user, Cart $cart, array $data): Order
    {
        $billingAddressId = $data['billing_address_id'] ?? null;
        $shippingAddressId = $data['shipping_address_id'] ?? null;

        // Handle Addresses
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

        // Calculate Totals using PricingService
        $subtotal = $this->pricingService->getSubtotal($cart);
        $discount = $this->pricingService->getDiscount($cart);
        $shipping = $this->pricingService->getShipping($cart);
        $tax = $this->pricingService->getTax($cart);
        $total = $this->pricingService->getTotal($cart);

        // Create Order
        $order = Order::create([
            'user_id' => $user->id,
            'status' => Order::STATUS_PENDING,
            'payment_status' => ($data['payment_method'] ?? 'card') === 'cod' 
                ? Order::PAYMENT_PENDING 
                : Order::PAYMENT_PAID,
            'payment_method' => $data['payment_method'] ?? 'card',
            'billing_address_id' => $billingAddressId,
            'shipping_address_id' => $shippingAddressId,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
            'coupon_id' => $cart->coupon_id,
            'notes' => $data['notes'] ?? null,
        ]);

        // Order Items
        foreach ($cart->items as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'variant_id' => $cartItem->variant_id,
                'product_name' => $cartItem->product->name,
                'variant_name' => $cartItem->variant?->name,
                'sku' => $cartItem->variant?->sku ?? $cartItem->product->sku,
                'quantity' => $cartItem->quantity,
                'unit_price' => $cartItem->unit_price,
                'total_price' => $cartItem->total_price,
                'image' => $cartItem->product->images->first()?->url,
            ]);
        }

        // Dispatch Order Created Event (Trigger Inventory Deduction)
        $this->eventBus->dispatch(new OrderCreated($order));

        // Coupon Usage
        if ($cart->coupon) {
            $cart->coupon->increment('used_count');
        }

        // Clear Cart
        $this->cartService->clear($cart);

        return $order;
    }
}
