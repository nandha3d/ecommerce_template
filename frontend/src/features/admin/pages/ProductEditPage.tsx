import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Trash2, Upload, Plus, X, Copy, Eye, EyeOff,
    Image as ImageIcon, Package, DollarSign, Tags, Settings, AlertCircle,
    Palette, Layers, FileText, Download, Sliders, Grid3X3, LayoutGrid,
    ChevronDown, ChevronUp, GripVertical, Check
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Button, Card, Input, Badge } from '../../../components/ui';
import api from '../../../services/api';
import { processImagesForUpload, getImageUrl } from '../../../utils/imageUtils';

interface ProductImage {
    id?: number;
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    sort_order?: number;
}

interface ProductVariant {
    id?: number;
    sku: string;
    name: string;
    price: number;
    sale_price?: number | null;
    stock_quantity: number;
    attributes: Record<string, string>;
    image?: string | null;
    is_active: boolean;
}

interface CustomTab {
    id: string;
    title: string;
    content: string;
    sort_order: number;
}

interface AddonOption {
    id?: number;
    name: string;
    price: number;
    is_default: boolean;
}

interface AddonGroup {
    id?: number;
    name: string;
    selection_type: 'single' | 'multiple';
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    options: AddonOption[];
}

interface CustomField {
    id: string;
    type: 'text' | 'textarea' | 'file' | 'color';
    label: string;
    required: boolean;
    placeholder?: string;
}

interface Category { id: number; name: string; slug: string; }
interface Brand { id: number; name: string; slug: string; }
interface AttributeOption { id: number; value: string; label?: string; color_code?: string; image?: string; }
interface Attribute { id: number; name: string; slug: string; type: string; options: AttributeOption[]; }

interface ProductFormData {
    name: string;
    sku: string;
    description: string;
    short_description: string;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    brand_id: number | null;
    category_ids: number[];
    is_active: boolean;
    is_featured: boolean;
    is_new: boolean;
    is_bestseller: boolean;
    seo_title: string;
    seo_description: string;
    ingredients: string;
    images: ProductImage[];
    variants: ProductVariant[];
    // New fields
    is_digital: boolean;
    is_downloadable: boolean;
    download_limit: number | null;
    download_expiry_days: number | null;
    has_customization: boolean;
    customization_fields: CustomField[];
    custom_tabs: CustomTab[];
    image_layout: 'horizontal' | 'vertical';
    addon_groups: AddonGroup[];
}

const defaultFormData: ProductFormData = {
    name: '',
    sku: '',
    description: '',
    short_description: '',
    price: 0,
    sale_price: null,
    stock_quantity: 0,
    brand_id: null,
    category_ids: [],
    is_active: true,
    is_featured: false,
    is_new: true,
    is_bestseller: false,
    seo_title: '',
    seo_description: '',
    ingredients: '',
    images: [],
    variants: [],
    is_digital: false,
    is_downloadable: false,
    download_limit: null,
    download_expiry_days: null,
    has_customization: false,
    customization_fields: [],
    custom_tabs: [],
    image_layout: 'horizontal',
    addon_groups: [],
};

type TabType = 'basic' | 'pricing' | 'images' | 'variants' | 'addons' | 'customization' | 'tabs' | 'seo';

const ProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id && id !== 'new');

    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [expandedVariants, setExpandedVariants] = useState<Record<number, boolean>>({});

    // Fetch categories, brands, and attributes
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, brandRes, attrRes] = await Promise.all([
                    api.get('/admin/categories'),
                    api.get('/admin/brands'),
                    api.get('/admin/attributes').catch(() => ({ data: { data: [] } })),
                ]);
                setCategories(catRes.data.data || []);
                setBrands(brandRes.data.data || []);
                setAttributes(attrRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch options:', err);
            }
        };
        fetchOptions();
    }, []);

    // Fetch product if editing
    useEffect(() => {
        if (isEditing && id) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/admin/products/${id}`);
                    const product = response.data.data;


                    const variants = (product.variants || []).map((v: any) => {
                        let parsedAttributes = {};
                        try {
                            parsedAttributes = typeof v.attributes === 'string'
                                ? JSON.parse(v.attributes)
                                : (v.attributes || {});
                        } catch (e) {
                            console.error('Failed to parse variant attributes:', e);
                            parsedAttributes = {};
                        }
                        return {
                            id: v.id,
                            sku: v.sku || '',
                            name: v.name || '',
                            price: Number(v.price) || 0,
                            sale_price: v.sale_price ? Number(v.sale_price) : null,
                            stock_quantity: Number(v.stock_quantity) || 0,
                            attributes: parsedAttributes,
                            image: v.image || null,
                            is_active: v.is_active ?? true,
                        };
                    });


                    setFormData({
                        name: product.name || '',
                        sku: product.sku || '',
                        description: product.description || '',
                        short_description: product.short_description || '',
                        price: product.price || 0,
                        sale_price: product.sale_price || null,
                        stock_quantity: product.stock_quantity || 0,
                        brand_id: product.brand_id || null,
                        category_ids: product.categories?.map((c: Category) => c.id) || [],
                        is_active: product.is_active ?? true,
                        is_featured: product.is_featured ?? false,
                        is_new: product.is_new ?? false,
                        is_bestseller: product.is_bestseller ?? false,
                        seo_title: product.seo_title || '',
                        seo_description: product.seo_description || '',
                        ingredients: product.ingredients || '',
                        images: product.images || [],
                        variants: variants,
                        is_digital: product.is_digital ?? false,
                        is_downloadable: product.is_downloadable ?? false,
                        download_limit: product.download_limit,
                        download_expiry_days: product.download_expiry_days,
                        has_customization: product.has_customization ?? false,
                        customization_fields: product.customization_fields || [],
                        custom_tabs: product.custom_tabs || [],
                        image_layout: product.image_layout || 'horizontal',
                        addon_groups: product.addon_groups || [],
                    });
                } catch (err: any) {
                    setError(err.message || 'Failed to fetch product');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditing]);

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (files: FileList) => {
        setUploadingImage(true);
        try {
            const processedFiles = await processImagesForUpload(files);
            const formDataUpload = new FormData();
            processedFiles.forEach(file => {
                formDataUpload.append('images[]', file);
            });

            const response = await api.post('/admin/upload/images', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const uploadedImages: ProductImage[] = response.data.data.map((img: any, idx: number) => ({
                url: img.url,
                alt_text: formData.name || 'Product image',
                is_primary: formData.images.length === 0 && idx === 0,
                sort_order: formData.images.length + idx,
            }));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImages],
            }));
        } catch (err: any) {
            setError('Failed to upload images: ' + (err.message || 'Unknown error'));
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const setPrimaryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => ({
                ...img,
                is_primary: i === index,
            })),
        }));
    };

    // Variant handlers
    const addVariant = () => {
        const newVariant: ProductVariant = {
            sku: `${formData.sku || 'SKU'}-VAR-${formData.variants.length + 1}`,
            name: '',
            price: formData.price || 0,
            sale_price: null,
            stock_quantity: 0,
            attributes: {},
            image: null,
            is_active: true,
        };
        setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v),
        }));
    };

    const updateVariantAttribute = (variantIndex: number, attrName: string, value: string) => {
        setFormData(prev => {
            const newVariants = prev.variants.map((v, i) => {
                if (i !== variantIndex) return v;
                const newAttributes = { ...v.attributes, [attrName]: value };
                const attrValues = Object.values(newAttributes).filter(Boolean);
                const autoSku = attrValues.length > 0
                    ? `${prev.sku || 'SKU'}-${attrValues.join('-').toLowerCase().replace(/\s+/g, '-')}`
                    : v.sku;
                const autoName = attrValues.length > 0 ? attrValues.join(' - ') : v.name;
                return { ...v, attributes: newAttributes, sku: autoSku, name: autoName };
            });
            return { ...prev, variants: newVariants };
        });
    };

    const duplicateVariant = (index: number) => {
        const variantToCopy = formData.variants[index];
        const newVariant: ProductVariant = {
            ...variantToCopy,
            id: undefined,
            sku: `${variantToCopy.sku}-copy`,
            name: `${variantToCopy.name} (Copy)`,
        };
        setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    // Variant image upload handler
    const handleVariantImageUpload = async (index: number, file: File) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        formDataUpload.append('folder', 'variants');

        try {
            const response = await api.post('/admin/upload/image', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data?.success && response.data?.data?.url) {
                updateVariant(index, 'image', response.data.data.url);
            }
        } catch (error) {
            console.error('Failed to upload variant image:', error);
        }
    };

    // Custom Tab handlers
    const addCustomTab = () => {
        const newTab: CustomTab = {
            id: `tab-${Date.now()}`,
            title: 'New Tab',
            content: '',
            sort_order: formData.custom_tabs.length,
        };
        setFormData(prev => ({ ...prev, custom_tabs: [...prev.custom_tabs, newTab] }));
    };

    const updateCustomTab = (index: number, field: keyof CustomTab, value: any) => {
        setFormData(prev => ({
            ...prev,
            custom_tabs: prev.custom_tabs.map((tab, i) => i === index ? { ...tab, [field]: value } : tab),
        }));
    };

    const removeCustomTab = (index: number) => {
        setFormData(prev => ({
            ...prev,
            custom_tabs: prev.custom_tabs.filter((_, i) => i !== index),
        }));
    };

    // Add-on handlers
    const addAddonGroup = () => {
        const newGroup: AddonGroup = {
            name: 'New Add-on Group',
            selection_type: 'multiple',
            is_required: false,
            min_selections: 0,
            max_selections: null,
            options: [],
        };
        setFormData(prev => ({ ...prev, addon_groups: [...prev.addon_groups, newGroup] }));
    };

    const updateAddonGroup = (index: number, field: keyof AddonGroup, value: any) => {
        setFormData(prev => ({
            ...prev,
            addon_groups: prev.addon_groups.map((g, i) => i === index ? { ...g, [field]: value } : g),
        }));
    };

    const removeAddonGroup = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addon_groups: prev.addon_groups.filter((_, i) => i !== index),
        }));
    };

    const addAddonOption = (groupIndex: number) => {
        const newOption: AddonOption = { name: '', price: 0, is_default: false };
        setFormData(prev => ({
            ...prev,
            addon_groups: prev.addon_groups.map((g, i) =>
                i === groupIndex ? { ...g, options: [...g.options, newOption] } : g
            ),
        }));
    };

    const updateAddonOption = (groupIndex: number, optIndex: number, field: keyof AddonOption, value: any) => {
        setFormData(prev => ({
            ...prev,
            addon_groups: prev.addon_groups.map((g, gi) =>
                gi === groupIndex
                    ? { ...g, options: g.options.map((o, oi) => oi === optIndex ? { ...o, [field]: value } : o) }
                    : g
            ),
        }));
    };

    const removeAddonOption = (groupIndex: number, optIndex: number) => {
        setFormData(prev => ({
            ...prev,
            addon_groups: prev.addon_groups.map((g, gi) =>
                gi === groupIndex
                    ? { ...g, options: g.options.filter((_, oi) => oi !== optIndex) }
                    : g
            ),
        }));
    };

    // Customization field handlers
    const addCustomField = () => {
        const newField: CustomField = {
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'Custom Field',
            required: false,
            placeholder: '',
        };
        setFormData(prev => ({
            ...prev,
            customization_fields: [...prev.customization_fields, newField],
        }));
    };

    const updateCustomField = (index: number, field: keyof CustomField, value: any) => {
        setFormData(prev => ({
            ...prev,
            customization_fields: prev.customization_fields.map((f, i) =>
                i === index ? { ...f, [field]: value } : f
            ),
        }));
    };

    const removeCustomField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            customization_fields: prev.customization_fields.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                images: formData.images.map((img, idx) => ({ ...img, sort_order: idx })),
            };

            if (isEditing) {
                await api.put(`/admin/products/${id}`, payload);
            } else {
                await api.post('/admin/products', payload);
            }

            navigate('/admin/products');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'basic' as TabType, label: 'Basic Info', icon: Package },
        { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
        { id: 'images' as TabType, label: 'Images', icon: ImageIcon },
        { id: 'variants' as TabType, label: 'Variants', icon: Tags },
        { id: 'addons' as TabType, label: 'Add-ons', icon: Layers },
        { id: 'customization' as TabType, label: 'Customization', icon: Sliders },
        { id: 'tabs' as TabType, label: 'Custom Tabs', icon: FileText },
        { id: 'seo' as TabType, label: 'SEO', icon: Settings },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900">
                            {isEditing ? 'Edit Product' : 'Create Product'}
                        </h1>
                        {isEditing && <p className="text-neutral-500 text-sm">ID: {id}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save</>}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-neutral-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Card className="rounded-2xl shadow-sm">
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="p-6 space-y-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_digital}
                                            onChange={(e) => handleInputChange('is_digital', e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-300 text-primary-500"
                                        />
                                        <span className="font-medium">Digital Product</span>
                                    </label>
                                    {formData.is_digital && (
                                        <Badge variant="info">No shipping required</Badge>
                                    )}
                                </div>

                                <Input
                                    label="Product Name *"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter product name"
                                />
                                <Input
                                    label="SKU *"
                                    value={formData.sku}
                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                    placeholder="Unique identifier"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Short Description</label>
                                    <textarea
                                        value={formData.short_description}
                                        onChange={(e) => handleInputChange('short_description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Brief summary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Full Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Detailed description"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 'pricing' && (
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Price *" type="number" step="0.01" value={formData.price}
                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} />
                                    <Input label="Sale Price" type="number" step="0.01" value={formData.sale_price || ''}
                                        onChange={(e) => handleInputChange('sale_price', parseFloat(e.target.value) || null)}
                                        placeholder="Leave empty if not on sale" />
                                </div>
                                {!formData.is_digital && (
                                    <Input label="Stock Quantity" type="number" value={formData.stock_quantity}
                                        onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)} />
                                )}
                                {formData.is_digital && (
                                    <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                        <h4 className="font-medium text-blue-700">Digital Product Options</h4>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={formData.is_downloadable}
                                                onChange={(e) => handleInputChange('is_downloadable', e.target.checked)}
                                                className="w-4 h-4 rounded" />
                                            <span>Downloadable</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Download Limit" type="number" value={formData.download_limit || ''}
                                                onChange={(e) => handleInputChange('download_limit', parseInt(e.target.value) || null)}
                                                placeholder="Unlimited" />
                                            <Input label="Expiry (days)" type="number" value={formData.download_expiry_days || ''}
                                                onChange={(e) => handleInputChange('download_expiry_days', parseInt(e.target.value) || null)}
                                                placeholder="Never" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Images Tab */}
                        {activeTab === 'images' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">Product Images</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-neutral-500">Layout:</span>
                                        <button
                                            onClick={() => handleInputChange('image_layout', 'horizontal')}
                                            className={`p-2 rounded-lg ${formData.image_layout === 'horizontal' ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'}`}
                                            title="Horizontal"
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleInputChange('image_layout', 'vertical')}
                                            className={`p-2 rounded-lg ${formData.image_layout === 'vertical' ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'}`}
                                            title="Vertical"
                                        >
                                            <Grid3X3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all mb-4">
                                    <input type="file" multiple accept="image/*" className="hidden"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        disabled={uploadingImage} />
                                    <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                                    <span className="text-neutral-600">{uploadingImage ? 'Uploading...' : 'Drop images here or click to upload'}</span>
                                </label>

                                {formData.images.length > 0 && (
                                    <div className={`grid gap-4 ${formData.image_layout === 'vertical' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={getImageUrl(image.url)} alt={image.alt_text || 'Product'}
                                                    className={`w-full h-full object-cover rounded-xl border-2 ${image.is_primary ? 'border-primary-500' : 'border-transparent'}`} />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => setPrimaryImage(index)} className="p-2 bg-white rounded-full">⭐</button>
                                                    <button onClick={() => removeImage(index)} className="p-2 bg-red-500 text-white rounded-full">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {image.is_primary && <Badge className="absolute top-2 left-2" variant="success">Primary</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variants Tab */}
                        {activeTab === 'variants' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">Product Variants</h3>
                                    <Button onClick={addVariant} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Variant</Button>
                                </div>

                                {formData.variants.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-500">
                                        <Tags className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p>No variants. Add variants for sizes, colors, etc.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.variants.map((variant, vIndex) => {
                                            const isExpanded = expandedVariants[vIndex] ?? false;
                                            return (
                                                <div key={vIndex} className={`border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200 bg-white'}`}>
                                                    {/* Collapsed Header */}
                                                    <div
                                                        onClick={() => setExpandedVariants(prev => ({ ...prev, [vIndex]: !isExpanded }))}
                                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="flex items-center justify-center w-6 h-6 bg-neutral-100 rounded text-xs font-medium text-neutral-600">
                                                                {vIndex + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-medium text-neutral-800 truncate block">
                                                                    {variant.name || `Variant ${vIndex + 1}`}
                                                                </span>
                                                                <span className="text-xs text-neutral-500">
                                                                    SKU: {variant.sku || '—'} • ${(Number(variant.price) || 0).toFixed(2)} • Stock: {variant.stock_quantity ?? 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); duplicateVariant(vIndex); }}
                                                                className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                                                title="Duplicate"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeVariant(vIndex); }}
                                                                className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-neutral-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    {isExpanded && (
                                                        <div className="px-3 pb-3 space-y-3 border-t border-neutral-100">
                                                            <div className="grid grid-cols-5 gap-2 pt-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                                                                    <input
                                                                        value={variant.name || ''}
                                                                        onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                                                                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">SKU</label>
                                                                    <input
                                                                        value={variant.sku || ''}
                                                                        onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                                                                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Price</label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={variant.price ?? 0}
                                                                        onChange={(e) => updateVariant(vIndex, 'price', parseFloat(e.target.value) || 0)}
                                                                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Stock</label>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.stock_quantity ?? 0}
                                                                        onChange={(e) => updateVariant(vIndex, 'stock_quantity', parseInt(e.target.value) || 0)}
                                                                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                    />
                                                                </div>
                                                                {/* Variant Image Upload */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-500 mb-1">Image</label>
                                                                    {variant.image ? (
                                                                        <div className="relative w-12 h-12 group">
                                                                            <img
                                                                                src={getImageUrl(variant.image)}
                                                                                alt="Variant"
                                                                                className="w-12 h-12 object-cover rounded-lg border border-neutral-200"
                                                                            />
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); updateVariant(vIndex, 'image', null); }}
                                                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                title="Remove image"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => e.target.files?.[0] && handleVariantImageUpload(vIndex, e.target.files[0])}
                                                                                className="hidden"
                                                                            />
                                                                            <Plus className="w-5 h-5 text-neutral-400" />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {attributes.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
                                                                    {attributes.map(attr => (
                                                                        <div key={attr.id} className="flex items-center gap-1.5">
                                                                            <label className="text-xs text-neutral-500 whitespace-nowrap">{attr.name}:</label>
                                                                            <select
                                                                                value={variant.attributes?.[attr.name] || ''}
                                                                                onChange={(e) => updateVariantAttribute(vIndex, attr.name, e.target.value)}
                                                                                className="px-2 py-1 text-xs rounded border border-neutral-200 bg-white min-w-[80px] max-w-[120px] focus:ring-1 focus:ring-primary-500"
                                                                            >
                                                                                <option value="">Select</option>
                                                                                {attr.options?.map(opt => (
                                                                                    <option key={opt.id} value={opt.value}>
                                                                                        {opt.label || opt.value}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add-ons Tab */}
                        {activeTab === 'addons' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-medium">Product Add-ons</h3>
                                        <p className="text-sm text-neutral-500">Optional extras customers can add (e.g., toppings, gift wrap)</p>
                                    </div>
                                    <Button onClick={addAddonGroup} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Group</Button>
                                </div>

                                {formData.addon_groups.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-500">
                                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p>No add-on groups. Add groups like "Toppings" or "Extras".</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.addon_groups.map((group, gIndex) => (
                                            <div key={gIndex} className="border border-neutral-200 rounded-xl overflow-hidden">
                                                <div className="p-4 bg-neutral-50 flex items-center justify-between">
                                                    <input
                                                        value={group.name}
                                                        onChange={(e) => updateAddonGroup(gIndex, 'name', e.target.value)}
                                                        className="font-medium bg-transparent border-none focus:ring-0 p-0"
                                                        placeholder="Group Name"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <select value={group.selection_type}
                                                            onChange={(e) => updateAddonGroup(gIndex, 'selection_type', e.target.value)}
                                                            className="text-sm border rounded-lg px-2 py-1">
                                                            <option value="multiple">Multi-select</option>
                                                            <option value="single">Single-select</option>
                                                        </select>
                                                        <label className="flex items-center gap-1 text-sm">
                                                            <input type="checkbox" checked={group.is_required}
                                                                onChange={(e) => updateAddonGroup(gIndex, 'is_required', e.target.checked)} />
                                                            Required
                                                        </label>
                                                        <button onClick={() => removeAddonGroup(gIndex)} className="text-red-500 p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    {group.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3">
                                                            <input value={opt.name} onChange={(e) => updateAddonOption(gIndex, oIndex, 'name', e.target.value)}
                                                                placeholder="Option name" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm text-neutral-500">+$</span>
                                                                <input type="number" step="0.01" value={opt.price}
                                                                    onChange={(e) => updateAddonOption(gIndex, oIndex, 'price', parseFloat(e.target.value) || 0)}
                                                                    className="w-20 px-2 py-2 border rounded-lg text-sm" />
                                                            </div>
                                                            <button onClick={() => removeAddonOption(gIndex, oIndex)} className="text-red-500 p-1">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addAddonOption(gIndex)}
                                                        className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> Add Option
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customization Tab */}
                        {activeTab === 'customization' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium">Product Customization</h3>
                                        <p className="text-sm text-neutral-500">Allow customers to personalize this product</p>
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.has_customization}
                                            onChange={(e) => handleInputChange('has_customization', e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-300 text-primary-500" />
                                        <span className="font-medium">Enable</span>
                                    </label>
                                </div>

                                {formData.has_customization && (
                                    <>
                                        <div className="space-y-3">
                                            {formData.customization_fields.map((field, fIndex) => (
                                                <div key={field.id} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg">
                                                    <select value={field.type}
                                                        onChange={(e) => updateCustomField(fIndex, 'type', e.target.value)}
                                                        className="px-3 py-2 border rounded-lg text-sm">
                                                        <option value="text">Text</option>
                                                        <option value="textarea">Textarea</option>
                                                        <option value="file">File Upload</option>
                                                        <option value="color">Color Picker</option>
                                                    </select>
                                                    <input value={field.label}
                                                        onChange={(e) => updateCustomField(fIndex, 'label', e.target.value)}
                                                        placeholder="Field Label" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                                                    <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                                                        <input type="checkbox" checked={field.required}
                                                            onChange={(e) => updateCustomField(fIndex, 'required', e.target.checked)} />
                                                        Required
                                                    </label>
                                                    <button onClick={() => removeCustomField(fIndex)} className="text-red-500 p-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={addCustomField}
                                            className="mt-3 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add Field
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Custom Tabs Tab */}
                        {activeTab === 'tabs' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-medium">Custom Product Tabs</h3>
                                        <p className="text-sm text-neutral-500">Add tabs like Nutrition Facts, Ingredients, Usage, etc.</p>
                                    </div>
                                    <Button onClick={addCustomTab} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Tab</Button>
                                </div>

                                {formData.custom_tabs.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p>No custom tabs. Add tabs for additional product information.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.custom_tabs.map((tab, tIndex) => (
                                            <div key={tab.id} className="border border-neutral-200 rounded-xl overflow-hidden">
                                                <div className="p-3 bg-neutral-50 flex items-center justify-between">
                                                    <input value={tab.title}
                                                        onChange={(e) => updateCustomTab(tIndex, 'title', e.target.value)}
                                                        className="font-medium bg-transparent border-none focus:ring-0 p-0"
                                                        placeholder="Tab Title" />
                                                    <button onClick={() => removeCustomTab(tIndex)} className="text-red-500 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <textarea value={tab.content}
                                                        onChange={(e) => updateCustomTab(tIndex, 'content', e.target.value)}
                                                        rows={4}
                                                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500"
                                                        placeholder="Tab content (supports HTML)" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SEO Tab */}
                        {activeTab === 'seo' && (
                            <div className="p-6 space-y-5">
                                <Input label="SEO Title" value={formData.seo_title}
                                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                                    placeholder="Title for search engines" />
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Description</label>
                                    <textarea value={formData.seo_description}
                                        onChange={(e) => handleInputChange('seo_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500"
                                        placeholder="Meta description (150-160 chars)" />
                                    <p className="text-sm text-neutral-400 mt-1">{formData.seo_description.length} / 160</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Publish Status */}
                    <Card className="rounded-2xl">
                        <div className="p-4">
                            <h3 className="font-medium mb-3">Publish Status</h3>
                            <button
                                onClick={() => handleInputChange('is_active', !formData.is_active)}
                                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${formData.is_active
                                    ? 'bg-green-50 border-2 border-green-500'
                                    : 'bg-neutral-50 border-2 border-neutral-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {formData.is_active ? (
                                        <Eye className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-5 h-5 text-neutral-400" />
                                    )}
                                    <span className={`font-medium ${formData.is_active ? 'text-green-700' : 'text-neutral-600'}`}>
                                        {formData.is_active ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className={`w-12 h-6 rounded-full transition-all ${formData.is_active ? 'bg-green-500' : 'bg-neutral-300'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${formData.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </div>
                            </button>
                        </div>
                    </Card>

                    {/* Product Type */}
                    <Card className="rounded-2xl">
                        <div className="p-4">
                            <h3 className="font-medium mb-3">Product Type</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.is_digital && <Badge variant="info">Digital</Badge>}
                                {formData.is_featured && <Badge variant="warning">Featured</Badge>}
                                {formData.is_new && <Badge variant="success">New</Badge>}
                                {formData.is_bestseller && <Badge variant="success">Bestseller</Badge>}
                            </div>
                            <div className="space-y-2 mt-3">
                                {['is_featured', 'is_new', 'is_bestseller'].map((field) => (
                                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox"
                                            checked={(formData as any)[field]}
                                            onChange={(e) => handleInputChange(field as any, e.target.checked)}
                                            className="w-4 h-4 rounded border-neutral-300 text-primary-500" />
                                        <span className="text-sm capitalize">{field.replace('is_', '')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Categories */}
                    <Card className="rounded-2xl">
                        <div className="p-4">
                            <h3 className="font-medium mb-3">Categories</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox"
                                            checked={formData.category_ids.includes(cat.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleInputChange('category_ids', [...formData.category_ids, cat.id]);
                                                } else {
                                                    handleInputChange('category_ids', formData.category_ids.filter(id => id !== cat.id));
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-neutral-300 text-primary-500" />
                                        <span className="text-sm">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Brand */}
                    <Card className="rounded-2xl">
                        <div className="p-4">
                            <h3 className="font-medium mb-3">Brand</h3>
                            <select value={formData.brand_id || ''}
                                onChange={(e) => handleInputChange('brand_id', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300">
                                <option value="">Select brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductEditPage;
