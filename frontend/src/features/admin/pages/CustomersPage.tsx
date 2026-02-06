import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
// import { adminService } from '../../services/admin.service'; // Assuming/To be created
import { Loader } from '../../components/ui';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    created_at: string;
    orders_count?: number;
}

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for now as admin service might not be fully ready
        // adminService.getCustomers().then(...)
        setTimeout(() => {
            setCustomers([
                { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01', orders_count: 5 },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-02', orders_count: 2 },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) return <div className="flex justify-center p-10"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                            <div className="text-sm text-gray-500">ID: #{customer.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col text-sm text-gray-500">
                                        <div className="flex items-center gap-2"><Mail size={14} /> {customer.email}</div>
                                        {customer.phone_number && <div className="flex items-center gap-2"><Phone size={14} /> {customer.phone_number}</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {customer.orders_count || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary-600 hover:text-primary-900">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;
