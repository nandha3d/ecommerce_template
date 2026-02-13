import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    MessageSquare,
    CheckCircle,
    XCircle,
    Trash2,
    Star,
    Loader2,
    Search,
    Filter,
    User,
    Package,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';

const ReviewModeration: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('pending');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-reviews', page, statusFilter],
        queryFn: () => adminService.getReviews({ page, status: statusFilter }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => adminService.approveReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review approved');
        },
        onError: () => toast.error('Failed to approve review')
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => adminService.rejectReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review hidden/rejected');
        },
        onError: () => toast.error('Failed to reject review')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminService.deleteReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            toast.success('Review deleted permanently');
        },
        onError: () => toast.error('Failed to delete review')
    });

    const reviews = data?.data?.data?.data || [];
    const meta = data?.data?.data;

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= rating ? 'var(--warning)' : 'transparent'}
                        color={star <= rating ? 'var(--warning)' : 'var(--text-muted)'}
                    />
                ))}
            </div>
        );
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending Moderation' },
        { value: 'approved', label: 'Approved Reviews' },
        { value: '', label: 'All Reviews' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h1>Review Moderation</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Moderate customer reviews and feedback.</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: '200px' }}>
                    <Select
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}><Loader2 className="animate-spin" size={40} /></div>
                ) : reviews.length > 0 ? reviews.map((review: any) => (
                    <div key={review.id} className="card animate-in" style={{ padding: 'var(--space-lg)', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                            <div style={{ flex: 1 }}>
                                <div className="flex-between" style={{ marginBottom: 'var(--space-xs)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{review.title || 'Review'}</div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{ color: 'var(--text-main)', marginBottom: 'var(--space-md)', fontStyle: 'italic', lineHeight: 1.6 }}>
                                    "{review.content}"
                                </div>

                                <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xl)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <User size={14} color="var(--primary)" />
                                            <span style={{ fontWeight: 600 }}>{review.user?.name || 'Anonymous'}</span>
                                            {review.is_verified_purchase && (
                                                <span className="badge badge-success" style={{ fontSize: '10px', height: '18px' }}>Verified</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <Package size={14} color="var(--text-muted)" />
                                            <span style={{ color: 'var(--text-secondary)' }}>{review.product?.name}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                        {!review.is_approved ? (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => approveMutation.mutate(review.id)}
                                                isLoading={approveMutation.isPending && approveMutation.variables === review.id}
                                                leftIcon={<CheckCircle size={16} />}
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => rejectMutation.mutate(review.id)}
                                                isLoading={rejectMutation.isPending && rejectMutation.variables === review.id}
                                                leftIcon={<XCircle size={16} />}
                                            >
                                                Unapprove
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            style={{ color: 'var(--error)' }}
                                            onClick={() => {
                                                if (window.confirm('Permanently delete this review?')) deleteMutation.mutate(review.id);
                                            }}
                                            isLoading={deleteMutation.isPending && deleteMutation.variables === review.id}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="card flex-center" style={{ padding: 'var(--space-3xl)', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <AlertCircle size={48} color="var(--text-muted)" />
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No reviews found for this filter.</div>
                    </div>
                )}
            </div>

            {meta && meta.last_page > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                    <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft /></button>
                    <span className="flex-center" style={{ fontWeight: 600 }}>{page} / {meta.last_page}</span>
                    <button className="btn-ghost" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}><ChevronRight /></button>
                </div>
            )}
        </div>
    );
};

export default ReviewModeration;
