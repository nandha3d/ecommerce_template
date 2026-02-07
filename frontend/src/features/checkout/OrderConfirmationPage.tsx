import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    CheckCircle,
    Package,
    Truck,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    Download,
    Share2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { Button, Loader, Badge } from '../../components/ui';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { SEO } from '../../components/common/SEO';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const OrderConfirmationPage: React.FC = () => {
    const { orderNumber } = useParams<{ orderNumber?: string }>();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        if (orderNumber) {
            fetchOrder(orderNumber);
        } else {
            // Try to get order from URL query param
            const orderId = new URLSearchParams(window.location.search).get('order');
            if (orderId) {
                fetchOrderById(parseInt(orderId));
            } else {
                navigate('/account/orders');
            }
        }
    }, [orderNumber, navigate]);

    const fetchOrder = async (orderNum: string) => {
        try {
            setIsLoading(true);
            const orderData = await orderService.getOrderByNumber(orderNum);
            setOrder(orderData);
        } catch (error) {
            toast.error('Order not found');
            navigate('/account/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrderById = async (orderId: number) => {
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

    const handleTrackOrder = async () => {
        if (!order) return;
        
        setIsTracking(true);
        try {
            const tracking = await orderService.trackOrder(order.order_number);
            // You could show a modal with tracking details
            console.log('Tracking info:', tracking);
            toast.success('Tracking information updated');
        } catch (error) {
            toast.error('Failed to fetch tracking information');
        } finally {
            setIsTracking(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!order) return;
        
        try {
            // This would generate and download a PDF invoice
            window.open(`/api/orders/${order.id}/invoice`, '_blank');
        } catch (error) {
            toast.error('Failed to download invoice');
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
                            <Package className="w-3 h-3" /> Processing
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
                title={`Order Confirmation - ${order.order_number}`}
                description="Your order has been successfully placed"
            />
            
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Success Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 mb-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                                Order Confirmed!
                            </h1>
                            <p className="text-neutral-600 mb-4">
                                Thank you for your order. We've sent a confirmation email to your registered email address.
                            </p>
                            <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
                                <span className="font-bold text-primary-900">Order #{order.order_number}</span>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                leftIcon={<Package className="w-4 h-4" />}
                                onClick={() => navigate('/account/orders')}
                            >
                                View All Orders
                            </Button>
                            <Button
                                variant="outline"
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                                onClick={handleTrackOrder}
                                isLoading={isTracking}
                            >
                                Track Order
                            </Button>
                            <Button
                                variant="outline"
                                leftIcon={<Download className="w-4 h-4" />}
                                onClick={handleDownloadInvoice}
                            >
                                Download Invoice
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<ArrowRight className="w-4 h-4" />}
                                onClick={() => navigate('/products')}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Items</h2>
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
                                                    <span className="font-bold text-primary-900">
                                                        <PriceDisplay amountInBase={item.total_price} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            {/* Shipping & Payment */}
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

                            {/* Next Steps */}
                            <div className="bg-primary-50 rounded-xl p-6">
                                <h3 className="font-bold text-primary-900 mb-3">What's Next?</h3>
                                <div className="space-y-2 text-sm text-primary-700">
                                    <p>• You'll receive an email confirmation shortly</p>
                                    <p>• We'll process your order within 1-2 business days</p>
                                    <p>• You'll receive tracking information once shipped</p>
                                    <p>• Expected delivery: 5-7 business days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderConfirmationPage;
