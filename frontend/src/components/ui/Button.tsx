import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}) => {
    const sizeClass = size !== 'md' ? `btn-${size}` : '';

    return (
        <button
            className={cn('btn', `btn-${variant}`, sizeClass, className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {!isLoading && leftIcon && <span className="flex-center">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="flex-center">{rightIcon}</span>}
        </button>
    );
};
