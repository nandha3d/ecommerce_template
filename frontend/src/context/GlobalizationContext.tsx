import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import axios from 'axios';

interface Currency {
    code: string;
    symbol: string;
    rate: number;
    decimals?: number;
    position?: 'left' | 'right';
}

interface GlobalizationContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (cents: number) => string;
    locale: string;
    setLocale: (locale: string) => void;
    refreshContext: () => Promise<void>;
}

const GlobalizationContext = createContext<GlobalizationContextType | undefined>(undefined);

export const GlobalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>({
        code: 'USD',
        symbol: '$',
        rate: 1.0,
        decimals: 2,
        position: 'left'
    });

    const [locale, setLocale] = useState('en-US');

    const refreshContext = async () => {
        try {
            const response = await axios.get('/api/v1/context', {
                headers: {
                    'X-Currency': localStorage.getItem('currency'),
                    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });

            const data = response.data;
            if (data?.currency) {
                setCurrency({
                    code: data.currency.active_code,
                    symbol: data.currency.symbol,
                    rate: data.currency.exchange_rate,
                    decimals: data.currency.decimals,
                    position: data.currency.position
                });
            }
            if (data?.timezone) {
                // Determine locale from timezone or browser
                setLocale(navigator.language);
            }
        } catch (error) {
            console.error('Failed to fetch globalization context:', error);
        }
    };

    useEffect(() => {
        refreshContext();
    }, []);

    const formatPrice = useMemo(() => (amount: number) => {
        // Database stores price in DOLLARS (e.g. 19.99), not cents.
        // If we receive cents from Stripe, we should convert before calling this, 
        // or this function should detect magnitude (unreliable).
        // Assuming input is always in correct MAJOR currency unit (e.g. Dollars).

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency.code,
                minimumFractionDigits: currency.decimals ?? 2,
                maximumFractionDigits: currency.decimals ?? 2,
            }).format(amount);
        } catch (e) {
            // Fallback for invalid locales
            return `${currency.symbol}${amount.toFixed(currency.decimals ?? 2)}`;
        }
    }, [currency, locale]);

    return (
        <GlobalizationContext.Provider value={{
            currency,
            setCurrency,
            formatPrice,
            locale,
            setLocale,
            refreshContext
        }}>
            {children}
        </GlobalizationContext.Provider>
    );
};

export const useGlobalization = () => {
    const context = useContext(GlobalizationContext);
    if (context === undefined) {
        throw new Error('useGlobalization must be used within a GlobalizationProvider');
    }
    return context;
};
