import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Search,
    Plus,
    Tag,
    Loader2,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle,
    Calendar,
    DollarSign,
    Percent
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

interface Coupon {
    id: number;
    code: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount?: number;
    usage_limit?: number;
    used_count: number;
    expires_at?: string;
    is_active: boolean;
}

const CouponManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [page] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-coupons', page, search],
        queryFn: () => adminService.getCoupons({ page, search }),
    });

    const coupons = data?.data?.data?.data || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => adminService.createCoupon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success('Coupon created successfully');
            closeModal();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to create coupon');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminService.updateCoupon(editingCoupon!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success('Coupon updated successfully');
            closeModal();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to update coupon');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminService.deleteCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success('Coupon deleted successfully');
        },
        onError: () => toast.error('Failed to delete coupon')
    });

    const openModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                description: coupon.description || '',
                type: coupon.type,
                value: coupon.value.toString(),
                min_order_amount: coupon.min_order_amount?.toString() || '',
                usage_limit: coupon.usage_limit?.toString() || '',
                expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
                is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                description: '',
                type: 'percentage',
                value: '',
                min_order_amount: '',
                usage_limit: '',
                expires_at: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            value: parseFloat(formData.value),
            min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            expires_at: formData.expires_at || null,
        };

        if (editingCoupon) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)' }}>
                        <Tag size={20} />
                    </div>
                    <div>
                        <h1>Coupons</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage discount codes and promotions.</p>
                    </div>
                </div>
                <Button onClick={() => openModal()} leftIcon={<Plus size={18} />}>
                    Create Coupon
                </Button>
            </div>

            <div className="card" style={{ padding: 'var(--space-md)' }}>
                <div className="flex-center animate-bg" style={{ backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search coupons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}><Loader2 className="animate-spin" /></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-md)' }}>Code</th>
                                <th style={{ padding: 'var(--space-md)' }}>Discount</th>
                                <th style={{ padding: 'var(--space-md)' }}>Usage</th>
                                <th style={{ padding: 'var(--space-md)' }}>Expiry</th>
                                <th style={{ padding: 'var(--space-md)' }}>Status</th>
                                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length > 0 ? coupons.map((coupon: Coupon) => (
                                <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem', color: 'var(--primary)' }}>{coupon.code}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{coupon.description}</div>
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                            {coupon.type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                                            {coupon.value}
                                            {coupon.type === 'percentage' ? '%' : ''} OFF
                                        </div>
                                        {coupon.min_order_amount && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min: ${coupon.min_order_amount}</div>}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        {coupon.used_count} / {coupon.usage_limit || '∞'}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        {coupon.expires_at ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="var(--text-muted)" />
                                                {new Date(coupon.expires_at).toLocaleDateString()}
                                            </div>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>Never</span>}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        {coupon.is_active ? (
                                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><CheckCircle2 size={14} /> Active</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><XCircle size={14} /> Inactive</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <Button variant="ghost" size="sm" onClick={() => openModal(coupon)}><Edit2 size={16} /></Button>
                                            <Button variant="ghost" size="sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(coupon.id)}><Trash2 size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>No coupons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%', padding: 'var(--space-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-lg)' }}>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label>Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER2026"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Summer Sale Discount"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        className="input"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="input"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label>Min. Order Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        value={formData.min_order_amount}
                                        onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Usage Limit</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="input"
                                        value={formData.usage_limit}
                                        onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.expires_at}
                                    onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="is_active" style={{ marginBottom: 0 }}>Active</label>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                                <Button variant="ghost" onClick={closeModal} style={{ flex: 1 }}>Cancel</Button>
                                <Button
                                    type="submit"
                                    style={{ flex: 1 }}
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;
