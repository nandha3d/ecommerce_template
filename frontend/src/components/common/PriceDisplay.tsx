import React from 'react';
import { useGlobalization } from '../../context/GlobalizationContext';

interface PriceDisplayProps {
    amountInBase?: number; // Optional: Standard mode
    className?: string;
    originalPrice?: number; // For strikethrough
    // Strict Mode Props
    amount?: number; // The already converted amount
    symbol?: string; // The explicit symbol to use
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    amountInBase,
    className = '',
    originalPrice,
    amount,
    symbol
}) => {
    const { currency } = useGlobalization();

    // STRICT MODE: If backend provides values, use them directly.
    if (amount !== undefined && symbol !== undefined) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="font-bold text-current">
                    {currency.position === 'before' ? `${symbol}${amount.toFixed(2)}` : `${amount.toFixed(2)}${symbol}`}
                </span>
                {originalPrice && originalPrice > amount && (
                    <span className="text-gray-400 line-through text-sm">
                        {currency.position === 'before' ? `${symbol}${originalPrice.toFixed(2)}` : `${originalPrice.toFixed(2)}${symbol}`}
                    </span>
                )}
            </div>
        );
    }

    // STANDARD MODE: Fallback to global context conversion
    if (amountInBase === undefined) return null;

    const format = (val: number) => {
        // STRICT Frontend Rule: Visual Only.
        // Ideally backend gives formatted string, but for instant UI response we do approximate.
        // OR we just use the rate provided by context.
        const rate = parseFloat(currency.exchange_rate);
        const converted = val * rate;

        // Formatting
        const num = converted.toFixed(currency.decimals);

        return currency.position === 'before'
            ? `${currency.symbol}${num}`
            : `${num}${currency.symbol}`;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="font-bold text-current">
                {format(amountInBase)}
            </span>
            {originalPrice && originalPrice > amountInBase && (
                <span className="text-gray-400 line-through text-sm">
                    {format(originalPrice)}
                </span>
            )}
        </div>
    );
};
