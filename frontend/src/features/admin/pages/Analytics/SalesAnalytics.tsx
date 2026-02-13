import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    ShoppingCart,
    Percent,
    Loader2
} from 'lucide-react';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { useGlobalization } from '@/context/GlobalizationContext';
import { analyticsService } from '@/lib/api/analytics';

export const SalesAnalytics: React.FC = () => {
    const { formatPrice, currency } = useGlobalization();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-analytics-sales', currency?.code],
        queryFn: () => analyticsService.getDashboardStats({ currency: currency?.code }),
    });

    const displayData = stats;

    if (isLoading) return <div className="flex-center" style={{ height: '300px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
                {/* Revenue Card */}
                <div className="card" style={{ display: 'flex', gap: '16px' }}>
                    <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Revenue Growth</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatPrice(displayData?.revenue.total || 0)}</span>
                            <span style={{
                                fontSize: '0.875rem',
                                color: (displayData?.revenue.change_percentage || 0) >= 0 ? 'var(--success)' : 'var(--error)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {(displayData?.revenue.change_percentage || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(displayData?.revenue.change_percentage || 0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="card" style={{ display: 'flex', gap: '16px' }}>
                    <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(var(--secondary-rgb), 0.1)', color: 'var(--secondary)' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Order Growth</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayData?.orders.total || 0}</span>
                            <span style={{
                                fontSize: '0.875rem',
                                color: (displayData?.orders.change_percentage || 0) >= 0 ? 'var(--success)' : 'var(--error)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {(displayData?.orders.change_percentage || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(displayData?.orders.change_percentage || 0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Conversion Card */}
                <div className="card" style={{ display: 'flex', gap: '16px' }}>
                    <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                        <Percent size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Conversion Rate</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayData?.business_health.conversion_rate || 0}%</span>
                            <span style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {displayData?.business_health.conversion_rate > 2 ? 'Above Average' : 'Stable'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Deep Dive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 'var(--space-xl)' }}>
                <RevenueChart
                    data={displayData?.revenue_chart || []}
                    isLoading={isLoading}
                    formatPrice={formatPrice}
                />

                <div className="card">
                    <h3 style={{ margin: '0 0 var(--space-lg) 0' }}>Sales by Category</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayData?.sales_by_category?.map((cat: any) => (
                            <div key={cat.name}>
                                <div className="flex-between" style={{ marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat.name}</span>
                                    <span style={{ fontSize: '0.875rem' }}>{formatPrice(cat.value)}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        className="gradient-bar-h"
                                        style={{
                                            width: `${cat.percentage}%`,
                                            height: '100%'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
