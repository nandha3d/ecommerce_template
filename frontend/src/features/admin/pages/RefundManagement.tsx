import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Search,
    Eye,
    RotateCcw,
    Loader2,
    ChevronLeft,
    ChevronRight,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';

const RefundManagement: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('pending');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-refunds', page, statusFilter],
        queryFn: () => adminService.getRefunds({ page, status: statusFilter }),
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, notes }: { id: number, notes: string }) => adminService.approveRefund(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
            toast.success('Refund approved');
        },
        onError: () => toast.error('Failed to approve refund')
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, notes }: { id: number, notes: string }) => adminService.rejectRefund(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
            toast.success('Refund rejected');
        },
        onError: () => toast.error('Failed to reject refund')
    });

    const refunds = data?.data?.data?.data || [];
    const meta = data?.data?.data;

    const handleApprove = (id: number) => {
        const notes = window.prompt('Enter approval notes (optional):');
        if (notes !== null) approveMutation.mutate({ id, notes });
    };

    const handleReject = (id: number) => {
        const notes = window.prompt('Enter reason for rejection:');
        if (notes) rejectMutation.mutate({ id, notes });
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending Requests' },
        { value: 'approved', label: 'Approved Refunds' },
        { value: 'rejected', label: 'Rejected Requests' },
        { value: '', label: 'All History' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <h1>Refund Management</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Process order refunds and returns.</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '200px' }}>
                    <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-lg)' }}>Order</th>
                                <th>Customer</th>
                                <th>Request Date</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th style={{ padding: 'var(--space-lg)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.length > 0 ? refunds.map((refund: any) => (
                                <tr key={refund.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: 'var(--space-lg)' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>#{refund.order?.order_number || refund.order_id}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {new Date(refund.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{refund.user?.name || 'Customer'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{refund.user?.email}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {new Date(refund.updated_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>
                                        ${refund.amount || 0}
                                    </td>
                                    <td style={{ maxWidth: '200px', fontSize: '0.9rem' }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={refund.reason}>
                                            {refund.reason}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${refund.status === 'approved' ? 'success' : refund.status === 'pending' ? 'warning' : 'error'}`} style={{ textTransform: 'capitalize' }}>
                                            {refund.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 'var(--space-lg)', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                                            <button className="btn-ghost" title="View Order" onClick={() => navigate(`/admin/orders/${refund.order_id}`)}>
                                                <Eye size={18} />
                                            </button>
                                            {refund.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleApprove(refund.id)}
                                                        isLoading={approveMutation.isPending && approveMutation.variables?.id === refund.id}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleReject(refund.id)}
                                                        isLoading={rejectMutation.isPending && rejectMutation.variables?.id === refund.id}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div className="flex-center" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
                                            <AlertCircle size={32} color="var(--text-muted)" />
                                            No refund requests found.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {meta && (
                    <div className="flex-between" style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Showing {refunds.length} requests
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <span className="flex-center" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                                {page}
                            </span>
                            <button className="btn-ghost" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundManagement;
