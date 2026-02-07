import React, { useState, useEffect } from 'react';

interface BundleProduct {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

interface Bundle {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    regular_price: number;
    bundle_price: number;
    savings_amount: number;
    savings_percent: number;
    products: BundleProduct[];
    ends_at?: string;
}

interface Props {
    bundles: Bundle[];
    onAddToCart: (bundleId: number) => void;
}

const ProductBundles: React.FC<Props> = ({ bundles, onAddToCart }) => {
    const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: { [key: number]: string } = {};
            bundles.forEach(bundle => {
                if (bundle.ends_at) {
                    newTimeLeft[bundle.id] = calculateTimeLeft(bundle.ends_at);
                }
            });
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [bundles]);

    const calculateTimeLeft = (endDate: string): string => {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m ${seconds}s left`;
    };

    if (bundles.length === 0) return null;

    return (
        <div className="product-bundles">
            <div className="bundles-header">
                <h2>
                    <span className="icon">🎁</span>
                    Bundle & Save
                </h2>
                <p>Get more for less with our specially curated bundles</p>
            </div>

            <div className="bundles-grid">
                {bundles.map(bundle => (
                    <div key={bundle.id} className="bundle-card">
                        {/* Savings Badge */}
                        <div className="savings-badge">
                            Save {bundle.savings_percent}%
                        </div>

                        {/* Timer (if limited time) */}
                        {bundle.ends_at && timeLeft[bundle.id] && (
                            <div className="timer-badge">
                                ⏰ {timeLeft[bundle.id]}
                            </div>
                        )}

                        {/* Bundle Image */}
                        <div className="bundle-image">
                            {bundle.image ? (
                                <img src={bundle.image} alt={bundle.name} />
                            ) : (
                                <div className="product-stack">
                                    {bundle.products.slice(0, 3).map((product, idx) => (
                                        <img
                                            key={product.id}
                                            src={product.image}
                                            alt={product.name}
                                            style={{
                                                zIndex: 3 - idx,
                                                transform: `translateX(${idx * 20}px) rotate(${idx * -5}deg)`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bundle Info */}
                        <div className="bundle-content">
                            <h3>{bundle.name}</h3>
                            {bundle.description && (
                                <p className="description">{bundle.description}</p>
                            )}

                            {/* Products in Bundle */}
                            <div className="bundle-products">
                                <span className="label">Includes:</span>
                                <ul>
                                    {bundle.products.map(product => (
                                        <li key={product.id}>
                                            {product.quantity > 1 && <span className="qty">{product.quantity}x </span>}
                                            {product.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pricing */}
                            <div className="bundle-pricing">
                                <div className="prices">
                                    <span className="original-price">₹{bundle.regular_price.toFixed(2)}</span>
                                    <span className="bundle-price">₹{bundle.bundle_price.toFixed(2)}</span>
                                </div>
                                <div className="savings-amount">
                                    You save ₹{bundle.savings_amount.toFixed(2)}
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <button
                                className="add-bundle-btn"
                                onClick={() => onAddToCart(bundle.id)}
                            >
                                <span>🛒</span> Add Bundle to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .product-bundles {
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fce7f3 100%);
                    border-radius: 24px;
                    margin: 40px 0;
                }

                .bundles-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .bundles-header h2 {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-size: 28px;
                    margin: 0 0 8px;
                    color: #1f2937;
                }

                .bundles-header .icon {
                    font-size: 32px;
                }

                .bundles-header p {
                    color: #6b7280;
                    margin: 0;
                    font-size: 16px;
                }

                .bundles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                }

                .bundle-card {
                    position: relative;
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .bundle-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                }

                .savings-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 14px;
                    z-index: 10;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                .timer-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    z-index: 10;
                }

                .bundle-image {
                    height: 200px;
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .bundle-image > img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-stack {
                    display: flex;
                    position: relative;
                    padding: 20px;
                }

                .product-stack img {
                    width: 100px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 12px;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    position: absolute;
                }

                .bundle-content {
                    padding: 24px;
                }

                .bundle-content h3 {
                    margin: 0 0 8px;
                    font-size: 20px;
                    color: #1f2937;
                }

                .description {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0 0 16px;
                    line-height: 1.5;
                }

                .bundle-products {
                    margin-bottom: 20px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 12px;
                }

                .bundle-products .label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 8px;
                }

                .bundle-products ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .bundle-products li {
                    font-size: 14px;
                    color: #374151;
                    padding: 4px 0;
                    display: flex;
                    align-items: center;
                }

                .bundle-products li::before {
                    content: '✓';
                    color: #10b981;
                    margin-right: 8px;
                    font-weight: bold;
                }

                .bundle-products .qty {
                    font-weight: 600;
                    color: #3b82f6;
                }

                .bundle-pricing {
                    margin-bottom: 16px;
                }

                .prices {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 4px;
                }

                .original-price {
                    font-size: 16px;
                    color: #9ca3af;
                    text-decoration: line-through;
                }

                .bundle-price {
                    font-size: 28px;
                    font-weight: 700;
                    color: #059669;
                }

                .savings-amount {
                    font-size: 14px;
                    color: #dc2626;
                    font-weight: 500;
                }

                .add-bundle-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s;
                }

                .add-bundle-btn:hover {
                    background: linear-gradient(135deg, #d97706, #b45309);
                    transform: scale(1.02);
                }

                @media (max-width: 640px) {
                    .bundles-grid {
                        grid-template-columns: 1fr;
                    }

                    .bundle-image {
                        height: 160px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductBundles;
