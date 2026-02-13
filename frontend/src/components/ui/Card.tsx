import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    actions?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    role?: string;
    tabIndex?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    actions,
    className = '',
    onClick,
    role,
    tabIndex,
    onKeyDown,
    style
}) => {
    return (
        <div
            className={cn('card', className)}
            onClick={onClick}
            role={role}
            tabIndex={tabIndex}
            onKeyDown={onKeyDown}
            style={style}
        >
            {(title || actions) && (
                <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                    {title && <h3 style={{ margin: 0 }}>{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
