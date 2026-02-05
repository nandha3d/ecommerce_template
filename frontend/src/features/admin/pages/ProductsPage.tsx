import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, MoreVertical, Check, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Button, Card, Badge, Pagination, Modal } from '../../../components/ui';
import { getImageUrl } from '../../../utils/imageUtils';
import api from '../../../services/api';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    primary_image: string | null;
    categories: { id: number; name: string; slug: string }[];
    variants: any[];
    is_featured: boolean;
    is_active: boolean;
}

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ total: 0, lastPage: 1, perPage: 12 });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/products', {
                params: {
                    page: currentPage,
                    per_page: 12,
                    search: searchQuery || undefined,
                    include_all: true, // Include draft products for admin
                }
            });
            setProducts(response.data.data || []);
            setPagination({
                total: response.data.meta?.total || 0,
                lastPage: response.data.meta?.last_page || 1,
                perPage: response.data.meta?.per_page || 12,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchProducts();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async () => {
        if (!deleteModal.product) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/products/${deleteModal.product.id}`);
            setDeleteModal({ open: false, product: null });
            fetchProducts();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete product');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (product: Product) => {
        if (!product.is_active) return <Badge variant="default">Draft</Badge>;
        if (product.stock_quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
        if (product.stock_quantity < 10) return <Badge variant="warning">Low Stock</Badge>;
        return <Badge variant="success">Active</Badge>;
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchProducts}>
                        Refresh
                    </Button>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/admin/products/new')}>
                    Add Product
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
                </div>
            )}

            {/* Products Table */}
            <Card padding="none">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                        <span className="ml-3 text-neutral-600">Loading products...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                        <p className="text-lg mb-4">No products found</p>
                        <Button onClick={() => navigate('/admin/products/new')}>Add Your First Product</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">SKU</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Stock</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Variants</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {product.primary_image ? (
                                                        <img src={getImageUrl(product.primary_image)} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl">📦</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-primary-900 block">{product.name}</span>
                                                    {product.is_featured && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 font-mono text-sm">{product.sku}</td>
                                        <td className="px-6 py-4 text-neutral-600">
                                            {product.categories?.map(c => c.name).join(', ') || 'Uncategorized'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.sale_price && product.sale_price < product.price ? (
                                                <>
                                                    <span className="font-medium text-green-600">${product.sale_price.toFixed(2)}</span>
                                                    <span className="ml-2 text-sm text-neutral-400 line-through">${product.price.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="font-medium">${product.price.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">{product.stock_quantity}</td>
                                        <td className="px-6 py-4 text-neutral-600">{product.variants?.length || 0}</td>
                                        <td className="px-6 py-4">{getStatusBadge(product)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                                                    className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="View on site"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                                    className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, product })}
                                                    className="p-2 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Showing {products.length} of {pagination.total} products
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.lastPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, product: null })}
                title="Delete Product"
                size="sm"
            >
                <div className="p-4">
                    <p className="text-neutral-600 mb-6">
                        Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setDeleteModal({ open: false, product: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Product'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default ProductsPage;
