/**
 * StatsCard Component - Reusable card for displaying metrics
 * 
 * DESIGN REQUIREMENTS:
 * - Must be fully responsive (mobile-first)
 * - Must show loading state
 * - Must handle very large numbers (1M+)
 * - Must show trend indicator (up/down)
 * - Must support custom icons
 * - Must be accessible (ARIA labels)
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    /** Card title */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Optional subtitle or description */
    subtitle?: string;
    /** Percentage change from previous period */
    changePercentage?: number;
    /** Icon component (from lucide-react) */
    icon?: React.ElementType;
    /** Icon color class */
    iconColor?: string;
    /** Icon background color class */
    iconBgColor?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Custom formatter for value */
    formatValue?: (value: string | number) => string;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    changePercentage,
    icon: Icon,
    iconColor = 'text-primary',
    iconBgColor = 'var(--primary-light)',
    isLoading = false,
    formatValue,
    onClick,
    className,
}) => {
    // Format large numbers with commas
    const formatNumber = (num: string | number): string => {
        const numValue = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(numValue)) return '0';

        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
        }).format(numValue);
    };

    // Determine trend direction
    const getTrendIcon = () => {
        if (changePercentage === undefined || changePercentage === 0) {
            return <Minus className="w-4 h-4" />;
        }
        return changePercentage > 0 ? (
            <TrendingUp className="w-4 h-4" />
        ) : (
            <TrendingDown className="w-4 h-4" />
        );
    };

    const getTrendColor = () => {
        if (changePercentage === undefined || changePercentage === 0) {
            return 'var(--text-muted)';
        }
        return changePercentage > 0 ? 'var(--success)' : 'var(--error)';
    };

    const displayValue = formatValue ? formatValue(value) : formatNumber(value);

    if (isLoading) {
        return (
            <Card className={cn('p-6', className)}>
                <div className="flex flex-col gap-3">
                    <Skeleton style={{ height: '16px', width: '96px' }} />
                    <Skeleton style={{ height: '32px', width: '128px' }} />
                    <Skeleton style={{ height: '12px', width: '80px' }} />
                </div>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'p-6 transition-shadow hover:shadow-md',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e: React.KeyboardEvent) => e.key === 'Enter' && onClick() : undefined}
        >
            <div className="flex items-start justify-between">
                {/* Left side - Text content */}
                <div className="flex-1">
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                        {displayValue}
                    </h3>

                    {/* Trend indicator */}
                    {changePercentage !== undefined && (
                        <div className="flex items-center" style={{ gap: '4px', fontSize: '0.875rem', fontWeight: 500, color: getTrendColor() }}>
                            {getTrendIcon()}
                            <span>
                                {Math.abs(changePercentage).toFixed(1)}%
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                vs last period
                            </span>
                        </div>
                    )}

                    {/* Subtitle */}
                    {subtitle && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right side - Icon */}
                {Icon && (
                    <div
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: iconBgColor,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;
