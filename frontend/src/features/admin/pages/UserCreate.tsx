import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { ChevronLeft, UserPlus, Save, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { useAddressLookup } from '../../../hooks/useAddressLookup';

const UserCreate: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        avatar: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        address_line_1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'IN'
    });

    const { lookupData, isLoading: isLookupLoading } = useAddressLookup(formData.postal_code, formData.country);

    // Auto-fill logic
    useEffect(() => {
        if (lookupData) {
            setFormData(prev => ({
                ...prev,
                city: lookupData.city,
                state: lookupData.state
            }));
        }
    }, [lookupData]);

    const { data: countriesResponse } = useQuery({
        queryKey: ['countries'],
        queryFn: () => adminService.getCountries()
    });

    const { data: statesResponse } = useQuery({
        queryKey: ['states', formData.country],
        queryFn: () => adminService.getStates(formData.country),
        enabled: !!formData.country
    });

    const countries = countriesResponse?.data?.data || [];
    const states = statesResponse?.data?.data || [];

    const countryOptions = countries.map((c: any) => ({ value: c.code, label: c.name }));
    const stateOptions = states.map((s: any) => ({ value: s.name, label: s.name }));
    const roleOptions = [
        { value: 'customer', label: 'Customer' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' }
    ];

    const createMutation = useMutation({
        mutationFn: (data: any) => adminService.createUser(data),
        onSuccess: () => {
            toast.success('User created successfully');
            navigate('/admin/users');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create user';
            toast.error(message);
        }
    });

    const handleCountryChange = (countryCode: string) => {
        setFormData({ ...formData, country: countryCode, state: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <div className="flex-column" style={{ gap: 'var(--space-xl)', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                        <ChevronLeft size={24} />
                    </Button>
                    <h1>Add New User</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-xl)' }}>
                    {/* Account & Profile */}
                    <div className="card flex-column" style={{ gap: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-sm)' }}>Account Information</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">First Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">Last Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                            <label className="label">Username/Display Name <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                className="input"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                            <label className="label">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="email"
                                className="input"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">Phone Number</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">User Role</label>
                                <Select
                                    options={roleOptions}
                                    value={formData.role}
                                    onChange={(val) => setFormData({ ...formData, role: val })}
                                />
                            </div>
                        </div>

                        <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                            <label className="label">Profile Photo URL</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="https://example.com/photo.jpg"
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">Password <span style={{ color: 'var(--error)' }}>*</span></label>
                                <input
                                    type="password"
                                    className="input"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">Confirm Password <span style={{ color: 'var(--error)' }}>*</span></label>
                                <input
                                    type="password"
                                    className="input"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="card flex-column" style={{ gap: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-sm)' }}>Default Shipping Address</h3>

                        <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                            <label className="label">Address Line 1</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Street address, P.O. box"
                                value={formData.address_line_1}
                                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">City</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">State / Province</label>
                                <Select
                                    options={stateOptions}
                                    value={formData.state}
                                    onChange={(val) => setFormData({ ...formData, state: val })}
                                    placeholder="Select State"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <div className="flex-between">
                                    <label className="label">Postal Code</label>
                                    {isLookupLoading && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={12} className="animate-spin" /> Looking up...</span>}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Pincode (e.g. 600001)"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <MapPin size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                </div>
                            </div>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label">Country</label>
                                <Select
                                    options={countryOptions}
                                    value={formData.country}
                                    onChange={(val) => handleCountryChange(val)}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}></div>

                        <div className="flex-center" style={{ gap: 'var(--space-md)', marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/admin/users')}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={createMutation.isPending}
                                leftIcon={<Save size={18} />}
                                style={{ flex: 2 }}
                            >
                                Create User
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserCreate;
