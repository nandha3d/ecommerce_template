import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, MapPin, Key, Shield, LogOut, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout, updateProfile } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { orderService } from '../../services/order.service';
import { geoService, GeoCountry, GeoState, GeoCity } from '../../services/geo.service';
import { Address } from '../../types';
import { Button, Input, Modal, Loader } from '../../components/ui';

// Validation Schemas
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

const addressSchema = z.object({
    type: z.enum(['billing', 'shipping']),
    name: z.string().min(1, 'Full Name is required'),
    address_line_1: z.string().min(1, 'Address is required'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().min(1, 'Phone is required'),
    is_default: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type AddressFormValues = z.infer<typeof addressSchema>;

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Geo State
    const [countries, setCountries] = useState<GeoCountry[]>([]);
    const [states, setStates] = useState<GeoState[]>([]);
    const [cities, setCities] = useState<GeoCity[]>([]);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);

    // Profile Form
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        }
    });

    // Password Form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    // Address Form
    const {
        register: registerAddress,
        handleSubmit: handleSubmitAddress,
        reset: resetAddressForm,
        setValue: setAddressValue,
        watch: watchAddress,
        formState: { errors: addressErrors, isSubmitting: isAddressSubmitting }
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: 'shipping',
            country: 'IN', // Default to India
            is_default: false
        }
    });

    const selectedCountry = watchAddress('country');
    const selectedState = watchAddress('state');
    const postalCode = watchAddress('postal_code');

    // Initial Data Load
    useEffect(() => {
        setCountries(geoService.getCountries());
    }, []);

    // Load States when Country changes
    useEffect(() => {
        if (selectedCountry) {
            setStates(geoService.getStatesByCountry(selectedCountry));
        } else {
            setStates([]);
        }
    }, [selectedCountry]);

    // Load Cities when State changes
    useEffect(() => {
        if (selectedCountry && selectedState) {
            setCities(geoService.getCitiesByState(selectedCountry, selectedState));
        } else {
            setCities([]);
        }
    }, [selectedState, selectedCountry]);

    // Auto-fetch details from Pincode
    useEffect(() => {
        const fetchPincodeDetails = async () => {
            if (postalCode && postalCode.length >= 5 && selectedCountry) {
                setIsPincodeLoading(true);
                const details = await geoService.lookupPincode(postalCode, selectedCountry);
                setIsPincodeLoading(false);

                if (details) {
                    // Try to match state ISO code if possible, or name
                    const matchingState = states.find(s =>
                        s.name.toLowerCase() === details.state.toLowerCase() ||
                        s.isoCode === details.state
                    );

                    if (matchingState) {
                        setAddressValue('state', matchingState.isoCode);

                        // Wait for cities to load/process?
                        // Cities might need a tick to update based on state change
                        setTimeout(() => {
                            setAddressValue('city', details.city);
                        }, 100);

                    } else {
                        // Fallback
                        setAddressValue('state', details.state);
                        setAddressValue('city', details.city);
                    }
                    toast.success(`Found: ${details.city}, ${details.state}`);
                }
            }
        };

        const timer = setTimeout(fetchPincodeDetails, 1000); // 1s debounce
        return () => clearTimeout(timer);
    }, [postalCode, selectedCountry, states]); // Added states as dependency

    useEffect(() => {
        if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab]);

    const fetchAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const data = await orderService.getAddresses();
            setAddresses(data);
        } catch (error) {
            toast.error('Failed to load addresses');
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const onSubmitProfile = async (data: ProfileFormValues) => {
        try {
            await dispatch(updateProfile(data)).unwrap();
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const onSubmitPassword = async (data: PasswordFormValues) => {
        try {
            await authService.changePassword(data);
            toast.success('Password changed successfully');
            resetPasswordForm();
        } catch (error) {
            toast.error('Failed to change password. Please check current password.');
        }
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        resetAddressForm({
            type: address.type,
            name: address.name,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country, // Ensure this maps to ISO code if possible
            phone: address.phone,
            is_default: address.is_default,
        });
        setIsAddressModalOpen(true);
    };

    const handleDeleteAddress = async (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            try {
                await orderService.deleteAddress(id);
                toast.success('Address deleted');
                fetchAddresses();
            } catch (error) {
                toast.error('Failed to delete address');
            }
        }
    };

    const onSubmitAddress = async (data: AddressFormValues) => {
        try {
            if (editingAddress) {
                await orderService.updateAddress(editingAddress.id, data);
                toast.success('Address updated');
            } else {
                await orderService.createAddress(data);
                toast.success('Address added');
            }
            setIsAddressModalOpen(false);
            setEditingAddress(null);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to save address');
        }
    };

    const handleSetDefaultAddress = async (id: number, type: 'billing' | 'shipping') => {
        try {
            await orderService.setDefaultAddress(id, type);
            toast.success(`Set as default ${type} address`);
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-6 bg-primary-50 border-b border-neutral-200 text-center">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-primary-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h3 className="font-bold text-neutral-900">{user.name}</h3>
                            <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <nav className="p-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile'
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-neutral-600 hover:bg-neutral-50'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'password'
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-neutral-600 hover:bg-neutral-50'
                                    }`}
                            >
                                <Key className="w-5 h-5" />
                                Change Password
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'addresses'
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-neutral-600 hover:bg-neutral-50'
                                    }`}
                            >
                                <MapPin className="w-5 h-5" />
                                Addresses
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-danger hover:bg-red-50 transition-colors mt-2"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
                        {/* Profile Details Tab */}
                        {activeTab === 'profile' && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-500" />
                                    Profile Details
                                </h2>
                                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6 max-w-lg">
                                    <Input
                                        label="Full Name"
                                        {...registerProfile('name')}
                                        error={profileErrors.name?.message}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        {...registerProfile('email')}
                                        error={profileErrors.email?.message}
                                        disabled // Often emails are immutable or require special flow
                                    />
                                    <Input
                                        label="Phone Number"
                                        {...registerProfile('phone')}
                                        error={profileErrors.phone?.message}
                                    />
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            isLoading={isProfileSubmitting}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary-500" />
                                    Change Password
                                </h2>
                                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 max-w-lg">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        {...registerPassword('current_password')}
                                        error={passwordErrors.current_password?.message}
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        {...registerPassword('password')}
                                        error={passwordErrors.password?.message}
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        {...registerPassword('password_confirmation')}
                                        error={passwordErrors.password_confirmation?.message}
                                    />
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            isLoading={isPasswordSubmitting}
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary-500" />
                                        Address Book
                                    </h2>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingAddress(null);
                                            resetAddressForm();
                                            setIsAddressModalOpen(true);
                                        }}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Add New Address
                                    </Button>
                                </div>

                                {isLoadingAddresses ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader />
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                                        <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                        <p className="text-neutral-500 mb-4">No addresses saved yet</p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setEditingAddress(null);
                                                setIsAddressModalOpen(true);
                                            }}
                                        >
                                            Add Your First Address
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <div key={address.id} className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors relative group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${address.type === 'billing' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                                        }`}>
                                                        {address.type}
                                                    </span>
                                                    {address.is_default && (
                                                        <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                                                            <Check className="w-3 h-3" /> Default
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-neutral-900">{address.name}</h4>
                                                <p className="text-sm text-neutral-600 mt-1">{address.address_line_1}</p>
                                                {address.address_line_2 && <p className="text-sm text-neutral-600">{address.address_line_2}</p>}
                                                <p className="text-sm text-neutral-600">
                                                    {address.city}, {address.state} {address.postal_code}
                                                </p>
                                                <p className="text-sm text-neutral-600 mb-4">{address.country}</p>
                                                <p className="text-sm text-neutral-500">📞 {address.phone}</p>

                                                <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                                                    <button
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                        className="text-sm text-danger hover:text-red-700 font-medium flex items-center gap-1 ml-auto"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>

                                                {!address.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefaultAddress(address.id, address.type)}
                                                        className="absolute top-2 right-2 text-xs text-neutral-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Set as Default
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            <Modal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                title={editingAddress ? 'Edit Address' : 'Add New Address'}
                size="lg"
            >
                <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Address Type</label>
                            <select
                                {...registerAddress('type')}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="shipping">Shipping</option>
                                <option value="billing">Billing</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer pb-3">
                                <input
                                    type="checkbox"
                                    {...registerAddress('is_default')}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-neutral-700">Set as default address</span>
                            </label>
                        </div>
                    </div>

                    <Input
                        label="Full Name"
                        {...registerAddress('name')}
                        error={addressErrors.name?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Postal Code"
                                {...registerAddress('postal_code')}
                                error={addressErrors.postal_code?.message}
                            />
                            {isPincodeLoading && (
                                <p className="text-xs text-primary-600 flex items-center mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" /> Looking up...
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                            <select
                                {...registerAddress('country')}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {addressErrors.country && (
                                <p className="text-sm text-danger mt-1">{addressErrors.country.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                            <select
                                {...registerAddress('state')}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                disabled={states.length === 0}
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {addressErrors.state && (
                                <p className="text-sm text-danger mt-1">{addressErrors.state.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                            {/* If cities loaded, use select, else text input fallback */}
                            {cities.length > 0 ? (
                                <select
                                    {...registerAddress('city')}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.name} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    label=""
                                    placeholder="Enter City"
                                    {...registerAddress('city')}
                                    error={addressErrors.city?.message}
                                    className="!mt-0"
                                />
                            )}
                            {addressErrors.city && cities.length > 0 && (
                                <p className="text-sm text-danger mt-1">{addressErrors.city.message}</p>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Street Address"
                        {...registerAddress('address_line_1')}
                        error={addressErrors.address_line_1?.message}
                    />

                    <Input
                        label="Apartment, suite, etc. (optional)"
                        {...registerAddress('address_line_2')}
                        error={addressErrors.address_line_2?.message}
                    />

                    <Input
                        label="Phone Number"
                        {...registerAddress('phone')}
                        error={addressErrors.phone?.message}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddressModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isAddressSubmitting}
                        >
                            {editingAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
