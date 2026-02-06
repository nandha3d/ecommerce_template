import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useStoreLayoutSettings } from '../../storeLayout/StoreLayoutProvider';
import { updateCartItem, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { Button, Input, Loader } from '../../components/ui';
import { getImageUrl } from '../../utils/imageUtils';
import { SEO } from '../../components/common/SEO';
import toast from 'react-hot-toast';
import { PriceDisplay } from '../../components/common/PriceDisplay';

const CartPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { settings } = useStoreLayoutSettings();
    const layoutVariant = settings.cart;
    const { cart, isLoading } = useAppSelector((state) => state.cart);
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [couponCode, setCouponCode] = React.useState('');
    const [couponLoading, setCouponLoading] = React.useState(false);

    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            dispatch(removeFromCart(itemId));
        } else {
            dispatch(updateCartItem({ itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId: number) => {
        dispatch(removeFromCart(itemId));
        toast.success('Item removed from cart');
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            await dispatch(applyCoupon(couponCode)).unwrap();
            toast.success('Coupon applied successfully!');
            setCouponCode('');
        } catch (error: any) {
            toast.error(error || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await dispatch(removeCoupon()).unwrap();
            toast.success('Coupon removed');
        } catch (error) {
            toast.error('Failed to remove coupon');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading cart..." />
            </div>
        );
    }

    if (!cart?.items?.length) {
        return (
            <div className="min-h-screen bg-neutral-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <ShoppingBag className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-display font-bold text-primary-900 mb-4">
                        Your cart is empty
                    </h1>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                        Looks like you haven't added any items to your cart yet.
                        Start shopping to fill it up!
                    </p>
                    <Link to="/products">
                        <Button size="lg">
                            Start Shopping
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const cartData = cart;

    const reverseColumns = layoutVariant === 2;
    const singleColumn = layoutVariant === 3 || layoutVariant === 5;
    const gridItems = layoutVariant === 4;

    const itemsWrapperClass = singleColumn
        ? ''
        : `lg:col-span-2 ${reverseColumns ? 'lg:order-2' : 'lg:order-1'}`;
    const summaryWrapperClass = singleColumn
        ? ''
        : `lg:col-span-1 ${reverseColumns ? 'lg:order-1' : 'lg:order-2'}`;

    const itemsContainerClass = gridItems ? 'grid sm:grid-cols-2 gap-4' : 'space-y-4';

    const itemsSection = (
        <div className={itemsWrapperClass}>
            <div className={itemsContainerClass}>
                {cartData.items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl p-4 md:p-6 shadow-card flex flex-col md:flex-row gap-4"
                    >
                        {/* Product Image */}
                        <Link
                            to={`/products/${item.product.slug}`}
                            className="w-full md:w-32 h-32 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0"
                        >
                            <img
                                src={item.product.images[0]?.url ? getImageUrl(item.product.images[0].url) : '/placeholder-product.jpg'}
                                alt={item.product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link
                                        to={`/products/${item.product.slug}`}
                                        className="font-semibold text-neutral-900 hover:text-primary-500 transition-colors"
                                    >
                                        {item.product.name}
                                    </Link>
                                    {item.variant && (
                                        <p className="text-sm text-neutral-500 mt-1">
                                            {Object.entries(item.variant.attributes).map(([key, value]) => (
                                                <span key={key} className="mr-3">
                                                    {key}: {value}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                    <p className="text-sm text-neutral-500 mt-1">
                                        SKU: {item.variant?.sku || item.product.sku}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-2 text-neutral-400 hover:text-danger transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-neutral-200 rounded-lg">
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                        className="p-2 hover:bg-neutral-100 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        className="p-2 hover:bg-neutral-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary-900">
                                        <PriceDisplay amountInBase={item.total_price} />
                                    </p>
                                    <p className="text-sm text-neutral-500 flex items-center justify-end gap-1">
                                        <PriceDisplay amountInBase={item.unit_price} /> each
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continue Shopping */}
            <div className="pt-4">
                <Link
                    to="/products"
                    className="text-primary-500 font-medium hover:underline inline-flex items-center gap-2"
                >
                    ← Continue Shopping
                </Link>
            </div>
        </div>
    );

    const summarySection = (
        <div className={summaryWrapperClass}>
            <div className={`bg-white rounded-xl p-6 shadow-card ${singleColumn ? '' : 'sticky top-24'}`}>
                <h2 className="text-lg font-bold text-primary-900 mb-6">Order Summary</h2>

                {/* Coupon */}
                <div className="mb-6">
                    {cartData.coupon ? (
                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-success" />
                                <span className="text-sm font-medium text-success">
                                    {cartData.coupon.code}
                                </span>
                            </div>
                            <button
                                onClick={handleRemoveCoupon}
                                className="text-neutral-400 hover:text-danger"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Coupon code"
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                onClick={handleApplyCoupon}
                                isLoading={couponLoading}
                            >
                                Apply
                            </Button>
                        </div>
                    )}
                </div>

                {/* TC: Totals Section using Strict Backend Data */}
                <div className="space-y-3 pb-6 border-b border-neutral-100">
                    <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span><PriceDisplay amountInBase={cartData.subtotal} /></span>
                    </div>
                    {cartData.discount > 0 && (
                        <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>-<PriceDisplay amountInBase={cartData.discount} /></span>
                        </div>
                    )}
                    <div className="flex justify-between text-neutral-600">
                        <span>Shipping</span>
                        <span>
                            {cartData.shipping === 0
                                ? 'Free'
                                : <PriceDisplay amountInBase={cartData.shipping} />
                            }
                        </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                        <span>Tax</span>
                        <span><PriceDisplay amountInBase={cartData.tax} /></span>
                    </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-primary-900 py-4">
                    <span>Total</span>
                    <span><PriceDisplay amountInBase={cartData.total} /></span>
                </div>

                {/* Checkout Button */}
                <Button
                    onClick={() => {
                        if (!isAuthenticated) {
                            navigate('/auth/login?redirect=/checkout');
                        } else {
                            navigate('/checkout');
                        }
                    }}
                    fullWidth
                    size="lg"
                >
                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 text-center mb-4">
                        Secure checkout powered by industry-leading encryption
                    </p>
                    <div className="flex justify-center gap-4">
                        <img src="/visa.svg" alt="Visa" className="h-6 opacity-50" />
                        <img src="/mastercard.svg" alt="Mastercard" className="h-6 opacity-50" />
                        <img src="/paypal.svg" alt="PayPal" className="h-6 opacity-50" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <SEO title="Shopping Cart" description="Review your cart items before checkout" noindex />
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">
                    Shopping Cart
                </h1>

                {singleColumn ? (
                    <div className="space-y-8">
                        {layoutVariant === 3 ? (
                            <>
                                {summarySection}
                                {itemsSection}
                            </>
                        ) : (
                            <>
                                {itemsSection}
                                {summarySection}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {itemsSection}
                        {summarySection}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
