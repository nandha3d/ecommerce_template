/**
 * RevenueChart Component - Line chart for revenue over time
 * 
 * REQUIREMENTS:
 * - Must use Recharts library
 * - Must be responsive
 * - Must format currency using globalization context
 * - Must show tooltips with detailed information
 * - Must handle empty data gracefully
 */

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
// import { useGlobalization } from '@/context/GlobalizationContext'; // TODO: Find or create
import type { RevenueChartDataPoint } from '@/types/analytics';

interface RevenueChartProps {
    /** Chart data points */
    data: RevenueChartDataPoint[];
    /** Loading state */
    isLoading?: boolean;
    /** Chart height in pixels */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** For localized price formatting */
    formatPrice: (val: number) => string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
    data,
    isLoading = false,
    height = 300,
    showLegend = true,
    formatPrice
}) => {
    // Format data for chart
    const chartData = useMemo(() => {
        return data.map((point) => ({
            ...point,
            // Format date for display
            displayDate: format(parseISO(point.date), 'MMM dd'),
            // Convert cents to currency format (numeric for chart)
            chartRevenue: point.revenue / 100,
        }));
    }, [data]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const pointData = payload[0].payload;

        return (
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {format(parseISO(pointData.date), 'MMMM dd, yyyy')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Revenue: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatPrice(pointData.revenue)}
                        </span>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Orders: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {pointData.orders}
                        </span>
                    </p>
                </div>
            </div>
        );
    };

    // Custom Y-axis tick formatter
    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value}`;
    };

    if (isLoading) {
        return (
            <Card title="Revenue Over Time">
                <Skeleton style={{ height: `${height}px`, width: '100%' }} />
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card title="Revenue Over Time">
                <div
                    style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No revenue data available</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Data will appear once orders are placed</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Revenue Over Time">
            <ResponsiveContainer width="100%" height={height}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="displayDate"
                        stroke="var(--text-muted)"
                        style={{ fontSize: '12px' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        style={{ fontSize: '12px' }}
                        tickFormatter={formatYAxis}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend />}
                    <Line
                        type="monotone"
                        dataKey="chartRevenue"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4, stroke: 'var(--bg-surface)' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Revenue"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default RevenueChart;
