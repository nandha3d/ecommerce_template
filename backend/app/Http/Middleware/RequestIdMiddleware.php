<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Request ID Middleware
 * 
 * Generates a unique request ID for every request. This ID is:
 * - Attached to the request for use in controllers/services
 * - Included in all log entries
 * - Returned in API responses for tracing
 */
class RequestIdMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate unique request ID (UUID v4)
        $requestId = (string) Str::uuid();
        
        // Attach to request for access in controllers
        $request->attributes->set('request_id', $requestId);
        
        // Add to log context for all subsequent logs
        Log::shareContext([
            'request_id' => $requestId,
        ]);

        // Process request
        $response = $next($request);

        // Add request ID to response headers for client-side tracing
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
