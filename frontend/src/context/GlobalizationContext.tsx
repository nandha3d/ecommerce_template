import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api'; // wrapper axios
import { GlobalizationContextState } from '../types/globalization';

const GlobalizationContext = createContext<GlobalizationContextState | undefined>(undefined);

export const GlobalizationProvider = ({ children }: { children: ReactNode }) => {
    // Initial state is empty/loading, NOT hardcoded.
    // The initial render might show a loader or skeleton until confirmed.

    const [state, setState] = useState<GlobalizationContextState['currency']>({
        active_code: '...', // Placeholder until load
        symbol: '',
        position: 'before',
        decimals: 2,
        exchange_rate: '1.000000',
        available: [],
    });

    const [tzState, setTzState] = useState<GlobalizationContextState['timezone']>({
        identifier: 'UTC', // Default fallback is okay, but specific user settings will overwrite
        offset: '+00:00',
    });

    const [isLoading, setIsLoading] = useState(true);

    const fetchContext = async () => {
        try {
            const response = await api.get('/context');
            const { currency, timezone } = response.data;
            if (currency) setState(currency);
            if (timezone) setTzState(timezone);
        } catch (error) {
            console.error('Failed to fetch globalization context:', error);
            // Ideally we should have a fallback strategy here if the API fails completely
            // e.g. read from LocalStorage or use a hard failsafe
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    const switchCurrency = async (code: string) => {
        try {
            await api.post('/settings/currency/switch', { code });
            await fetchContext();
        } catch (error) {
            console.error('Failed to switch currency:', error);
        }
    };

    const switchTimezone = async (identifier: string) => {
        try {
            await api.post('/settings/timezone/switch', { identifier });
            await fetchContext();
        } catch (error) {
            console.error('Failed to switch timezone:', error);
        }
    };

    return (
        <GlobalizationContext.Provider value={{
            currency: state,
            timezone: tzState,
            isLoading,
            switchCurrency,
            switchTimezone
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
