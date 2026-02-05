import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../../../services/admin.service';
import { Category } from '../../../types';
import { Button, Input, Modal, Loader, Badge } from '../../../components/ui';

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                is_active: category.is_active
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                is_active: true
            });
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', is_active: true });
        setSelectedImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('is_active', formData.is_active ? '1' : '0');
            if (selectedImage) {
                data.append('image', selectedImage);
            }

            if (editingCategory) {
                await adminService.updateCategory(editingCategory.id, data);
                toast.success('Category updated successfully');
            } else {
                await adminService.createCategory(data);
                toast.success('Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                        <Loader className="w-6 h-6 mx-auto mb-2" />
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => (
                                    <tr key={category.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {category.image ? (
                                                    <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                        {category.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-neutral-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-neutral-500 truncate max-w-xs">{category.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {category.products_count || 0} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={category.is_active ? 'success' : 'default'}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-1 text-neutral-500 hover:text-primary-600 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {/* Add delete button logic if needed */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Category Name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Short description"
                            className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Image</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setSelectedImage(e.target.files[0]);
                                    }
                                }}
                                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                        </div>
                        {editingCategory && (editingCategory as any).image && !selectedImage && (
                            <p className="text-xs text-neutral-500 mt-1">Current image: {(editingCategory as any).image}</p>
                        )}
                        {selectedImage && (
                            <p className="text-xs text-success-600 mt-1">Selected: {selectedImage.name}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            id="is_active"
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-neutral-700">Active</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" type="button" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Category'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default CategoriesPage;
