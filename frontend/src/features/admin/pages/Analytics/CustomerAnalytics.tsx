import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    UserPlus,
    UserMinus,
    MessageSquare,
    Globe,
    Activity,
    Loader2
} from 'lucide-react';
import { analyticsService } from '@/lib/api/analytics';

export const CustomerAnalytics: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-analytics-customers'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const displayData = stats;

    // Get the most recent cohort for display
    const latestCohortMonth = displayData?.retention_cohort ? Object.keys(displayData.retention_cohort).sort().reverse()[0] : null;
    const retention = latestCohortMonth ? displayData.retention_cohort[latestCohortMonth] : {};

    if (isLoading) return <div className="flex-center" style={{ height: '300px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Retention Cohort */}
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--space-lg) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} /> Retention Cohort {latestCohortMonth && `(${latestCohortMonth})`}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-md)', height: '260px', paddingBottom: '30px' }}>
                        {Object.entries(retention).map(([month, val]: [string, any]) => (
                            <div key={month} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                <div
                                    className="gradient-bar-v"
                                    style={{
                                        width: '100%',
                                        height: `${val}%`,
                                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        paddingTop: '8px',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}
                                >
                                    {val}%
                                </div>
                                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acquisition Sources */}
                <div className="card">
                    <h3 style={{ margin: '0 0 var(--space-lg) 0' }}>Acquisition Sources</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayData?.acquisition_sources.map(s => {
                            const Icon = s.source === 'Social' ? MessageSquare : s.source === 'Referral' ? UserPlus : Globe;
                            return (
                                <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="flex-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-main)' }}>
                                        <Icon size={14} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                                            <span>{s.source}</span>
                                            <span>{s.percentage || Math.round((s.count / displayData.customers.total) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'var(--bg-main)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div
                                                className="gradient-bar-h"
                                                style={{
                                                    width: `${s.percentage || (displayData.customers.total > 0 ? (s.count / displayData.customers.total) * 100 : 0)}%`,
                                                    height: '100%'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Customer Segments */}
            <div className="card">
                <h3 style={{ margin: '0 0 var(--space-lg) 0' }}>Customer Segmentation (RFM)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
                    {[
                        { label: 'Champions', count: displayData?.customer_segmentation.champions, color: 'var(--success)' },
                        { label: 'Loyal Customers', count: displayData?.customer_segmentation.loyal, color: 'var(--primary)' },
                        { label: 'At Risk', count: displayData?.customer_segmentation.at_risk, color: 'var(--warning)' },
                        { label: 'Lost', count: displayData?.customer_segmentation.lost, color: 'var(--error)' }
                    ].map(seg => (
                        <div key={seg.label} style={{ padding: 'var(--space-md)', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: seg.color }}>{seg.count}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{seg.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
