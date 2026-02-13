import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

type Theme = 'light' | 'dark';
type GradientTarget = 'buttons' | 'backgrounds' | 'text' | 'all';

export interface ThemeConfig {
    preset_id: string;
    primary: string;
    secondary: string;
    accent: string;
    bg?: string;
    surface?: string;
    border?: string;
    text?: string;
    muted?: string;
    neutral?: string;
}

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    activeTheme: ThemeConfig;
    refreshTheme: () => Promise<void>;
    gradientTargets: GradientTarget[];
    toggleGradientTarget: (target: GradientTarget) => void;
    isGradientActive: (target: GradientTarget) => boolean;
    activePreset: ThemeConfig;
    setPreset: (presetId: string) => void;
    presets: ThemeConfig[];
}

const defaultTheme: ThemeConfig = {
    preset_id: 'gold-rush',
    primary: '#d4af37',
    secondary: '#1a1a1a',
    accent: '#ffffff',
    bg: '#fcfcfc',
    surface: '#ffffff',
    border: '#f3f4f6',
    text: '#1a1a1a',
    muted: '#9ca3af',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'light';
    });

    const [activeTheme, setActiveTheme] = useState<ThemeConfig>(defaultTheme);
    const [gradientTargets, setGradientTargets] = useState<GradientTarget[]>(() => {
        const saved = localStorage.getItem('theme-gradient-targets');
        return saved ? JSON.parse(saved) : [];
    });

    const refreshTheme = async () => {
        try {
            const response = await axios.get('/api/v1/context', {
                headers: {
                    'X-Currency': localStorage.getItem('currency') || 'USD',
                    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });

            if (response.data?.theme) {
                setActiveTheme(response.data.theme);
            }
        } catch (error) {
            console.error('Failed to fetch theme context:', error);
        }
    };

    const presets: ThemeConfig[] = [
        {
            preset_id: 'gold-rush',
            primary: '#d4af37',
            secondary: '#1a1a1a',
            accent: '#ffffff',
            bg: '#fcfcfc',
            surface: '#ffffff',
            border: '#f3f4f6',
            text: '#1a1a1a',
            muted: '#9ca3af',
            neutral: '#f3f4f6'
        },
        {
            preset_id: 'rose',
            primary: '#e11d7c',
            secondary: '#1a1a1a',
            accent: '#ffffff',
            bg: '#fff7fb',
            surface: '#ffffff',
            border: '#f1dbe8',
            text: '#2a0f1d',
            muted: '#6e4a5a',
            neutral: '#fcebf4'
        },
        {
            preset_id: 'midnight',
            primary: '#6366f1',
            secondary: '#0f172a',
            accent: '#1e293b',
            bg: '#020617',
            surface: '#0f172a',
            border: '#1e293b',
            text: '#f8fafc',
            muted: '#94a3b8',
            neutral: '#1e293b'
        },
        {
            preset_id: 'ocean',
            primary: '#0ea5e9',
            secondary: '#0c4a6e',
            accent: '#f0f9ff',
            bg: '#f0f9ff',
            surface: '#ffffff',
            border: '#bae6fd',
            text: '#0c4a6e',
            muted: '#64748b',
            neutral: '#e0f2fe'
        }
    ];

    const setPreset = (presetId: string) => {
        const selected = presets.find(p => p.preset_id === presetId);
        if (selected) {
            setActiveTheme(selected);
            // Optionally save to API
        }
    };

    // Initial Fetch
    useEffect(() => {
        refreshTheme();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;

        // Dark/Light Class
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Clean old gradient classes
        const gradientClasses = ['style-gradient-buttons', 'style-gradient-backgrounds', 'style-gradient-text', 'style-gradient-all'];
        root.classList.remove(...gradientClasses);

        // Add active gradient classes
        gradientTargets.forEach(target => {
            root.classList.add(`style-gradient-${target}`);
        });

        // 1. Convert HEX to HSL for variable manipulation
        const hexToHsl = (hex: string) => {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt('0x' + hex[1] + hex[1]);
                g = parseInt('0x' + hex[2] + hex[2]);
                b = parseInt('0x' + hex[3] + hex[3]);
            } else if (hex.length === 7) {
                r = parseInt('0x' + hex[1] + hex[2]);
                g = parseInt('0x' + hex[3] + hex[4]);
                b = parseInt('0x' + hex[5] + hex[6]);
            }
            r /= 255; g /= 255; b /= 255;
            const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
            let h = 0, s = 0, l = 0;

            if (delta === 0) h = 0;
            else if (cmax === r) h = ((g - b) / delta) % 6;
            else if (cmax === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;

            h = Math.round(h * 60);
            if (h < 0) h += 360;
            l = (cmax + cmin) / 2;
            s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            s = +(s * 100).toFixed(1);
            l = +(l * 100).toFixed(1);

            return { h, s, l };
        };

        const setHslVars = (name: string, hex: string) => {
            const { h, s, l } = hexToHsl(hex);
            root.style.setProperty(`--${name}-h`, `${h}`);
            root.style.setProperty(`--${name}-s`, `${s}%`);
            root.style.setProperty(`--${name}-l`, `${l}%`);
            root.style.setProperty(`--${name}`, hex);
        };

        // Inject Core Colors
        setHslVars('primary', activeTheme.primary);
        setHslVars('secondary', activeTheme.secondary);
        root.style.setProperty('--accent', activeTheme.accent);

        if (activeTheme.neutral) root.style.setProperty('--neutral', activeTheme.neutral);

        // Inject Extended Colors ONLY if NOT in Dark Mode (or if user wants to override)
        // If Dark Mode is active, we rely on index.css defaults for bg/surface/text
        // UNLESS the preset specifically defines dark mode colors (which we don't have yet)
        if (theme === 'light') {
            if (activeTheme.bg) root.style.setProperty('--bg-main', activeTheme.bg);
            if (activeTheme.surface) root.style.setProperty('--bg-surface', activeTheme.surface);
            if (activeTheme.border) root.style.setProperty('--border', activeTheme.border);
            if (activeTheme.text) root.style.setProperty('--text-main', activeTheme.text);
            if (activeTheme.muted) root.style.setProperty('--text-muted', activeTheme.muted);
        } else {
            // Clean up inline styles so CSS classes take over
            root.style.removeProperty('--bg-main');
            root.style.removeProperty('--bg-surface');
            root.style.removeProperty('--border');
            root.style.removeProperty('--text-main');
            root.style.removeProperty('--text-muted');
        }

        // Generate dynamic tints
        root.style.setProperty('--primary-light', `color-mix(in srgb, var(--primary), transparent 90%)`);
        root.style.setProperty('--primary-glow', `color-mix(in srgb, var(--primary), transparent 80%)`);

        localStorage.setItem('theme', theme);
        localStorage.setItem('theme-gradient-targets', JSON.stringify(gradientTargets));
    }, [theme, gradientTargets, activeTheme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const toggleGradientTarget = (target: GradientTarget) => {
        setGradientTargets(prev => {
            if (target === 'all') {
                return prev.includes('all') ? [] : ['all', 'buttons', 'backgrounds', 'text'];
            }
            const filtered = prev.filter(t => t !== 'all');
            if (filtered.includes(target)) {
                return filtered.filter(t => t !== target);
            } else {
                return [...filtered, target];
            }
        });
    };

    const isGradientActive = (target: GradientTarget) => gradientTargets.includes(target);

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme, setTheme,
            activeTheme, refreshTheme,
            gradientTargets, toggleGradientTarget, isGradientActive,
            activePreset: activeTheme, // Alias for Settings
            setPreset,
            presets
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
