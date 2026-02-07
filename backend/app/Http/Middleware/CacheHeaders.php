<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cache Headers Middleware
 * 
 * Adds appropriate caching headers for different content types:
 * - Static assets: Long cache (1 year)
 * - API responses: No cache or short cache
 * - Images: Medium cache with revalidation
 */
class CacheHeaders
{
    /**
     * Cache durations in seconds
     */
    protected array $durations = [
        'immutable' => 31536000,  // 1 year (for versioned assets)
        'static' => 86400,       // 1 day
        'images' => 604800,      // 1 week
        'api' => 0,              // No cache
    ];

    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $response = $next($request);

        // Don't cache error responses
        if ($response->getStatusCode() >= 400) {
            return $response;
        }

        switch ($type) {
            case 'immutable':
                // For versioned/hashed assets (JS, CSS with hash in filename)
                $response->headers->set('Cache-Control', 'public, max-age=' . $this->durations['immutable'] . ', immutable');
                break;

            case 'static':
                // For static files that may change
                $response->headers->set('Cache-Control', 'public, max-age=' . $this->durations['static'] . ', must-revalidate');
                break;

            case 'images':
                // For uploaded images with revalidation
                $response->headers->set('Cache-Control', 'public, max-age=' . $this->durations['images'] . ', stale-while-revalidate=86400');
                break;

            case 'api':
            default:
                // No caching for API responses
                $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
                $response->headers->set('Pragma', 'no-cache');
                break;
        }

        // Add Vary header for proper caching
        $response->headers->set('Vary', 'Accept-Encoding, Authorization');

        return $response;
    }
}
