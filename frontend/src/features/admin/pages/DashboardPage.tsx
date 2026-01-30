import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowRight
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, Loader } from '../../../components/ui';

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, iconBg }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-neutral-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-primary-900">{value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                        {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(change)}% from last month</span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

const DashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        products: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsChange: 0,
    });

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setStats({
                revenue: 52489,
                orders: 342,
                customers: 1205,
                products: 156,
                revenueChange: 12.5,
                ordersChange: 8.2,
                customersChange: 15.3,
                productsChange: 3.1,
            });
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const recentOrders = [
        { id: 'ORD-001', customer: 'John Doe', total: 156.99, status: 'Delivered', date: '2024-01-15' },
        { id: 'ORD-002', customer: 'Jane Smith', total: 89.50, status: 'Processing', date: '2024-01-15' },
        { id: 'ORD-003', customer: 'Mike Wilson', total: 234.00, status: 'Shipped', date: '2024-01-14' },
        { id: 'ORD-004', customer: 'Sarah Brown', total: 67.25, status: 'Pending', date: '2024-01-14' },
        { id: 'ORD-005', customer: 'Tom Davis', total: 189.99, status: 'Delivered', date: '2024-01-13' },
    ];

    const topProducts = [
        { name: 'Whey Protein Isolate', sales: 245, revenue: 7350 },
        { name: 'Pre-Workout Energy', sales: 189, revenue: 5670 },
        { name: 'BCAA Powder', sales: 156, revenue: 3900 },
        { name: 'Creatine Monohydrate', sales: 134, revenue: 2680 },
        { name: 'Omega-3 Fish Oil', sales: 98, revenue: 1960 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-success/10 text-success';
            case 'Shipped': return 'bg-info/10 text-info';
            case 'Processing': return 'bg-warning/10 text-warning';
            case 'Pending': return 'bg-neutral-100 text-neutral-600';
            default: return 'bg-neutral-100 text-neutral-600';
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader size="lg" text="Loading dashboard..." />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    change={stats.revenueChange}
                    icon={<DollarSign className="w-6 h-6 text-success" />}
                    iconBg="bg-success/10"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders.toLocaleString()}
                    change={stats.ordersChange}
                    icon={<ShoppingCart className="w-6 h-6 text-primary-500" />}
                    iconBg="bg-primary-100"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.customers.toLocaleString()}
                    change={stats.customersChange}
                    icon={<Users className="w-6 h-6 text-purple-500" />}
                    iconBg="bg-purple-100"
                />
                <StatCard
                    title="Total Products"
                    value={stats.products.toLocaleString()}
                    change={stats.productsChange}
                    icon={<Package className="w-6 h-6 text-warning" />}
                    iconBg="bg-warning/10"
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex items-center justify-between p-6 border-b border-neutral-100">
                        <CardTitle>Recent Orders</CardTitle>
                        <a href="/admin/orders" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </a>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-primary-900">{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{order.customer}</td>
                                            <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader className="flex items-center justify-between p-6 border-b border-neutral-100">
                        <CardTitle>Top Products</CardTitle>
                        <a href="/admin/products" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </a>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-neutral-100">
                            {topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-primary-900">{product.name}</p>
                                            <p className="text-sm text-neutral-500">{product.sales} sales</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-primary-900">${product.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default DashboardPage;
