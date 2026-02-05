<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Health Check Controller for monitoring and load balancer probes
 */
class HealthController extends Controller
{
    /**
     * Basic health check - lightweight for load balancer probes
     * Returns 200 OK if app is running
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Detailed health check - checks all dependencies
     * Use for monitoring dashboards
     */
    public function status(): JsonResponse
    {
        $checks = [
            'app' => $this->checkApp(),
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
        ];

        $allHealthy = collect($checks)->every(fn($check) => $check['healthy']);

        return response()->json([
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'checks' => $checks,
        ], $allHealthy ? 200 : 503);
    }

    protected function checkApp(): array
    {
        return [
            'healthy' => true,
            'message' => 'Application is running',
            'details' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
        ];
    }

    protected function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $start) * 1000, 2);

            return [
                'healthy' => true,
                'message' => 'Database connection successful',
                'details' => [
                    'driver' => config('database.default'),
                    'latency_ms' => $latency,
                ],
            ];
        } catch (\Exception $e) {
            return [
                'healthy' => false,
                'message' => 'Database connection failed',
                'details' => [
                    'error' => config('app.debug') ? $e->getMessage() : 'Connection error',
                ],
            ];
        }
    }

    protected function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'test', 10);
            $value = Cache::get($key);
            Cache::forget($key);

            return [
                'healthy' => $value === 'test',
                'message' => 'Cache is operational',
                'details' => [
                    'driver' => config('cache.default'),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'healthy' => false,
                'message' => 'Cache check failed',
                'details' => [
                    'error' => config('app.debug') ? $e->getMessage() : 'Cache error',
                ],
            ];
        }
    }

    protected function checkStorage(): array
    {
        try {
            $disk = Storage::disk('local');
            $testPath = 'health_check_test.txt';
            
            $disk->put($testPath, 'test');
            $exists = $disk->exists($testPath);
            $disk->delete($testPath);

            return [
                'healthy' => $exists,
                'message' => 'Storage is writable',
                'details' => [
                    'default_disk' => config('filesystems.default'),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'healthy' => false,
                'message' => 'Storage check failed',
                'details' => [
                    'error' => config('app.debug') ? $e->getMessage() : 'Storage error',
                ],
            ];
        }
    }
}
