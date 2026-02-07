import React, { useState } from 'react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
}

interface ShippingAddress {
    name: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
}

interface PaymentGateway {
    id: number;
    slug: string;
    name: string;
    description: string;
    logo?: string;
}

interface Props {
    cartItems: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount?: number;
    paymentGateways: PaymentGateway[];
    onPlaceOrder: (data: { shipping: ShippingAddress; payment: string }) => void;
    loading?: boolean;
}

type Step = 'shipping' | 'payment' | 'review';

const MinimalCheckout: React.FC<Props> = ({
    cartItems,
    subtotal,
    shipping,
    tax,
    total,
    discount = 0,
    paymentGateways,
    onPlaceOrder,
    loading = false,
}) => {
    const [step, setStep] = useState<Step>('shipping');
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        name: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
    });
    const [selectedPayment, setSelectedPayment] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateShipping = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
        if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
        if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
        if (!shippingAddress.address_line_1.trim()) newErrors.address_line_1 = 'Address is required';
        if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
        if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
        if (!shippingAddress.postal_code.trim()) newErrors.postal_code = 'PIN code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateShipping()) {
            setStep('payment');
        }
    };

    const handlePaymentSubmit = () => {
        if (!selectedPayment) {
            setErrors({ payment: 'Please select a payment method' });
            return;
        }
        setStep('review');
    };

    const handlePlaceOrder = () => {
        onPlaceOrder({
            shipping: shippingAddress,
            payment: selectedPayment,
        });
    };

    const updateField = (field: keyof ShippingAddress, value: string) => {
        setShippingAddress(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const steps = [
        { key: 'shipping', label: 'Shipping', icon: '📦' },
        { key: 'payment', label: 'Payment', icon: '💳' },
        { key: 'review', label: 'Review', icon: '✅' },
    ];

    return (
        <div className="minimal-checkout">
            {/* Progress Steps */}
            <div className="checkout-steps">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.key}>
                        <div
                            className={`step ${step === s.key ? 'active' : ''} ${steps.findIndex(st => st.key === step) > idx ? 'completed' : ''}`}
                            onClick={() => steps.findIndex(st => st.key === step) > idx && setStep(s.key as Step)}
                        >
                            <span className="step-icon">{s.icon}</span>
                            <span className="step-label">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && <div className="step-line" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="checkout-content">
                {/* Shipping Form */}
                {step === 'shipping' && (
                    <form onSubmit={handleShippingSubmit} className="checkout-form">
                        <h2>Shipping Details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Full Name *"
                                    value={shippingAddress.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={shippingAddress.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="tel"
                                    placeholder="Phone *"
                                    value={shippingAddress.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Address Line 1 *"
                                value={shippingAddress.address_line_1}
                                onChange={(e) => updateField('address_line_1', e.target.value)}
                                className={errors.address_line_1 ? 'error' : ''}
                            />
                            {errors.address_line_1 && <span className="error-text">{errors.address_line_1}</span>}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Address Line 2 (Optional)"
                                value={shippingAddress.address_line_2}
                                onChange={(e) => updateField('address_line_2', e.target.value)}
                            />
                        </div>

                        <div className="form-row three-col">
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="City *"
                                    value={shippingAddress.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    className={errors.city ? 'error' : ''}
                                />
                                {errors.city && <span className="error-text">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="State *"
                                    value={shippingAddress.state}
                                    onChange={(e) => updateField('state', e.target.value)}
                                    className={errors.state ? 'error' : ''}
                                />
                                {errors.state && <span className="error-text">{errors.state}</span>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="PIN Code *"
                                    value={shippingAddress.postal_code}
                                    onChange={(e) => updateField('postal_code', e.target.value)}
                                    className={errors.postal_code ? 'error' : ''}
                                />
                                {errors.postal_code && <span className="error-text">{errors.postal_code}</span>}
                            </div>
                        </div>

                        <button type="submit" className="continue-btn">
                            Continue to Payment →
                        </button>
                    </form>
                )}

                {/* Payment Selection */}
                {step === 'payment' && (
                    <div className="checkout-form">
                        <h2>Select Payment Method</h2>

                        <div className="payment-methods">
                            {paymentGateways.map(gateway => (
                                <label
                                    key={gateway.id}
                                    className={`payment-option ${selectedPayment === gateway.slug ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={gateway.slug}
                                        checked={selectedPayment === gateway.slug}
                                        onChange={() => setSelectedPayment(gateway.slug)}
                                    />
                                    <div className="payment-content">
                                        {gateway.logo && <img src={gateway.logo} alt={gateway.name} />}
                                        <div className="payment-info">
                                            <span className="name">{gateway.name}</span>
                                            <span className="desc">{gateway.description}</span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {errors.payment && <span className="error-text center">{errors.payment}</span>}

                        <div className="form-actions">
                            <button className="back-btn" onClick={() => setStep('shipping')}>
                                ← Back
                            </button>
                            <button className="continue-btn" onClick={handlePaymentSubmit}>
                                Review Order →
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Review */}
                {step === 'review' && (
                    <div className="checkout-form">
                        <h2>Review Your Order</h2>

                        <div className="review-section">
                            <h3>📦 Shipping To</h3>
                            <p>
                                <strong>{shippingAddress.name}</strong><br />
                                {shippingAddress.address_line_1}<br />
                                {shippingAddress.address_line_2 && <>{shippingAddress.address_line_2}<br /></>}
                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />
                                📧 {shippingAddress.email} | 📱 {shippingAddress.phone}
                            </p>
                        </div>

                        <div className="review-section">
                            <h3>💳 Payment Method</h3>
                            <p>{paymentGateways.find(g => g.slug === selectedPayment)?.name}</p>
                        </div>

                        <div className="review-section">
                            <h3>🛒 Order Items ({cartItems.length})</h3>
                            <div className="order-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="order-item">
                                        {item.image && <img src={item.image} alt={item.name} />}
                                        <div className="item-info">
                                            <span className="name">{item.name}</span>
                                            {item.variant && <span className="variant">{item.variant}</span>}
                                            <span className="qty">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="back-btn" onClick={() => setStep('payment')}>
                                ← Back
                            </button>
                            <button
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Place Order ₹' + total.toFixed(2)}
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Summary (Sidebar) */}
                <div className="order-summary">
                    <h3>Order Summary</h3>

                    <div className="summary-items">
                        {cartItems.slice(0, 3).map(item => (
                            <div key={item.id} className="summary-item">
                                <span className="name">{item.name} ×{item.quantity}</span>
                                <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        {cartItems.length > 3 && (
                            <div className="more-items">+{cartItems.length - 3} more items</div>
                        )}
                    </div>

                    <div className="summary-totals">
                        <div className="row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="row discount">
                                <span>Discount</span>
                                <span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="row">
                            <span>Tax</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="row total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="secure-badge">
                        🔒 Secure Checkout - 256-bit SSL
                    </div>
                </div>
            </div>

            <style>{`
                .minimal-checkout {
                    min-height: 100vh;
                    background: #f8fafc;
                    padding: 40px 20px;
                }

                .checkout-steps {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 500px;
                    margin: 0 auto 40px;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }

                .step.active, .step.completed {
                    opacity: 1;
                }

                .step-icon {
                    font-size: 28px;
                }

                .step-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .step-line {
                    flex: 1;
                    height: 2px;
                    background: #e5e7eb;
                    margin: 0 20px;
                }

                .checkout-content {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 40px;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .checkout-form {
                    background: #fff;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                .checkout-form h2 {
                    margin: 0 0 24px;
                    font-size: 24px;
                    color: #1f2937;
                }

                .form-row {
                    display: grid;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .form-row.two-col { grid-template-columns: 1fr 1fr; }
                .form-row.three-col { grid-template-columns: 1fr 1fr 1fr; }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 16px;
                }

                .form-group input {
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .form-group input.error {
                    border-color: #ef4444;
                }

                .error-text {
                    color: #ef4444;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .error-text.center {
                    text-align: center;
                    display: block;
                    margin-bottom: 16px;
                }

                .continue-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .continue-btn:hover {
                    transform: translateY(-2px);
                }

                .back-btn {
                    padding: 16px 24px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 24px;
                }

                .form-actions .continue-btn {
                    flex: 1;
                }

                .payment-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .payment-option {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .payment-option.selected {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }

                .payment-option input {
                    margin-right: 12px;
                }

                .payment-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .payment-content img {
                    width: 48px;
                    height: 32px;
                    object-fit: contain;
                }

                .payment-info {
                    display: flex;
                    flex-direction: column;
                }

                .payment-info .name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .payment-info .desc {
                    font-size: 13px;
                    color: #6b7280;
                }

                .review-section {
                    margin-bottom: 24px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .review-section h3 {
                    margin: 0 0 12px;
                    font-size: 16px;
                }

                .review-section p {
                    margin: 0;
                    line-height: 1.6;
                    color: #374151;
                }

                .order-items {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .order-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .order-item img {
                    width: 48px;
                    height: 48px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .order-item .item-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .order-item .name {
                    font-weight: 500;
                }

                .order-item .variant, .order-item .qty {
                    font-size: 13px;
                    color: #6b7280;
                }

                .order-item .price {
                    font-weight: 600;
                }

                .place-order-btn {
                    flex: 1;
                    padding: 18px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .place-order-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .order-summary {
                    background: #fff;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    height: fit-content;
                    position: sticky;
                    top: 24px;
                }

                .order-summary h3 {
                    margin: 0 0 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .summary-items {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .summary-item .name {
                    color: #6b7280;
                }

                .more-items {
                    color: #3b82f6;
                    font-size: 14px;
                    cursor: pointer;
                }

                .summary-totals .row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    font-size: 15px;
                }

                .summary-totals .row.discount {
                    color: #059669;
                }

                .summary-totals .row.total {
                    font-size: 20px;
                    font-weight: 700;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 2px solid #e5e7eb;
                }

                .secure-badge {
                    text-align: center;
                    padding: 12px;
                    background: #f0fdf4;
                    border-radius: 8px;
                    color: #059669;
                    font-size: 13px;
                    margin-top: 20px;
                }

                @media (max-width: 900px) {
                    .checkout-content {
                        grid-template-columns: 1fr;
                    }

                    .order-summary {
                        position: static;
                        order: -1;
                    }
                }

                @media (max-width: 640px) {
                    .form-row.two-col,
                    .form-row.three-col {
                        grid-template-columns: 1fr;
                    }

                    .checkout-form {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MinimalCheckout;
