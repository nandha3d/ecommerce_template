import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../../services/shopService';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import { useGlobalization } from '../../../context/GlobalizationContext';
import {
    ShoppingCart,
    Star,
    Truck,
    ShieldCheck,
    Minus,
    Plus,
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetail: React.FC = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { formatPrice } = useGlobalization();
    const [quantity, setQuantity] = useState(1);

    // Smart Selector State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['shop-product', slug],
        queryFn: () => shopService.getProductBySlug(slug!),
    });

    const product = data?.data?.data;

    // Extract unique attributes from variants
    const productAttributes = useMemo(() => {
        if (!product?.variants) return {};
        const attrs: Record<string, Set<string>> = {};

        product.variants.forEach((v: any) => {
            if (v.attributes) {
                Object.entries(v.attributes).forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    attrs[key].add(String(value));
                });
            }
        });

        // Sort values if needed (naive sort for now)
        const sortedAttrs: Record<string, string[]> = {};
        Object.keys(attrs).forEach(key => {
            sortedAttrs[key] = Array.from(attrs[key]).sort();
        });

        return sortedAttrs;
    }, [product]);

    // Update selectedVariant when options change
    useEffect(() => {
        if (!product?.variants) return;

        // Find variant matching ALL selected options
        const match = product.variants.find((v: any) => {
            if (!v.attributes) return false;
            // Check if every selected option matches this variant's attribute
            const hasAllSelected = Object.entries(selectedOptions).every(([key, val]) =>
                String(v.attributes[key]) === val
            );
            // Also check if variant has ONLY these attributes (strict match) implies we selected all keys
            // But usually we just need to match what's selected so far?
            // "Smart" usually implies selecting ALL required attributes.
            // If we have 2 attributes (Color, Size), we need both to identify a variant.
            const keysCountMatch = Object.keys(v.attributes).length === Object.keys(selectedOptions).length;

            return hasAllSelected && keysCountMatch;
        });

        setSelectedVariant(match || null);
    }, [selectedOptions, product]);

    // Pre-select first options if available
    useEffect(() => {
        if (product?.variants?.length > 0 && Object.keys(selectedOptions).length === 0) {
            // Optional: Auto-select highest stock or first variant
            const first = product.variants[0];
            if (first?.attributes) {
                setSelectedOptions(first.attributes);
            }
        }
    }, [product]);

    const handleOptionSelect = (attribute: string, value: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attribute]: value
        }));
    };

    // Check if an option combination is valid (exists in at least one variant)
    const isOptionAvailable = (attribute: string, value: string) => {
        // Create a potential selection
        const potential = { ...selectedOptions, [attribute]: value };

        // Is there ANY variant that matches this subset?
        return product.variants.some((v: any) => {
            return Object.entries(potential).every(([k, val]) => {
                // Ignore keys we haven't selected yet for this specific check?
                // Actually, we want to know if `val` is compatible with *other* currently selected options.
                if (v.attributes[k] === undefined) return false;
                return String(v.attributes[k]) === val;
            });
        });
    };

    const handleAddToCart = () => {
        if (product.variants?.length > 0 && !selectedVariant) {
            toast.error('Please select all options');
            return;
        }

        dispatch(addToCart({
            id: product.id,
            variant_id: selectedVariant?.id,
            name: product.name,
            price: selectedVariant?.price || product.price,
            image: product.images?.[0]?.url,
            quantity,
            attributes: selectedVariant?.attributes
        }));
        toast.success('Added to cart!');
    };

    if (isLoading) return <div className="flex-center" style={{ height: '600px' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
    if (!product) return <div className="flex-center" style={{ height: '400px' }}>Product not found.</div>;

    // Determine Logic State
    const priceToDisplay = selectedVariant ? selectedVariant.price : product.price;
    const isOutOfStock = selectedVariant ? (selectedVariant.stock_quantity <= 0) : (product.stock_quantity <= 0);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xl)' }}>
                {/* Image Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', height: '500px' }}>
                        <img
                            src={product.images?.[0]?.url}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            {product.images.map((img: any, i: number) => (
                                <div key={i} className="card" style={{ width: '80px', height: '80px', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent' }}>
                                    <img src={img.url} alt={`View ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.9rem' }}>{product.brand?.name}</span>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', color: '#fbbf24' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>(128 reviews)</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {formatPrice(priceToDisplay)}
                        </div>
                        {isOutOfStock && (
                            <span className="badge badge-error" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {product.description || 'Experience the ultimate performance boost with our premium supplement.'}
                    </p>

                    {/* Smart Selectors */}
                    {Object.keys(productAttributes).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            {Object.entries(productAttributes).map(([attrName, values]) => (
                                <div key={attrName}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                                        {attrName}: <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{selectedOptions[attrName]}</span>
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                        {values.map((value) => {
                                            const isSelected = selectedOptions[attrName] === value;
                                            const isAvailable = isOptionAvailable(attrName, value);

                                            // Optional: If not available, we can strikethrough or gray out
                                            // But standard "Amazon style" is user can select it, but it might invalidate OTHER options.
                                            // Simple approach: Always allow selection, but update available variants.

                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleOptionSelect(attrName, value)}
                                                    className={`card ${isSelected ? 'active-option' : ''}`}
                                                    style={{
                                                        padding: 'var(--space-sm) var(--space-md)',
                                                        cursor: 'pointer',
                                                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                        backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                                                        minWidth: '40px',
                                                        textAlign: 'center',
                                                        opacity: 1 // Managed by valid combos if we wanted strict enforcement
                                                    }}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                        <div className="card flex-center" style={{ padding: 'var(--space-sm)', gap: 'var(--space-md)', border: '1px solid var(--border)' }}>
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn-ghost"><Minus size={18} /></button>
                            <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="btn-ghost"><Plus size={18} /></button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary"
                            disabled={isOutOfStock || (product.variants?.length > 0 && !selectedVariant)}
                            style={{ flex: 1, height: '54px', fontSize: '1.1rem', opacity: isOutOfStock ? 0.6 : 1 }}
                        >
                            <ShoppingCart size={20} />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--space-md)',
                        marginTop: 'var(--space-xl)',
                        borderTop: '1px solid var(--border)',
                        paddingTop: 'var(--space-xl)'
                    }}>
                        <div className="flex-center" style={{ gap: 'var(--space-sm)', justifyContent: 'flex-start' }}>
                            <Truck size={20} color="var(--primary)" />
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Free Shipping</strong>
                                <div style={{ color: 'var(--text-muted)' }}>On orders over $100</div>
                            </div>
                        </div>
                        <div className="flex-center" style={{ gap: 'var(--space-sm)', justifyContent: 'flex-start' }}>
                            <ShieldCheck size={20} color="var(--primary)" />
                            <div style={{ fontSize: '0.9rem' }}>
                                <strong>Authentic</strong>
                                <div style={{ color: 'var(--text-muted)' }}>100% Genuine product</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
