<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Core\Cart\Services\CartService;
use Illuminate\Support\Facades\Log;
use App\Enums\ApiErrorCode;

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

        return $this->success(new CartResource($cart), 'Cart retrieved', 200, ['X-Cart-Session' => $cart->session_id]);
    }

    /**
     * Add item to cart.
     */
    public function addItem(\App\Http\Requests\CartItemRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $cart = $this->getOrCreateCart($request);
        
        try {
            $this->cartService->addItem(
                $cart,
                $validated['product_id'],
                $validated['quantity'] ?? 1,
                $validated['variant_id']
            );

            $cart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($cart), 'Item added to cart', 200, ['X-Cart-Session' => $cart->session_id]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::CART_EMPTY->value, 400);
        }
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
        
        try {
            $this->cartService->updateItem($item, $request->input('quantity'));

            $cart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($cart), 'Cart updated', 200, ['X-Cart-Session' => $cart->session_id]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::VALIDATION_ERROR->value, 400);
        }
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->where('id', $itemId)->firstOrFail();
        
        try {
            $this->cartService->removeItem($item);

            $cart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($cart), 'Item removed from cart', 200, ['X-Cart-Session' => $cart->session_id]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::INTERNAL_ERROR->value, 400);
        }
    }

    /**
     * Clear cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $this->cartService->clear($cart);

        return $this->success(null, 'Cart cleared');
    }

    /**
     * Apply coupon.
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $cart = $this->getOrCreateCart($request);

        try {
            $this->cartService->applyCoupon($cart, $request->input('code'));
            $cart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($cart), 'Coupon applied successfully', 200, ['X-Cart-Session' => $cart->session_id]);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), ApiErrorCode::INVALID_COUPON->value, 400);
        } catch (\Exception $e) {
            Log::error('Coupon application failed', ['error' => $e->getMessage(), 'cart_id' => $cart->id]);
            return $this->error('Failed to apply coupon', ApiErrorCode::SERVER_ERROR->value, 500);
        }
    }

    /**
     * Remove coupon.
     */
    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        
        try {
            $this->cartService->removeCoupon($cart);
            $cart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($cart), 'Coupon removed', 200, ['X-Cart-Session' => $cart->session_id]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::INTERNAL_ERROR->value, 400);
        }
    }

    /**
     * Merge guest cart with user cart.
     */
    public function merge(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return $this->error('Authentication required', ApiErrorCode::UNAUTHORIZED->value, 401);
        }

        $request->validate([
            'guest_cart_id' => [
                'required',
                'string',
                'regex:/^(cart_|guest_)[a-zA-Z0-9]{20,64}$/',
                'max:100'
            ],
        ]);

        $guestCart = $this->cartService->findBySessionId($request->input('guest_cart_id'));
        
        if (!$guestCart) {
            return $this->error('Guest cart not found', ApiErrorCode::CART_NOT_FOUND->value, 404);
        }

        $userCart = $this->cartService->getOrCreateByUser(auth()->id());
        
        try {
            $this->cartService->merge($userCart, $guestCart);

            $userCart->load(['items.product.images', 'items.variant', 'coupon']);

            return $this->success(new CartResource($userCart), 'Carts merged successfully', 200, ['X-Cart-Session' => $userCart->session_id]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), ApiErrorCode::INTERNAL_ERROR->value, 400);
        }
    }

    /**
     * Get or create cart for current user/session.
     * 
     * SECURITY: Validates cart ownership to prevent IDOR attacks.
     */
    private function getOrCreateCart(Request $request): \App\Models\Cart
    {
        $userId = auth('api')->id();
        $sessionId = $request->header('X-Cart-Session') ?? $request->input('session_id');

        // ALWAYS ensure we have a session ID for guest users
        if (!$userId && !$sessionId) {
            // Generate new session ID and return in response header
            $sessionId = 'guest_' . bin2hex(random_bytes(16)); // Cryptographically secure
            
            Log::warning('Cart request without X-Cart-Session header', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        // Validate session ID format
        if ($sessionId && !preg_match('/^(cart_|guest_)[a-zA-Z0-9]{20,64}$/', $sessionId)) {
            Log::warning('Invalid cart session ID format', [
                'session_id' => $sessionId,
                'ip' => $request->ip(),
            ]);
            // Regenerate valid session ID if invalid
            $sessionId = 'guest_' . bin2hex(random_bytes(16));
        }

        $cart = $this->cartService->getCart($userId, $sessionId);

        // Update session ID if it was generated/regenerated and cart is new or matches
        // Ideally CartService creates it with this ID.

        // SECURITY: Ownership validation
        $this->authorize('view', $cart);

        // If guest request, verify session matches
        if (!$userId && $cart->session_id && $cart->session_id !== $sessionId) {
            // If cart exists but session differs, it might be an orphaned cart or collision.
            // But since getCart uses sessionId to find it, this branch essentially catches
            // if getCart found something by ID but the returned object has different ID (impossible)
            // or if we passed ID A, and it returned Cart B (userId based?).
            
            // If we are guest, we only look by session ID.
            
             Log::warning('Cart session mismatch', [
                'cart_id' => $cart->id,
                'cart_session' => $cart->session_id,
                'request_session' => $sessionId,
                'ip' => $request->ip(),
            ]);
             // Don't abort yet, maybe just accept the new cart.
             // But let's follow the strict plan.
             abort(403, 'Access denied');
        }
        
        // Ensure the cart object carries the session ID we intend to use, 
        // effectively "attaching" the session ID to the instance for later response header injection
        // (Though strictly, we need to manually pass it to response functions unless we store it on request or similar)
        // For now, we rely on $cart->session_id being populated from DB.
        
        return $cart;
    }
}
