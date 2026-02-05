import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../services/api';

interface SiteConfig {
    'site.name': string;
    'site.description': string;
    'contact.email': string;
    'contact.phone': string;
    'contact.address': string;
    'social.facebook': string;
    'social.twitter': string;
    'social.instagram': string;
    // Theme colors (from admin panel)
    'theme.preset_id': string;
    'theme.primary': string;
    'theme.bg': string;
    'theme.surface': string;
    'theme.border': string;
    'theme.text': string;
    'theme.muted': string;
    [key: string]: string;
}

interface ConfigContextType {
    config: SiteConfig;
    isLoading: boolean;
    isError: boolean;
}

// Empty config - no hardcoded defaults
const emptyConfig: SiteConfig = {
    'site.name': '',
    'site.description': '',
    'contact.email': '',
    'contact.phone': '',
    'contact.address': '',
    'social.facebook': '',
    'social.twitter': '',
    'social.instagram': '',
    // Default theme fallbacks
    'theme.preset_id': 'rose',
    'theme.primary': '#e11d7c',
    'theme.bg': '#fff7fb',
    'theme.surface': '#ffffff',
    'theme.border': '#f1dbe8',
    'theme.text': '#2a0f1d',
    'theme.muted': '#6e4a5a',
};

const ConfigContext = createContext<ConfigContextType>({
    config: emptyConfig,
    isLoading: true,
    isError: false,
});

/**
 * Helper to mix two hex colors
 */
const mixHex = (a: string, b: string, t: number): string => {
    const hexToRgb = (hex: string) => {
        const cleaned = hex.replace('#', '').trim();
        const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
        const num = parseInt(full, 16);
        if (isNaN(num) || full.length !== 6) return null;
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    if (!ra || !rb) return a;
    const k = Math.min(1, Math.max(0, t));
    const r = Math.round(ra.r + (rb.r - ra.r) * k);
    const g = Math.round(ra.g + (rb.g - ra.g) * k);
    const bl = Math.round(ra.b + (rb.b - ra.b) * k);
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
};

/**
 * Apply theme colors as CSS custom properties on :root
 * NOTE: For storefront, we only apply the PRIMARY color from theme.
 * Neutral colors stay fixed (dark text on light backgrounds) for readability.
 */
const applyThemeToRoot = (config: SiteConfig) => {
    const root = document.documentElement;

    const primary = config['theme.primary'] || emptyConfig['theme.primary'];

    // Primary color scale - this changes based on theme
    root.style.setProperty('--color-primary-50', mixHex(primary, '#ffffff', 0.9));
    root.style.setProperty('--color-primary-100', mixHex(primary, '#ffffff', 0.75));
    root.style.setProperty('--color-primary-200', mixHex(primary, '#ffffff', 0.5));
    root.style.setProperty('--color-primary-300', mixHex(primary, '#ffffff', 0.3));
    root.style.setProperty('--color-primary-400', mixHex(primary, '#ffffff', 0.15));
    root.style.setProperty('--color-primary-500', primary);
    root.style.setProperty('--color-primary-600', mixHex(primary, '#000000', 0.1));
    root.style.setProperty('--color-primary-700', mixHex(primary, '#000000', 0.2));
    root.style.setProperty('--color-primary-800', mixHex(primary, '#000000', 0.3));
    root.style.setProperty('--color-primary-900', mixHex(primary, '#000000', 0.4));

    // Neutral color scale - FIXED for light backgrounds (dark text)
    // These stay consistent regardless of theme for proper contrast
    root.style.setProperty('--color-neutral-50', '#fafafa');
    root.style.setProperty('--color-neutral-100', '#f5f5f5');
    root.style.setProperty('--color-neutral-200', '#e5e5e5');
    root.style.setProperty('--color-neutral-300', '#d4d4d4');
    root.style.setProperty('--color-neutral-400', '#a3a3a3');
    root.style.setProperty('--color-neutral-500', '#737373');
    root.style.setProperty('--color-neutral-600', '#525252');
    root.style.setProperty('--color-neutral-700', '#404040');
    root.style.setProperty('--color-neutral-800', '#262626');
    root.style.setProperty('--color-neutral-900', '#171717');

    // Direct theme tokens (for optional use)
    root.style.setProperty('--theme-bg', '#fafafa');
    root.style.setProperty('--theme-surface', '#ffffff');
    root.style.setProperty('--theme-border', '#e5e5e5');
    root.style.setProperty('--theme-text', '#171717');
    root.style.setProperty('--theme-muted', '#737373');
    root.style.setProperty('--theme-primary', primary);
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig>(emptyConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/system/config');
                if (response.data.success) {
                    const mergedConfig = { ...emptyConfig, ...response.data.data };
                    setConfig(mergedConfig);
                    document.title = mergedConfig['site.name'] || 'Store';

                    // Apply theme CSS variables
                    applyThemeToRoot(mergedConfig);
                }
            } catch (error) {
                console.error('Failed to load system config', error);
                setIsError(true);
                // Apply default theme on error
                applyThemeToRoot(emptyConfig);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, isLoading, isError }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);

