import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Search,
    UserPlus,
    Loader2,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    User,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { User as UserType, UserRole } from '../../../types/user';

const UsersList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const roleOptions = [
        { value: '', label: 'All Roles' },
        { value: 'customer', label: 'Customer' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, roleFilter, statusFilter],
        queryFn: () => adminService.getUsers({
            page,
            search,
            role: roleFilter || undefined,
            status: statusFilter || undefined
        }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id: number) => adminService.toggleUserStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const users = data?.data?.data?.data || [];
    const meta = data?.data?.data;

    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => adminService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted successfully');
        },
        onError: () => toast.error('Failed to delete user')
    });

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'super_admin':
                return <span className="badge badge-error"><Shield size={12} style={{ marginRight: '4px' }} /> Super Admin</span>;
            case 'admin':
                return <span className="badge badge-info"><Shield size={12} style={{ marginRight: '4px' }} /> Admin</span>;
            default:
                return <span className="badge" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Customer</span>;
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    return (
        <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
            <div className="flex-between">
                <div>
                    <h1>User Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage all platform users, roles, and account statuses.</p>
                </div>
                <Button
                    className="flex-center"
                    onClick={() => navigate('/admin/users/create')}
                    leftIcon={<UserPlus size={18} />}
                >
                    Add New User
                </Button>
            </div>

            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <div className="flex-center animate-bg" style={{ flex: 1, minWidth: '250px', backgroundColor: 'var(--bg-main)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', gap: 'var(--space-sm)', border: '1px solid var(--border)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <Select
                            options={roleOptions}
                            value={roleFilter}
                            onChange={(val) => setRoleFilter(val)}
                            style={{ minWidth: '140px' }}
                        />

                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            style={{ minWidth: '140px' }}
                        />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                                    <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                                    <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                                    <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered</th>
                                    <th style={{ padding: 'var(--space-md)', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user: UserType) => (
                                    <tr key={user.id} className="hover-bg" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="flex-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            {user.is_active ? (
                                                <span className="badge badge-success">
                                                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Active
                                                </span>
                                            ) : (
                                                <span className="badge badge-error">
                                                    <XCircle size={12} style={{ marginRight: '4px' }} /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="View Details"
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                                <label className="switch" title={user.is_active ? 'Deactivate' : 'Activate'}>
                                                    <input
                                                        type="checkbox"
                                                        checked={user.is_active}
                                                        onChange={() => toggleStatusMutation.mutate(user.id)}
                                                        disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables === user.id}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Delete User"
                                                    onClick={() => handleDelete(user.id)}
                                                    isLoading={deleteUserMutation.isPending && deleteUserMutation.variables === user.id}
                                                    style={{ color: 'var(--error)' }}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No users found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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

export default UsersList;
