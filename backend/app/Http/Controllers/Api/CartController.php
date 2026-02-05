<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Http\Resources\CartResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Core\Cart\Services\CartService;

class CartController extends Controller
{
    private CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Get current cart.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Add item to cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'sometimes|integer|min:1',
            'variant_id' => 'sometimes|exists:product_variants,id',
        ]);

        $cart = $this->getOrCreateCart($request);
        $this->cartService->addItem(
            $cart,
            $request->input('product_id'),
            $request->input('quantity', 1),
            $request->input('variant_id')
        );

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->findOrFail($itemId);
        
        $this->cartService->updateItem($item, $request->input('quantity'));

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->where('id', $itemId)->firstOrFail();
        
        $this->cartService->removeItem($item);

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Clear cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $this->cartService->clear($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }

    /**
     * Apply coupon.
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $coupon = Coupon::where('code', $request->input('code'))
                        ->where('is_active', true)
                        ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code',
            ], 400);
        }

        // Check if expired
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon has expired',
            ], 400);
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon usage limit reached',
            ], 400);
        }

        $cart = $this->getOrCreateCart($request);

        // Check minimum order amount
        if ($coupon->min_order_amount && $cart->subtotal < $coupon->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => "Minimum order amount of \${$coupon->min_order_amount} required",
            ], 400);
        }

        $cart->coupon_id = $coupon->id;
        $cart->save();

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Remove coupon.
     */
    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $cart->coupon_id = null;
        $cart->save();

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Coupon removed',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Merge guest cart with user cart.
     */
    public function merge(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
            ], 401);
        }

        $request->validate([
            'guest_cart_id' => 'required|string',
        ]);

        $guestCart = Cart::where('session_id', $request->input('guest_cart_id'))->first();
        
        if (!$guestCart) {
            return response()->json([
                'success' => false,
                'message' => 'Guest cart not found',
            ], 404);
        }

        $userCart = Cart::firstOrCreate(['user_id' => auth()->id()]);
        $this->cartService->merge($userCart, $guestCart);

        $userCart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Carts merged successfully',
            'data' => new CartResource($userCart),
        ]);
    }

    /**
     * Get or create cart for current user/session.
     */
    private function getOrCreateCart(Request $request): Cart
    {
        if (auth()->check()) {
            return Cart::firstOrCreate(['user_id' => auth()->id()]);
        }

        $sessionId = $request->header('X-Cart-Session') ?? $request->input('session_id');
        
        if (!$sessionId) {
            $sessionId = uniqid('cart_', true);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }
}
