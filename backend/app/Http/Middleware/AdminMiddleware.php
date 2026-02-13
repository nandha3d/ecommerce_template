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
        $guard = auth('api');

        if (!$guard->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = $guard->user();

        if (!in_array($user->role, ['admin', 'super_admin'])) {
            \Log::warning('Unauthorized access attempt to admin route', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'url' => $request->fullUrl()
            ]);
            return response()->json(['message' => 'Access denied. Admin only.'], 403);
        }

        return $next($request);
    }
}
