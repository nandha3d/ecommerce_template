import React, { useState, useEffect } from 'react';
import { Palette, Store, Loader2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Button, Card } from '../../../components/ui';
import { useAdminTheme } from '../theme/AdminThemeProvider';
import { useStoreLayoutSettings } from '../../../storeLayout/StoreLayoutProvider';
import type { LayoutVariant } from '../../../storeLayout/storeLayoutSettings';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

// --- Theme Components ---

const ColorField: React.FC<{
    label: string;
    value: string;
    onChange: (next: string) => void;
}> = ({ label, value, onChange }) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <p className="font-medium text-neutral-900 truncate">{label}</p>
                <p className="text-xs text-neutral-500 truncate">{value}</p>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-neutral-200 bg-white"
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-28 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                />
            </div>
        </div>
    );
};

const ThemeSettingsContent: React.FC = () => {
    const {
        presets,
        preset,
        state,
        tokens,
        layout,
        setPresetId,
        updateTokens,
        updateLayout,
        clearOverrides,
        resetTheme,
    } = useAdminTheme();

    const { settings, setHome, setProductDetail, setCart, setCheckout, reset } = useStoreLayoutSettings();

    const [isSaving, setIsSaving] = useState(false);

    const variantOptions: LayoutVariant[] = [1, 2, 3, 4, 5];

    const applyToStore = async () => {
        setIsSaving(true);
        try {
            await api.put('/admin/theme', {
                preset_id: state.presetId,
                primary: tokens.primary,
                bg: tokens.bg,
                surface: tokens.surface,
                border: tokens.border,
                text: tokens.text,
                muted: tokens.muted,
            });
            toast.success('Theme applied to storefront!');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save theme');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-primary-900">Store Appearance</h1>
                    <p className="text-neutral-600">Customize theme colors and apply to storefront.</p>
                </div>
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={clearOverrides}>Clear Overrides</Button>
                    <Button variant="danger" onClick={resetTheme}>Reset</Button>
                    <Button
                        variant="primary"
                        onClick={applyToStore}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Store className="w-4 h-4" />
                        )}
                        Apply to Store
                    </Button>
                </div>
            </div>

            <Card className="p-0" hover={false}>
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Store Layout Variants</h2>
                        <p className="text-sm text-neutral-500">Select which layout is used on the storefront pages</p>
                    </div>
                    <Button variant="outline" onClick={reset}>Reset Layouts</Button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="font-medium text-neutral-900">Home Page</p>
                        <select
                            value={settings.home}
                            onChange={(e) => setHome(Number(e.target.value) as LayoutVariant)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                        >
                            {variantOptions.map(v => (
                                <option key={v} value={v}>Layout {v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-neutral-900">Product Detail Page</p>
                        <select
                            value={settings.productDetail}
                            onChange={(e) => setProductDetail(Number(e.target.value) as LayoutVariant)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                        >
                            {variantOptions.map(v => (
                                <option key={v} value={v}>Layout {v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-neutral-900">Cart Page</p>
                        <select
                            value={settings.cart}
                            onChange={(e) => setCart(Number(e.target.value) as LayoutVariant)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                        >
                            {variantOptions.map(v => (
                                <option key={v} value={v}>Layout {v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-neutral-900">Checkout Page</p>
                        <select
                            value={settings.checkout}
                            onChange={(e) => setCheckout(Number(e.target.value) as LayoutVariant)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                        >
                            {variantOptions.map(v => (
                                <option key={v} value={v}>Layout {v}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="p-0" hover={false}>
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-neutral-900">Theme Presets</h2>
                    </div>
                    <p className="text-sm text-neutral-500">Selected: <span className="font-medium text-neutral-700">{preset.name}</span></p>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presets.map((p) => {
                        const active = p.id === state.presetId;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setPresetId(p.id)}
                                className={`text-left rounded-xl border p-4 transition-all ${active ? 'border-primary-500 ring-2 ring-primary-100' : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                                style={{ background: 'var(--admin-surface)' }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-neutral-900 truncate">{p.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full" style={{ background: p.tokens.primary }} />
                                        <span className="w-4 h-4 rounded-full" style={{ background: p.tokens.sidebarBg }} />
                                        <span className="w-4 h-4 rounded-full" style={{ background: p.tokens.bg }} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card hover={false}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-neutral-900">Color Overrides</h2>
                        <p className="text-sm text-neutral-500">Overrides apply on top of the preset</p>
                    </div>

                    <div className="space-y-4">
                        <ColorField label="Background" value={tokens.bg} onChange={(v) => updateTokens({ bg: v })} />
                        <ColorField label="Surface" value={tokens.surface} onChange={(v) => updateTokens({ surface: v })} />
                        <ColorField label="Border" value={tokens.border} onChange={(v) => updateTokens({ border: v })} />
                        <ColorField label="Text" value={tokens.text} onChange={(v) => updateTokens({ text: v })} />
                        <ColorField label="Muted" value={tokens.muted} onChange={(v) => updateTokens({ muted: v })} />
                        <div className="border-t border-neutral-100 pt-4" />
                        <ColorField label="Primary" value={tokens.primary} onChange={(v) => updateTokens({ primary: v })} />
                        <ColorField label="Primary Text" value={tokens.primaryText} onChange={(v) => updateTokens({ primaryText: v })} />
                        <div className="border-t border-neutral-100 pt-4" />
                        <ColorField label="Sidebar BG" value={tokens.sidebarBg} onChange={(v) => updateTokens({ sidebarBg: v })} />
                        <ColorField label="Sidebar Text" value={tokens.sidebarText} onChange={(v) => updateTokens({ sidebarText: v })} />
                        <ColorField label="Sidebar Active BG" value={tokens.sidebarActiveBg} onChange={(v) => updateTokens({ sidebarActiveBg: v })} />
                        <ColorField label="Sidebar Active Text" value={tokens.sidebarActiveText} onChange={(v) => updateTokens({ sidebarActiveText: v })} />
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-neutral-900">Layout</h2>
                        <p className="text-sm text-neutral-500">Change navigation placement & spacing</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-neutral-900">Navigation</p>
                                <p className="text-sm text-neutral-500">Sidebar or Topbar</p>
                            </div>
                            <select
                                value={layout.nav}
                                onChange={(e) => updateLayout({ nav: e.target.value as any })}
                                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                            >
                                <option value="sidebar">Sidebar</option>
                                <option value="topbar">Topbar</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-neutral-900">Density</p>
                                <p className="text-sm text-neutral-500">Comfortable or Compact</p>
                            </div>
                            <select
                                value={layout.density}
                                onChange={(e) => updateLayout({ density: e.target.value as any })}
                                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                            >
                                <option value="comfortable">Comfortable</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-neutral-900">Sidebar Width</p>
                                <p className="text-sm text-neutral-500">{layout.sidebarWidth}px</p>
                            </div>
                            <input
                                type="range"
                                min={220}
                                max={320}
                                value={layout.sidebarWidth}
                                onChange={(e) => updateLayout({ sidebarWidth: Number(e.target.value) })}
                                className="w-40"
                                disabled={layout.nav !== 'sidebar'}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- Shipping Component ---

const ShippingSettingsContent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [channelId, setChannelId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await shippingService.updateConfig({ email, password, channel_id: channelId, pickup_location: pickupLocation });
            toast.success('Shipping configuration saved!');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save configuration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTest = async () => {
        setIsTesting(true);
        try {
            const res = await shippingService.testConnection();
            toast.success(res.message);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Connection failed');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-xl font-bold text-neutral-900">Shiprocket Configuration</h2>
                <p className="text-neutral-600">Enter your Shiprocket API credentials to enable automated shipping.</p>
            </div>

            <Card hover={false}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">Account Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                            placeholder="your-email@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">Account Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">Custom Channel ID (Optional)</label>
                        <input
                            type="text"
                            value={channelId}
                            onChange={e => setChannelId(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                            placeholder="e.g. 12345"
                        />
                        <p className="text-xs text-neutral-500">Found in Shiprocket: Channels -{'>'} Channel ID</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900">Pickup Location ID (Optional)</label>
                        <input
                            type="text"
                            value={pickupLocation}
                            onChange={e => setPickupLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                            placeholder="Primary"
                        />
                        <p className="text-xs text-neutral-500">The exact name of your pickup location in Shiprocket.</p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                        <Button type="submit" variant="primary" isLoading={isLoading}>Save Configuration</Button>
                        <Button type="button" variant="outline" onClick={handleTest} isLoading={isTesting}>Test Connection</Button>
                    </div>
                </form>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orders will be synced to Shiprocket when marked as "Processing".</li>
                    <li>Tracking numbers will be auto-generated.</li>
                    <li>Address availability checks are performed at checkout (if enabled).</li>
                </ul>
            </div>
        </div>
    );
};

// --- Globalization Component ---

import { shippingService } from '../../../services/shipping.service';
import { Globe, DollarSign, Clock, Check, X, Trash2, Search } from 'lucide-react';

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    symbol_position: 'before' | 'after';
    decimal_places: number;
    exchange_rate: string;
    is_default: boolean;
    is_base: boolean;
    is_active: boolean;
}

interface Timezone {
    id: number;
    identifier: string;
    label: string;
    offset: string;
    is_active: boolean;
    is_default: boolean;
}

const COMMON_SYMBOLS: Record<string, string> = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
    'CAD': '$', 'AUD': '$', 'CNY': '¥', 'KRW': '₩', 'BRL': 'R$',
    'RUB': '₽', 'TRY': '₺', 'ZAR': 'R', 'HKD': '$', 'SGD': '$',
    'NZD': '$', 'MXN': '$'
};

const GlobalizationSettingsContent: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [timezones, setTimezones] = useState<Timezone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Available currencies from external API
    const [availableCurrencies, setAvailableCurrencies] = useState<Record<string, string>>({});
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);

    const [isAddingCurrency, setIsAddingCurrency] = useState(false);
    const [isAddingTimezone, setIsAddingTimezone] = useState(false);

    // New Currency State
    const [newCurrency, setNewCurrency] = useState({
        code: '', name: '', symbol: '', symbol_position: 'before',
        decimal_places: 2, exchange_rate: '', is_active: true
    });

    // New Timezone State
    const [newTimezone, setNewTimezone] = useState({
        identifier: '', label: '', offset: '', is_active: true
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [currRes, tzRes] = await Promise.all([
                api.get('/admin/currencies'),
                api.get('/admin/timezones')
            ]);
            setCurrencies(currRes.data.data || []);
            setTimezones(tzRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load globalization settings');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableCurrencies = async () => {
        setIsLoadingAvailable(true);
        try {
            // Using Frankfurter API which is free and open
            const res = await axios.get('https://api.frankfurter.app/currencies');
            setAvailableCurrencies(res.data);
        } catch (error) {
            console.error("Failed to fetch available currencies", error);
            // Fallback could be added here if needed
        } finally {
            setIsLoadingAvailable(false);
        }
    };

    React.useEffect(() => {
        fetchData();
        fetchAvailableCurrencies();
    }, []);

    const handleCurrencySelect = (code: string) => {
        if (!code) return;
        const name = availableCurrencies[code] || '';
        // Auto-fill symbol if known, else default to Code if not found, or empty
        const symbol = COMMON_SYMBOLS[code] || '';

        setNewCurrency(prev => ({
            ...prev,
            code,
            name,
            symbol: symbol || prev.symbol // Keep existing if mapped one isn't found
        }));
    };

    const handleCreateCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCurrency.code) {
            toast.error('Please select a currency');
            return;
        }

        try {
            await api.post('/admin/currencies', newCurrency);
            toast.success('Currency created successfully');
            setIsAddingCurrency(false);
            setNewCurrency({
                code: '', name: '', symbol: '', symbol_position: 'before',
                decimal_places: 2, exchange_rate: '', is_active: true
            });
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to create currency');
        }
    };

    const handleDeleteCurrency = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this currency?')) return;
        try {
            await api.delete(`/admin/currencies/${id}`);
            toast.success('Currency deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to delete currency');
        }
    };

    const handleCreateTimezone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/timezones', newTimezone);
            toast.success('Timezone created successfully');
            setIsAddingTimezone(false);
            setNewTimezone({ identifier: '', label: '', offset: '', is_active: true });
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to create timezone');
        }
    };

    const handleDeleteTimezone = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this timezone?')) return;
        try {
            await api.delete(`/admin/timezones/${id}`);
            toast.success('Timezone deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to delete timezone');
        }
    };

    // Toggles and Defaults
    const toggleCurrencyActive = async (id: number) => {
        try { await api.post(`/admin/currencies/${id}/toggle`); toast.success('Status updated'); fetchData(); }
        catch (error: any) { toast.error(error?.response?.data?.error || 'Failed to update'); }
    };
    const setCurrencyDefault = async (id: number) => {
        try { await api.post(`/admin/currencies/${id}/default`); toast.success('Default updated'); fetchData(); }
        catch (error: any) { toast.error(error?.response?.data?.error || 'Failed to update'); }
    };
    const toggleTimezoneActive = async (id: number) => {
        try { await api.post(`/admin/timezones/${id}/toggle`); toast.success('Status updated'); fetchData(); }
        catch (error: any) { toast.error(error?.response?.data?.error || 'Failed to update'); }
    };
    const setTimezoneDefault = async (id: number) => {
        try { await api.post(`/admin/timezones/${id}/default`); toast.success('Default updated'); fetchData(); }
        catch (error: any) { toast.error(error?.response?.data?.error || 'Failed to update'); }
    };

    if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-primary-900">Globalization Settings</h1>
                <p className="text-neutral-600">Manage currencies and timezones for your store.</p>
            </div>

            {/* Currencies Section */}
            <Card className="p-0 overflow-hidden" hover={false}>
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-neutral-900">Currencies</h2>
                    </div>
                    <Button size="sm" onClick={() => setIsAddingCurrency(!isAddingCurrency)}>
                        {isAddingCurrency ? 'Cancel' : 'Add Currency'}
                    </Button>
                </div>

                {isAddingCurrency && (
                    <div className="p-6 bg-primary-50 border-b border-primary-100 animate-fade-in">
                        <h3 className="font-semibold text-primary-900 mb-4">Add New Currency</h3>
                        <form onSubmit={handleCreateCurrency} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Currency Selection Dropdown */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-neutral-500">Currency</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                                    value={newCurrency.code}
                                    onChange={(e) => handleCurrencySelect(e.target.value)}
                                    required
                                >
                                    <option value="">Select Currency...</option>
                                    {isLoadingAvailable ? (
                                        <option disabled>Loading...</option>
                                    ) : (
                                        Object.entries(availableCurrencies).map(([code, name]) => (
                                            <option key={code} value={code}>
                                                {code} - {name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-neutral-500">Display Name</label>
                                <input
                                    placeholder="e.g. United States Dollar"
                                    value={newCurrency.name}
                                    onChange={e => setNewCurrency({ ...newCurrency, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs font-semibold uppercase text-neutral-500">Symbol</label>
                                    <input
                                        placeholder="e.g. $"
                                        value={newCurrency.symbol}
                                        onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs font-semibold uppercase text-neutral-500">Position</label>
                                    <select
                                        value={newCurrency.symbol_position}
                                        onChange={e => setNewCurrency({ ...newCurrency, symbol_position: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                                    >
                                        <option value="before">Before ($10)</option>
                                        <option value="after">After (10$)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-neutral-500">Exchange Rate (vs Base)</label>
                                <input
                                    placeholder="Enter 1.0 for Base"
                                    type="number"
                                    step="0.00000001"
                                    value={newCurrency.exchange_rate}
                                    onChange={e => setNewCurrency({ ...newCurrency, exchange_rate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                                    required
                                />
                                <p className="text-xs text-neutral-400 mt-1">Rates can be auto-updated via CRON later.</p>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <Button type="submit" variant="primary" className="w-full md:w-auto">Create Currency</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-neutral-100">
                    {currencies.map((currency) => (
                        <div key={currency.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-100 shadow-sm flex items-center justify-center text-lg font-bold text-primary-600">
                                    {currency.symbol}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-neutral-900">{currency.code}</span>
                                        {currency.is_base && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Base</span>}
                                        {currency.is_default && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Default</span>}
                                    </div>
                                    <p className="text-sm text-neutral-500">{currency.name} • Rate: {currency.exchange_rate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!currency.is_base && (
                                    <>
                                        {!currency.is_default && (
                                            <Button variant="ghost" size="sm" onClick={() => setCurrencyDefault(currency.id)}>Set Default</Button>
                                        )}
                                        <button
                                            onClick={() => toggleCurrencyActive(currency.id)}
                                            className={`p-2 rounded-lg transition-colors ${currency.is_active ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
                                            title={currency.is_active ? "Active" : "Inactive"}
                                        >
                                            {currency.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCurrency(currency.id)}
                                            className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {currencies.length === 0 && <div className="p-8 text-center text-neutral-500">No currencies found.</div>}
                </div>
            </Card>

            {/* Timezones Section */}
            <Card className="p-0 overflow-hidden" hover={false}>
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-neutral-900">Timezones</h2>
                    </div>
                    <Button size="sm" onClick={() => setIsAddingTimezone(!isAddingTimezone)}>
                        {isAddingTimezone ? 'Cancel' : 'Add Timezone'}
                    </Button>
                </div>

                {isAddingTimezone && (
                    <div className="p-6 bg-primary-50 border-b border-primary-100 animate-fade-in">
                        <h3 className="font-semibold text-primary-900 mb-4">Add New Timezone</h3>
                        <form onSubmit={handleCreateTimezone} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Identifier (e.g. Asia/Singapore)"
                                value={newTimezone.identifier}
                                onChange={e => setNewTimezone({ ...newTimezone, identifier: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-neutral-200"
                                required
                            />
                            <input
                                placeholder="Label (e.g. Singapore Time)"
                                value={newTimezone.label}
                                onChange={e => setNewTimezone({ ...newTimezone, label: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-neutral-200"
                                required
                            />
                            <input
                                placeholder="Offset (e.g. +08:00)"
                                value={newTimezone.offset}
                                onChange={e => setNewTimezone({ ...newTimezone, offset: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-neutral-200"
                                required
                                pattern="^[+-]\d{2}:\d{2}$"
                                title="Format: +05:30 or -05:00"
                            />
                            <div className="md:col-span-2">
                                <Button type="submit" variant="primary">Create Timezone</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-neutral-100">
                    {timezones.map((tz) => (
                        <div key={tz.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-neutral-900">{tz.identifier}</span>
                                    {tz.is_default && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Default</span>}
                                </div>
                                <p className="text-sm text-neutral-500">{tz.label} • {tz.offset}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!tz.is_default && (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => setTimezoneDefault(tz.id)}>Set Default</Button>
                                        <button
                                            onClick={() => toggleTimezoneActive(tz.id)}
                                            className={`p-2 rounded-lg transition-colors ${tz.is_active ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
                                            title={tz.is_active ? "Active" : "Inactive"}
                                        >
                                            {tz.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTimezone(tz.id)}
                                            className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {timezones.length === 0 && <div className="p-8 text-center text-neutral-500">No timezones found.</div>}
                </div>
            </Card>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'theme' | 'shipping' | 'globalization'>('theme');

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                {/* Simple Tab Header */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg w-fit flex-wrap">
                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'theme' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Store Appearance
                    </button>
                    <button
                        onClick={() => setActiveTab('globalization')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'globalization' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Currency & Timezone
                    </button>
                    <button
                        onClick={() => setActiveTab('shipping')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'shipping' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Shipping & Delivery
                    </button>
                </div>

                {activeTab === 'theme' && <ThemeSettingsContent />}
                {activeTab === 'globalization' && <GlobalizationSettingsContent />}
                {activeTab === 'shipping' && <ShippingSettingsContent />}
            </div>
        </AdminLayout>
    );
};

export default SettingsPage;
