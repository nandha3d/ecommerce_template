<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class PaymentRateLimiter
{
    /**
     * Rate limit: 10 payment attempts per 5 minutes per IP
     */
    private const MAX_ATTEMPTS = 10;
    private const DECAY_MINUTES = 5;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $key = 'payment_rate_limit:' . $ip;
        
        $attempts = Cache::get($key, 0);
        
        if ($attempts >= self::MAX_ATTEMPTS) {
            return response()->json([
                'success' => false,
                'message' => 'Too many payment attempts. Please try again later.',
                'error_code' => 'RATE_LIMIT_EXCEEDED',
                'retry_after' => Cache::get($key . ':expires_at', now())->diffInSeconds(now()),
            ], 429);
        }
        
        // Increment attempt count
        if ($attempts === 0) {
            Cache::put($key, 1, now()->addMinutes(self::DECAY_MINUTES));
            Cache::put($key . ':expires_at', now()->addMinutes(self::DECAY_MINUTES), now()->addMinutes(self::DECAY_MINUTES));
        } else {
            Cache::increment($key);
        }
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', self::MAX_ATTEMPTS);
        $response->headers->set('X-RateLimit-Remaining', max(0, self::MAX_ATTEMPTS - $attempts - 1));
        
        return $response;
    }
}
