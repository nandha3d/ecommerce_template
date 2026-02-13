import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={{
                backgroundColor: 'var(--border)',
                opacity: 0.5,
                ...style
            }}
        />
    );
};
