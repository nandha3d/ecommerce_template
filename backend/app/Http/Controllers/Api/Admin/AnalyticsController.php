<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Core\Analytics\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    private AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard summary stats.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = $this->analyticsService->getDashboardStats();
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
