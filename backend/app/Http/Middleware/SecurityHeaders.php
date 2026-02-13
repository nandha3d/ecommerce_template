<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 * Adds CSP, XSS protection, and other security headers
 * 
 * Note: CSP is more permissive in development to allow Vite HMR
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Skip CSP in development for Vite HMR compatibility
        // Only apply full CSP in production
        if (config('app.env') === 'production') {
            // Configurable external sources for CSP
            $scriptSources = array_filter([
                "'self'", "'unsafe-inline'", "'unsafe-eval'",
                'https://cdn.jsdelivr.net',
                'https://js.stripe.com',
                'https://checkout.razorpay.com',
                env('CSP_EXTRA_SCRIPT_SRC'),
            ]);

            $connectSources = array_filter([
                "'self'",
                'https://api.stripe.com',
                'https://api.razorpay.com',
                'wss:',
                env('CSP_EXTRA_CONNECT_SRC'),
            ]);

            $frameSources = array_filter([
                "'self'",
                'https://js.stripe.com',
                'https://api.razorpay.com',
                env('CSP_EXTRA_FRAME_SRC'),
            ]);

            $csp = implode('; ', [
                "default-src 'self'",
                "script-src " . implode(' ', $scriptSources),
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
                "img-src 'self' data: blob: https: http:",
                "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
                "connect-src " . implode(' ', $connectSources),
                "frame-src " . implode(' ', $frameSources),
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
            ]);
            $response->headers->set('Content-Security-Policy', $csp);
            
            // HSTS only in production
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Apply these headers in all environments
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}
