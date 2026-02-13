import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Package,
    TrendingUp,
    TrendingDown,
    Activity,
    Box,
    Loader2
} from 'lucide-react';
import { analyticsService } from '@/lib/api/analytics';
import { useGlobalization } from '@/context/GlobalizationContext';

export const ProductAnalytics: React.FC = () => {
    const { formatPrice } = useGlobalization();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-analytics-products'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const displayData = stats;

    if (isLoading) return <div className="flex-center" style={{ height: '300px' }}><Loader2 className="animate-spin" /></div>;

    const products = displayData?.top_products || [];

    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--space-lg) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} style={{ color: 'var(--success)' }} /> Best Sellers (30 Days)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {products.map((p, i) => (
                            <div key={p.id} className="flex-between" style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.units_sold} units sold</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700 }}>{formatPrice(p.revenue)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ margin: '0 0 var(--space-lg) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} style={{ color: 'var(--primary)' }} /> Inventory Health
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Turnover Ratio</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{(displayData?.inventory_turnover || 0).toFixed(2)}x</div>
                        </div>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(var(--warning-rgb), 0.05)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Out of Stock</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayData?.products.out_of_stock}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Box size={20} />
                            <span style={{ fontWeight: 600 }}>Category Stock Distribution</span>
                        </div>
                        {displayData?.sales_by_category?.map((c: any) => (
                            <div key={c.name} style={{ marginBottom: '12px' }}>
                                <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>{c.name}</span>
                                    <span>{c.percentage || 0}% Share</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        className="gradient-bar-h"
                                        style={{
                                            width: `${c.percentage || 0}%`,
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
