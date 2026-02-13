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
        // Different limits for different operations
        $isInitialization = !$request->has('source'); // No source = initialization or intent creation
        
        if ($isInitialization) {
            $maxAttempts = 20; // More lenient for initialization
            $decayMinutes = 2;
            $keyPrefix = 'payment_init:';
        } else {
            $maxAttempts = 5; // Strict for actual payment charges
            $decayMinutes = 10;
            $keyPrefix = 'payment_charge:';
        }

        $ip = $request->ip();
        $key = $keyPrefix . $ip;
        
        $attempts = Cache::get($key, 0);
        
        if ($attempts >= $maxAttempts) {
            $expiresAt = Cache::get($key . ':expires_at', now());
            $retryAfter = $expiresAt instanceof \DateTimeInterface ? $expiresAt->diffInSeconds(now()) : 0;
            
            return response()->json([
                'success' => false,
                'message' => 'Too many payment attempts. Please try again later.',
                'error_code' => 'RATE_LIMIT_EXCEEDED',
                'retry_after' => max(0, $retryAfter),
            ], 429);
        }
        
        $response = $next($request);
        
        // Logic for incrementing attempts:
        // 1. Always increment on the first successful initial request to set the window
        // 2. Increment on failed responses (SCA, server errors, etc.)
        // 3. Do not increment on repeated successful initializations if within window (for refreshes)
        if ($response->status() >= 400 || $attempts === 0) {
            if ($attempts === 0) {
                Cache::put($key, 1, now()->addMinutes($decayMinutes));
                Cache::put($key . ':expires_at', now()->addMinutes($decayMinutes), now()->addMinutes($decayMinutes));
            } else {
                Cache::increment($key);
            }
        }
        
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
        
        return $response;
    }
}
