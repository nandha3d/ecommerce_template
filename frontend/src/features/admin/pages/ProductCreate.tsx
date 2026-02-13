import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    Type,
    Layers,
    Search,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    PlusCircle,
    FileText,
    Settings,
    Globe
} from 'lucide-react';
import { VariantBuilder } from '../components/variant-builder';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: Type },
    { id: 'media', title: 'Media', icon: ImageIcon },
    { id: 'variants', title: 'Variants', icon: Layers },
    { id: 'addons', title: 'Add-Ons', icon: PlusCircle },
    { id: 'tabs', title: 'Additional Tabs', icon: FileText },
    { id: 'specs', title: 'Specifications', icon: Settings },
    { id: 'seo', title: 'SEO & Meta', icon: Globe },
];

const ProductCreate: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const queryClient = useQueryClient();

    const { register, handleSubmit, control, setValue, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            slug: '',
            sku: '',
            price: '',
            sale_price: '',
            cost_price: '',
            stock_quantity: 100,
            stock_threshold: 10,
            description: '',
            short_description: '',
            category_ids: [],
            brand_id: '',
            tags: [],
            is_featured: false,
            is_bestseller: false,
            is_new: true,
            is_active: true,
            is_digital: false,
            is_downloadable: false,
            download_limit: null,
            download_expiry_days: null,
            weight: '',
            length: '',
            breadth: '',
            height: '',
            fssai_license: '',
            batch_no: '',
            manufacturing_date: '',
            expiry_date: '',
            origin_country: '',
            hs_code: '',
            is_returnable: true,
            return_policy_days: 30,
            images: [],
            video_link: '',
            variants: [],
            addon_groups: [],
            custom_tabs: [],
            specifications: [],
            seo_title: '',
            seo_description: '',
            og_title: '',
            og_description: '',
            og_image: '',
            twitter_title: '',
            twitter_description: '',
            twitter_image: '',
            include_in_sitemap: true,
            sitemap_priority: 0.5,
            sitemap_change_frequency: 'weekly'
        }
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants"
    });

    const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
        control,
        name: "addon_groups"
    });

    const { fields: tabFields, append: appendTab, remove: removeTab } = useFieldArray({
        control,
        name: "custom_tabs"
    });

    const { fields: specificationFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control,
        name: "specifications"
    });

    // Fetch initial data for edit mode
    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['admin-product', id],
        queryFn: () => adminService.getProduct(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (productData?.data?.data) {
            reset(productData.data.data);
        } else if (productData?.data) {
            // Fallback if data is not nested
            reset(productData.data);
        }
    }, [productData, reset]);

    // Fetch categories and brands
    useQuery({
        queryKey: ['admin-categories'],
        queryFn: adminService.getCategories,
    });

    useQuery({
        queryKey: ['admin-brands'],
        queryFn: adminService.getBrands,
    });

    useQuery({
        queryKey: ['admin-attributes'],
        queryFn: adminService.getAttributes,
    });

    const productName = watch('name');
    const baseSku = watch('sku');
    const currentVariants = watch('variants');

    const mutation = useMutation({
        mutationFn: (data: any) => id ? adminService.updateProduct(id, data) : adminService.createProduct(data),
        onSuccess: () => {
            toast.success(`Product ${id ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            navigate('/admin/products');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    const nextStep = () => setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
    const prevStep = () => setActiveStep(s => Math.max(s - 1, 0));

    if (id && productLoading) return <div className="flex-center" style={{ height: '400px' }}>Loading product...</div>;

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1>{id ? 'Edit Product' : 'Create New Product'}</h1>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    isLoading={mutation.isPending}
                    leftIcon={!mutation.isPending && <Save size={18} />}
                >
                    {mutation.isPending ? 'Saving...' : 'Save Product'}
                </Button>
            </div>

            {/* Stepper */}
            <div className="tabs-nav">
                {STEPS.map((step, index) => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={`tab-btn ${index === activeStep ? 'active' : ''}`}
                    >
                        <step.icon size={18} />
                        {step.title}
                        {index < activeStep && <CheckCircle2 size={16} style={{ marginLeft: 'var(--space-xs)', color: 'var(--success)' }} />}
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <div className="card" style={{ padding: 'var(--space-xl)' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {activeStep === 0 && (
                        <div className="product-form-step">
                            {/* Product Identification */}
                            <div className="form-section">
                                <h3 className="section-title">Product Identification</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Product Name*</label>
                                        <input
                                            {...register('name', { required: true, maxLength: 255 })}
                                            className="form-input"
                                            placeholder="Enter product name"
                                        />
                                        {errors.name && <span className="error-text">Name is required (max 255)</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>SKU (Base)*</label>
                                        <input
                                            {...register('sku', { required: true })}
                                            className="form-input"
                                            placeholder="e.g. WHEY-PRO-001"
                                        />
                                        {errors.sku && <span className="error-text">SKU is required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Slug (URL)*</label>
                                        <input
                                            {...register('slug', { required: true })}
                                            className="form-input"
                                            placeholder="product-url-slug"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <select {...register('brand_id')} className="form-input">
                                            <option value="">Select Brand</option>
                                            {/* Options would be dynamic in real app */}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="form-section">
                                <h3 className="section-title">Descriptions</h3>
                                <div className="form-group mb-4">
                                    <label>Short Description (Quick Preview - Max 500)</label>
                                    <textarea
                                        {...register('short_description', { maxLength: 500 })}
                                        rows={2}
                                        className="form-input resize-none"
                                        placeholder="Enter brief summary..."
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Full Description (Rich Text)</label>
                                    <textarea
                                        {...register('description')}
                                        rows={6}
                                        className="form-input"
                                        placeholder="Enter detailed description..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="form-section">
                                <h3 className="section-title">Pricing</h3>
                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Base Price ($)*</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('price', { required: true, min: 0 })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sale Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('sale_price', { min: 0 })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Cost Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('cost_price', { min: 0 })}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping & Dimensions */}
                            <div className="form-section">
                                <h3 className="section-title">Shipping & Dimensions</h3>
                                <div className="form-grid-4">
                                    <div className="form-group">
                                        <label>Weight</label>
                                        <input type="number" step="0.01" {...register('weight')} className="form-input" placeholder="kg/lbs" />
                                    </div>
                                    <div className="form-group">
                                        <label>Length</label>
                                        <input type="number" step="0.01" {...register('length')} className="form-input" placeholder="cm/in" />
                                    </div>
                                    <div className="form-group">
                                        <label>Breadth/Width</label>
                                        <input type="number" step="0.01" {...register('breadth')} className="form-input" placeholder="cm/in" />
                                    </div>
                                    <div className="form-group">
                                        <label>Height</label>
                                        <input type="number" step="0.01" {...register('height')} className="form-input" placeholder="cm/in" />
                                    </div>
                                </div>
                            </div>

                            {/* Status & Inventory */}
                            <div className="form-section">
                                <h3 className="section-title">Status & Inventory</h3>
                                <div className="form-grid">
                                    <div className="checkbox-group grid-2">
                                        <label className="checkbox-item"><input type="checkbox" {...register('is_featured')} /> Featured</label>
                                        <label className="checkbox-item"><input type="checkbox" {...register('is_bestseller')} /> Bestseller</label>
                                        <label className="checkbox-item"><input type="checkbox" {...register('is_new')} /> New Arrival</label>
                                        <label className="checkbox-item"><input type="checkbox" {...register('is_active')} /> Active</label>
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Stock Quantity</label>
                                            <input type="number" {...register('stock_quantity')} className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Low Stock Alert</label>
                                            <input type="number" {...register('stock_threshold')} className="form-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <h3 className="section-title"><ImageIcon size={20} /> Product Media</h3>
                                <div className="media-upload-zone card" style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-strong)', background: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.02)' }}>
                                    <ImageIcon size={48} className="text-muted" />
                                    <p className="mt-2 text-muted">Drag and drop images here, or browse files</p>
                                    <Button type="button" variant="secondary" className="mt-4">Choose Files</Button>
                                </div>
                                <div className="form-group mt-6">
                                    <label>Product Video (YouTube/Vimeo URL)</label>
                                    <input
                                        {...register('video_link')}
                                        className="form-input"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <h3 className="section-title"><Layers size={20} /> Product Variants</h3>
                                <VariantBuilder
                                    productId={id || 'new'}
                                    productName={productName || 'New Product'}
                                    baseSku={baseSku || 'SKU'}
                                    initialVariants={currentVariants}
                                    onGenerate={(variants) => setValue('variants', variants)}
                                />
                            </div>
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <div className="flex-between mb-6">
                                    <h3 className="section-title" style={{ marginBottom: 0 }}><PlusCircle size={20} /> Product Add-Ons</h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => appendAddon({ name: '', selection_type: 'multiple', is_required: false, options: [] })}
                                        leftIcon={<PlusCircle size={16} />}
                                    >
                                        Add Group
                                    </Button>
                                </div>

                                <div className="flex-column" style={{ gap: 'var(--space-md)' }}>
                                    {addonFields.map((field, index) => (
                                        <div key={field.id} className="card" style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex-between mb-4">
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-md)', flex: 1, marginRight: 'var(--space-md)' }}>
                                                    <div className="form-group">
                                                        <label>Group Name</label>
                                                        <input {...register(`addon_groups.${index}.name`)} className="form-input" placeholder="e.g. Extra Toppings" />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Selection Type</label>
                                                        <select {...register(`addon_groups.${index}.selection_type`)} className="form-input">
                                                            <option value="single">Single (Radio)</option>
                                                            <option value="multiple">Multiple (Checkbox)</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group flex-center" style={{ paddingTop: '28px' }}>
                                                        <label className="checkbox-item">
                                                            <input type="checkbox" {...register(`addon_groups.${index}.is_required`)} /> Required
                                                        </label>
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeAddon(index)} style={{ color: 'var(--error)' }}>
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Add options in individual product settings after creation</p>
                                            </div>
                                        </div>
                                    ))}
                                    {addonFields.length === 0 && (
                                        <div className="card text-center py-12" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
                                            <p className="text-muted">No add-ons configured yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 4 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <div className="flex-between mb-6">
                                    <h3 className="section-title" style={{ marginBottom: 0 }}><FileText size={20} /> Additional Tabs</h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => appendTab({ title: '', content: '' })}
                                        leftIcon={<PlusCircle size={16} />}
                                    >
                                        Add New Tab
                                    </Button>
                                </div>
                                <div className="flex-column" style={{ gap: 'var(--space-md)' }}>
                                    {tabFields.map((field, index) => (
                                        <div key={field.id} className="card" style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex-between mb-4">
                                                <div className="form-group" style={{ flex: 1, marginRight: 'var(--space-md)' }}>
                                                    <label>Tab Title</label>
                                                    <input {...register(`custom_tabs.${index}.title`)} className="form-input" placeholder="e.g. Usage Guide" />
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeTab(index)} style={{ color: 'var(--error)' }}>
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                            <div className="form-group">
                                                <label>Tab Content</label>
                                                <textarea {...register(`custom_tabs.${index}.content`)} rows={4} className="form-input" placeholder="HTML or Plain Text..." />
                                            </div>
                                        </div>
                                    ))}
                                    {tabFields.length === 0 && (
                                        <div className="card text-center py-12" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
                                            <p className="text-muted">No custom tabs added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 5 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <div className="flex-between mb-6">
                                    <h3 className="section-title" style={{ marginBottom: 0 }}><Settings size={20} /> Technical Specifications</h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => appendSpec({ section: '', properties: [] })}
                                        leftIcon={<PlusCircle size={16} />}
                                    >
                                        Add Section Heading
                                    </Button>
                                </div>

                                <div className="flex-column" style={{ gap: 'var(--space-md)' }}>
                                    {specificationFields.map((field, index) => (
                                        <div key={field.id} className="card" style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex-between mb-4" style={{ background: 'var(--bg-sidebar)', padding: '8px 12px', borderRadius: '4px' }}>
                                                <input
                                                    {...register(`specifications.${index}.section`)}
                                                    className="form-input"
                                                    placeholder="Section Heading (e.g. Dimensions)"
                                                    style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '1rem' }}
                                                />
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(index)} style={{ color: 'var(--error)' }}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>

                                            <p className="text-muted px-4 py-4 text-center" style={{ fontSize: '0.85rem' }}>
                                                Add properties to this section after saving the basic structure.
                                            </p>
                                        </div>
                                    ))}
                                    {specificationFields.length === 0 && (
                                        <div className="card text-center py-12" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
                                            <p className="text-muted">Create sections to organize technical product specs.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 6 && (
                        <div className="product-form-step">
                            <div className="form-section">
                                <h3 className="section-title"><Search size={20} /> Search Engine Optimization</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>SEO Title</label>
                                        <input {...register('seo_title')} className="form-input" placeholder="Title for search results" />
                                    </div>
                                    <div className="form-group">
                                        <label>SEO Description</label>
                                        <textarea {...register('seo_description')} rows={3} className="form-input" placeholder="Meta description..." />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title"><Globe size={20} /> Social & Sitemap</h3>
                                <div className="form-grid-2 mb-6">
                                    <div className="form-group">
                                        <label>OpenGraph Title</label>
                                        <input {...register('og_title')} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Twitter Title</label>
                                        <input {...register('twitter_title')} className="form-input" />
                                    </div>
                                </div>
                                <div className="form-grid-3">
                                    <div className="checkbox-item" style={{ alignSelf: 'center' }}>
                                        <input type="checkbox" {...register('include_in_sitemap')} /> Include in Sitemap
                                    </div>
                                    <div className="form-group">
                                        <label>Sitemap Priority</label>
                                        <input type="number" step="0.1" {...register('sitemap_priority')} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Change Frequency</label>
                                        <select {...register('sitemap_change_frequency')} className="form-input">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex-between" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border)' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            disabled={activeStep === 0}
                            leftIcon={<ChevronLeft size={18} />}
                        >
                            Previous
                        </Button>
                        <Button
                            type="button"
                            onClick={activeStep === STEPS.length - 1 ? handleSubmit(onSubmit) : nextStep}
                            isLoading={activeStep === STEPS.length - 1 && mutation.isPending}
                        >
                            {activeStep === STEPS.length - 1 ? 'Finish & Save' : 'Next Step'}
                            {activeStep !== STEPS.length - 1 && <ChevronRight size={18} style={{ marginLeft: '8px' }} />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCreate;
