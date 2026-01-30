import React from 'react';
import { Tag, Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const CategoriesPage: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900">Categories</h1>
                        <p className="text-neutral-600">Manage product categories</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Tag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">Coming Soon</h3>
                    <p className="text-neutral-500">Category management will be available in a future update.</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CategoriesPage;
