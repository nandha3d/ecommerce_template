import React, { useState } from 'react';
import {
    TrendingUp,
    Package,
    Users,
    Calendar,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SalesAnalytics } from './Analytics/SalesAnalytics';
import { ProductAnalytics } from './Analytics/ProductAnalytics';
import { CustomerAnalytics } from './Analytics/CustomerAnalytics';

const AnalyticsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers'>('sales');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* Header */}
            <div className="flex-between">
                <div>
                    <h1 style={{ margin: 0 }}>Analytics Deep-Dive</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Detailed business intelligence and reporting</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary"><Calendar size={18} style={{ marginRight: '8px' }} /> Date Range</Button>
                    <Button variant="secondary"><Download size={18} style={{ marginRight: '8px' }} /> Export Report</Button>
                </div>
            </div>

            {/* Tabbed Navigation */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="tabs-nav" style={{ margin: 0, borderBottom: '1px solid var(--border)', backgroundColor: 'transparent', padding: 'var(--space-xs)' }}>
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    >
                        <TrendingUp size={18} /> Sales
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    >
                        <Package size={18} /> Products
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                    >
                        <Users size={18} /> Customers
                    </button>
                </div>

                <div style={{ minHeight: '500px' }}>
                    {activeTab === 'sales' && <SalesAnalytics />}
                    {activeTab === 'products' && <ProductAnalytics />}
                    {activeTab === 'customers' && <CustomerAnalytics />}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
