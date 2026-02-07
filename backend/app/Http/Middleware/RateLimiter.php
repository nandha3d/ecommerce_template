<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter as LaravelRateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Custom Rate Limiter Middleware
 * 
 * Provides different rate limits for different API endpoints:
 * - Auth endpoints: 5 requests per minute (login, register)
 * - Cart: 30 requests per minute (add/update/remove items)
 * - Checkout: 10 requests per minute
 * - Order: 3 requests per minute (order creation)
 * - General API: 60 requests per minute
 */
class RateLimiter
{
    protected array $limits = [];

    public function __construct()
    {
        $this->limits = config('rate_limits', [
            'auth' => ['attempts' => 5, 'decay' => 60],
            'checkout' => ['attempts' => 10, 'decay' => 60],
            'api' => ['attempts' => 60, 'decay' => 60],
            'search' => ['attempts' => 30, 'decay' => 60],
            'cart' => ['attempts' => 30, 'decay' => 60],
            'order' => ['attempts' => 3, 'decay' => 60],
            'coupon' => ['attempts' => 5, 'decay' => 60],
            'payment' => ['attempts' => 10, 'decay_minutes' => 5],
        ]);
    }

    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $key = $this->resolveRateLimitKey($request, $type);
        $limits = $this->limits[$type] ?? $this->limits['api'];

        if (LaravelRateLimiter::tooManyAttempts($key, $limits['attempts'])) {
            $retryAfter = LaravelRateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too many requests',
                'message' => 'Please slow down. Try again later.',
                'retry_after' => $retryAfter,
            ], 429, [
                'X-RateLimit-Limit' => $limits['attempts'],
                'X-RateLimit-Remaining' => 0,
                'X-RateLimit-Reset' => now()->addSeconds($retryAfter)->timestamp,
                'Retry-After' => $retryAfter,
            ]);
        }

        LaravelRateLimiter::hit($key, $limits['decay']);

        $response = $next($request);

        // Add rate limit headers to successful responses
        return $this->addRateLimitHeaders($response, $key, $limits);
    }

    /**
     * Generate unique rate limit key per user/IP and endpoint type
     */
    protected function resolveRateLimitKey(Request $request, string $type): string
    {
        $identifier = $request->user()?->id ?? $request->ip();
        return sprintf('rate_limit:%s:%s', $type, $identifier);
    }

    /**
     * Add rate limit headers to response
     */
    protected function addRateLimitHeaders(Response $response, string $key, array $limits): Response
    {
        $remaining = LaravelRateLimiter::remaining($key, $limits['attempts']);
        
        $response->headers->set('X-RateLimit-Limit', $limits['attempts']);
        $response->headers->set('X-RateLimit-Remaining', max(0, $remaining));
        
        return $response;
    }
}
