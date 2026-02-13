import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Search,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Edit2,
    ChevronDown,
    History as HistoryIcon,
    ChevronRight,
    Filter,
    Save,
    RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const InventoryManagement: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState<number[]>([]);
    const [stockEdits, setStockEdits] = useState<Record<number, number>>({});
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products-inventory', page, search, showLowStockOnly],
        queryFn: () => adminService.getProducts({
            page,
            search,
            low_stock: showLowStockOnly ? 'true' : undefined
        }),
    });

    const products = data?.data?.data || [];
    const meta = data?.data?.meta || {};

    const updateMutation = useMutation({
        mutationFn: adminService.bulkUpdateStock,
        onSuccess: () => {
            toast.success('Stock updated successfully');
            setStockEdits({});
            queryClient.invalidateQueries({ queryKey: ['admin-products-inventory'] });
        },
        onError: () => toast.error('Failed to update stock')
    });

    const toggleExpand = (id: number) => {
        setExpandedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleStockChange = (variantId: number, value: string) => {
        const num = parseInt(value);
        if (!isNaN(num)) {
            setStockEdits(prev => ({ ...prev, [variantId]: num }));
        }
    };

    const hasChanges = Object.keys(stockEdits).length > 0;

    const saveChanges = () => {
        if (!hasChanges) return;

        // Calculate deltas
        const updates: { id: number, change: number, reason: string }[] = [];

        products.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((v: any) => {
                    if (stockEdits[v.id] !== undefined) {
                        const delta = stockEdits[v.id] - v.stock_quantity;
                        if (delta !== 0) {
                            updates.push({ id: v.id, change: delta, reason: 'Admin Grid Update' });
                        }
                    }
                });
            } else {
                // Simple product (variant_id usually matches product logic if standardized, but backend uses ProductVariant model)
                // Assuming simple products have a default variant or we access the variant ID somehow.
                // For now, focusing on variants array. If simple product, it should have 1 variant in the new architecture.
                // If legacy simple product, we might need a workaround. 
                // Using product.variants[0] if exists.
            }
        });

        if (updates.length === 0) {
            setStockEdits({});
            return;
        }

        updateMutation.mutate(updates);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)' }}>
                        <Package size={20} />
                    </div>
                    <div>
                        <h1>Inventory</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage stock levels and tracking.</p>
                    </div>
                </div>
                {hasChanges && (
                    <div className="flex-center animate-fade-in" style={{ gap: 'var(--space-sm)' }}>
                        <Button variant="ghost" onClick={() => setStockEdits({})} leftIcon={<RotateCcw size={16} />}>
                            Discard
                        </Button>
                        <Button onClick={saveChanges} isLoading={updateMutation.isPending} leftIcon={<Save size={16} />}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="flex-center animate-bg" style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
                <button
                    className={`btn ${showLowStockOnly ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    style={{ gap: '8px' }}
                >
                    <Filter size={18} />
                    {showLowStockOnly ? 'Showing Low Stock' : 'Show Low Stock'}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}><Loader2 className="animate-spin" /></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-md)', width: '40px' }}></th>
                                <th style={{ padding: 'var(--space-md)' }}>Product</th>
                                <th style={{ padding: 'var(--space-md)' }}>SKU</th>
                                <th style={{ padding: 'var(--space-md)' }}>Total Stock</th>
                                <th style={{ padding: 'var(--space-md)' }}>Status</th>
                                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((product: any) => (
                                <React.Fragment key={product.id}>
                                    <tr
                                        style={{ borderBottom: expandedProducts.includes(product.id) ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}
                                        onClick={() => toggleExpand(product.id)}
                                    >
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            {product.variants && product.variants.length > 0 && (
                                                expandedProducts.includes(product.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                            )}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}></div>
                                                )}
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--text-secondary)' }}>{product.sku || '-'}</td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: (product.stock_quantity || 0) <= 5 ? 'var(--warning)' : 'var(--success)'
                                            }}>
                                                {product.stock_quantity || 0}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            {product.is_active ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--text-muted)" />}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <Link to={`/admin/products/${product.id}/edit`} className="btn-ghost" onClick={(e) => e.stopPropagation()}>
                                                    <Edit2 size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Variants Expansion */}
                                    {expandedProducts.includes(product.id) && product.variants && product.variants.length > 0 && (
                                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                            <td colSpan={6} style={{ padding: '0 0 var(--space-md) 0' }}>
                                                <table style={{ width: '100%', paddingLeft: '40px' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ padding: 'var(--space-sm) var(--space-md) var(--space-sm) 80px', fontSize: '0.85rem' }}>Variant</th>
                                                            <th style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.85rem' }}>SKU</th>
                                                            <th style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.85rem' }}>Stock Level</th>
                                                            <th style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.85rem' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {product.variants.map((variant: any) => (
                                                            <tr key={variant.id}>
                                                                <td style={{ padding: 'var(--space-sm) var(--space-md) var(--space-sm) 80px', width: '30%' }}>
                                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                                        {variant.attribute_summary || variant.name || `Variant #${variant.id}`}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: 'var(--space-sm) var(--space-md)', width: '20%' }}>
                                                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{variant.sku}</div>
                                                                </td>
                                                                <td style={{ padding: 'var(--space-sm) var(--space-md)', width: '20%' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                                                        <input
                                                                            type="number"
                                                                            className="input"
                                                                            style={{
                                                                                width: '100px',
                                                                                padding: '4px 8px',
                                                                                borderColor: stockEdits[variant.id] !== undefined ? 'var(--primary)' : 'var(--border-strong)'
                                                                            }}
                                                                            value={stockEdits[variant.id] !== undefined ? stockEdits[variant.id] : variant.stock_quantity}
                                                                            onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                                                        />
                                                                        {(stockEdits[variant.id] !== undefined && stockEdits[variant.id] !== variant.stock_quantity) && (
                                                                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Modified</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right', paddingRight: 'var(--space-md)' }}>
                                                                    <button
                                                                        className="btn-ghost"
                                                                        title="View Stock Ledger"
                                                                        onClick={() => toast.success('Ledger view coming soon')}
                                                                    >
                                                                        <HistoryIcon size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr><td colSpan={6} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Simple Pagination */}
            {meta && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
                    <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span className="flex-center" style={{ fontWeight: 600 }}>Page {page}</span>
                    <button className="btn-ghost" disabled={page === (meta.last_page || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
