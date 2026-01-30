import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    Grid3X3,
    LayoutList,
    Search
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchProducts, fetchCategories, fetchBrands, setFilters } from '../../store/slices/productSlice';
import { ProductCard } from '../../components/layout';
import { Button, Loader, Pagination, Input, Select } from '../../components/ui';
import { ProductFilters } from '../../types';

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [localSearch, setLocalSearch] = useState('');

    const dispatch = useAppDispatch();
    const { products, categories, brands, pagination, filters, isLoading } = useAppSelector(
        (state) => state.products
    );

    // Parse URL params into filters
    const urlFilters = useMemo((): ProductFilters => ({
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        brand: searchParams.get('brand') || undefined,
        min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
        max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
        sort_by: (searchParams.get('sort_by') as ProductFilters['sort_by']) || undefined,
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        per_page: 12,
    }), [searchParams]);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchBrands());
    }, [dispatch]);

    useEffect(() => {
        dispatch(setFilters(urlFilters));
        dispatch(fetchProducts(urlFilters));
        setLocalSearch(urlFilters.search || '');
    }, [dispatch, urlFilters]);

    const updateFilters = (newFilters: Partial<ProductFilters>) => {
        const updated = { ...urlFilters, ...newFilters, page: newFilters.page || 1 };
        const params = new URLSearchParams();

        Object.entries(updated).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        });

        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
        setLocalSearch('');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: localSearch || undefined });
    };

    const sortOptions = [
        { value: '', label: 'Default' },
        { value: 'popularity', label: 'Most Popular' },
        { value: 'newest', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
    ];

    const priceRanges = [
        { value: '', label: 'All Prices' },
        { value: '0-25', label: 'Under $25' },
        { value: '25-50', label: '$25 - $50' },
        { value: '50-100', label: '$50 - $100' },
        { value: '100-', label: 'Over $100' },
    ];

    const activeFilterCount = Object.values(urlFilters).filter(
        (v) => v !== undefined && v !== '' && v !== 1 && v !== 12
    ).length;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-primary-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        {urlFilters.category || urlFilters.search ?
                            `Search Results${urlFilters.search ? ` for "${urlFilters.search}"` : ''}` :
                            'All Products'
                        }
                    </h1>
                    <p className="text-white/70">
                        {pagination ? `${pagination.total} products found` : 'Loading...'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search & Controls */}
                <div className="bg-white rounded-xl shadow-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </form>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Sort */}
                            <Select
                                options={sortOptions}
                                value={urlFilters.sort_by || ''}
                                onChange={(e) => updateFilters({ sort_by: e.target.value as ProductFilters['sort_by'] || undefined })}
                                selectSize="sm"
                                className="min-w-[150px]"
                            />

                            {/* Filter Toggle */}
                            <Button
                                variant={showFilters ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                            >
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>

                            {/* View Mode */}
                            <div className="hidden md:flex border border-neutral-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                                >
                                    <Grid3X3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                                >
                                    <LayoutList className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Category */}
                                <Select
                                    label="Category"
                                    options={[
                                        { value: '', label: 'All Categories' },
                                        ...categories.map((c) => ({ value: c.slug, label: c.name })),
                                    ]}
                                    value={urlFilters.category || ''}
                                    onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                                    selectSize="sm"
                                />

                                {/* Brand */}
                                <Select
                                    label="Brand"
                                    options={[
                                        { value: '', label: 'All Brands' },
                                        ...brands.map((b) => ({ value: b.slug, label: b.name })),
                                    ]}
                                    value={urlFilters.brand || ''}
                                    onChange={(e) => updateFilters({ brand: e.target.value || undefined })}
                                    selectSize="sm"
                                />

                                {/* Price Range */}
                                <Select
                                    label="Price Range"
                                    options={priceRanges}
                                    value={
                                        urlFilters.min_price !== undefined || urlFilters.max_price !== undefined
                                            ? `${urlFilters.min_price || ''}-${urlFilters.max_price || ''}`
                                            : ''
                                    }
                                    onChange={(e) => {
                                        const [min, max] = e.target.value.split('-');
                                        updateFilters({
                                            min_price: min ? Number(min) : undefined,
                                            max_price: max ? Number(max) : undefined,
                                        });
                                    }}
                                    selectSize="sm"
                                />

                                {/* Clear Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        leftIcon={<X className="w-4 h-4" />}
                                        fullWidth
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Tags */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {urlFilters.category && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                Category: {categories.find((c) => c.slug === urlFilters.category)?.name}
                                <button onClick={() => updateFilters({ category: undefined })}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {urlFilters.brand && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                Brand: {brands.find((b) => b.slug === urlFilters.brand)?.name}
                                <button onClick={() => updateFilters({ brand: undefined })}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {urlFilters.search && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                Search: {urlFilters.search}
                                <button onClick={() => { updateFilters({ search: undefined }); setLocalSearch(''); }}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader size="lg" text="Loading products..." />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No products found</h3>
                        <p className="text-neutral-600 mb-6">Try adjusting your filters or search terms</p>
                        <Button onClick={clearFilters}>Clear All Filters</Button>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                            }`}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={pagination.current_page}
                                    totalPages={pagination.last_page}
                                    onPageChange={(page) => updateFilters({ page })}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
