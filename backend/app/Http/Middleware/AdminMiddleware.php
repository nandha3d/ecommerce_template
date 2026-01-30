<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = auth()->user();
        
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Access denied. Admin only.'], 403);
        }

        return $next($request);
    }
}
