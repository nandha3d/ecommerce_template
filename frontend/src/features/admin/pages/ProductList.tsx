import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    ExternalLink,
    Loader2,
    Package,
    Upload,
    Download
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-products', page, search],
        queryFn: () => adminService.getProducts({ page, search }),
    });

    const products = data?.data?.data || [];
    const meta = data?.data?.meta || {};

    if (error) return <div className="card" style={{ color: 'var(--error)', padding: 'var(--space-xl)', textAlign: 'center' }}>Error loading products. Please try again.</div>;

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <h1>Product Management</h1>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <input
                        type="file"
                        id="import-csv"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append('file', file);
                                const toastId = toast.loading('Importing products...');
                                try {
                                    await adminService.importProducts(formData);
                                    toast.success('Import started successfully', { id: toastId });
                                    // Refresh list after delay or rely on socket/manual refresh
                                } catch (err) {
                                    toast.error('Import failed', { id: toastId });
                                }
                                e.target.value = ''; // Reset input
                            }
                        }}
                    />
                    <Button
                        variant="ghost"
                        style={{ border: '1px solid var(--border)' }}
                        onClick={() => document.getElementById('import-csv')?.click()}
                        leftIcon={<Upload size={18} />}
                    >
                        Import
                    </Button>
                    <Button
                        variant="ghost"
                        style={{ border: '1px solid var(--border)' }}
                        onClick={async () => {
                            const toastId = toast.loading('Exporting products...');
                            try {
                                const response = await adminService.exportProducts();
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'products_export.csv');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                toast.success('Export downloaded', { id: toastId });
                            } catch (err) {
                                toast.error('Export failed', { id: toastId });
                            }
                        }}
                        leftIcon={<Download size={18} />}
                    >
                        Export
                    </Button>
                    <Button
                        onClick={() => navigate('/admin/products/create')}
                        leftIcon={<Plus size={18} />}
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-sm) var(--space-md)' }}>
                <div className="flex-between">
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'none', outline: 'none', width: '100%' }}
                        />
                    </div>
                    <Button variant="ghost" style={{ border: '1px solid var(--border)' }} className="hide-mobile">
                        <Filter size={18} />
                        Filters
                    </Button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-md)' }}>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((product: any) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                                {product.images?.[0] ?
                                                    <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                                    <div className="flex-center" style={{ height: '100%' }}><Package size={20} color="var(--text-muted)" /></div>
                                                }
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500 }}>{product.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {product.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.sku}</td>
                                    <td>{product.categories?.[0]?.name || 'Uncategorized'}</td>
                                    <td>${product.price}</td>
                                    <td>
                                        <span style={{ color: product.stock_quantity < 10 ? 'var(--error)' : 'inherit' }}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.8rem',
                                            backgroundColor: product.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                                            color: product.is_active ? 'var(--success)' : 'var(--text-muted)'
                                        }}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-xs)' }}>
                                            <Button variant="ghost" size="sm" title="View in Shop"><ExternalLink size={16} /></Button>
                                            <Button variant="ghost" size="sm" title="Edit" onClick={() => navigate(`/admin/products/${product.id}/edit`)}><Edit size={16} /></Button>
                                            <Button variant="ghost" size="sm" title="Delete" style={{ color: 'var(--error)' }}><Trash2 size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {products.length > 0 && (
                    <div className="flex-between" style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Showing {products.length} of {meta.total || products.length} products</span>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button
                                className="btn btn-ghost"
                                style={{ border: '1px solid var(--border)' }}
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-ghost"
                                style={{ border: '1px solid var(--border)' }}
                                disabled={page >= (meta.last_page || 1)}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
