import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

interface LicenseStatus {
    activated: boolean;
    valid?: boolean;
    tier?: string;
    tier_display?: string;
    modules?: string[];
    expires_at?: string;
    support_until?: string;
    last_validated?: string;
    status?: string;
    message?: string;
}

interface ModuleInfo {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    is_core: boolean;
    is_licensed: boolean;
    is_active: boolean;
    can_toggle: boolean;
}

const LicenseActivation: React.FC = () => {
    const [licenseKey, setLicenseKey] = useState('');
    const [status, setStatus] = useState<LicenseStatus | null>(null);
    const [modules, setModules] = useState<ModuleInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const [statusRes, modulesRes] = await Promise.all([
                api.get('/license/status'),
                api.get('/license/modules').catch(() => ({ data: { data: [] } })),
            ]);
            setStatus(statusRes.data.data);
            setModules(modulesRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch license status', err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActivating(true);

        try {
            const response = await api.post('/license/activate', { license_key: licenseKey });

            if (response.data.success) {
                setSuccess('License activated successfully!');
                setLicenseKey('');
                fetchStatus();
            } else {
                setError(response.data.message || 'Activation failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate license');
        } finally {
            setActivating(false);
        }
    };

    const handleRevalidate = async () => {
        try {
            const response = await api.post('/license/revalidate');
            if (response.data.success) {
                setSuccess('License revalidated successfully');
                fetchStatus();
            }
        } catch (err) {
            setError('Failed to revalidate license');
        }
    };

    const getTierBadgeColor = (tier: string) => {
        switch (tier) {
            case 'enterprise': return '#7c3aed';
            case 'professional': return '#2563eb';
            case 'starter': return '#059669';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'expired': return '#f59e0b';
            case 'revoked': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="license-page">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="license-page">
            <div className="license-header">
                <h1>🔐 License Management</h1>
                <p>Manage your SupplePro license and unlock premium features</p>
            </div>

            {/* Current License Status */}
            {status?.activated ? (
                <div className="license-card active">
                    <div className="license-status-header">
                        <div className="status-badge" style={{ backgroundColor: getStatusColor(status.status || 'active') }}>
                            {status.status?.toUpperCase() || 'ACTIVE'}
                        </div>
                        <div className="tier-badge" style={{ backgroundColor: getTierBadgeColor(status.tier || '') }}>
                            {status.tier_display || status.tier}
                        </div>
                    </div>

                    <div className="license-info">
                        <div className="info-item">
                            <span className="label">Expires</span>
                            <span className="value">{status.expires_at || 'Never (Lifetime)'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Support Until</span>
                            <span className="value">{status.support_until || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Last Validated</span>
                            <span className="value">{status.last_validated || 'Never'}</span>
                        </div>
                    </div>

                    <div className="license-actions">
                        <button onClick={handleRevalidate} className="btn-secondary">
                            🔄 Revalidate
                        </button>
                        <a href="https://supplepro.com/pricing" target="_blank" rel="noopener noreferrer" className="btn-upgrade">
                            ⬆️ Upgrade License
                        </a>
                    </div>
                </div>
            ) : (
                <div className="license-card inactive">
                    <div className="no-license">
                        <span className="icon">🔒</span>
                        <h3>No Active License</h3>
                        <p>Enter your license key below to activate premium features</p>
                    </div>
                </div>
            )}

            {/* Activation Form */}
            <div className="activation-section">
                <h2>Activate License</h2>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleActivate} className="activation-form">
                    <input
                        type="text"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="SPLE-XXXX-XXXX-XXXX.xxxxx..."
                        className="license-input"
                        disabled={activating}
                    />
                    <button type="submit" className="btn-primary" disabled={activating || !licenseKey}>
                        {activating ? 'Activating...' : 'Activate License'}
                    </button>
                </form>

                <p className="help-text">
                    Don't have a license? <a href="https://supplepro.com/pricing" target="_blank" rel="noopener noreferrer">Purchase one here</a>
                </p>
            </div>

            {/* Licensed Modules */}
            <div className="modules-section">
                <h2>Available Modules</h2>
                <div className="modules-grid">
                    {modules.map(module => (
                        <div
                            key={module.id}
                            className={`module-card ${module.is_licensed ? 'licensed' : 'locked'} ${module.is_active ? 'active' : ''}`}
                        >
                            <div className="module-icon">
                                {module.is_licensed ? '✅' : '🔒'}
                            </div>
                            <div className="module-info">
                                <h4>{module.name}</h4>
                                <p>{module.description}</p>
                            </div>
                            <div className="module-status">
                                {module.is_core ? (
                                    <span className="badge core">Core</span>
                                ) : module.is_licensed ? (
                                    <span className="badge licensed">Licensed</span>
                                ) : (
                                    <span className="badge locked">Upgrade Required</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .license-page {
                    padding: 32px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .license-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .license-header h1 {
                    font-size: 28px;
                    margin: 0 0 8px;
                    color: #1f2937;
                }

                .license-header p {
                    color: #6b7280;
                    margin: 0;
                }

                .license-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .license-card.active {
                    border: 2px solid #10b981;
                }

                .license-card.inactive {
                    border: 2px dashed #d1d5db;
                }

                .license-status-header {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .status-badge, .tier-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                    text-transform: uppercase;
                }

                .license-info {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-item .label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .info-item .value {
                    font-weight: 600;
                    color: #1f2937;
                }

                .license-actions {
                    display: flex;
                    gap: 12px;
                }

                .no-license {
                    text-align: center;
                    padding: 40px 20px;
                }

                .no-license .icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }

                .no-license h3 {
                    margin: 0 0 8px;
                    color: #374151;
                }

                .no-license p {
                    margin: 0;
                    color: #6b7280;
                }

                .activation-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .activation-section h2 {
                    margin: 0 0 16px;
                    font-size: 20px;
                }

                .activation-form {
                    display: flex;
                    gap: 12px;
                }

                .license-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: monospace;
                }

                .license-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-upgrade {
                    background: linear-gradient(135deg, #7c3aed, #5b21b6);
                    color: #fff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                }

                .help-text {
                    margin-top: 12px;
                    font-size: 14px;
                    color: #6b7280;
                }

                .help-text a {
                    color: #3b82f6;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .alert.error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                .alert.success {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                }

                .modules-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .modules-section h2 {
                    margin: 0 0 20px;
                    font-size: 20px;
                }

                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .module-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    transition: all 0.2s;
                }

                .module-card.licensed {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .module-card.locked {
                    opacity: 0.7;
                }

                .module-icon {
                    font-size: 24px;
                }

                .module-info {
                    flex: 1;
                }

                .module-info h4 {
                    margin: 0 0 4px;
                    font-size: 14px;
                }

                .module-info p {
                    margin: 0;
                    font-size: 12px;
                    color: #6b7280;
                }

                .badge {
                    font-size: 10px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge.core {
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                .badge.licensed {
                    background: #d1fae5;
                    color: #059669;
                }

                .badge.locked {
                    background: #fef3c7;
                    color: #d97706;
                }

                .loading-spinner {
                    text-align: center;
                    padding: 60px;
                    color: #6b7280;
                }

                @media (max-width: 640px) {
                    .license-info {
                        grid-template-columns: 1fr;
                    }

                    .activation-form {
                        flex-direction: column;
                    }

                    .license-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default LicenseActivation;
