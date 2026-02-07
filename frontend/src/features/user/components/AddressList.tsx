import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../../services/order.service';
import { geoService, GeoCountry, GeoState, GeoCity } from '../../../services/geo.service';
import { Address } from '../../../types';
import { Button, Input, Loader } from '../../../components/ui';

// Validation Schema
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
    is_default: z.boolean(),
});

type AddressFormValues = {
    type: 'billing' | 'shipping';
    name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
};

interface AddressListProps {
    selectable?: boolean;
    selectedId?: number | null;
    onSelect?: (address: Address) => void;
}

export const AddressList: React.FC<AddressListProps> = ({ selectable = false, selectedId, onSelect }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Geo State
    const [countries, setCountries] = useState<GeoCountry[]>([]);
    const [states, setStates] = useState<GeoState[]>([]);
    const [cities, setCities] = useState<GeoCity[]>([]);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);

    // Address Form
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: 'shipping',
            country: 'IN', // Default to India
            is_default: false
        }
    });

    const selectedCountry = watch('country');
    const selectedState = watch('state');
    const postalCode = watch('postal_code');

    // Initial Data Load
    useEffect(() => {
        setCountries(geoService.getCountries());
        fetchAddresses();
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
                    const matchingState = states.find(s =>
                        s.name.toLowerCase() === details.state.toLowerCase() ||
                        s.isoCode === details.state
                    );

                    if (matchingState) {
                        setValue('state', matchingState.isoCode);
                        setTimeout(() => setValue('city', details.city), 100);
                    } else {
                        setValue('state', details.state);
                        setValue('city', details.city);
                    }
                    toast.success(`Found: ${details.city}, ${details.state}`);
                }
            }
        };

        const timer = setTimeout(fetchPincodeDetails, 1000);
        return () => clearTimeout(timer);
    }, [postalCode, selectedCountry, states, setValue]);

    const fetchAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const data = await orderService.getAddresses();
            setAddresses(data);

            // Auto-select default if in selectable mode and nothing selected
            if (selectable && !selectedId && data.length > 0 && onSelect) {
                const defaultAddr = data.find(a => a.is_default) || data[0];
                onSelect(defaultAddr);
            }

            // Auto-open form if no addresses exist
            if (data.length === 0) {
                setShowForm(true);
            }
        } catch (error) {
            toast.error('Failed to load addresses');
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        reset({
            type: address.type,
            name: address.name,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone,
            is_default: address.is_default || false,
        });
        setShowForm(true);
    };

    const handleDeleteAddress = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
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

    const onSubmitAddress = async (formData: any) => {
        try {
            const data = formData as AddressFormValues;
            let savedAddress;
            if (editingAddress) {
                savedAddress = await orderService.updateAddress(editingAddress.id, data);
                toast.success('Address updated');
            } else {
                savedAddress = await orderService.createAddress(data as any);
                toast.success('Address added');
            }
            setShowForm(false);
            setEditingAddress(null);
            reset();
            fetchAddresses();

            // Auto-select the new/updated address if in selection mode
            if (selectable && onSelect && savedAddress) {
                onSelect(savedAddress);
            }
        } catch (error: any) {
            console.error('Address Save Error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to save address';
            toast.error(message);

            if (error.response?.data?.errors) {
                // Show validation errors if available
                Object.values(error.response.data.errors).flat().forEach((err: any) => {
                    toast.error(err);
                });
            }
        }
    };

    const handleSetDefaultAddress = async (e: React.MouseEvent, id: number, type: 'billing' | 'shipping') => {
        e.stopPropagation();
        try {
            await orderService.setDefaultAddress(id, type);
            toast.success(`Set as default ${type} address`);
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    {showForm
                        ? (editingAddress ? 'Edit Address' : 'Add New Address')
                        : (selectable ? 'Select Shipping Address' : 'Address Book')
                    }
                </h2>
                {!showForm && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setEditingAddress(null);
                            reset();
                            setShowForm(true);
                        }}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add New Address
                    </Button>
                )}
            </div>

            {isLoadingAddresses ? (
                <div className="py-12 flex justify-center">
                    <Loader />
                </div>
            ) : showForm ? (
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 animate-fade-in">
                    <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Address Type</label>
                                <select
                                    {...register('type')}
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
                                        {...register('is_default')}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-neutral-700">Set as default address</span>
                                </label>
                            </div>
                        </div>

                        <Input
                            label="Full Name"
                            {...register('name')}
                            error={errors.name?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Postal Code"
                                    {...register('postal_code')}
                                    error={errors.postal_code?.message}
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
                                    {...register('country')}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {countries.map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && (
                                    <p className="text-sm text-danger mt-1">{errors.country.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                                <select
                                    {...register('state')}
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
                                {errors.state && (
                                    <p className="text-sm text-danger mt-1">{errors.state.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                                {cities.length > 0 ? (
                                    <select
                                        {...register('city')}
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
                                        {...register('city')}
                                        error={errors.city?.message}
                                        className="!mt-0"
                                    />
                                )}
                                {errors.city && cities.length > 0 && (
                                    <p className="text-sm text-danger mt-1">{errors.city.message}</p>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Street Address"
                            {...register('address_line_1')}
                            error={errors.address_line_1?.message}
                        />

                        <Input
                            label="Apartment, suite, etc. (optional)"
                            {...register('address_line_2')}
                            error={errors.address_line_2?.message}
                        />

                        <Input
                            label="Phone Number"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 mt-6">
                            {addresses.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                            >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </Button>
                        </div>
                    </form>
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
                            setShowForm(true);
                        }}
                    >
                        Add Your First Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            onClick={() => selectable && onSelect && onSelect(address)}
                            className={`border rounded-lg p-4 transition-all relative group ${selectable
                                ? 'cursor-pointer'
                                : ''
                                } ${selectable && selectedId === address.id
                                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                                    : 'border-neutral-200 hover:border-primary-300'
                                }`}
                        >
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
                                    onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={(e) => handleDeleteAddress(e, address.id)}
                                    className="text-sm text-danger hover:text-red-700 font-medium flex items-center gap-1 ml-auto"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>

                            {!address.is_default && (
                                <button
                                    onClick={(e) => handleSetDefaultAddress(e, address.id, address.type)}
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
    );
};
