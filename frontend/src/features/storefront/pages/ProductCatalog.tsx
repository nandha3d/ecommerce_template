import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../../services/shopService';
import {
    Filter,
    ChevronDown,
    Loader2
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductCatalog: React.FC = () => {
    const [filters] = useState({
        category: '',
        sort: 'newest',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['shop-products', filters],
        queryFn: () => shopService.getProducts(filters),
    });

    const products = data?.data?.data || [];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>Premium Catalog</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Fuel your performance with top-tier supplements.</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div className="flex-center card" style={{ padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer', gap: 'var(--space-sm)' }}>
                        <Filter size={18} />
                        <span>Filter</span>
                    </div>
                    <div className="flex-center card" style={{ padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer', gap: 'var(--space-sm)' }}>
                        <span>Sort: {filters.sort}</span>
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-center" style={{ minHeight: '400px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 'var(--space-xl)'
                }}>
                    {products.length > 0 ? products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-xl)' }}>
                            No products available in the catalog.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
