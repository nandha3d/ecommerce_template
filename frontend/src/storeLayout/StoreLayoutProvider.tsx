import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_STORE_LAYOUT_SETTINGS,
    safeParseStoreLayoutSettings,
    STORE_LAYOUT_STORAGE_KEY,
    type LayoutVariant,
    type StoreLayoutSettings,
} from './storeLayoutSettings';

interface StoreLayoutContextValue {
    settings: StoreLayoutSettings;
    setHome: (variant: LayoutVariant) => void;
    setProductDetail: (variant: LayoutVariant) => void;
    setCart: (variant: LayoutVariant) => void;
    setCheckout: (variant: LayoutVariant) => void;
    reset: () => void;
}

const StoreLayoutContext = React.createContext<StoreLayoutContextValue | null>(null);

export const useStoreLayoutSettings = () => {
    const ctx = React.useContext(StoreLayoutContext);
    if (!ctx) {
        return {
            settings: DEFAULT_STORE_LAYOUT_SETTINGS,
            setHome: () => undefined,
            setProductDetail: () => undefined,
            setCart: () => undefined,
            setCheckout: () => undefined,
            reset: () => undefined,
        };
    }
    return ctx;
};

interface StoreLayoutProviderProps {
    children: React.ReactNode;
}

const StoreLayoutProvider: React.FC<StoreLayoutProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<StoreLayoutSettings>(() => {
        const parsed = safeParseStoreLayoutSettings(localStorage.getItem(STORE_LAYOUT_STORAGE_KEY));
        return parsed || DEFAULT_STORE_LAYOUT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem(STORE_LAYOUT_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const setHome = useCallback((variant: LayoutVariant) => {
        setSettings((prev) => ({ ...prev, home: variant }));
    }, []);

    const setProductDetail = useCallback((variant: LayoutVariant) => {
        setSettings((prev) => ({ ...prev, productDetail: variant }));
    }, []);

    const setCart = useCallback((variant: LayoutVariant) => {
        setSettings((prev) => ({ ...prev, cart: variant }));
    }, []);

    const setCheckout = useCallback((variant: LayoutVariant) => {
        setSettings((prev) => ({ ...prev, checkout: variant }));
    }, []);

    const reset = useCallback(() => {
        setSettings(DEFAULT_STORE_LAYOUT_SETTINGS);
    }, []);

    const value = useMemo<StoreLayoutContextValue>(() => {
        return {
            settings,
            setHome,
            setProductDetail,
            setCart,
            setCheckout,
            reset,
        };
    }, [reset, setCart, setCheckout, setHome, setProductDetail, settings]);

    return <StoreLayoutContext.Provider value={value}>{children}</StoreLayoutContext.Provider>;
};

export default StoreLayoutProvider;
