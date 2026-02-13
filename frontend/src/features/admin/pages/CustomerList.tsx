import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Search,
    User,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const CustomerList: React.FC = () => {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-customers', page, search],
        queryFn: () => adminService.getCustomers({ page, search }),
    });

    const customers = data?.data?.data || [];
    const meta = data?.data?.meta;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="flex-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h1>Customers</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage and view profiles of registered customers.</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-md)' }}>
                <div className="flex-center animate-bg" style={{ backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-xl)' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ gridColumn: '1/-1', padding: 'var(--space-2xl)' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : customers.length > 0 ? customers.map((customer: any) => (
                    <div key={customer.id} className="card product-card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div className="flex-between">
                            <div className="flex-center" style={{ width: '50px', height: '50px', backgroundColor: 'var(--bg-main)', borderRadius: '50%', color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 800 }}>
                                {customer.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</div>
                                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>Active</div>
                            </div>
                        </div>

                        <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }} className="hover:underline">{customer.name}</h3>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 'var(--space-xs)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Mail size={14} /> {customer.email}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', padding: 'var(--space-md)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total Orders</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontWeight: 700 }}>
                                    <ShoppingBag size={14} color="var(--primary)" /> {customer.orders_count || 0}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total Spent</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>${customer.total_spent || '0.00'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                                <Phone size={14} /> {customer.phone || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                                <MapPin size={14} /> {customer.city ? `${customer.city}, ${customer.country}` : 'No address set'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                                <Calendar size={14} /> Joined {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                        No customers found.
                    </div>
                )}
            </div>

            {meta && meta.last_page > 1 && (
                <div className="flex-center" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                    <button
                        className="btn-ghost"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                        {[...Array(meta.last_page)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    backgroundColor: page === i + 1 ? 'var(--primary)' : 'var(--bg-main)',
                                    color: page === i + 1 ? 'white' : 'var(--text-main)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn-ghost"
                        disabled={page === meta.last_page}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
