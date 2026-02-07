<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Cart;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure Cart Ownership Middleware
 * 
 * SECURITY: Validates that cart operations are performed by the cart owner.
 * This middleware provides defense-in-depth for cart routes.
 */
class EnsureCartOwnership
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = auth('api')->id();
        $sessionId = $request->header('X-Cart-Session') ?? $request->input('session_id');

        // If no identifier at all, let the controller handle cart creation
        if (!$userId && !$sessionId) {
            return $next($request);
        }

        // Check if there's an existing cart for this user/session
        $cart = null;
        
        if ($userId) {
            $cart = Cart::where('user_id', $userId)
                ->where('status', 'active')
                ->first();
        } elseif ($sessionId) {
            $cart = Cart::where('session_id', $sessionId)
                ->where('status', 'active')
                ->first();
        }

        // No cart exists yet - allow through (controller will create)
        if (!$cart) {
            return $next($request);
        }

        // Validate ownership
        if ($userId && $cart->user_id && $cart->user_id !== $userId) {
            \Log::warning('Middleware: Cart ownership violation', [
                'cart_id' => $cart->id,
                'cart_user_id' => $cart->user_id,
                'request_user_id' => $userId,
                'route' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        if (!$userId && $sessionId && $cart->session_id !== $sessionId) {
            \Log::warning('Middleware: Cart session violation', [
                'cart_id' => $cart->id,
                'cart_session' => substr($cart->session_id, 0, 10) . '...',
                'request_session' => substr($sessionId, 0, 10) . '...',
                'route' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        // Attach cart to request for downstream use
        $request->attributes->set('cart', $cart);

        return $next($request);
    }
}
