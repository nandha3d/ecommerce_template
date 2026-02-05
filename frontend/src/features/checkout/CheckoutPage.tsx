import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    ChevronRight,
    MapPin,
    Truck,
    CreditCard,
    Check,
    Lock
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { useStoreLayoutSettings } from '../../storeLayout/StoreLayoutProvider';
import { orderService } from '../../services';
import { Button, Input, Loader } from '../../components/ui';
import { SEO } from '../../components/common/SEO';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';
import { AddressList } from '../user/components/AddressList';
import { Address } from '../../types';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cart, isLoading: cartLoading } = useAppSelector((state) => state.cart);
    const { settings } = useStoreLayoutSettings();
    const layoutVariant = settings.checkout;

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');

    // Checkout State
    const [selectedAddressObj, setSelectedAddressObj] = useState<Address | null>(null);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // We no longer need the manual address form here as AddressList handles it
    const { handleSubmit } = useForm();

    const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
        { id: 'address', label: 'Address', icon: <MapPin className="w-5 h-5" /> },
        { id: 'shipping', label: 'Shipping', icon: <Truck className="w-5 h-5" /> },
        { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'review', label: 'Review', icon: <Check className="w-5 h-5" /> },
    ];

    const stepIndex = steps.findIndex(s => s.id === currentStep);

    const nextStep = () => {
        const next = steps[stepIndex + 1];
        if (next) setCurrentStep(next.id);
    };

    const prevStep = () => {
        const prev = steps[stepIndex - 1];
        if (prev) setCurrentStep(prev.id);
    };

    const shippingOptions = [
        { id: 'standard', name: 'Standard Shipping', price: 0, days: '5-7 business days' },
        { id: 'express', name: 'Express Shipping', price: 9.99, days: '2-3 business days' },
        { id: 'overnight', name: 'Overnight Shipping', price: 19.99, days: 'Next business day' },
    ];

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        try {
            if (!selectedAddressObj) {
                toast.error('Please select a shipping address');
                setIsSubmitting(false);
                return;
            }

            const orderData = {
                billing_address_id: selectedAddressObj.id,
                shipping_address_id: selectedAddressObj.id,
                payment_method: paymentMethod,
                same_as_billing: true,
            };

            const order = await orderService.createOrder(orderData);
            toast.success('Order placed successfully!');
            navigate(`/checkout/success?order=${order.order_number}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading checkout..." />
            </div>
        );
    }

    if (!cart?.items?.length) {
        navigate('/cart');
        return null;
    }

    const reverseColumns = layoutVariant === 2;
    const singleColumn = layoutVariant === 3 || layoutVariant === 4;
    const summaryFirst = layoutVariant === 3;
    const earlyColumns = layoutVariant === 5;

    const gridWrapperClass = earlyColumns ? 'grid md:grid-cols-3 gap-8' : 'grid lg:grid-cols-3 gap-8';
    const mainColClass = earlyColumns
        ? `md:col-span-2 ${reverseColumns ? 'md:order-2' : 'md:order-1'}`
        : `lg:col-span-2 ${reverseColumns ? 'lg:order-2' : 'lg:order-1'}`;
    const summaryColClass = earlyColumns
        ? `md:col-span-1 ${reverseColumns ? 'md:order-1' : 'md:order-2'}`
        : `lg:col-span-1 ${reverseColumns ? 'lg:order-1' : 'lg:order-2'}`;

    const orderSummary = (
        <div className={summaryColClass}>
            <div className={`bg-white rounded-xl p-6 shadow-card ${singleColumn ? '' : 'sticky top-24'}`}>
                <h2 className="text-lg font-bold text-primary-900 mb-6">Order Summary</h2>

                <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            <img
                                src={getImageUrl(item.product.images[0]?.url)}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product.name}</p>
                                <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">${item.total_price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 py-4 border-t border-b border-neutral-100">
                    <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    {cart.discount > 0 && (
                        <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>-${cart.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-neutral-600">
                        <span>Shipping</span>
                        <span>
                            {shippingOptions.find(s => s.id === shippingMethod)?.price === 0
                                ? 'Free'
                                : `$${shippingOptions.find(s => s.id === shippingMethod)?.price.toFixed(2)}`
                            }
                        </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                        <span>Tax</span>
                        <span>${cart.tax.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-primary-900 pt-4">
                    <span>Total</span>
                    <span>${(cart.total + (shippingOptions.find(s => s.id === shippingMethod)?.price || 0)).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );

    const addressStep = (
        <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Shipping Address</h2>
            <AddressList
                selectable
                selectedId={selectedAddressObj?.id}
                onSelect={setSelectedAddressObj}
            />

            <div className="mt-8 flex justify-end">
                <Button
                    onClick={nextStep}
                    disabled={!selectedAddressObj}
                >
                    Continue to Shipping
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <SEO title="Checkout" description="Complete your purchase securely" noindex />
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-display font-bold text-primary-900 mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="bg-white rounded-xl p-6 shadow-card mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div
                                    className={`flex items-center gap-3 ${index <= stepIndex ? 'text-primary-500' : 'text-neutral-400'
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${index < stepIndex
                                            ? 'bg-success text-white'
                                            : index === stepIndex
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-neutral-100'
                                            }`}
                                    >
                                        {index < stepIndex ? <Check className="w-5 h-5" /> : step.icon}
                                    </div>
                                    <span className="hidden sm:block font-medium">{step.label}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${index < stepIndex ? 'bg-success' : 'bg-neutral-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {singleColumn ? (
                    <div className="space-y-8">
                        {summaryFirst && orderSummary}
                        <div>
                            <form onSubmit={handleSubmit(handlePlaceOrder)}>
                                {currentStep === 'address' && addressStep}

                                {/* Shipping Step */}
                                {currentStep === 'shipping' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Shipping Method</h2>

                                        <div className="space-y-4">
                                            {shippingOptions.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${shippingMethod === option.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="radio"
                                                            name="shipping"
                                                            checked={shippingMethod === option.id}
                                                            onChange={() => setShippingMethod(option.id)}
                                                        />
                                                        <div>
                                                            <p className="font-medium">{option.name}</p>
                                                            <p className="text-sm text-neutral-600">{option.days}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold">
                                                        {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button onClick={nextStep}>
                                                Continue to Payment
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Step */}
                                {currentStep === 'payment' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Payment Method</h2>

                                        <div className="space-y-4 mb-6">
                                            {[
                                                { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                                                { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                                                { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
                                            ].map((method) => (
                                                <label
                                                    key={method.id}
                                                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        checked={paymentMethod === method.id}
                                                        onChange={() => setPaymentMethod(method.id)}
                                                    />
                                                    <span className="text-2xl">{method.icon}</span>
                                                    <span className="font-medium">{method.name}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
                                                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Expiry Date" placeholder="MM/YY" />
                                                    <Input label="CVV" placeholder="123" />
                                                </div>
                                                <Input label="Name on Card" placeholder="John Doe" />
                                            </div>
                                        )}

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button onClick={nextStep}>
                                                Review Order
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Review Step */}
                                {currentStep === 'review' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Review Order</h2>

                                        <div className="space-y-6">
                                            {/* Order Items */}
                                            <div>
                                                <h3 className="font-medium text-neutral-900 mb-4">Order Items</h3>
                                                <div className="space-y-3">
                                                    {cart.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <img
                                                                src={getImageUrl(item.product.images[0]?.url)}
                                                                alt={item.product.name}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{item.product.name}</p>
                                                                <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="font-bold">${item.total_price.toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-100 pt-4">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                    <Lock className="w-4 h-4" />
                                                    Your payment information is secure
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button type="submit" size="lg" isLoading={isSubmitting}>
                                                <Lock className="w-5 h-5 mr-2" />
                                                Place Order - ${cart.total.toFixed(2)}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                        {!summaryFirst && orderSummary}
                    </div>
                ) : (
                    <div className={gridWrapperClass}>
                        {/* Main Content */}
                        <div className={mainColClass}>
                            <form onSubmit={handleSubmit(handlePlaceOrder)}>
                                {currentStep === 'address' && addressStep}

                                {/* Shipping Step */}
                                {currentStep === 'shipping' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Shipping Method</h2>

                                        <div className="space-y-4">
                                            {shippingOptions.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${shippingMethod === option.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="radio"
                                                            name="shipping"
                                                            checked={shippingMethod === option.id}
                                                            onChange={() => setShippingMethod(option.id)}
                                                        />
                                                        <div>
                                                            <p className="font-medium">{option.name}</p>
                                                            <p className="text-sm text-neutral-600">{option.days}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold">
                                                        {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button onClick={nextStep}>
                                                Continue to Payment
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Step */}
                                {currentStep === 'payment' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Payment Method</h2>

                                        <div className="space-y-4 mb-6">
                                            {[
                                                { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                                                { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                                                { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
                                            ].map((method) => (
                                                <label
                                                    key={method.id}
                                                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        checked={paymentMethod === method.id}
                                                        onChange={() => setPaymentMethod(method.id)}
                                                    />
                                                    <span className="text-2xl">{method.icon}</span>
                                                    <span className="font-medium">{method.name}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
                                                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Expiry Date" placeholder="MM/YY" />
                                                    <Input label="CVV" placeholder="123" />
                                                </div>
                                                <Input label="Name on Card" placeholder="John Doe" />
                                            </div>
                                        )}

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button onClick={nextStep}>
                                                Review Order
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Review Step */}
                                {currentStep === 'review' && (
                                    <div className="bg-white rounded-xl p-6 shadow-card">
                                        <h2 className="text-xl font-bold text-primary-900 mb-6">Review Order</h2>

                                        <div className="space-y-6">
                                            {/* Order Items */}
                                            <div>
                                                <h3 className="font-medium text-neutral-900 mb-4">Order Items</h3>
                                                <div className="space-y-3">
                                                    {cart.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <img
                                                                src={getImageUrl(item.product.images[0]?.url)}
                                                                alt={item.product.name}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{item.product.name}</p>
                                                                <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="font-bold">${item.total_price.toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-100 pt-4">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                    <Lock className="w-4 h-4" />
                                                    Your payment information is secure
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button variant="ghost" onClick={prevStep}>
                                                Back
                                            </Button>
                                            <Button type="submit" size="lg" isLoading={isSubmitting}>
                                                <Lock className="w-5 h-5 mr-2" />
                                                Place Order - ${cart.total.toFixed(2)}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {orderSummary}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
