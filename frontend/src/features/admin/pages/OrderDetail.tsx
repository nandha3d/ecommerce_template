import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Loader2,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    MapPin,
    CreditCard,
    ArrowLeft,
    Printer,
    Download,
    AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-order', id],
        queryFn: () => adminService.getOrder(id!),
        enabled: !!id,
    });

    const order = data?.data;

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => adminService.updateOrderStatus(id!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            toast.success('Order status updated successfully');
            setIsUpdating(false);
        },
        onError: () => {
            toast.error('Failed to update order status');
            setIsUpdating(false);
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: () => adminService.cancelOrder(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            toast.success('Order cancelled successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to cancel order');
        }
    });

    const handleStatusChange = (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        setIsUpdating(true);
        updateStatusMutation.mutate(newStatus);
    };

    const handleCancelOrder = () => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
        cancelOrderMutation.mutate();
    };

    if (isLoading) return <div className="flex-center" style={{ height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>;
    if (error || !order) return <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: 'var(--space-md)' }}><AlertTriangle size={40} color="var(--error)" /><h3>Order not found</h3><button className="btn btn-secondary" onClick={() => navigate('/admin/orders')}>Go Back</button></div>;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'var(--warning)';
            case 'processing': return 'var(--info)';
            case 'shipped': return 'var(--accent)';
            case 'delivered': return 'var(--success)';
            case 'cancelled': return 'var(--error)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Loader2 size={16} className="animate-spin" />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle2 size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Package size={16} />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* Header */}
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button className="btn-ghost" onClick={() => navigate('/admin/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Order #{order.order_number || order.id}</h1>
                            <div className="flex-center" style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: `${getStatusColor(order.status)}20`,
                                color: getStatusColor(order.status),
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                gap: '6px'
                            }}>
                                {getStatusIcon(order.status)}
                                <span style={{ textTransform: 'capitalize' }}>{order.status}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn btn-secondary" style={{ gap: 'var(--space-sm)' }}>
                        <Printer size={18} /> Print
                    </button>
                    <button className="btn btn-secondary" style={{ gap: 'var(--space-sm)' }}>
                        <Download size={18} /> Invoice
                    </button>
                    {order.status === 'pending' && (
                        <button
                            className="btn btn-danger"
                            onClick={handleCancelOrder}
                            disabled={cancelOrderMutation.isPending}
                        >
                            {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Left Column - Order Items & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Items Card */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Package size={20} color="var(--primary)" />
                            Order Items
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: 'var(--space-md)' }}>Product</th>
                                    <th style={{ padding: 'var(--space-md)' }}>Price</th>
                                    <th style={{ padding: 'var(--space-md)' }}>Quantity</th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                {item.product?.image || item.product_image ? (
                                                    <img
                                                        src={item.product?.image || item.product_image}
                                                        alt={item.product_name}
                                                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={20} color="var(--text-muted)" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{item.product_name || item.product?.name}</div>
                                                    {item.variant_name && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Variant: {item.variant_name}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>${parseFloat(item.price).toFixed(2)}</td>
                                        <td style={{ padding: 'var(--space-md)' }}>{item.quantity}</td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 600 }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} style={{ padding: 'var(--space-md)', textAlign: 'right', color: 'var(--text-secondary)' }}>Subtotal</td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 600 }}>${order.subtotal || order.total_amount}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{ padding: 'var(--space-md)', textAlign: 'right', color: 'var(--text-secondary)' }}>Shipping</td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 600 }}>$0.00</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{ padding: 'var(--space-md)', textAlign: 'right', color: 'var(--text-secondary)' }}>Tax</td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 600 }}>$0.00</td>
                                </tr>
                                <tr style={{ borderTop: '2px solid var(--border)' }}>
                                    <td colSpan={3} style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>Total</td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>${order.total_amount}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Status Management */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Loader2 size={20} color="var(--primary)" />
                            Update Status
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                <button
                                    key={status}
                                    className={`btn ${order.status.toLowerCase() === status.toLowerCase() ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => handleStatusChange(status.toLowerCase())}
                                    disabled={isUpdating || order.status.toLowerCase() === status.toLowerCase()}
                                    style={{
                                        border: order.status.toLowerCase() !== status.toLowerCase() ? '1px solid var(--border)' : 'none',
                                        minWidth: '100px'
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Customer Info */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <User size={20} color="var(--primary)" />
                            Customer
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Guest User'}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{order.customer?.email}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customer ID: {order.user_id || 'N/A'}</div>
                            <button className="btn-link" style={{ alignSelf: 'flex-start', padding: 0, marginTop: 'var(--space-sm)' }}>View Profile</button>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <MapPin size={20} color="var(--primary)" />
                            Shipping Address
                        </h3>
                        {order.shipping_address ? (
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <div>{order.shipping_address.address_line_1}</div>
                                {order.shipping_address.address_line_2 && <div>{order.shipping_address.address_line_2}</div>}
                                <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</div>
                                <div>{order.shipping_address.country}</div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>No shipping address provided</div>
                        )}
                    </div>

                    {/* Billing Address */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <CreditCard size={20} color="var(--primary)" />
                            Billing Address
                        </h3>
                        {order.billing_address ? (
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <div>{order.billing_address.address_line_1}</div>
                                {order.billing_address.address_line_2 && <div>{order.billing_address.address_line_2}</div>}
                                <div>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</div>
                                <div>{order.billing_address.country}</div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>Same as shipping address</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
