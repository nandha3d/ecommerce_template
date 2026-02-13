/**
 * Dashboard Page - Main admin dashboard with analytics
 * 
 * CRITICAL REQUIREMENTS:
 * - Must fetch ALL data from API (zero hardcoding)
 * - Must handle loading states for all sections
 * - Must handle errors gracefully
 * - Must be fully responsive
 * - Must support date range filtering
 * - Must use React Query for caching
 * - Must format all currency using globalization context
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    Download,
    Loader2,
    RefreshCw,
    Percent,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable';
import { Button } from '@/components/ui/Button';
import { useGlobalization } from '@/context/GlobalizationContext';
import { analyticsService } from '@/lib/api/analytics';
import { TimePeriod } from '@/types/analytics';

export const Dashboard: React.FC = () => {
    const { formatPrice, currency } = useGlobalization();
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(TimePeriod.LAST_30_DAYS);

    // Fetch dashboard stats
    const {
        data: stats,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useQuery({
        queryKey: ['dashboard-stats', selectedPeriod, currency?.code],
        queryFn: () => analyticsService.getDashboardStats({
            period: selectedPeriod,
            currency: currency?.code,
        }),
        staleTime: 5 * 60 * 1000,
    });

    const handleExport = async () => {
        try {
            const blob = await analyticsService.exportDashboard({
                period: selectedPeriod,
                currency: currency?.code,
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (isError) {
        return (
            <div style={{ padding: 'var(--space-xl)' }}>
                <div style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: '8px' }}>Failed to load dashboard</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                    <Button onClick={() => refetch()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>What's happening RIGHT NOW?</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                            fontSize: '0.875rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value={TimePeriod.LAST_7_DAYS}>Last 7 Days</option>
                        <option value={TimePeriod.LAST_30_DAYS}>Last 30 Days</option>
                        <option value={TimePeriod.THIS_MONTH}>This Month</option>
                        <option value={TimePeriod.THIS_YEAR}>This Year</option>
                    </select>
                    <Button variant="secondary" onClick={() => refetch()} disabled={isLoading || isRefetching} className="hide-mobile">
                        <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="secondary" onClick={handleExport} disabled={isLoading} className="hide-mobile">
                        <Download size={18} style={{ marginRight: '8px' }} /> Export
                    </Button>
                </div>
            </div>

            {/* Main KPI Grid - 8 Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-lg)'
            }}>
                <StatsCard
                    title="Total Revenue"
                    value={stats?.revenue.total || 0}
                    formatValue={(v) => formatPrice(Number(v))}
                    changePercentage={stats?.revenue.change_percentage}
                    icon={DollarSign}
                    isLoading={isLoading}
                    subtitle={`${stats?.revenue.order_count || 0} orders`}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.orders.total || 0}
                    changePercentage={stats?.orders.change_percentage}
                    icon={ShoppingCart}
                    isLoading={isLoading}
                    subtitle={`Avg: ${formatPrice(stats?.orders.average_value || 0)}`}
                />
                <StatsCard
                    title="Conversion Rate"
                    value={`${stats?.business_health?.conversion_rate || 0}%`}
                    icon={Percent}
                    isLoading={isLoading}
                    subtitle="Checkouts to Orders"
                />
                <StatsCard
                    title="Avg. Order Value"
                    value={stats?.business_health?.aov || 0}
                    formatValue={(v) => formatPrice(Number(v))}
                    icon={TrendingUp}
                    isLoading={isLoading}
                    subtitle="Revenue per order"
                />
                <StatsCard
                    title="Customers"
                    value={stats?.customers.total || 0}
                    changePercentage={stats?.customers.change_percentage}
                    icon={Users}
                    isLoading={isLoading}
                    subtitle={`${stats?.customers.new_in_period || 0} new`}
                />
                <StatsCard
                    title="Products"
                    value={stats?.products.total || 0}
                    icon={Package}
                    isLoading={isLoading}
                    subtitle={`${stats?.products.active || 0} active`}
                />
                <StatsCard
                    title="CLV"
                    value={stats?.business_health?.clv || 0}
                    formatValue={(v) => formatPrice(Number(v))}
                    icon={Users}
                    isLoading={isLoading}
                    subtitle="Avg. value per customer"
                />
                <StatsCard
                    title="Abandonment Rate"
                    value={`${stats?.business_health?.abandonment_rate || 0}%`}
                    icon={ShoppingCart}
                    isLoading={isLoading}
                    subtitle="Carts not checked out"
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
                gap: 'var(--space-xl)',
                alignItems: 'start'
            }}>
                {/* Left Column: Charts & Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', minWidth: 0 }}>
                    <RevenueChart
                        data={stats?.revenue_chart || []}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />

                    <div className="card" style={{ minWidth: 0 }}>
                        <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ margin: 0 }}>Recent Orders</h3>
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                            </Button>
                        </div>
                        <RecentOrdersTable
                            orders={stats?.recent_orders || []}
                            isLoading={isLoading}
                            limit={5}
                            formatPrice={formatPrice}
                        />
                    </div>
                </div>

                {/* Right Column: Insights & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Action Required */}
                    <div className="card" style={{
                        border: '1px solid var(--border)',
                        background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, transparent 100%)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} color="var(--warning)" /> Action Required
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="flex-between" style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.875rem' }}>Pending Fulfillment</span>
                                <span className="badge badge-warning" style={{ borderRadius: '12px', padding: '2px 8px' }}>
                                    {stats?.action_required?.pending_fulfillment || 0}
                                </span>
                            </div>
                            <div className="flex-between" style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.875rem' }}>Out of Stock</span>
                                <span className="badge badge-danger" style={{ borderRadius: '12px', padding: '2px 8px' }}>
                                    {stats?.action_required?.out_of_stock || 0}
                                </span>
                            </div>
                            <div className="flex-between" style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.875rem' }}>Refund Requests</span>
                                <span className="badge badge-info" style={{ borderRadius: '12px', padding: '2px 8px' }}>
                                    {stats?.action_required?.refund_requests || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1rem' }}>Low Stock Alerts</h3>
                        {stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {stats.low_stock_products.map((p: any) => (
                                    <div key={p.sku || p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku || 'N/A'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: Number(p.stock_quantity) === 0 ? 'var(--error)' : 'var(--warning)', fontWeight: 700 }}>
                                                {p.stock_quantity} left
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5, color: 'var(--success)' }} />
                                All stock levels healthy
                            </div>
                        )}
                    </div>

                    {/* Today's Activity */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} /> Today's Activity
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{stats?.today_activity?.new_orders || 0} New Orders</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Since midnight today</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '4px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{stats?.today_activity?.new_customers || 0} New Customers</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Increased reach</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
