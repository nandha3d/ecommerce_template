import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { useTheme } from '../../../context/ThemeContext';
import {
    Settings as SettingsIcon,
    Globe,
    DollarSign,
    Save,
    Loader2,
    Plus,
    Trash2,
    Edit2,
    Sun,
    Moon,
    Layers
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'localization' | 'taxes' | 'themes'>('general');
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)', borderRadius: 'var(--radius-md)' }}>
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>Settings</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure store settings and preferences.</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-xs) var(--space-md)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Appearance: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </span>
                    <button
                        onClick={toggleTheme}
                        className="flex-center"
                        style={{
                            background: 'var(--primary-light)',
                            border: '1px solid var(--primary)',
                            padding: '6px',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            transition: 'var(--transition)'
                        }}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>

            <div className="tabs-nav">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <SettingsIcon size={18} />
                    General
                </button>
                <button
                    className={`tab-btn ${activeTab === 'localization' ? 'active' : ''}`}
                    onClick={() => setActiveTab('localization')}
                >
                    <Globe size={18} />
                    Localization
                </button>
                <button
                    className={`tab-btn ${activeTab === 'taxes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('taxes')}
                >
                    <DollarSign size={18} />
                    Taxes
                </button>
                <button
                    className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('themes')}
                >
                    <Layers size={18} />
                    Themes
                </button>
            </div>

            <div style={{ minHeight: '400px' }}>
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'localization' && <LocalizationSettings />}
                {activeTab === 'taxes' && <TaxSettings />}
                {activeTab === 'themes' && <ThemeSettings />}
            </div>
        </div>
    );
};

const GeneralSettings: React.FC = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});

    const { data, isLoading } = useQuery({
        queryKey: ['admin-settings-system', 'general'],
        queryFn: () => adminService.getSystemSettings('general'),
    });

    React.useEffect(() => {
        if (data?.data?.data) {
            const settings = data.data.data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
            setFormData(settings);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: (settings: any) => adminService.updateSystemSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings-system'] });
            toast.success('Settings updated successfully');
        },
        onError: () => toast.error('Failed to update settings')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) return <div className="flex-center" style={{ height: '200px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <h3>General Information</h3>
            <div className="form-group flex-col" style={{ gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Store Name</label>
                <input
                    type="text"
                    className="input"
                    value={formData['site.name'] || ''}
                    onChange={e => setFormData({ ...formData, 'site.name': e.target.value })}
                    placeholder="ShopKart"
                />
            </div>
            <div className="form-group flex-col" style={{ gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Contact Email</label>
                <input
                    type="email"
                    className="input"
                    value={formData['site.email'] || ''}
                    onChange={e => setFormData({ ...formData, 'site.email': e.target.value })}
                    placeholder="support@shopkart.com"
                />
            </div>
            <div className="form-group flex-col" style={{ gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Support Phone</label>
                <input
                    type="text"
                    className="input"
                    value={formData['site.phone'] || ''}
                    onChange={e => setFormData({ ...formData, 'site.phone': e.target.value })}
                    placeholder="+1 (555) 123-4567"
                />
            </div>
            <Button type="submit" isLoading={mutation.isPending} style={{ marginTop: 'var(--space-md)' }} leftIcon={<Save size={18} />}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    );
};

const LocalizationSettings: React.FC = () => {
    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <h3>Localization</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Configure language, timezone, and currency settings.</p>
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                Localization settings coming soon.
            </div>
        </div>
    );
};

const TaxSettings: React.FC = () => {
    const [isAdding, setIsAdding] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-taxes'],
        queryFn: adminService.getTaxRates,
    });

    const taxes = data?.data?.data || [];

    if (isLoading) return <div className="flex-center" style={{ height: '200px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="flex-between">
                <div>
                    <h3>Tax Rates</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage global and region-specific tax rates.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} leftIcon={<Plus size={18} />}>
                    Add Tax Rate
                </Button>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                            <th style={{ padding: 'var(--space-md)' }}>Name</th>
                            <th style={{ padding: 'var(--space-md)' }}>Rate (%)</th>
                            <th style={{ padding: 'var(--space-md)' }}>Type</th>
                            <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {taxes.map((tax: any) => (
                            <tr key={tax.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{tax.name}</td>
                                <td style={{ padding: 'var(--space-md)' }}>{tax.rate}%</td>
                                <td style={{ padding: 'var(--space-md)' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-main)', fontSize: '0.8rem' }}>
                                        {tax.type}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <Button variant="ghost" size="sm" style={{ padding: '6px' }}><Edit2 size={16} /></Button>
                                        <Button variant="ghost" size="sm" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={16} /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h3>Add Tax Rate</h3>
                        {/* Placeholder form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <input type="text" className="input" placeholder="Tax Name (e.g. VAT)" />
                            <input type="number" className="input" placeholder="Rate (e.g. 20)" />
                            <div className="flex-between">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={() => setIsAdding(false)}>Add Rate</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ThemeSettings: React.FC = () => {
    const { activePreset, setPreset, toggleGradientTarget, isGradientActive, presets } = useTheme();

    const options: { id: 'buttons' | 'backgrounds' | 'text' | 'all', label: string }[] = [
        { id: 'all', label: 'All Elements' },
        { id: 'buttons', label: 'Buttons' },
        { id: 'backgrounds', label: 'Backgrounds & Cards' },
        { id: 'text', label: 'Title Text' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-lg)' }}>
                <div>
                    <h3>Granular Gradient Control</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose exactly where luxury gradients are applied.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => toggleGradientTarget(opt.id as any)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border)',
                                background: isGradientActive(opt.id as any) ? 'var(--primary)' : 'var(--bg-main)',
                                color: isGradientActive(opt.id as any) ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Color Presets</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activePreset.name} (Active)</span>
                </div>

                <div className="theme-grid-compact">
                    {presets.map((preset) => (
                        <div
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className={`theme-swatch-compact ${activePreset.id === preset.id ? 'active' : ''}`}
                            title={preset.name}
                        >
                            <div style={{ flex: 1, background: preset.primary }} />
                            <div style={{ flex: 1, background: preset.secondary }} />
                            <div style={{ flex: 1, background: preset.accent }} />
                            {preset.neutral && <div style={{ flex: 1, background: preset.neutral }} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
