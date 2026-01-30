import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ADMIN_THEME_PRESETS,
    ADMIN_THEME_STORAGE_KEY,
    DEFAULT_ADMIN_THEME_STATE,
    resolveAdminTheme,
    type AdminThemeLayout,
    type AdminThemeState,
    type AdminThemeTokens,
} from './themes';

interface AdminThemeContextValue {
    state: AdminThemeState;
    setPresetId: (presetId: string) => void;
    updateTokens: (patch: Partial<AdminThemeTokens>) => void;
    updateLayout: (patch: Partial<AdminThemeLayout>) => void;
    clearOverrides: () => void;
    resetTheme: () => void;
}

const AdminThemeContext = React.createContext<AdminThemeContextValue | null>(null);

const hexToRgb = (hex: string) => {
    const cleaned = hex.replace('#', '').trim();
    const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
    const num = Number.parseInt(full, 16);
    if (Number.isNaN(num) || full.length !== 6) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const mixHex = (a: string, b: string, t: number) => {
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    if (!ra || !rb) return a;
    const k = clamp01(t);
    const r = Math.round(ra.r + (rb.r - ra.r) * k);
    const g = Math.round(ra.g + (rb.g - ra.g) * k);
    const b2 = Math.round(ra.b + (rb.b - ra.b) * k);
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b2)}`;
};

const safeParseThemeState = (raw: string | null): AdminThemeState | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Partial<AdminThemeState>;
        if (!parsed || typeof parsed !== 'object') return null;
        if (!parsed.presetId || typeof parsed.presetId !== 'string') return null;
        return {
            presetId: parsed.presetId,
            tokensOverride: (parsed.tokensOverride && typeof parsed.tokensOverride === 'object') ? parsed.tokensOverride : {},
            layoutOverride: (parsed.layoutOverride && typeof parsed.layoutOverride === 'object') ? parsed.layoutOverride : {},
        };
    } catch {
        return null;
    }
};

export const useAdminTheme = () => {
    const ctx = React.useContext(AdminThemeContext);
    const fallbackState = DEFAULT_ADMIN_THEME_STATE;
    const resolvedFallback = resolveAdminTheme(fallbackState);

    if (!ctx) {
        return {
            ...resolvedFallback,
            presets: ADMIN_THEME_PRESETS,
            state: fallbackState,
            setPresetId: () => undefined,
            updateTokens: () => undefined,
            updateLayout: () => undefined,
            clearOverrides: () => undefined,
            resetTheme: () => undefined,
        };
    }

    const resolved = resolveAdminTheme(ctx.state);
    return {
        presets: ADMIN_THEME_PRESETS,
        preset: resolved.preset,
        tokens: resolved.tokens,
        layout: resolved.layout,
        state: ctx.state,
        setPresetId: ctx.setPresetId,
        updateTokens: ctx.updateTokens,
        updateLayout: ctx.updateLayout,
        clearOverrides: ctx.clearOverrides,
        resetTheme: ctx.resetTheme,
    };
};

interface AdminThemeProviderProps {
    children: React.ReactNode;
}

const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
    const [state, setState] = useState<AdminThemeState>(() => {
        const parsed = safeParseThemeState(localStorage.getItem(ADMIN_THEME_STORAGE_KEY));
        return parsed || DEFAULT_ADMIN_THEME_STATE;
    });

    useEffect(() => {
        localStorage.setItem(ADMIN_THEME_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const setPresetId = useCallback((presetId: string) => {
        setState((prev) => ({ ...prev, presetId }));
    }, []);

    const updateTokens = useCallback((patch: Partial<AdminThemeTokens>) => {
        setState((prev) => ({
            ...prev,
            tokensOverride: { ...prev.tokensOverride, ...patch },
        }));
    }, []);

    const updateLayout = useCallback((patch: Partial<AdminThemeLayout>) => {
        setState((prev) => ({
            ...prev,
            layoutOverride: { ...prev.layoutOverride, ...patch },
        }));
    }, []);

    const clearOverrides = useCallback(() => {
        setState((prev) => ({ ...prev, tokensOverride: {}, layoutOverride: {} }));
    }, []);

    const resetTheme = useCallback(() => {
        setState(DEFAULT_ADMIN_THEME_STATE);
    }, []);

    const { preset, tokens, layout } = useMemo(() => resolveAdminTheme(state), [state]);

    const primary700 = useMemo(() => mixHex(tokens.primary, '#000000', 0.2), [tokens.primary]);
    const primary900 = useMemo(() => mixHex(tokens.primary, '#000000', 0.4), [tokens.primary]);
    const primary100 = useMemo(() => mixHex(tokens.primary, '#ffffff', 0.75), [tokens.primary]);
    const primary50 = useMemo(() => mixHex(tokens.primary, '#ffffff', 0.9), [tokens.primary]);

    const styleVars = useMemo((): React.CSSProperties => {
        return {
            ['--admin-bg' as any]: tokens.bg,
            ['--admin-surface' as any]: tokens.surface,
            ['--admin-border' as any]: tokens.border,
            ['--admin-text' as any]: tokens.text,
            ['--admin-muted' as any]: tokens.muted,
            ['--admin-primary' as any]: tokens.primary,
            ['--admin-primary-text' as any]: tokens.primaryText,
            ['--admin-sidebar-bg' as any]: tokens.sidebarBg,
            ['--admin-sidebar-text' as any]: tokens.sidebarText,
            ['--admin-sidebar-active-bg' as any]: tokens.sidebarActiveBg,
            ['--admin-sidebar-active-text' as any]: tokens.sidebarActiveText,
            ['--admin-sidebar-width' as any]: `${layout.sidebarWidth}px`,

            ['--color-primary-50' as any]: primary50,
            ['--color-primary-100' as any]: primary100,
            ['--color-primary-500' as any]: tokens.primary,
            ['--color-primary-700' as any]: primary700,
            ['--color-primary-900' as any]: primary900,

            ['--color-neutral-50' as any]: tokens.bg,
            ['--color-neutral-100' as any]: mixHex(tokens.bg, tokens.surface, 0.7),
            ['--color-neutral-200' as any]: tokens.border,
            ['--color-neutral-300' as any]: mixHex(tokens.border, tokens.text, 0.15),
            ['--color-neutral-400' as any]: mixHex(tokens.muted, tokens.text, 0.15),
            ['--color-neutral-500' as any]: tokens.muted,
            ['--color-neutral-600' as any]: tokens.muted,
            ['--color-neutral-700' as any]: mixHex(tokens.text, '#000000', 0.15),
            ['--color-neutral-800' as any]: mixHex(tokens.text, '#000000', 0.05),
            ['--color-neutral-900' as any]: tokens.text,
        };
    }, [layout.sidebarWidth, primary100, primary50, primary700, primary900, tokens]);

    const value = useMemo<AdminThemeContextValue>(() => {
        return {
            state,
            setPresetId,
            updateTokens,
            updateLayout,
            clearOverrides,
            resetTheme,
        };
    }, [clearOverrides, resetTheme, setPresetId, state, updateLayout, updateTokens]);

    return (
        <AdminThemeContext.Provider value={value}>
            <div data-admin-theme={preset.id} style={styleVars}>
                {children}
            </div>
        </AdminThemeContext.Provider>
    );
};

export default AdminThemeProvider;
