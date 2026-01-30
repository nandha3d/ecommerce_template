import React, { useState } from 'react';
import { Search, Filter, Eye, ChevronDown } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Button, Card, Badge, Pagination, Modal, Select } from '../../../components/ui';

const OrdersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Mock data
    const orders = [
        { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', total: 156.99, status: 'Delivered', payment: 'Paid', date: '2024-01-15', items: 3 },
        { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 89.50, status: 'Processing', payment: 'Paid', date: '2024-01-15', items: 2 },
        { id: 'ORD-003', customer: 'Mike Wilson', email: 'mike@example.com', total: 234.00, status: 'Shipped', payment: 'Paid', date: '2024-01-14', items: 4 },
        { id: 'ORD-004', customer: 'Sarah Brown', email: 'sarah@example.com', total: 67.25, status: 'Pending', payment: 'Pending', date: '2024-01-14', items: 1 },
        { id: 'ORD-005', customer: 'Tom Davis', email: 'tom@example.com', total: 189.99, status: 'Delivered', payment: 'Paid', date: '2024-01-13', items: 5 },
        { id: 'ORD-006', customer: 'Emily Clark', email: 'emily@example.com', total: 312.50, status: 'Cancelled', payment: 'Refunded', date: '2024-01-13', items: 6 },
        { id: 'ORD-007', customer: 'David Lee', email: 'david@example.com', total: 78.99, status: 'Confirmed', payment: 'Paid', date: '2024-01-12', items: 2 },
        { id: 'ORD-008', customer: 'Anna Martinez', email: 'anna@example.com', total: 145.00, status: 'Processing', payment: 'Paid', date: '2024-01-12', items: 3 },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Delivered': return <Badge variant="success">{status}</Badge>;
            case 'Shipped': return <Badge variant="info">{status}</Badge>;
            case 'Processing': return <Badge variant="warning">{status}</Badge>;
            case 'Confirmed': return <Badge variant="info">{status}</Badge>;
            case 'Pending': return <Badge variant="default">{status}</Badge>;
            case 'Cancelled': return <Badge variant="danger">{status}</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getPaymentBadge = (payment: string) => {
        switch (payment) {
            case 'Paid': return <Badge variant="success">{payment}</Badge>;
            case 'Pending': return <Badge variant="warning">{payment}</Badge>;
            case 'Refunded': return <Badge variant="danger">{payment}</Badge>;
            default: return <Badge>{payment}</Badge>;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    return (
        <AdminLayout>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <Select
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        selectSize="md"
                    />
                </div>
                <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                    Export
                </Button>
            </div>

            {/* Orders Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Order</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Items</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-primary-500">{order.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-primary-900">{order.customer}</p>
                                            <p className="text-sm text-neutral-500">{order.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600">{order.date}</td>
                                    <td className="px-6 py-4 text-neutral-600">{order.items} items</td>
                                    <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">{getPaymentBadge(order.payment)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                    <p className="text-sm text-neutral-500">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </p>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(orders.length / 10)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </Card>

            {/* Order Detail Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={`Order ${selectedOrder?.id}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-neutral-500">Customer</p>
                                <p className="font-medium">{selectedOrder.customer}</p>
                                <p className="text-sm text-neutral-600">{selectedOrder.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Order Date</p>
                                <p className="font-medium">{selectedOrder.date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Payment Status</p>
                                <div className="mt-1">{getPaymentBadge(selectedOrder.payment)}</div>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Order Status</p>
                                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <h4 className="font-medium mb-4">Update Status</h4>
                            <div className="flex gap-2">
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedOrder.status === status
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default OrdersPage;
