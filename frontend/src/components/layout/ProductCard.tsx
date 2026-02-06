import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addToCart } from '../../store/slices/cartSlice';
import { wishlistService } from '../../services';
import { Badge, Button } from '../ui';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';
import { PriceDisplay } from '../common/PriceDisplay';

interface ProductCardProps {
    product: Product;
    showQuickAdd?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showQuickAdd = true }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Use server-provided discount (Strict Repair)
    const discountPercentage = product.discount_percent || 0;

    // Get the default variant ID for cart operations
    const defaultVariantId = product.variants?.[0]?.id || (product as any).default_variant_id;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await dispatch(addToCart({ productId: product.id, quantity: 1, variantId: defaultVariantId })).unwrap();
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (wishlistLoading) return;

        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                await wishlistService.removeFromWishlist(product.id);
                setIsInWishlist(false);
                toast.success('Removed from wishlist');
            } else {
                await wishlistService.addToWishlist(product.id);
                setIsInWishlist(true);
                toast.success('Added to wishlist!');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const getStockBadge = () => {
        switch (product.stock_status) {
            case 'out_of_stock':
                return <Badge variant="danger">Out of Stock</Badge>;
            case 'low_stock':
                return <Badge variant="warning">Low Stock</Badge>;
            default:
                return null;
        }
    };

    const MotionLink = motion.create(Link);

    return (
        <MotionLink
            to={`/products/${product.slug}`}
            className="group block bg-white rounded-xl border border-neutral-200/50 overflow-hidden shadow-card hover:shadow-soft transition-all duration-300"
            variants={{
                hidden: { opacity: 0, scale: 0.8, y: 30 },
                visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        mass: 0.8
                    }
                }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                <img
                    src={getImageUrl(product.images[0]?.url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discountPercentage > 0 && (
                        <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded">
                            -{discountPercentage}%
                        </span>
                    )}
                    {product.is_new && (
                        <span className="px-2 py-1 bg-success text-white text-xs font-bold rounded">
                            NEW
                        </span>
                    )}
                    {product.is_bestseller && (
                        <span className="px-2 py-1 bg-warning text-white text-xs font-bold rounded">
                            BEST SELLER
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAuthenticated && (
                        <button
                            onClick={handleToggleWishlist}
                            disabled={wishlistLoading}
                            className={`w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${isInWishlist
                                ? 'text-danger bg-red-50'
                                : 'text-neutral-600 hover:text-danger hover:bg-red-50'
                                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/products/${product.slug}`);
                        }}
                        className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-600 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                {/* Add to Cart Button */}
                {showQuickAdd && product.stock_status !== 'out_of_stock' && (
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Button
                            onClick={handleAddToCart}
                            variant="primary"
                            size="sm"
                            fullWidth
                            leftIcon={<ShoppingCart className="w-4 h-4" />}
                        >
                            Add to Cart
                        </Button>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category */}
                {product.categories[0] && (
                    <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">
                        {product.categories[0].name}
                    </p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(product.average_rating)
                                    ? 'text-warning fill-warning'
                                    : 'text-neutral-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-neutral-500">
                        ({product.review_count})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <PriceDisplay
                        amountInBase={product.effective_price || product.price || 0}
                        originalPrice={product.discount_percent ? (product.price || 0) : undefined}
                        className="text-lg font-bold text-primary-900"
                    />
                </div>

                {/* Stock Status */}
                <div className="mt-2">
                    {getStockBadge()}
                </div>
            </div>
        </MotionLink>
    );
};

export default ProductCard;
