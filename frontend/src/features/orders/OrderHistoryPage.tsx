import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronRight, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order, PaginatedResponse } from '../../types';
import { Button, Loader, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<{
        current_page: number;
        last_page: number;
        total: number;
    }>({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const fetchOrders = async (page: number) => {
        try {
            setIsLoading(true);
            const response = await orderService.getOrders(page);
            setOrders(response.data);
            setPagination({
                current_page: response.meta.current_page,
                last_page: response.meta.last_page,
                total: response.meta.total,
            });
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return (
                    <Badge variant="success">
                        <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Delivered
                        </span>
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge variant="info">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Processing
                        </span>
                    </Badge>
                );
            case 'shipped':
                return (
                    <Badge variant="info">
                        <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Shipped
                        </span>
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="danger">
                        <span className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Cancelled
                        </span>
                    </Badge>
                );
            default:
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader size="lg" text="Loading orders..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">My Orders</h1>
            <p className="text-neutral-600 mb-8">View and track your order history</p>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No orders yet</h3>
                    <p className="text-neutral-500 mb-6">You haven't placed any orders yet.</p>
                    <Link to="/products">
                        <Button variant="primary">Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:border-primary-300 transition-colors">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                                            #{order.order_number.slice(-4)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">Order #{order.order_number}</p>
                                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(order.status)}
                                        <span className="font-bold text-lg text-neutral-900">
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <span className="font-medium">{order.items.length} items</span>
                                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                        <span>Shipping to {order.shipping_address?.city}, {order.shipping_address?.country}</span>
                                    </div>
                                    <Link to={`/account/orders/${order.id}`}>
                                        <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === 1}
                        onClick={() => fetchOrders(pagination.current_page - 1)}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-4 font-medium text-neutral-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === pagination.last_page}
                        onClick={() => fetchOrders(pagination.current_page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
