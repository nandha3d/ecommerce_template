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
        ])->header('X-Cart-Session', $cart->session_id);
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
        ])->header('X-Cart-Session', $cart->session_id);
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
        ])->header('X-Cart-Session', $cart->session_id);
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
        ])->header('X-Cart-Session', $cart->session_id);
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

        $genericError = [
            'success' => false,
            'message' => 'This coupon code cannot be applied to your order.',
        ];

        // Audit Requirement: Prevent Enumeration
        // We check all conditions but return the SAME error message.
        // We also log the specific failure for admin debugging.

        if (!$coupon) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Not found", ['code' => $request->input('code')]);
            return response()->json($genericError, 400);
        }

        // Check if expired
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Expired", ['code' => $request->input('code')]);
            return response()->json($genericError, 400);
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Usage Limit", ['code' => $request->input('code')]);
            return response()->json($genericError, 400);
        }

        $cart = $this->getOrCreateCart($request);

        // Check minimum order amount
        if ($coupon->min_order_amount && $cart->subtotal < $coupon->min_order_amount) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Min Order Amount", ['code' => $request->input('code')]);
            return response()->json($genericError, 400);
        }

        $cart->coupon_id = $coupon->id;
        $cart->save();

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully',
            'data' => new CartResource($cart),
        ])->header('X-Cart-Session', $cart->session_id);
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
        ])->header('X-Cart-Session', $cart->session_id);
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
            'guest_cart_id' => [
                'required',
                'string',
                'regex:/^(cart_|guest_)[a-zA-Z0-9]{20,64}$/',
                'max:100'
            ],
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
        ])->header('X-Cart-Session', $userCart->session_id);
    }

    /**
     * Get or create cart for current user/session.
     * 
     * SECURITY: Validates cart ownership to prevent IDOR attacks.
     */
    private function getOrCreateCart(Request $request): Cart
    {
        $userId = auth('api')->id();
        $sessionId = $request->header('X-Cart-Session') ?? $request->input('session_id');

        // ALWAYS ensure we have a session ID for guest users
        if (!$userId && !$sessionId) {
            // Generate new session ID and return in response header
            $sessionId = 'guest_' . bin2hex(random_bytes(16)); // Cryptographically secure
            
            \Illuminate\Support\Facades\Log::warning('Cart request without X-Cart-Session header', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        // Validate session ID format
        if ($sessionId && !preg_match('/^(cart_|guest_)[a-f0-9]{32,64}$/', $sessionId)) {
            \Illuminate\Support\Facades\Log::warning('Invalid cart session ID format', [
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
        if ($userId && $cart->user_id && $cart->user_id !== $userId) {
            \Illuminate\Support\Facades\Log::warning('Cart ownership mismatch', [
                'cart_id' => $cart->id,
                'cart_user_id' => $cart->user_id,
                'request_user_id' => $userId,
                'ip' => $request->ip(),
            ]);
            abort(403, 'Access denied');
        }

        // If guest request, verify session matches
        if (!$userId && $cart->session_id && $cart->session_id !== $sessionId) {
            // If cart exists but session differs, it might be an orphaned cart or collision.
            // But since getCart uses sessionId to find it, this branch essentially catches
            // if getCart found something by ID but the returned object has different ID (impossible)
            // or if we passed ID A, and it returned Cart B (userId based?).
            
            // If we are guest, we only look by session ID.
            
             \Illuminate\Support\Facades\Log::warning('Cart session mismatch', [
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
