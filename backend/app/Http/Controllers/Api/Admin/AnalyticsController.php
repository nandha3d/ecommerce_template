<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Core\Analytics\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\OrderItem;

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
    public function dashboard(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $stats = $this->analyticsService->getDashboardStats(
                $request->query('period'),
                $request->query('currency', 'USD')
            );
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get variant performance metrics (best/worst sellers).
     */
    public function variantPerformance(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            // Top selling variants
            $topVariants = OrderItem::select(
                'variant_id',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(subtotal) as revenue')
            )
            ->with(['variant.product', 'variant.costBreakdown'])
            ->groupBy('variant_id')
            ->orderByDesc('total_sold')
            ->take(10)
            ->get()
            ->map(function ($item) {
                $cost = $item->variant?->cost_price ?? 0;
                $profit = $item->revenue - ($cost * $item->total_sold);
                
                return [
                    'sku' => $item->variant->sku ?? 'Unknown',
                    'product_name' => $item->variant->product->name ?? 'Unknown',
                    'sold' => (int)$item->total_sold,
                    'revenue' => (int)$item->revenue,
                    'profit' => (int)$profit,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $topVariants
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Analyze which attributes (colors, sizes) are most popular.
     */
    public function attributeAnalysis(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            // Get all order items with their variant attributes
            $items = OrderItem::with('variant:id,attributes')->get();
            
            $attributeCounts = [];

            foreach ($items as $item) {
                if (!$item->variant || empty($item->variant->attributes)) continue;
                
                foreach ($item->variant->attributes as $key => $value) {
                    $key = ucfirst($key);
                    if (!isset($attributeCounts[$key])) {
                        $attributeCounts[$key] = [];
                    }
                    if (!isset($attributeCounts[$key][$value])) {
                        $attributeCounts[$key][$value] = 0;
                    }
                    $attributeCounts[$key][$value] += $item->quantity;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $attributeCounts
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
