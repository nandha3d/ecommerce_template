/**
 * RecentOrdersTable Component - Table displaying recent orders
 * 
 * REQUIREMENTS:
 * - Must show latest 5-10 orders
 * - Must format currency properly
 * - Must show order status with color coding
 * - Must link to order detail page
 * - Must be responsive (stack on mobile)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatus, type RecentOrder } from '@/types/analytics';

interface RecentOrdersTableProps {
    /** Orders to display */
    orders: RecentOrder[];
    /** Loading state */
    isLoading?: boolean;
    /** Maximum number of orders to show */
    limit?: number;
    /** Price formatter */
    formatPrice: (val: number) => string;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
    orders,
    isLoading = false,
    limit = 10,
    formatPrice,
}) => {
    const navigate = useNavigate();

    // Status color mapping
    const getStatusColor = (status: OrderStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        const statusMap: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
            [OrderStatus.COMPLETED]: 'success',
            [OrderStatus.DELIVERED]: 'success',
            [OrderStatus.SHIPPED]: 'info',
            [OrderStatus.PROCESSING]: 'warning',
            [OrderStatus.PENDING]: 'warning',
            [OrderStatus.CANCELLED]: 'error',
            [OrderStatus.REFUNDED]: 'error',
        };
        return statusMap[status] || 'default';
    };

    // Format status for display
    const formatStatus = (status: OrderStatus): string => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    // Navigate to order detail
    const handleOrderClick = (orderId: number) => {
        navigate(`/admin/orders/${orderId}`);
    };

    if (isLoading) {
        return (
            <Card title="Recent Orders">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} style={{ height: '64px', width: '100%' }} />
                    ))}
                </div>
            </Card>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card title="Recent Orders">
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No orders yet</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Orders will appear here once placed</p>
                </div>
            </Card>
        );
    }

    const displayOrders = orders.slice(0, limit);

    return (
        <Card
            title="Recent Orders"
            actions={
                <button
                    onClick={() => navigate('/admin/orders')}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                    View All
                </button>
            }
        >
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Order</th>
                            <th style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Customer</th>
                            <th style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Date</th>
                            <th style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total</th>
                            <th style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayOrders.map((order) => (
                            <tr
                                key={order.id}
                                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                onClick={() => handleOrderClick(order.id)}
                                className="hover-bg"
                            >
                                <td style={{ padding: '12px' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>{order.order_number}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                    </p>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)' }}>{order.customer_name}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer_email}</p>
                                </td>
                                <td style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {format(parseISO(order.created_at), 'MMM dd, yyyy')}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                        {formatPrice(order.total)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Badge variant={getStatusColor(order.status)}>
                                        {formatStatus(order.status)}
                                    </Badge>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <ExternalLink size={16} color="var(--text-muted)" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default RecentOrdersTable;
