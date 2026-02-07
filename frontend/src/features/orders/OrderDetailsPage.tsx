import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Package,
    Truck,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    Download,
    RefreshCw,
    XCircle,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { Button, Loader, Badge } from '../../components/ui';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { SEO } from '../../components/common/SEO';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (id) {
            fetchOrder(parseInt(id));
        }
    }, [id]);

    const fetchOrder = async (orderId: number) => {
        try {
            setIsLoading(true);
            const orderData = await orderService.getOrder(orderId);
            setOrder(orderData);
        } catch (error) {
            toast.error('Order not found');
            navigate('/account/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !cancelReason.trim()) return;
        
        setIsCancelling(true);
        try {
            const updatedOrder = await orderService.cancelOrder(order.id, cancelReason);
            setOrder(updatedOrder);
            setShowCancelModal(false);
            setCancelReason('');
            toast.success('Order cancelled successfully');
        } catch (error) {
            toast.error('Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleTrackOrder = async () => {
        if (!order) return;
        
        setIsTracking(true);
        try {
            const tracking = await orderService.trackOrder(order.order_number);
            console.log('Tracking info:', tracking);
            toast.success('Tracking information updated');
        } catch (error) {
            toast.error('Failed to fetch tracking information');
        } finally {
            setIsTracking(false);
        }
    };

    const handleReorder = async () => {
        if (!order) return;
        
        try {
            await orderService.reorderItems(order.id);
            toast.success('Items added to cart');
            navigate('/cart');
        } catch (error) {
            toast.error('Failed to reorder items');
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
            case 'confirmed':
                return (
                    <Badge variant="success">
                        <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="warning">
                        <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Pending
                        </span>
                    </Badge>
                );
        }
    };

    const canCancel = order && ['pending', 'confirmed'].includes(order.status);
    const canReorder = order && ['delivered', 'cancelled'].includes(order.status);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading order details..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Order not found</h2>
                    <Link to="/account/orders">
                        <Button variant="primary">View My Orders</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title={`Order Details - ${order.order_number}`}
                description="View your order details and tracking information"
            />
            
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/account/orders" className="flex items-center gap-2 text-neutral-600 hover:text-primary-500">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Orders
                        </Link>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="font-bold text-lg text-neutral-900">
                                Order #{order.order_number}
                            </span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-neutral-900">Order Items</h2>
                                    {canReorder && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleReorder}
                                        >
                                            Reorder Items
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image ? getImageUrl(item.image) : '/placeholder-product.jpg'}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-neutral-900">{item.product_name}</h3>
                                                {item.variant_name && (
                                                    <p className="text-sm text-neutral-500">{item.variant_name}</p>
                                                )}
                                                <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm text-neutral-600">Qty: {item.quantity}</span>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary-900">
                                                            <PriceDisplay amountInBase={item.total_price} />
                                                        </p>
                                                        <p className="text-sm text-neutral-500">
                                                            <PriceDisplay amountInBase={item.unit_price} /> each
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Timeline</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">Order Placed</p>
                                            <p className="text-sm text-neutral-600">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {order.status !== 'pending' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Order Confirmed</p>
                                                <p className="text-sm text-neutral-600">Your order has been confirmed</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {order.status === 'processing' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-info rounded-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Processing</p>
                                                <p className="text-sm text-neutral-600">Your order is being prepared</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {order.status === 'shipped' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-info rounded-full flex items-center justify-center">
                                                <Truck className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Shipped</p>
                                                <p className="text-sm text-neutral-600">
                                                    {order.tracking_number && `Tracking: ${order.tracking_number}`}
                                                </p>
                                                {order.shipped_at && (
                                                    <p className="text-sm text-neutral-600">
                                                        Shipped on {new Date(order.shipped_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {order.status === 'delivered' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Delivered</p>
                                                {order.delivered_at && (
                                                    <p className="text-sm text-neutral-600">
                                                        Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {order.status === 'cancelled' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-danger rounded-full flex items-center justify-center">
                                                <XCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Cancelled</p>
                                                <p className="text-sm text-neutral-600">Order was cancelled</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Actions</h2>
                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        fullWidth
                                        leftIcon={<RefreshCw className="w-4 h-4" />}
                                        onClick={handleTrackOrder}
                                        isLoading={isTracking}
                                    >
                                        Track Order
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        fullWidth
                                        leftIcon={<Download className="w-4 h-4" />}
                                        onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
                                    >
                                        Download Invoice
                                    </Button>
                                    {canCancel && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            fullWidth
                                            onClick={() => setShowCancelModal(true)}
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Shipping Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-neutral-900">{order.shipping_address.name}</p>
                                            <p className="text-sm text-neutral-600">{order.shipping_address.address_line_1}</p>
                                            {order.shipping_address.address_line_2 && (
                                                <p className="text-sm text-neutral-600">{order.shipping_address.address_line_2}</p>
                                            )}
                                            <p className="text-sm text-neutral-600">
                                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                                            </p>
                                            <p className="text-sm text-neutral-600">{order.shipping_address.country}</p>
                                            <p className="text-sm text-neutral-600">{order.shipping_address.phone}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="w-5 h-5 text-neutral-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-neutral-900">Payment Method</p>
                                            <p className="text-sm text-neutral-600 capitalize">{order.payment_method}</p>
                                            <p className="text-sm text-neutral-600 capitalize">{order.payment_status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Totals */}
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span><PriceDisplay amountInBase={order.subtotal} /></span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-success">
                                            <span>Discount</span>
                                            <span>-<PriceDisplay amountInBase={order.discount} /></span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Shipping</span>
                                        <span>{order.shipping === 0 ? 'Free' : <PriceDisplay amountInBase={order.shipping} />}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Tax</span>
                                        <span><PriceDisplay amountInBase={order.tax} /></span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-primary-900 pt-3 border-t border-neutral-100">
                                        <span>Total</span>
                                        <span><PriceDisplay amountInBase={order.total} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Cancel Order</h3>
                        <p className="text-neutral-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation (optional)"
                            className="w-full p-3 border border-neutral-200 rounded-lg resize-none"
                            rows={3}
                        />
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                            >
                                Keep Order
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                isLoading={isCancelling}
                            >
                                Cancel Order
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderDetailsPage;
