import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Search,
    Filter,
    Eye,
    ShoppingCart,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, search, statusFilter],
        queryFn: () => adminService.getOrders({ page, search, status: statusFilter === 'all' ? '' : statusFilter }),
    });

    const orders = data?.data?.data || [];
    const meta = data?.data?.meta;

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return { bg: 'rgba(251, 191, 36, 0.1)', color: '#d97706', icon: <Clock size={14} /> };
            case 'processing': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', icon: <Loader2 size={14} className="animate-spin" /> };
            case 'shipped': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', icon: <Truck size={14} /> };
            case 'delivered': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', icon: <CheckCircle2 size={14} /> };
            case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', icon: <XCircle size={14} /> };
            default: return { bg: 'var(--bg-main)', color: 'var(--text-secondary)', icon: null };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1>Orders</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage and track all customer orders.</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div className="flex-center animate-bg" style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer, or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
                <div className="flex-center" style={{ backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <Filter size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-lg)' }}>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style={{ padding: 'var(--space-lg)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? orders.map((order: any) => {
                                const status = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: 'var(--space-lg)' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>#{order.order_number || order.id}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items_count || 0} items</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Guest'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customer?.email}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            ${order.total_amount || order.total}
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-xs)',
                                                padding: '4px 12px',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: status.bg,
                                                color: status.color,
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}>
                                                {status.icon}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-lg)', textAlign: 'right' }}>
                                            <button
                                                className="btn-ghost"
                                                title="View Details"
                                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {meta && (
                    <div className="flex-between" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Showing {orders.length} of {meta.total} orders
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button
                                className="btn-ghost"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="flex-center" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                                {page}
                            </span>
                            <button
                                className="btn-ghost"
                                disabled={page === meta.last_page}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderList;
