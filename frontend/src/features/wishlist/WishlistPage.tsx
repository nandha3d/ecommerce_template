import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { wishlistService } from '../../services/wishlist.service';
import { WishlistItem } from '../../types';
import { Button, Loader, Badge } from '../../components/ui';
import { getImageUrl } from '../../utils/imageUtils';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

const WishlistPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const items = await wishlistService.getWishlist();
            setWishlistItems(items);
        } catch (error) {
            toast.error('Failed to load wishlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId: number) => {
        try {
            await wishlistService.removeFromWishlist(productId);
            setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleMoveToCart = async (item: WishlistItem) => {
        try {
            // Check stock status first
            if (item.product.stock_status === 'out_of_stock') {
                toast.error('Product is out of stock');
                return;
            }

            // Get default variant ID for cart (variant-first architecture)
            const variantId = item.product.variants?.[0]?.id || (item.product as any).default_variant_id;
            await dispatch(addToCart({ productId: item.product_id, quantity: 1, variantId })).unwrap();
            await wishlistService.removeFromWishlist(item.product_id); // Optional: remove after adding
            setWishlistItems((prev) => prev.filter((i) => i.product_id !== item.product_id));
            toast.success('Moved to cart');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader size="lg" text="Loading wishlist..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">My Wishlist</h1>
            <p className="text-neutral-600 mb-8">{wishlistItems.length} items saved for later</p>

            {wishlistItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-danger" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-neutral-500 mb-6">Save items you love to access them later.</p>
                    <Link to="/products">
                        <Button variant="primary">Start Exploring</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden group hover:shadow-soft transition-all duration-300">
                            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                                <Link to={`/products/${item.product.slug}`}>
                                    <img
                                        src={getImageUrl(item.product.images[0]?.url)}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>
                                <button
                                    onClick={() => handleRemove(item.product_id)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-neutral-400 hover:text-danger hover:bg-white transition-colors shadow-sm"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {item.product.stock_status === 'out_of_stock' && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <Badge variant="danger">Out of Stock</Badge>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <Link to={`/products/${item.product.slug}`}>
                                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1 hover:text-primary-500 transition-colors">
                                        {item.product.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="font-bold text-lg text-primary-900">
                                        ${((item.product.sale_price || item.product.price) || 0).toFixed(2)}
                                    </span>
                                    {item.product.sale_price && (
                                        <span className="text-sm text-neutral-400 line-through">
                                            ${(item.product.price || 0).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    fullWidth
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleMoveToCart(item)}
                                    disabled={item.product.stock_status === 'out_of_stock'}
                                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
