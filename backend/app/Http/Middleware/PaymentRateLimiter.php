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
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maxAttempts = config('rate_limits.payment.attempts', 10);
        $decayMinutes = config('rate_limits.payment.decay_minutes', 5);

        $ip = $request->ip();
        $key = 'payment_rate_limit:' . $ip;
        
        $attempts = Cache::get($key, 0);
        
        if ($attempts >= $maxAttempts) {
            return response()->json([
                'success' => false,
                'message' => 'Too many payment attempts. Please try again later.',
                'error_code' => 'RATE_LIMIT_EXCEEDED',
                'retry_after' => Cache::get($key . ':expires_at', now())->diffInSeconds(now()),
            ], 429);
        }
        
        // Increment attempt count
        if ($attempts === 0) {
            Cache::put($key, 1, now()->addMinutes($decayMinutes));
            Cache::put($key . ':expires_at', now()->addMinutes($decayMinutes), now()->addMinutes($decayMinutes));
        } else {
            Cache::increment($key);
        }
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
        
        return $response;
    }
}
