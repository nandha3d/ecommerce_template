import React from 'react';
import { BarChart3 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AnalyticsPage: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900">Analytics</h1>
                        <p className="text-neutral-600">Store performance and insights</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">Coming Soon</h3>
                    <p className="text-neutral-500">Analytics dashboard will be available in a future update.</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AnalyticsPage;
