import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart, Package } from 'lucide-react';
import { useGlobalization } from '../../../context/GlobalizationContext';
// import { useDispatch } from 'react-redux';
// import { addToCart } from '../../../store/cartSlice';

interface ProductCardProps {
    product: any;
    className?: string;
    showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '', showActions = true }) => {
    const { formatPrice } = useGlobalization();
    // const dispatch = useDispatch();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        // Implement quick add logic or open drawer
        // dispatch(addToCart(...));
    };

    return (
        <div className={`card product-card ${className}`} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '300px', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
                {product.images?.[0] ? (
                    <img
                        src={product.images[0].url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div className="flex-center" style={{ height: '100%' }}>
                        <Package size={64} color="var(--text-muted)" />
                    </div>
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 'var(--space-md)', left: 'var(--space-md)', display: 'flex', gap: 'var(--space-xs)' }}>
                    {product.sale_price && (
                        <span className="badge badge-error">SALE</span>
                    )}
                    {product.is_new && (
                        <span className="badge badge-info">NEW</span>
                    )}
                </div>

                {/* Overlay Actions */}
                {showActions && (
                    <div className="product-actions">
                        <Link
                            to={`/products/${product.slug}`}
                            className="btn btn-primary"
                            style={{ borderRadius: '50%', padding: '12px', width: '44px', height: '44px' }}
                            title="View Details"
                        >
                            <Eye size={20} />
                        </Link>
                        <button
                            className="btn btn-primary"
                            style={{ borderRadius: '50%', padding: '12px', width: '44px', height: '44px' }}
                            onClick={handleQuickAdd}
                            title="Quick Add"
                        >
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{ marginBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {product.brand?.name || 'Exclusive'}
                    </span>
                </div>
                <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ margin: '0 0 var(--space-sm) 0', fontSize: '1.2rem', lineHeight: 1.4 }}>{product.name}</h3>
                </Link>

                <div className="flex-between">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {formatPrice(product.sale_price || product.price)}
                            </span>
                            {product.sale_price && product.sale_price < product.price && (
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
