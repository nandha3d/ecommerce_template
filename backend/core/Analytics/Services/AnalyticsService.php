<?php

namespace Core\Analytics\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AnalyticsService
{
    /**
     * Get aggregate dashboard stats.
     */
    public function getDashboardStats(?string $period = 'last_30_days', ?string $currency = 'USD'): array
    {
        $generatedAt = now()->toIso8601String();
        $period = $period ?? 'last_30_days';

        $totalRevenue = (int) $this->getTotalRevenue();
        $previousRevenue = (int) $this->getPreviousRevenue();
        $revenueGrowth = $this->getGrowthPercentage($totalRevenue, $previousRevenue);

        $totalOrders = $this->getTotalOrders();
        $previousOrders = $this->getPreviousOrders();
        $ordersGrowth = $this->getGrowthPercentage($totalOrders, $previousOrders);

        $totalCustomers = $this->getTotalCustomers();
        $previousCustomers = $this->getPreviousCustomers();
        $customersGrowth = $this->getGrowthPercentage($totalCustomers, $previousCustomers);

        $aov = $totalOrders > 0 ? (int) ($totalRevenue / $totalOrders) : 0;
        $previousAov = $previousOrders > 0 ? (int) ($previousRevenue / $previousOrders) : 0;
        
        $convRate = $this->getConversionRate();
        $abandonRate = $this->getAbandonmentRate();

        return [
            'revenue' => [
                'total' => $totalRevenue,
                'previous_period' => $previousRevenue,
                'change_percentage' => $revenueGrowth,
                'currency_code' => $currency ?? 'USD',
                'order_count' => $totalOrders
            ],
            'orders' => [
                'total' => $totalOrders,
                'previous_period' => $previousOrders,
                'change_percentage' => $ordersGrowth,
                'by_status' => $this->getOrdersByStatus(),
                'average_value' => $aov,
                'aov_growth' => $this->getGrowthPercentage($aov, $previousAov)
            ],
            'products' => $this->getInventoryStats(),
            'customers' => [
                'total' => $totalCustomers,
                'new_in_period' => $this->getNewCustomersInPeriod(),
                'previous_period' => $previousCustomers,
                'change_percentage' => $customersGrowth,
                'active' => $this->getActiveCustomers(),
                'lifetime_value' => $totalCustomers > 0 ? (int)($totalRevenue / $totalCustomers) : 0
            ],
            'business_health' => [
                'conversion_rate' => $convRate,
                'abandonment_rate' => $abandonRate,
                'aov' => $aov,
                'clv' => $totalCustomers > 0 ? (int)($totalRevenue / $totalCustomers) : 0
            ],
            'revenue_chart' => $this->getRevenueChartData(),
            'orders_chart' => $this->getOrdersChartData(),
            'top_products' => $this->getTopSellingProducts(5),
            'recent_orders' => $this->getRecentOrders(10),
            'low_stock_products' => $this->getLowStockProducts(10),
            'sales_by_category' => $this->getSalesByCategory(),
            'action_required' => $this->getActionRequiredCounts(),
            'today_activity' => $this->getTodayActivity(),
            'retention_cohort' => $this->getRetentionCohort(),
            'customer_segmentation' => $this->getCustomerSegmentation(),
            'acquisition_sources' => $this->getAcquisitionSources(),
            'inventory_turnover' => $this->getInventoryTurnover(),
            'period' => $period,
            'period_start' => now()->subDays(30)->toIso8601String(),
            'period_end' => now()->toIso8601String(),
            'generated_at' => $generatedAt
        ];
    }

    private function getGrowthPercentage($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function getConversionRate(): float
    {
        $sessions = DB::table('checkout_sessions')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        $orders = $this->getTotalOrders();
        
        if ($sessions == 0) return 0.0;
        return round(($orders / $sessions) * 100, 2);
    }

    private function getAbandonmentRate(): float
    {
        $abandoned = DB::table('abandoned_carts')
            ->where('abandoned_at', '>=', now()->subDays(30))
            ->count();
        $orders = $this->getTotalOrders();
        
        $totalPotential = $orders + $abandoned;
        if ($totalPotential == 0) return 0.0;
        return round(($abandoned / $totalPotential) * 100, 2);
    }

    private function getPreviousRevenue(): float
    {
        return (float) DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [now()->subDays(60), now()->subDays(30)])
            ->sum('orders.total');
    }

