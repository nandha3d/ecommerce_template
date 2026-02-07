import React, { useEffect, useState } from 'react';
// @ts-ignore
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Loader } from '../../components/ui';

const AnalyticsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Mock Data
    const salesData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800);
    }, []);

    if (isLoading) return <div className="flex justify-center p-10"><Loader size="lg" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['Total Revenue', 'Orders', 'Avg Order Value', 'Active Users'].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                        <p className="text-sm font-medium text-neutral-500 uppercase">{stat}</p>
                        <p className="text-2xl font-bold text-neutral-900 mt-2">
                            {i === 0 ? '$12,345' : i === 2 ? '$85' : '1,234'}
                        </p>
                        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded inline-block mt-2">
                            +12.5% from last week
                        </span>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Sales</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Traffic Overview</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
