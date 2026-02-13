import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    ChevronLeft,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag
} from 'lucide-react';

const CustomerProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch Customer Details
    const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
        queryKey: ['admin-customer', id],
        queryFn: () => adminService.getCustomer(id!),
        enabled: !!id,
    });

    // Fetch Customer Orders - assuming backend supports filtering by user_id/customer_id or we filter client side if needed
    // Ideally backend should have /admin/customers/{id}/orders or we use /admin/orders?customer_id={id}
    // For now, let's try strict filtering if API supports it, otherwise we might just link to orders page with search
    const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['admin-customer-orders', id],
        queryFn: () => adminService.getOrders({ search: customerData?.data?.email }), // Searching by email as a proxy for customer filter
        enabled: !!customerData?.data?.email,
    });

    const customer = customerData?.data;
    const orders = ordersData?.data?.data || [];

    if (isLoadingCustomer) return <div className="flex-center" style={{ height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>;
    if (!customer) return <div className="flex-center" style={{ height: '60vh' }}>Customer not found</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* Header */}
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button className="btn-ghost" onClick={() => navigate('/admin/customers')}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '50%', color: 'white', fontSize: '1rem', fontWeight: 800 }}>
                                {customer.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{customer.name}</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Customer ID: {customer.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn btn-secondary">Edit Profile</button>
                    <button className="btn btn-secondary">Reset Password</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)' }}>
                {/* Left Column - Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <User size={20} color="var(--primary)" />
                            Contact Info
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Mail size={16} color="var(--text-muted)" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                                    <div style={{ fontWeight: 500 }}>{customer.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Phone size={16} color="var(--text-muted)" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div>
                                    <div style={{ fontWeight: 500 }}>{customer.phone || 'N/A'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Calendar size={16} color="var(--text-muted)" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined</div>
                                    <div style={{ fontWeight: 500 }}>{new Date(customer.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <MapPin size={20} color="var(--primary)" />
                            Primary Address
                        </h3>
                        {customer.addresses && customer.addresses.length > 0 ? (
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <div>{customer.addresses[0].address_line_1}</div>
                                {customer.addresses[0].address_line_2 && <div>{customer.addresses[0].address_line_2}</div>}
                                <div>{customer.addresses[0].city}, {customer.addresses[0].state} {customer.addresses[0].postal_code}</div>
                                <div>{customer.addresses[0].country}</div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>No address saved</div>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats & Orders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Total Orders</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{customer.orders_count || orders.length}</div>
                        </div>
                        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Total Spent</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>${customer.total_spent || '0.00'}</div>
                        </div>
                        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Avg. Order Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>${customer.avg_order_value || '0.00'}</div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <ShoppingBag size={20} color="var(--primary)" />
                            Recent Orders
                        </h3>
                        {isLoadingOrders ? (
                            <div className="flex-center" style={{ padding: 'var(--space-xl)' }}><Loader2 className="animate-spin" /></div>
                        ) : orders.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: 'var(--space-md)' }}>Order</th>
                                        <th style={{ padding: 'var(--space-md)' }}>Date</th>
                                        <th style={{ padding: 'var(--space-md)' }}>Status</th>
                                        <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Total</th>
                                        <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: 'var(--space-md)', fontWeight: 600 }}>#{order.order_number || order.id}</td>
                                            <td style={{ padding: 'var(--space-md)', color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: 'var(--space-md)' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                    fontSize: '0.8rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 600 }}>${order.total_amount}</td>
                                            <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                                <button
                                                    className="btn-link"
                                                    style={{ padding: 0 }}
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No orders found for this customer.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
