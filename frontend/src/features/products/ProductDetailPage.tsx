import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Heart,
    Star,
    Minus,
    Plus,
    Share2,
    Truck,
    Shield,
    RotateCcw,
    ChevronRight,
    Check,
    ZoomIn,
    ChevronLeft
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useStoreLayoutSettings } from '../../storeLayout/StoreLayoutProvider';
import { fetchProduct, fetchRelatedProducts, clearCurrentProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { ProductCard } from '../../components/layout';
import { Button, Loader, Badge, ImageZoomModal } from '../../components/ui';
import { ProductVariant } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { settings } = useStoreLayoutSettings();
    const layoutVariant = settings.productDetail;
    const { currentProduct: product, relatedProducts, isLoading } = useAppSelector(
        (state) => state.products
    );
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<string>('description');
    const [selectedAddons, setSelectedAddons] = useState<Record<number, number[]>>({});

    // Image gallery state
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [autoRotateKey, setAutoRotateKey] = useState(0);
    const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Combine product images with variant images
    const allImages = useMemo(() => {
        if (!product) return [];
        const images = [...product.images];

        // Add variant images if they exist and aren't already included
        if (selectedVariant?.image) {
            const variantImageUrl = selectedVariant.image;
            const alreadyExists = images.some(img => img.url === variantImageUrl);
            if (!alreadyExists) {
                images.unshift({
                    id: -1,
                    url: variantImageUrl,
                    alt: selectedVariant.name,
                    is_primary: false,
                    sort_order: -1
                });
            }
        }

        return images;
    }, [product, selectedVariant]);

    // Auto-rotate images every 10 seconds
    useEffect(() => {
        if (!product || allImages.length <= 1 || isHovering || isZoomOpen) {
            if (autoRotateRef.current) {
                clearInterval(autoRotateRef.current);
                autoRotateRef.current = null;
            }
            return;
        }

        autoRotateRef.current = setInterval(() => {
            setSelectedImage(prev => (prev + 1) % allImages.length);
            setAutoRotateKey(prev => prev + 1);
        }, 10000);

        return () => {
            if (autoRotateRef.current) {
                clearInterval(autoRotateRef.current);
            }
        };
    }, [product, allImages.length, isHovering, isZoomOpen]);

    // Reset auto-rotate timer when image changes manually
    const handleImageSelect = useCallback((index: number) => {
        setSelectedImage(index);
        setAutoRotateKey(prev => prev + 1);
    }, []);

    // Get unique attribute names and their values (with priority ordering)
    const attributeGroups = useMemo(() => {
        if (!product?.variants.length) return [];

        // Priority order for attributes - weight/size first, flavor/color second
        const priorityOrder = ['weight', 'size', 'flavor', 'flavour', 'color', 'colour'];

        const groups: { name: string; values: string[] }[] = [];
        const attributeNames = Object.keys(product.variants[0].attributes || {});

        // Sort attribute names by priority
        const sortedNames = [...attributeNames].sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aIndex = priorityOrder.findIndex(p => aLower.includes(p));
            const bIndex = priorityOrder.findIndex(p => bLower.includes(p));

            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

        sortedNames.forEach(attrName => {
            const uniqueValues = [...new Set(
                product.variants.map(v => v.attributes[attrName]).filter(Boolean)
            )];
            groups.push({ name: attrName, values: uniqueValues });
        });

        return groups;
    }, [product?.variants]);

    // Get available values for each attribute based on previous selections
    const getAvailableValues = (attrIndex: number): string[] => {
        if (!product?.variants.length || attrIndex >= attributeGroups.length) return [];

        const attrName = attributeGroups[attrIndex].name;

        // Filter variants by all previously selected attributes
        let filteredVariants = product.variants;
        for (let i = 0; i < attrIndex; i++) {
            const prevAttrName = attributeGroups[i].name;
            const prevValue = selectedAttributes[prevAttrName];
            if (prevValue) {
                filteredVariants = filteredVariants.filter(v => v.attributes[prevAttrName] === prevValue);
            }
        }

        return [...new Set(filteredVariants.map(v => v.attributes[attrName]).filter(Boolean))];
    };

    // Get attribute swatch info for a specific attribute
    const getAttributeSwatch = (attrName: string) => {
        return (product as any)?.attribute_swatches?.find(
            (s: any) => s.name.toLowerCase() === attrName.toLowerCase()
        );
    };

    // Get image for a specific attribute value from attribute swatches
    const getSwatchImage = (attrName: string, value: string): string | null => {
        const swatch = getAttributeSwatch(attrName);
        if (!swatch) return null;

        const option = swatch.options?.find(
            (o: any) => o.value.toLowerCase() === value.toLowerCase() || o.label.toLowerCase() === value.toLowerCase()
        );
        return option?.image ? getImageUrl(option.image) : null;
    };

    // Get color code for a specific attribute value
    const getSwatchColor = (attrName: string, value: string): string | null => {
        const swatch = getAttributeSwatch(attrName);
        if (!swatch) return null;

        const option = swatch.options?.find(
            (o: any) => o.value.toLowerCase() === value.toLowerCase() || o.label.toLowerCase() === value.toLowerCase()
        );
        return option?.color_code || null;
    };

    // Get price difference for selecting a specific attribute value
    const getVariantPriceDiff = (attrIndex: number, value: string): number | null => {
        if (!product?.variants.length) return null;

        const attrName = attributeGroups[attrIndex].name;
        const basePrice = product.price;

        // Get current selected attributes plus this new selection
        const testAttrs = { ...selectedAttributes, [attrName]: value };

        // Find matching variant for these selections
        let matchingVariants = product.variants.filter(v => {
            return Object.entries(testAttrs).every(([key, val]) => v.attributes[key] === val);
        });

        if (matchingVariants.length === 0) return null;

        // Get the minimum price variant
        const variantPrice = Math.min(...matchingVariants.map(v => v.sale_price || v.price));
        const diff = variantPrice - basePrice;

        return diff !== 0 ? diff : null;
    };

    // Check attribute type from attribute_swatches
    const getAttributeType = (attrName: string): string => {
        const swatch = getAttributeSwatch(attrName);
        return swatch?.type || 'text';
    };

    // Check if price diff should be shown for this attribute group
    const shouldShowPriceDiff = (attrName: string): boolean => {
        const swatch = getAttributeSwatch(attrName);
        return swatch?.show_price_diff ?? true;
    };

    // Find matching variant when all attributes are selected
    useEffect(() => {
        if (!product?.variants.length || !attributeGroups.length) return;

        const allSelected = attributeGroups.every(g => selectedAttributes[g.name]);
        if (allSelected) {
            const matchingVariant = product.variants.find(v =>
                attributeGroups.every(g => v.attributes[g.name] === selectedAttributes[g.name])
            );
            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
            }
        }
    }, [selectedAttributes, product?.variants, attributeGroups]);

    // Handle attribute selection
    const handleAttributeSelect = (attrName: string, value: string, attrIndex: number) => {
        setSelectedAttributes(prev => {
            const newAttrs = { ...prev, [attrName]: value };
            // Clear subsequent attribute selections
            for (let i = attrIndex + 1; i < attributeGroups.length; i++) {
                delete newAttrs[attributeGroups[i].name];
            }
            return newAttrs;
        });
    };

    useEffect(() => {
        // Hydration check: if store already has this product, skip fetch
        if (slug && product?.slug === slug) {
            console.log('⚡ Using hydrated product data, skipping fetch.');
            return;
        }

        if (slug) {
            dispatch(fetchProduct(slug));
        }
        return () => {
            // Only clear if we are navigating AWAY (component unmounting)
            // But be careful not to clear if we are just switching products?
            // Existing logic cleared it. Keeping clean logic.
            dispatch(clearCurrentProduct());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, slug]);

    useEffect(() => {
        if (product) {
            dispatch(fetchRelatedProducts(product.id));
            if (product.variants.length > 0) {
                setSelectedVariant(product.variants[0]);
                setSelectedAttributes(product.variants[0].attributes);
            }
            // Reset add-ons when product changes
            setSelectedAddons({});
        }
    }, [dispatch, product]);

    // Handle add-on selection
    const handleAddonChange = (groupId: number, optionId: number, selectionType: 'single' | 'multiple') => {
        setSelectedAddons(prev => {
            if (selectionType === 'single') {
                return { ...prev, [groupId]: [optionId] };
            } else {
                const current = prev[groupId] || [];
                if (current.includes(optionId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [groupId]: [...current, optionId] };
                }
            }
        });
    };

    // Calculate add-ons total
    const addonsTotal = product?.addon_groups?.reduce((total, group) => {
        const selectedOptionIds = selectedAddons[group.id] || [];
        const groupTotal = group.options
            .filter(opt => selectedOptionIds.includes(opt.id))
            .reduce((sum, opt) => sum + opt.price, 0);
        return total + groupTotal;
    }, 0) || 0;

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await dispatch(addToCart({
                productId: product.id,
                quantity,
                variantId: selectedVariant?.id
            })).unwrap();
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            await dispatch(addToCart({
                productId: product.id,
                quantity,
                variantId: selectedVariant?.id
            })).unwrap();
            navigate('/checkout');
        } catch (error) {
            toast.error('Failed to proceed to checkout');
        }
    };

    const basePrice = selectedVariant?.sale_price || selectedVariant?.price ||
        product?.sale_price || product?.price || 0;
    const unitPrice = basePrice + addonsTotal;
    const unitOriginalPrice = (selectedVariant?.price || product?.price || 0) + addonsTotal;
    const totalPrice = unitPrice * quantity;
    const totalOriginalPrice = unitOriginalPrice * quantity;
    const discountPercentage = unitOriginalPrice > unitPrice
        ? Math.round(((unitOriginalPrice - unitPrice) / unitOriginalPrice) * 100)
        : 0;

    const detailsGridClass =
        layoutVariant === 4
            ? 'grid lg:grid-cols-12 gap-12'
            : layoutVariant === 3
                ? 'grid lg:grid-cols-12 gap-6' // 3-column Amazon style
                : 'grid lg:grid-cols-2 gap-12';
    const imagesColClass = layoutVariant === 4 ? 'lg:col-span-7' : layoutVariant === 3 ? 'lg:col-span-5' : '';
    const infoColClass = layoutVariant === 4 ? 'lg:col-span-5' : layoutVariant === 3 ? 'lg:col-span-4' : '';
    const buyBoxColClass = layoutVariant === 3 ? 'lg:col-span-3' : ''; // Third column for buy box
    const imagesOrderClass = layoutVariant === 2 ? 'lg:order-2' : 'lg:order-1';
    const infoOrderClass = layoutVariant === 2 ? 'lg:order-1' : 'lg:order-2';
    const infoStickyClass = layoutVariant === 4 ? 'lg:sticky lg:top-24 self-start' : '';
    const tabsOrder = layoutVariant === 5 ? 2 : 1;
    const relatedOrder = layoutVariant === 5 ? 1 : 2;

    // Debug logging
    useEffect(() => {
        console.log('ProductDetailPage State:', { isLoading, product, error: (product as any)?.error });
    }, [isLoading, product]);

    const { error } = useAppSelector((state) => state.products);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-medium">Failed to load product</div>
                <div className="text-sm text-neutral-500">{error}</div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    if (isLoading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading product..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="bg-neutral-50 py-4">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center text-sm text-neutral-500">
                        <Link to="/" className="hover:text-primary-500">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link to="/products" className="hover:text-primary-500">Products</Link>
                        {product.categories[0] && (
                            <>
                                <ChevronRight className="w-4 h-4 mx-2" />
                                <Link
                                    to={`/products?category=${product.categories[0].slug}`}
                                    className="hover:text-primary-500"
                                >
                                    {product.categories[0].name}
                                </Link>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-neutral-900">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Product Details */}
            <div className="container mx-auto px-4 py-8">
                <div className={detailsGridClass}>
                    {/* Images */}
                    <div
                        className={`${(product as any).image_layout === 'vertical' ? 'flex gap-4' : 'space-y-4'} ${imagesColClass} ${imagesOrderClass}`}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        {/* Vertical thumbnails (left side) */}
                        {(product as any).image_layout === 'vertical' && allImages.length > 1 && (
                            <div className="flex flex-col gap-2 flex-shrink-0 max-h-[500px] overflow-y-auto gallery-scrollbar pr-1">
                                {allImages.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => handleImageSelect(index)}
                                        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-primary-500 ring-2 ring-primary-200'
                                            : 'border-neutral-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(image.url)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main image and horizontal thumbnails */}
                        <div className="flex-1 space-y-4">
                            {/* Main Image Container */}
                            <div
                                className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden cursor-zoom-in group"
                                onClick={() => setIsZoomOpen(true)}
                            >
                                <img
                                    src={getImageUrl(allImages[selectedImage]?.url)}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Zoom Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                                    <div className="p-3 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                        <ZoomIn className="w-6 h-6 text-neutral-700" />
                                    </div>
                                </div>

                                {/* Navigation Arrows for quick browsing */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleImageSelect(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-neutral-700" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleImageSelect(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                        >
                                            <ChevronRight className="w-5 h-5 text-neutral-700" />
                                        </button>
                                    </>
                                )}

                                {/* Auto-rotate Progress Bar */}
                                {allImages.length > 1 && !isHovering && !isZoomOpen && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                                        <div
                                            key={autoRotateKey}
                                            className="h-full bg-primary-500 animate-progress"
                                        />
                                    </div>
                                )}

                                {/* Image Counter Badge */}
                                {allImages.length > 1 && (
                                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                                        {selectedImage + 1} / {allImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Horizontal thumbnails (bottom) - only for horizontal layout */}
                            {(product as any).image_layout !== 'vertical' && allImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 gallery-scrollbar max-w-full">
                                    {allImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => handleImageSelect(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-primary-500 ring-2 ring-primary-200'
                                                : 'border-neutral-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <img
                                                src={getImageUrl(image.url)}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Zoom Modal */}
                    <ImageZoomModal
                        isOpen={isZoomOpen}
                        onClose={() => setIsZoomOpen(false)}
                        images={allImages.map(img => ({ url: getImageUrl(img.url), alt: img.alt || product.name }))}
                        initialIndex={selectedImage}
                        onIndexChange={setSelectedImage}
                    />

                    {/* Info */}
                    <div className={`space-y-6 ${infoColClass} ${infoOrderClass} ${infoStickyClass}`}>
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                            {discountPercentage > 0 && (
                                <Badge variant="danger">-{discountPercentage}% OFF</Badge>
                            )}
                            {product.is_bestseller && <Badge variant="warning">Best Seller</Badge>}
                            {product.is_new && <Badge variant="success">New</Badge>}
                        </div>

                        {/* Brand & Name */}
                        {product.brand && (
                            <Link
                                to={`/products?brand=${product.brand.slug}`}
                                className="text-primary-500 font-medium hover:underline"
                            >
                                {product.brand.name}
                            </Link>
                        )}
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.round(product.average_rating)
                                            ? 'text-warning fill-warning'
                                            : 'text-neutral-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-neutral-600">
                                {(product.average_rating || 0).toFixed(1)} ({product.review_count} reviews)
                            </span>
                        </div>

                        {/* Price - Hidden in Layout 3 (shown in buy box) */}
                        {layoutVariant !== 3 && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-primary-900">
                                        ${(totalPrice || 0).toFixed(2)}
                                    </span>
                                    {discountPercentage > 0 && (
                                        <span className="text-xl text-neutral-400 line-through">
                                            ${(totalOriginalPrice || 0).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {quantity > 1 && (
                                    <span className="text-sm text-neutral-500">
                                        ${(unitPrice || 0).toFixed(2)} each
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Short Description */}
                        {product.short_description && (
                            <p className="text-neutral-600 leading-relaxed">
                                {product.short_description}
                            </p>
                        )}

                        {/* Variants - Hierarchical Selection */}
                        {attributeGroups.length > 0 && (
                            <div className="space-y-5">
                                {attributeGroups.map((group, groupIndex) => {
                                    const availableValues = getAvailableValues(groupIndex);
                                    const isDisabled = groupIndex > 0 && !selectedAttributes[attributeGroups[groupIndex - 1].name];
                                    const attrType = getAttributeType(group.name);
                                    const showPriceDiff = shouldShowPriceDiff(group.name);
                                    const isImageSwatch = attrType === 'image';
                                    const isColorSwatch = attrType === 'color';

                                    return (
                                        <div key={group.name} className={`space-y-2 ${isDisabled ? 'opacity-50' : ''}`}>
                                            <label className="text-sm font-semibold text-neutral-800 capitalize">
                                                {group.name}
                                                {selectedAttributes[group.name] && (
                                                    <span className="text-primary-600 font-normal ml-2">: {selectedAttributes[group.name]}</span>
                                                )}
                                            </label>

                                            {/* Image Swatch Cards */}
                                            {isImageSwatch ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                    {availableValues.map((value) => {
                                                        const image = getSwatchImage(group.name, value);
                                                        const priceDiff = showPriceDiff ? getVariantPriceDiff(groupIndex, value) : null;
                                                        const isSelected = selectedAttributes[group.name] === value;

                                                        return (
                                                            <button
                                                                key={value}
                                                                onClick={() => !isDisabled && handleAttributeSelect(group.name, value, groupIndex)}
                                                                disabled={isDisabled}
                                                                className={`p-3 rounded-xl border-2 transition-all text-center ${isSelected
                                                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                                                    : isDisabled
                                                                        ? 'border-neutral-200 cursor-not-allowed'
                                                                        : 'border-neutral-200 hover:border-primary-400 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                {image ? (
                                                                    <img
                                                                        src={image}
                                                                        alt={value}
                                                                        className="w-12 h-12 object-contain mx-auto mb-2"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-neutral-100 rounded-lg mx-auto mb-2 flex items-center justify-center text-neutral-400 text-xs">
                                                                        {value.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <p className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-neutral-700'}`}>
                                                                    {value}
                                                                </p>
                                                                {priceDiff !== null && (
                                                                    <p className={`text-xs mt-1 ${priceDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                                        {priceDiff > 0 ? '+' : ''}{priceDiff < 0 ? '-' : ''}${Math.abs(priceDiff || 0).toFixed(2)}
                                                                    </p>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : isColorSwatch ? (
                                                /* Color Swatch Layout */
                                                <div className="flex flex-wrap gap-2">
                                                    {availableValues.map((value) => {
                                                        const colorCode = getSwatchColor(group.name, value);
                                                        const priceDiff = showPriceDiff ? getVariantPriceDiff(groupIndex, value) : null;
                                                        const isSelected = selectedAttributes[group.name] === value;

                                                        return (
                                                            <button
                                                                key={value}
                                                                onClick={() => !isDisabled && handleAttributeSelect(group.name, value, groupIndex)}
                                                                disabled={isDisabled}
                                                                title={value}
                                                                className={`relative w-10 h-10 rounded-lg border-2 transition-all ${isSelected
                                                                    ? 'border-primary-500 ring-2 ring-primary-200 scale-110'
                                                                    : isDisabled
                                                                        ? 'border-neutral-200 cursor-not-allowed'
                                                                        : 'border-neutral-200 hover:border-primary-400'
                                                                    }`}
                                                                style={{ backgroundColor: colorCode || '#e5e5e5' }}
                                                            >
                                                                {isSelected && (
                                                                    <Check className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                /* Compact Button Layout for Text/Weight/Flavor */
                                                <div className="flex flex-wrap gap-2">
                                                    {availableValues.map((value) => {
                                                        const priceDiff = showPriceDiff ? getVariantPriceDiff(groupIndex, value) : null;
                                                        const isSelected = selectedAttributes[group.name] === value;

                                                        return (
                                                            <button
                                                                key={value}
                                                                onClick={() => !isDisabled && handleAttributeSelect(group.name, value, groupIndex)}
                                                                disabled={isDisabled}
                                                                className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                                    ? 'border-primary-500 bg-primary-500 text-white'
                                                                    : isDisabled
                                                                        ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                                                                        : 'border-neutral-200 hover:border-primary-400 hover:bg-primary-50'
                                                                    }`}
                                                            >
                                                                {value}
                                                                {priceDiff !== null && (
                                                                    <span className={`text-xs ${isSelected ? 'text-white/80' : priceDiff > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                                                        ({priceDiff > 0 ? '+' : ''}{priceDiff < 0 ? '-' : ''}${Math.abs(priceDiff || 0).toFixed(2)})
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {groupIndex === 0 && !selectedAttributes[group.name] && (
                                                <p className="text-xs text-neutral-500">Please select {group.name} first</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add-ons */}
                        {product.addon_groups && product.addon_groups.length > 0 && (
                            <div className="space-y-4 p-4 bg-neutral-50 rounded-xl">
                                <h4 className="font-semibold text-neutral-900">Customize Your Order</h4>
                                {product.addon_groups.map((group: any) => (
                                    <div key={group.id} className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                                            {group.name}
                                            {group.is_required && <span className="text-danger text-xs">*Required</span>}
                                        </label>
                                        <div className="space-y-2">
                                            {group.options.map((option: any) => (
                                                <label
                                                    key={option.id}
                                                    className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type={group.selection_type === 'single' ? 'radio' : 'checkbox'}
                                                            name={`addon-${group.id}`}
                                                            checked={(selectedAddons[group.id] || []).includes(option.id)}
                                                            onChange={() => handleAddonChange(group.id, option.id, group.selection_type)}
                                                            className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                                                        />
                                                        <span className="font-medium">{option.name}</span>
                                                    </div>
                                                    {option.price > 0 && (
                                                        <span className="text-primary-600 font-semibold">+${(option.price || 0).toFixed(2)}</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Customization Fields */}
                        {product.has_customization && product.customization_fields && product.customization_fields.length > 0 && (
                            <div className="space-y-4 p-4 bg-neutral-50 rounded-xl">
                                <h4 className="font-semibold text-neutral-900">Personalize Your Product</h4>
                                {product.customization_fields.map((field: any, index: number) => (
                                    <div key={index} className="space-y-1">
                                        <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                                            {field.label}
                                            {field.required && <span className="text-danger text-xs">*Required</span>}
                                        </label>
                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        )}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        )}
                                        {field.type === 'file' && (
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id={`customization-file-${index}`}
                                                />
                                                <label
                                                    htmlFor={`customization-file-${index}`}
                                                    className="px-4 py-2.5 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                                                >
                                                    Choose File
                                                </label>
                                                <span className="text-sm text-neutral-500">No file chosen</span>
                                            </div>
                                        )}
                                        {field.type === 'color' && (
                                            <input
                                                type="color"
                                                className="w-12 h-12 rounded-lg border border-neutral-200 cursor-pointer"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity & Add to Cart - Hidden in Layout 3 (shown in buy box) */}
                        {layoutVariant !== 3 && (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-neutral-200 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-neutral-100 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 hover:bg-neutral-100 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={product.stock_status === 'out_of_stock'}
                                        className="flex-1"
                                        size="lg"
                                        leftIcon={<ShoppingCart className="w-5 h-5" />}
                                    >
                                        {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>

                                    <Button
                                        onClick={handleBuyNow}
                                        disabled={product.stock_status === 'out_of_stock'}
                                        variant="secondary"
                                        size="lg"
                                        className="bg-neutral-900 text-white hover:bg-neutral-800"
                                    >
                                        Buy Now
                                    </Button>

                                    {isAuthenticated && (
                                        <button className="p-3 border border-neutral-200 rounded-lg hover:border-danger hover:text-danger transition-colors">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2">
                                    {product.stock_status === 'in_stock' ? (
                                        <>
                                            <Check className="w-5 h-5 text-success" />
                                            <span className="text-success font-medium">In Stock</span>
                                        </>
                                    ) : product.stock_status === 'low_stock' ? (
                                        <>
                                            <div className="w-2 h-2 bg-warning rounded-full" />
                                            <span className="text-warning font-medium">Low Stock - Order Soon!</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-danger rounded-full" />
                                            <span className="text-danger font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-neutral-100">
                                    <div className="text-center">
                                        <Truck className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                                        <p className="text-sm text-neutral-600">Free Shipping</p>
                                    </div>
                                    <div className="text-center">
                                        <Shield className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                                        <p className="text-sm text-neutral-600">Secure Payment</p>
                                    </div>
                                    <div className="text-center">
                                        <RotateCcw className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                                        <p className="text-sm text-neutral-600">30-Day Returns</p>
                                    </div>
                                </div>

                                {/* Share */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-neutral-500">Share:</span>
                                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                                        <Share2 className="w-5 h-5 text-neutral-600" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Buy Box Column - Layout 3 Only (Amazon Style) */}
                    {layoutVariant === 3 && (
                        <div className={`${buyBoxColClass} lg:order-3`}>
                            <div className="sticky top-24 bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-sm">
                                {/* Price */}
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-primary-900">
                                            ${totalPrice.toFixed(2)}
                                        </span>
                                        {discountPercentage > 0 && (
                                            <span className="text-lg text-neutral-400 line-through">
                                                ${totalOriginalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {quantity > 1 && (
                                        <p className="text-sm text-neutral-500 mt-1">
                                            ${unitPrice.toFixed(2)} each
                                        </p>
                                    )}
                                    {discountPercentage > 0 && (
                                        <p className="text-sm text-success font-medium mt-1">
                                            You save ${(totalOriginalPrice - totalPrice).toFixed(2)} ({discountPercentage}%)
                                        </p>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2 py-3 border-t border-b border-neutral-100">
                                    {product.stock_status === 'in_stock' ? (
                                        <>
                                            <Check className="w-5 h-5 text-success" />
                                            <span className="text-success font-medium">In Stock</span>
                                        </>
                                    ) : product.stock_status === 'low_stock' ? (
                                        <>
                                            <div className="w-2 h-2 bg-warning rounded-full" />
                                            <span className="text-warning font-medium">Low Stock - Order Soon!</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-danger rounded-full" />
                                            <span className="text-danger font-medium">Out of Stock</span>
                                        </>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <p className="text-sm font-medium text-neutral-700 mb-2">Quantity</p>
                                    <div className="flex items-center border border-neutral-200 rounded-lg w-fit h-10">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 h-full hover:bg-neutral-50 transition-colors flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 h-full hover:bg-neutral-50 transition-colors flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart */}
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock_status === 'out_of_stock'}
                                    fullWidth
                                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                                    className="h-10 text-sm font-medium"
                                >
                                    {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                                </Button>

                                {/* Buy Now */}
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={product.stock_status === 'out_of_stock'}
                                    variant="secondary"
                                    fullWidth
                                    className="h-10 bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-medium"
                                >
                                    Buy Now
                                </Button>

                                {/* Wishlist */}
                                {isAuthenticated && (
                                    <button className="w-full p-3 border border-neutral-200 rounded-lg hover:border-danger hover:text-danger transition-colors flex items-center justify-center gap-2">
                                        <Heart className="w-5 h-5" />
                                        <span className="text-sm font-medium">Add to Wishlist</span>
                                    </button>
                                )}

                                {/* Trust Badges */}
                                <div className="pt-4 border-t border-neutral-100 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Truck className="w-5 h-5 text-primary-500" />
                                        <span className="text-neutral-600">Free Shipping on orders over $50</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Shield className="w-5 h-5 text-primary-500" />
                                        <span className="text-neutral-600">100% Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <RotateCcw className="w-5 h-5 text-primary-500" />
                                        <span className="text-neutral-600">30-Day Easy Returns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-16 flex flex-col gap-16">
                    {/* Tabs */}
                    <div style={{ order: tabsOrder }}>
                        <div className="border-b border-neutral-200">
                            <div className="flex gap-8 overflow-x-auto">
                                {/* Default tabs */}
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'description'
                                        ? 'border-primary-500 text-primary-500'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                                        }`}
                                >
                                    Description
                                </button>
                                {product.nutrition_facts && (
                                    <button
                                        onClick={() => setActiveTab('nutrition')}
                                        className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'nutrition'
                                            ? 'border-primary-500 text-primary-500'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900'
                                            }`}
                                    >
                                        Nutrition Facts
                                    </button>
                                )}
                                {/* Custom tabs from database */}
                                {product.custom_tabs?.map((tab: any) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-500'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900'
                                            }`}
                                    >
                                        {tab.title}
                                    </button>
                                ))}
                                {product.specifications && product.specifications.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('specifications')}
                                        className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'specifications'
                                            ? 'border-primary-500 text-primary-500'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-900'
                                            }`}
                                    >
                                        Specifications
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reviews'
                                        ? 'border-primary-500 text-primary-500'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                                        }`}
                                >
                                    Reviews ({product.review_count})
                                </button>
                            </div>
                        </div>

                        <div className="py-8">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                    {product.benefits && product.benefits.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-bold mb-4">Key Benefits</h3>
                                            <ul className="space-y-2">
                                                {product.benefits.map((benefit: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {product.ingredients && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                                            <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-6 rounded-xl">
                                                {product.ingredients}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="space-y-8 animate-fadeIn">
                                    {product.specifications?.map((section: any, idx: number) => (
                                        <div key={idx} className="max-w-5xl mx-auto bg-white rounded-lg border border-primary-100 overflow-hidden shadow-sm">
                                            <div className="bg-primary-600 px-4 py-3 border-b border-primary-600">
                                                <h3 className="font-bold text-white text-base uppercase tracking-wider">{section.title}</h3>
                                            </div>
                                            <div className="divide-y divide-primary-100">
                                                {Array.from({ length: Math.ceil(section.items.length / 2) }).map((_, rIdx) => {
                                                    const rowItems = section.items.slice(rIdx * 2, rIdx * 2 + 2);
                                                    return (
                                                        <div key={rIdx} className={`flex flex-col md:flex-row ${rIdx % 2 === 0 ? 'bg-white' : 'bg-primary-50/30'}`}>
                                                            {rowItems.map((item: any, iIdx: number) => (
                                                                <div key={iIdx} className="flex-1 flex items-center justify-between px-6 py-4 border-b md:border-b-0 border-primary-100 last:border-0 md:border-r md:last:border-r-0">
                                                                    <span className="text-primary-900 font-semibold text-sm w-1/3">{item.key}</span>
                                                                    <span className="text-neutral-700 font-medium text-sm w-2/3 text-right md:text-left pl-4">{item.value}</span>
                                                                </div>
                                                            ))}
                                                            {/* Empty filler for odd items to maintain grid look */}
                                                            {rowItems.length === 1 && (
                                                                <div className="hidden md:block flex-1"></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}


                            {activeTab === 'nutrition' && product.nutrition_facts && (
                                <div className="max-w-md">
                                    <div className="bg-neutral-50 rounded-xl p-6">
                                        <h3 className="text-xl font-bold mb-4">Nutrition Facts</h3>
                                        <div className="space-y-3 border-t border-neutral-200 pt-4">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Serving Size</span>
                                                <span className="font-medium">{product.nutrition_facts.serving_size}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Servings Per Container</span>
                                                <span className="font-medium">{product.nutrition_facts.servings_per_container}</span>
                                            </div>
                                            <div className="border-t border-neutral-200 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="font-bold">Calories</span>
                                                    <span className="font-bold">{product.nutrition_facts.calories}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Protein</span>
                                                <span>{product.nutrition_facts.protein}g</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Carbs</span>
                                                <span>{product.nutrition_facts.carbs}g</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Fat</span>
                                                <span>{product.nutrition_facts.fat}g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Custom tabs content */}
                            {product.custom_tabs?.map((tab: any) => (
                                activeTab === tab.id && (
                                    <div key={tab.id} className="prose max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: tab.content }} />
                                    </div>
                                )
                            ))}

                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <p className="text-neutral-600">Reviews coming soon...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div style={{ order: relatedOrder }}>
                            <h2 className="text-2xl font-display font-bold text-primary-900 mb-8">
                                You Might Also Like
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.slice(0, 4).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProductDetailPage;