    private function getTotalRevenue(): float
    {
        return (float) DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->sum('orders.total');
    }

    private function getTotalOrders(): int
    {
        return DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->count();
    }

    private function getPreviousOrders(): int
    {
        return DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->whereBetween('orders.created_at', [now()->subDays(60), now()->subDays(30)])
            ->count();
    }

    private function getOrdersByStatus(): array
    {
        $stats = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->select('orders.status', DB::raw('count(*) as count'))
            ->groupBy('orders.status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure common statuses exist with 0 if missing
        $defaults = ['pending' => 0, 'processing' => 0, 'shipped' => 0, 'completed' => 0, 'cancelled' => 0];
        return array_merge($defaults, $stats);
    }

    private function getInventoryStats(): array
    {
        $total = DB::table('products')->count();
        $active = DB::table('products')->where('is_active', true)->count();
        $outOfStock = DB::table('product_variants')->where('stock_quantity', '<=', 0)->count();
        
        // Assuming 10 as a general low stock threshold
        $lowStock = DB::table('product_variants')
            ->where('stock_quantity', '>', 0)
            ->where('stock_quantity', '<=', 10)
            ->count();

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $total - $active,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'new_in_period' => DB::table('products')->where('created_at', '>=', now()->subDays(30))->count()
        ];
    }

