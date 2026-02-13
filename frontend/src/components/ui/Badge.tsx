import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        success: { bg: 'rgba(34, 197, 94, 0.1)', color: 'rgb(21, 128, 61)' },
        warning: { bg: 'rgba(234, 179, 8, 0.1)', color: 'rgb(161, 98, 7)' },
        error: { bg: 'rgba(239, 68, 68, 0.1)', color: 'rgb(185, 28, 28)' },
        info: { bg: 'rgba(59, 130, 246, 0.1)', color: 'rgb(29, 78, 216)' },
        default: { bg: 'var(--bg-main)', color: 'var(--text-secondary)' }
    };

    const { bg, color } = variants[variant] || variants.default;

    return (
        <span
            className={`badge ${className}`}
            style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: bg,
                color: color,
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
            }}
        >
            {children}
        </span>
    );
};
