import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    ChevronLeft,
    Mail,
    Phone,
    Clock,
    Shield,
    CreditCard,
    ShoppingBag,
    Activity,
    Lock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    User,
    TrendingUp
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'activity' | 'security' | 'analytics'>('profile');

    const { data: userResponse, isLoading } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => adminService.getUser(id!),
        enabled: !!id
    });

    const { data: activityResponse } = useQuery({
        queryKey: ['admin-user-activity', id],
        queryFn: () => adminService.getUserActivity(id!),
        enabled: !!id && activeTab === 'activity'
    });

    const updateRoleMutation = useMutation({
        mutationFn: (role: string) => adminService.changeUserRole(id!, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
            toast.success('User role updated');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: () => adminService.toggleUserStatus(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
            toast.success('User status toggled');
        }
    });

    const user = userResponse?.data?.data;
    const activities = activityResponse?.data?.data?.data || [];

    const roleOptions = [
        { value: 'customer', label: 'Customer' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' }
    ];

    if (isLoading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;
    if (!user) return <div className="flex-center" style={{ height: '400px' }}>User not found</div>;

    return (
        <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem' }}>{user.name}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Registered on {user.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ gap: 'var(--space-sm)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
                        <label className="switch" title={user.is_active ? 'Deactivate' : 'Activate'}>
                            <input
                                type="checkbox"
                                checked={user.is_active}
                                onChange={() => toggleStatusMutation.mutate()}
                                disabled={toggleStatusMutation.isPending}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <Button variant="ghost" style={{ color: 'var(--error)' }}>
                        Delete User
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
                {/* User Sidebar Info */}
                <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                    <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                        <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 auto var(--space-md)' }}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <h3 style={{ marginBottom: '4px' }}>{user.name}</h3>
                        <span className="badge badge-primary">
                            {user.role}
                        </span>

                        <div style={{ marginTop: 'var(--space-xl)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                                <Mail size={18} /> {user.email}
                            </div>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                                <Phone size={18} /> {user.phone || 'No phone set'}
                            </div>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                                <Clock size={18} /> Last login: {user.last_login_at ? format(new Date(user.last_login_at), 'PPp') : 'Never'}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 'var(--space-lg)' }}>
                        <h4 style={{ marginBottom: 'var(--space-md)' }}>Financial Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="flex-between">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Spent</span>
                                <span style={{ fontWeight: 700 }}>${user.total_spent || '0.00'}</span>
                            </div>
                            <div className="flex-between">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Orders</span>
                                <span style={{ fontWeight: 700 }}>{user.orders_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                    {/* Tabs */}
                    <div className="tabs-nav">
                        {[
                            { id: 'profile', icon: User },
                            { id: 'analytics', icon: TrendingUp },
                            { id: 'activity', icon: Activity },
                            { id: 'security', icon: Shield }
                        ].map(tab => {
                            const isActive = activeTab === tab.id || (activeTab === 'orders' && tab.id === 'analytics');
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`tab-btn ${isActive ? 'active' : ''}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    <tab.icon size={18} />
                                    {tab.id}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="card" style={{ padding: 'var(--space-xl)' }}>
                        {activeTab === 'profile' && (
                            <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                                    <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                        <label className="label">First Name</label>
                                        <div className="input-preview">{user.first_name || user.name?.split(' ')[0] || 'N/A'}</div>
                                    </div>
                                    <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                        <label className="label">Last Name</label>
                                        <div className="input-preview">{user.last_name || user.name?.split(' ').slice(1).join(' ') || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                                    <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                        <label className="label">Email Address</label>
                                        <div className="input-preview">{user.email}</div>
                                    </div>
                                    <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                        <label className="label">Phone Number</label>
                                        <div className="input-preview">{user.phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <Select
                                        options={roleOptions}
                                        value={user.role}
                                        onChange={(val) => updateRoleMutation.mutate(val)}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {user.addresses?.length > 0 && (
                                    <div className="flex-column" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                                        <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-xs)' }}>Primary Address</h4>
                                        <div className="input-preview" style={{ height: 'auto', lineHeight: '1.6' }}>
                                            <strong>{user.addresses[0].name}</strong><br />
                                            {user.addresses[0].address_line_1}<br />
                                            {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].postal_code}<br />
                                            {user.addresses[0].country}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(activeTab === 'analytics' || activeTab === 'orders') && (
                            <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                                <div className="flex-between">
                                    <h3>Order & Purchase History</h3>
                                    <div className="flex-center" style={{ gap: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter by date:</span>
                                        <input type="date" className="input" style={{ padding: '4px 8px', fontSize: '0.8rem' }} />
                                    </div>
                                </div>

                                {user.orders?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                                        {user.orders.map((order: any) => (
                                            <div key={order.id} className="flex-column" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                                <div className="flex-between" style={{ backgroundColor: 'var(--bg-main)', padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                                                        <div className="flex-column">
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Number</span>
                                                            <span style={{ fontWeight: 700 }}>#{order.order_number}</span>
                                                        </div>
                                                        <div className="flex-column">
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date Placed</span>
                                                            <span>{format(new Date(order.created_at), 'PPP')}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span className="badge badge-info">{order.status.toUpperCase()}</span>
                                                        <div style={{ marginTop: '4px', fontWeight: 800, fontSize: '1.1rem' }}>${(order.total / 100).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: 'var(--space-md)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                                <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Product</th>
                                                                <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>Qty</th>
                                                                <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items?.map((item: any) => (
                                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                                    <td style={{ padding: '12px 0' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                                            <img src={item.image || 'https://via.placeholder.com/40'} alt={item.product_name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', background: 'var(--bg-main)' }} />
                                                                            <div className="flex-column">
                                                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</span>
                                                                                {item.variant_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.variant_name}</span>}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '12px 0', textAlign: 'center' }}>x{item.quantity}</td>
                                                                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>${(item.unit_price / 100).toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-center" style={{ padding: 'var(--space-3xl)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                                        <div className="flex-column flex-center" style={{ gap: 'var(--space-sm)', color: 'var(--text-muted)' }}>
                                            <ShoppingBag size={48} opacity={0.3} />
                                            <p>No orders found for this user.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                                {activities.map((log: any) => (
                                    <div key={log.id} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                        <div className="flex-center" style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', height: 'fit-content' }}>
                                            <Activity size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 600 }}>{log.action.replace(/_/g, ' ')}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{format(new Date(log.created_at), 'PPp')}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{log.description || `Performed ${log.action} action.`}</p>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>IP: {log.ip_address}</div>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No activity logs yet.</p>}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                                <div style={{ padding: 'var(--space-md)', backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-md)', color: 'var(--warning)' }}>
                                    <AlertTriangle size={24} />
                                    <div>
                                        <h4 style={{ color: 'inherit' }}>Security Actions</h4>
                                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Be careful when performing these actions. They will directly affect the user's access.</p>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    <div className="flex-between" style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <h5 style={{ marginBottom: '2px' }}>Reset Password</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send a temporary password to the user.</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="flex-center" style={{ gap: '4px' }} leftIcon={<Lock size={16} />}>
                                            Generate Temp Password
                                        </Button>
                                    </div>
                                    <div className="flex-between" style={{ padding: 'var(--space-md)' }}>
                                        <div>
                                            <h5 style={{ marginBottom: '2px' }}>Revoke Sessions</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Force the user to log out from all devices.</p>
                                        </div>
                                        <Button variant="ghost" size="sm" style={{ color: 'var(--error)' }}>
                                            Log Out All Devices
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