    private function getTotalCustomers(): int
    {
        return DB::table('users')
            ->where('role', 'customer')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('orders')
                    ->whereColumn('orders.user_id', 'users.id');
            })
            ->count();
    }

    private function getPreviousCustomers(): int
    {
        return DB::table('users')
            ->where('role', 'customer')
            ->whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('orders')
                    ->whereColumn('orders.user_id', 'users.id');
            })
            ->count();
    }

    private function getNewCustomersInPeriod(): int
    {
        return DB::table('users')
            ->where('role', 'customer')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('orders')
                    ->whereColumn('orders.user_id', 'users.id');
            })
            ->count();
    }

    private function getActiveCustomers(): int
    {
        // Customers with at least one order in last 30 days
        return DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->distinct('orders.user_id')
            ->count('orders.user_id');
    }

    private function getRevenueChartData(): array
    {
        $rawData = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(orders.total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = $rawData->get($date);
            
            $data[] = [
                'date' => $date,
                'revenue' => $dayData ? (int) $dayData->revenue : 0,
                'orders' => $dayData ? (int) $dayData->orders : 0,
                'label' => now()->subDays($i)->format('M d')
            ];
        }
        return $data;
    }

    private function getOrdersChartData(): array
    {
        $rawData = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = $rawData->get($date);
            
            $data[] = [
                'date' => $date,
                'value' => $dayData ? (int) $dayData->count : 0,
                'label' => now()->subDays($i)->format('M d')
            ];
        }
        return $data;
    }

    private function getRecentOrders(int $limit): array
    {
        return DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->select(
                'orders.id', 
                'orders.order_number', 
                'orders.total', 
                'orders.status', 
                'orders.created_at',
                'users.name as customer_name',
                'users.email as customer_email'
            )
            ->orderBy('orders.created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($o) => (array)$o)
            ->toArray();
    }

    private function getTopSellingProducts(int $limit): array
    {
        if (!Schema::hasTable('order_items')) return [];

        return DB::table('order_items as oi')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('users as u', 'o.user_id', '=', 'u.id')
            ->where('u.role', 'customer')
            ->select(
                'p.id',
                'p.name', 
                'p.sku',
                DB::raw('SUM(oi.quantity) as units_sold'), 
                DB::raw('SUM(oi.total_price) as revenue')
            )
            ->groupBy('p.id', 'p.name', 'p.sku')
            ->orderByDesc('units_sold')
            ->limit($limit)
            ->get()
            ->map(fn($p) => (array)$p)
            ->toArray();
    }

    private function getLowStockProducts(int $limit): array
    {
        return DB::table('product_variants as pv')
            ->join('products as p', 'pv.product_id', '=', 'p.id')
            ->where('pv.stock_quantity', '<=', 10)
            ->select('p.id', 'p.name', 'pv.sku', 'pv.stock_quantity')
            ->orderBy('pv.stock_quantity', 'asc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => (array)$p)
            ->toArray();
    }

    private function getSalesByCategory(): array
    {
        if (!Schema::hasTable('product_category')) return [];

        return DB::table('order_items as oi')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->join('product_category as pc', 'p.id', '=', 'pc.product_id')
            ->join('categories as c', 'pc.category_id', '=', 'c.id')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('users as u', 'o.user_id', '=', 'u.id')
            ->where('u.role', 'customer')
            ->select('c.name', DB::raw('SUM(oi.total_price) as value'))
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('value')
            ->limit(5)
            ->get()
            ->map(fn($c) => (array)$c)
            ->toArray();
    }

    private function getActionRequiredCounts(): array
    {
        return [
            'pending_fulfillment' => DB::table('orders')->where('status', 'processing')->count(),
            'out_of_stock' => DB::table('product_variants')->where('stock_quantity', '<=', 0)->count(),
            'refund_requests' => DB::table('orders')->where('status', 'refund_requested')->count(),
            'pending_customizations' => 0 // Placeholder
        ];
    }

    private function getTodayActivity(): array
    {
        $orders = DB::table('orders')
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
        $customers = DB::table('users')
            ->where('role', 'customer')
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
        
        return [
            'new_orders' => $orders,
            'new_customers' => $customers,
            'timeline' => [] // Detailed activity log could go here
        ];
    }

    private function getRetentionCohort(): array
    {
        // Get first order month for each user
        $cohorts = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->select('user_id', DB::raw("MIN(DATE_FORMAT(orders.created_at, '%Y-%m-01')) as cohort_month"))
            ->groupBy('user_id');

        // Join with subsequent orders
        $retention = DB::table('orders')
            ->joinSub($cohorts, 'cohorts', 'orders.user_id', '=', 'cohorts.user_id')
            ->select(
                'cohort_month',
                DB::raw("PERIOD_DIFF(DATE_FORMAT(orders.created_at, '%Y%m'), DATE_FORMAT(cohort_month, '%Y%m')) as month_number"),
                DB::raw('COUNT(DISTINCT orders.user_id) as user_count')
            )
            ->groupBy('cohort_month', 'month_number')
            ->orderBy('cohort_month')
            ->orderBy('month_number')
            ->get()
            ->groupBy('cohort_month');

        $result = [];
        foreach ($retention as $month => $data) {
            $baseCount = $data->where('month_number', 0)->first()->user_count ?? 1;
            $months = [];
            foreach ($data as $row) {
                if ($row->month_number > 0 && $row->month_number <= 6) {
                    $months["month" . $row->month_number] = round(($row->user_count / $baseCount) * 100, 1);
                }
            }
            // Fill missing months up to 6
            for ($i = 1; $i <= 6; $i++) {
                if (!isset($months["month" . $i])) $months["month" . $i] = 0;
            }
            $result[$month] = $months;
        }

        return $result;
    }

    private function getCustomerSegmentation(): array
    {
        // Simplified RFM
        $stats = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->select(
                'user_id',
                DB::raw('COUNT(*) as frequency'),
                DB::raw('SUM(total) as monetary'),
                DB::raw('DATEDIFF(NOW(), MAX(orders.created_at)) as recency')
            )
            ->groupBy('user_id')
            ->get();

        $segments = [
            'champions' => 0,
            'loyal' => 0,
            'at_risk' => 0,
            'lost' => 0
        ];

        foreach ($stats as $s) {
            if ($s->recency <= 30 && $s->frequency >= 5) $segments['champions']++;
            elseif ($s->frequency >= 3) $segments['loyal']++;
            elseif ($s->recency > 90) $segments['lost']++;
            else $segments['at_risk']++;
        }

        return $segments;
    }

    private function getAcquisitionSources(): array
    {
        // Since we don't have a source column, let's proxy with payment method or something available
        // In a real app, this would come from an attribution table or UTM tags
        return DB::table('orders')
            ->select('payment_method as source', DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($row) {
                return [
                    'source' => ucfirst($row->source),
                    'count' => $row->count,
                    'percentage' => 0 // Calculated later if needed
                ];
            })->toArray();
    }

    private function getInventoryTurnover(): float
    {
        $sold = DB::table('order_items')->sum('quantity');
        $stock = DB::table('product_variants')->sum('stock_quantity');
        
        if ($stock == 0) return 0.0;
        return round($sold / ($sold + $stock), 2);
    }
}
