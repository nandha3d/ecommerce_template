import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    MapPin,
    Truck,
    CreditCard,
    Check,
    Lock,
    AlertTriangle
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { useStoreLayoutSettings } from '../../storeLayout/StoreLayoutProvider';
import { orderService } from '../../services/order.service';
import { paymentService, getStripe } from '../../services/payment.service';
import { checkoutService } from '../../services/checkout.service';
import { Button, Input, Loader } from '../../components/ui';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { SEO } from '../../components/common/SEO';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';
import { AddressList } from '../user/components/AddressList';
import { Address } from '../../types';
import { getLayoutConfig } from '../../constants/layouts';
import PaymentForm from '../../components/payment/PaymentForm';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    // dispatch is available if needed for other actions
    // const dispatch = useAppDispatch(); 
    const { cart, isLoading: cartLoading } = useAppSelector((state) => state.cart);
    const { settings } = useStoreLayoutSettings();
    const layoutVariant = settings.checkout;
    const layoutConfig = getLayoutConfig(layoutVariant);

    const {
        singleColumn = false,
        summaryFirst = false,
        mainColClass = 'lg:col-span-2',
        gridWrapperClass = 'lg:grid lg:grid-cols-3 lg:gap-8',
    } = layoutConfig as any;

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');

    // Checkout State
    const [selectedAddressObj, setSelectedAddressObj] = useState<Address | null>(null);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('razorpay'); // Default to Razorpay
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null); // Razorpay Order ID or Stripe Client Secret
    const [stripePromise, setStripePromise] = useState<any>(null);
    const [orderValidation, setOrderValidation] = useState<any>(null);
    const [checkoutId, setCheckoutId] = useState<number | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Initialize Stripe and form
    useEffect(() => {
        const stripe = getStripe();
        setStripePromise(stripe);
    }, []);

    // Load Razorpay SDK
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Validate order when cart changes
    useEffect(() => {
        if (cart && cart.items.length > 0) {
            validateOrder();
        }
    }, [cart]);

    const validateOrder = async () => {
        setIsValidating(true);
        try {
            const validation = await orderService.validateOrder();
            setOrderValidation(validation);

            if (validation.valid && validation.checkout_id) {
                setCheckoutId(validation.checkout_id);
            }

            if (!validation.valid) {
                toast.error('Some items in your cart are no longer available. Please review your cart.');
            }
        } catch (error) {
            console.error('Order validation failed:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Initialize Payment (Strict Flow)
    useEffect(() => {
        if (currentStep === 'payment' && checkoutId && !clientSecret) {
            initializePayment();
        }
    }, [currentStep, checkoutId]);

    const initializePayment = async () => {
        if (!checkoutId) {
            toast.error('Session expired. Please review your cart.');
            return;
        }

        try {
            // Call Backend to Create Payment Intent (Stripe) or Order (Razorpay)
            const response = await checkoutService.initiatePayment(String(checkoutId), paymentMethod);

            if (response.client_secret) {
                setClientSecret(response.client_secret);
            } else {
                toast.error('Unable to secure payment connection.');
            }
        } catch (error: any) {
            toast.error('Failed to initialize payment: ' + (error.response?.data?.message || error.message));
            console.error(error);
        }
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        if (!clientSecret) {
            toast.error('Payment initialization failed. Refreshing...');
            initializePayment();
            return;
        }

        const options = {
            key: "rzp_test_SCtZeLvJHObiCH", // Should ideally be from env
            amount: Math.round(cart!.total * 100),
            currency: "INR", // Backend should force this, but strictly cart.currency needed if dynamic
            name: "ShopKart",
            description: "Checkout Payment",
            order_id: clientSecret, // The Order ID from createCheckoutIntent
            handler: async function (response: any) {
                try {
                    setIsSubmitting(true);
                    // Verify and Capture
                    const verifyRes = await checkoutService.initiatePayment(
                        String(checkoutId),
                        'razorpay',
                        response.razorpay_payment_id,
                        {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        }
                    );

                    if (verifyRes.transaction_id) {
                        toast.success('Payment Successful!');
                        navigate('/order-success/' + (verifyRes.transaction_id || ''));
                        // Or trigger handlePlaceOrder if we separate order creation from payment?
                        // Current flow: Payment Success -> Order Created? 
                        // Actually Backend initiate returns transaction_id. 
                        // Do we strictly create the "Order" entity after payment?
                        // Legacy flow: createOrder() then pay.
                        // Strict flow: CheckoutSession -> Payment -> Order?
                        // We need to clarify if "Order" exists yet.
                        // OrderController::store creates order.
                        // Usually clean flow: Frontend calls createOrder() passing transaction_id.
                    }
                } catch (error) {
                    toast.error('Payment Verification Failed');
                    setIsSubmitting(false);
                }
            },
            prefill: {
                name: selectedAddressObj?.name,
                email: "user@example.com", // TODO: Get from user/auth
                contact: selectedAddressObj?.phone
            },
            theme: {
                color: "#3399cc"
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

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
        // Backend does not support Express/Overnight yet. Removed to prevent Money Path violation.
    ];

    const handlePlaceOrder = async (paymentIntentId?: string) => {
        if (!cart || !selectedAddressObj) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Validate order one more time before placing
            const validation = await orderService.validateOrder();
            if (!validation.valid) {
                if (validation.errors?.items) {
                    toast.error('Some items in your cart are no longer available. Please review your cart.');
                    navigate('/cart');
                    return;
                }
                if (validation.errors?.shipping) {
                    toast.error(validation.errors.shipping);
                    setCurrentStep('address');
                    return;
                }
            }

            // Create order with enhanced data
            const order = await orderService.createOrder({
                payment_method: paymentMethod,
                payment_intent_id: paymentIntentId,
                shipping_address_id: selectedAddressObj.id,
                billing_address_id: selectedAddressObj.id,
                notes: '',
                same_as_billing: true,
                reserve_inventory: true,
            });

            // Navigate to success page with order details
            navigate(`/checkout/success?order=${order.id}`);
        } catch (error: any) {
            // Extract meaningful error message from 422 validation errors
            const message = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Failed to place order';

            // If the cart became empty (race condition / cleared cart), route user back to cart.
            // Avoid showing this as an error toast.
            if (typeof message === 'string' && /cart is empty/i.test(message)) {
                navigate('/cart');
                return;
            }

            // Handle specific error cases
            if (message.includes('inventory') || message.includes('available')) {
                toast.error('Some items in your cart are no longer available. Please review your cart.');
                navigate('/cart');
                return;
            }

            if (message.includes('payment')) {
                toast.error('Payment processing failed. Please try a different payment method.');
                setCurrentStep('payment');
                return;
            }

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = (paymentIntent: any) => {
        handlePlaceOrder(paymentIntent.id);
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again.');
    };

    if (cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading secure checkout..." />
            </div>
        );
    }

    if (!cart || !cart.items.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your cart is empty</h2>
                    <p className="text-neutral-600 mb-6">Add some products to your cart to proceed with checkout.</p>
                    <Button onClick={() => navigate('/products')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    // Address Step
    const addressStep = (
        <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Shipping Address</h2>
            <AddressList
                selectable={true}
                selectedId={selectedAddressObj?.id}
                onSelect={(address: Address) => setSelectedAddressObj(address)}
            />
            <div className="mt-8 flex justify-between">
                <div></div>
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

    // Order Summary
    const orderSummary = (
        <div className="bg-white rounded-xl p-6 shadow-card h-fit">
            <h2 className="text-lg font-bold text-primary-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
                {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <img
                            src={item.product.images[0]?.url ? getImageUrl(item.product.images[0].url) : '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{item.product.name}</p>
                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-primary-900">
                            <PriceDisplay amountInBase={item.total_price} />
                        </p>
                    </div>
                ))}
            </div>

            <div className="border-t border-neutral-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span><PriceDisplay amountInBase={cart.subtotal} /></span>
                </div>
                {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                        <span>Discount</span>
                        <span>-<PriceDisplay amountInBase={cart.discount} /></span>
                    </div>
                )}
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Shipping</span>
                    <span>{cart.shipping === 0 ? 'FREE' : <PriceDisplay amountInBase={cart.shipping} />}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Tax</span>
                    <span><PriceDisplay amountInBase={cart.tax} /></span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary-900 pt-2 border-t border-neutral-100">
                    <span>Total</span>
                    <span><PriceDisplay amountInBase={cart.total} /></span>
                </div>
            </div>

            {orderValidation && !orderValidation.valid && (
                <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                    <div className="flex items-center gap-2 text-danger text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Some items need attention before checkout</span>
                    </div>
                </div>
            )}
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
                                        <div className="flex space-x-4 mb-6">
                                            <button
                                                onClick={() => setPaymentMethod('razorpay')}
                                                className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${paymentMethod === 'razorpay' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'
                                                    }`}
                                            >
                                                <span className="font-medium">Razorpay / UPI / NetBanking</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'
                                                    }`}
                                            >
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                <span className="font-medium">Card (Stripe)</span>
                                            </button>
                                        </div>
                                    </div>

                                    {paymentMethod === 'razorpay' ? (
                                        <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
                                            <p className="mb-6 text-neutral-600">
                                                Secure payment via Razorpay. Supports UPI, Cards, NetBanking, and Wallets.
                                            </p>
                                            <Button
                                                onClick={handleRazorpayPayment}
                                                isLoading={isSubmitting}
                                                className="w-full max-w-md mx-auto"
                                                size="lg"
                                            >
                                                Pay Now
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {clientSecret && stripePromise ? (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <PaymentForm
                                                        clientSecret={clientSecret}
                                                        onPaymentSuccess={handlePaymentSuccess}
                                                        onPaymentError={handlePaymentError}
                                                        isProcessing={isSubmitting}
                                                    />
                                                </Elements>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Loader size="sm" text="Initializing secure payment..." />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <Button variant="ghost" onClick={prevStep}>
                                            Back
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
                                                            src={item.product.images[0]?.url ? getImageUrl(item.product.images[0].url) : '/placeholder-product.jpg'}
                                                            alt={item.product.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{item.product.name}</p>
                                                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold">
                                                            <PriceDisplay amountInBase={item.total_price} />
                                                        </p>
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
                                        <Button size="lg" isLoading={isSubmitting} onClick={() => handlePlaceOrder()}>
                                            <Lock className="w-5 h-5 mr-2" />
                                            Place Order <span className="ml-1 opacity-90"><PriceDisplay amountInBase={cart.total} /></span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!summaryFirst && orderSummary}
                    </div>
                ) : (
                    <div className={gridWrapperClass}>
                        {/* Main Content */}
                        <div className={mainColClass}>
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
                                        <div className="flex space-x-4 mb-6">
                                            <button
                                                onClick={() => setPaymentMethod('razorpay')}
                                                className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${paymentMethod === 'razorpay' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'
                                                    }`}
                                            >
                                                <span className="font-medium">Razorpay / UPI / NetBanking</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('card')}
                                                className={`flex-1 p-4 border rounded-lg flex items-center justify-center space-x-2 ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'
                                                    }`}
                                            >
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                <span className="font-medium">Card (Stripe)</span>
                                            </button>
                                        </div>
                                    </div>

                                    {paymentMethod === 'razorpay' ? (
                                        <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
                                            <p className="mb-6 text-neutral-600">
                                                Secure payment via Razorpay. Supports UPI, Cards, NetBanking, and Wallets.
                                            </p>
                                            <Button
                                                onClick={handleRazorpayPayment}
                                                isLoading={isSubmitting}
                                                className="w-full max-w-md mx-auto"
                                                size="lg"
                                            >
                                                Pay Now
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {clientSecret && stripePromise ? (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <PaymentForm
                                                        clientSecret={clientSecret}
                                                        onPaymentSuccess={handlePaymentSuccess}
                                                        onPaymentError={handlePaymentError}
                                                        isProcessing={isSubmitting}
                                                    />
                                                </Elements>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Loader size="sm" text="Initializing secure payment..." />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <Button variant="ghost" onClick={prevStep}>
                                            Back
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
                                                            src={item.product.images[0]?.url ? getImageUrl(item.product.images[0].url) : '/placeholder-product.jpg'}
                                                            alt={item.product.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{item.product.name}</p>
                                                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold">
                                                            <PriceDisplay amountInBase={item.total_price} />
                                                        </p>
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
                                        <Button size="lg" isLoading={isSubmitting} onClick={() => handlePlaceOrder()}>
                                            <Lock className="w-5 h-5 mr-2" />
                                            Place Order <span className="ml-1 opacity-90"><PriceDisplay amountInBase={cart.total} /></span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {orderSummary}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
