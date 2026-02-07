export type AdminNavLayout = 'sidebar' | 'topbar';
export type AdminDensity = 'comfortable' | 'compact';

export interface AdminThemeTokens {
    bg: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
    primary: string;
    primaryText: string;
    sidebarBg: string;
    sidebarText: string;
    sidebarActiveBg: string;
    sidebarActiveText: string;
}

export interface AdminThemeLayout {
    nav: AdminNavLayout;
    density: AdminDensity;
    sidebarWidth: number;
}

export interface AdminThemePreset {
    id: string;
    name: string;
    tokens: AdminThemeTokens;
    layout: AdminThemeLayout;
}

export interface AdminThemeState {
    presetId: string;
    tokensOverride: Partial<AdminThemeTokens>;
    layoutOverride: Partial<AdminThemeLayout>;
}

export const ADMIN_THEME_STORAGE_KEY = 'admin_theme_v1';

export const ADMIN_THEME_PRESETS: AdminThemePreset[] = [
    {
        id: 'midnight',
        name: 'Midnight Indigo',
        tokens: {
            bg: '#0b1020',
            surface: '#0f1730',
            border: '#1e2a4a',
            text: '#e8eeff',
            muted: '#a6b3d6',
            primary: '#5b8cff',
            primaryText: '#0b1020',
            sidebarBg: '#070b16',
            sidebarText: '#cbd6ff',
            sidebarActiveBg: '#5b8cff',
            sidebarActiveText: '#0b1020',
        },
        layout: { nav: 'sidebar', density: 'comfortable', sidebarWidth: 264 },
    },
    {
        id: 'ocean',
        name: 'Ocean Teal',
        tokens: {
            bg: '#f6fbfc',
            surface: '#ffffff',
            border: '#e5eef0',
            text: '#0b1f24',
            muted: '#5b6b70',
            primary: '#0ea5a8',
            primaryText: '#062427',
            sidebarBg: '#062427',
            sidebarText: '#d9f6f6',
            sidebarActiveBg: '#0ea5a8',
            sidebarActiveText: '#062427',
        },
        layout: { nav: 'sidebar', density: 'comfortable', sidebarWidth: 256 },
    },
    {
        id: 'rose',
        name: 'Rose Quartz',
        tokens: {
            bg: '#fff7fb',
            surface: '#ffffff',
            border: '#f1dbe8',
            text: '#2a0f1d',
            muted: '#6e4a5a',
            primary: '#e11d7c',
            primaryText: '#ffffff',
            sidebarBg: '#2a0f1d',
            sidebarText: '#ffe3f2',
            sidebarActiveBg: '#e11d7c',
            sidebarActiveText: '#ffffff',
        },
        layout: { nav: 'sidebar', density: 'compact', sidebarWidth: 248 },
    },
    {
        id: 'citrus',
        name: 'Citrus Lime',
        tokens: {
            bg: '#f7fff2',
            surface: '#ffffff',
            border: '#e3f2d7',
            text: '#14210a',
            muted: '#5b6f4e',
            primary: '#65a30d',
            primaryText: '#0f1c08',
            sidebarBg: '#0f1c08',
            sidebarText: '#e9ffd6',
            sidebarActiveBg: '#65a30d',
            sidebarActiveText: '#0f1c08',
        },
        layout: { nav: 'sidebar', density: 'comfortable', sidebarWidth: 256 },
    },
    {
        id: 'sunset',
        name: 'Sunset Orange',
        tokens: {
            bg: '#fff8f2',
            surface: '#ffffff',
            border: '#f3e1d6',
            text: '#2a140b',
            muted: '#7a5a4a',
            primary: '#f97316',
            primaryText: '#2a140b',
            sidebarBg: '#2a140b',
            sidebarText: '#ffe7db',
            sidebarActiveBg: '#f97316',
            sidebarActiveText: '#2a140b',
        },
        layout: { nav: 'sidebar', density: 'compact', sidebarWidth: 252 },
    },
    {
        id: 'lavender',
        name: 'Lavender Mist',
        tokens: {
            bg: '#fbfaff',
            surface: '#ffffff',
            border: '#e8e4ff',
            text: '#1b1630',
            muted: '#615a8a',
            primary: '#7c3aed',
            primaryText: '#ffffff',
            sidebarBg: '#1b1630',
            sidebarText: '#efe9ff',
            sidebarActiveBg: '#7c3aed',
            sidebarActiveText: '#ffffff',
        },
        layout: { nav: 'topbar', density: 'comfortable', sidebarWidth: 0 },
    },
    {
        id: 'mono',
        name: 'Monochrome',
        tokens: {
            bg: '#f7f7f7',
            surface: '#ffffff',
            border: '#e5e5e5',
            text: '#111111',
            muted: '#5f5f5f',
            primary: '#111111',
            primaryText: '#ffffff',
            sidebarBg: '#111111',
            sidebarText: '#eaeaea',
            sidebarActiveBg: '#ffffff',
            sidebarActiveText: '#111111',
        },
        layout: { nav: 'sidebar', density: 'comfortable', sidebarWidth: 260 },
    },
    {
        id: 'aurora',
        name: 'Aurora',
        tokens: {
            bg: '#07131f',
            surface: '#0a1b2c',
            border: '#12314a',
            text: '#e6f6ff',
            muted: '#9ab8cc',
            primary: '#22c55e',
            primaryText: '#061109',
            sidebarBg: '#061109',
            sidebarText: '#d6ffe4',
            sidebarActiveBg: '#22c55e',
            sidebarActiveText: '#061109',
        },
        layout: { nav: 'topbar', density: 'compact', sidebarWidth: 0 },
    },
    {
        id: 'sand',
        name: 'Desert Sand',
        tokens: {
            bg: '#fffaf2',
            surface: '#ffffff',
            border: '#efe3cf',
            text: '#2a1e0f',
            muted: '#7a6850',
            primary: '#b45309',
            primaryText: '#fffaf2',
            sidebarBg: '#2a1e0f',
            sidebarText: '#ffe9c8',
            sidebarActiveBg: '#b45309',
            sidebarActiveText: '#fffaf2',
        },
        layout: { nav: 'sidebar', density: 'comfortable', sidebarWidth: 256 },
    },
    {
        id: 'ice',
        name: 'Arctic Ice',
        tokens: {
            bg: '#f4fbff',
            surface: '#ffffff',
            border: '#d7eefc',
            text: '#0b1b2a',
            muted: '#476177',
            primary: '#0284c7',
            primaryText: '#062032',
            sidebarBg: '#062032',
            sidebarText: '#d7f3ff',
            sidebarActiveBg: '#0284c7',
            sidebarActiveText: '#062032',
        },
        layout: { nav: 'topbar', density: 'comfortable', sidebarWidth: 0 },
    },
];

export const DEFAULT_ADMIN_THEME_STATE: AdminThemeState = {
    presetId: 'ocean',
    tokensOverride: {},
    layoutOverride: {},
};

export const resolveAdminTheme = (state: AdminThemeState) => {
    const preset = ADMIN_THEME_PRESETS.find((p) => p.id === state.presetId) || ADMIN_THEME_PRESETS[0];
    return {
        preset,
        tokens: { ...preset.tokens, ...state.tokensOverride },
        layout: { ...preset.layout, ...state.layoutOverride },
    };
};
