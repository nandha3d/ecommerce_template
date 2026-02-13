import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw, Edit2, Image as ImageIcon, Check, X, AlertCircle, Search, Copy, Layers, PlusCircle, ChevronDown, Edit3 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { adminService } from '../../../services/adminService';
import { useQuery } from '@tanstack/react-query';

interface MatrixAttribute {
    name: string;
    values: string;
}

interface VariantDimensions {
    length: string;
    breadth: string;
    height: string;
}

interface GeneratedVariant {
    id: string;
    sku: string;
    attributes: { name: string; value: string }[];
    price: string;
    sale_price: string;
    cost_price: string;
    stock: number;
    enabled: boolean;
    images: string[];
    weight: string;
    dimensions: VariantDimensions;
    manufacturer_code?: string;
    barcode?: string;
}

interface BuilderConfig {
    maxImagesPerVariant: number;
    maxDuplicateCount: number;
    allowedImageFormats: string[];
    maxImageSizeBytes: number;
    skuFormat: string;
    titleFormat: string;
    validationRules: {
        priceMinimum: number;
        stockMinimum: number;
        weightMinimum: number;
        dimensionsRequired: boolean;
    };
    fieldLabels: {
        cost: string;
        price: string;
        salePrice: string;
        stock: string;
        weight: string;
        length: string;
        breadth: string;
        height: string;
    };
}

interface VariationMatrixProps {
    onGenerate: (variants: any[]) => void;
    initialAttributes?: MatrixAttribute[];
}

const BadgePicker: React.FC<{
    label: string; // The attribute name (e.g., "Size")
    value: string; // The selected value (e.g., "S")
    options: string[]; // Options for values
    nameOptions: string[]; // Options for attribute names
    onNameChange: (newName: string) => void;
    onValueChange: (newVal: string) => void;
    disabled?: boolean;
}> = ({ label, value, options, nameOptions, onNameChange, onValueChange, disabled }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<'name' | 'value' | null>(null);

    return (
        <div className="badge-picker-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '100px', flex: '1' }}>
            {/* NAME SELECTOR (TITLE) */}
            <div
                onClick={() => !disabled && setIsMenuOpen(isMenuOpen === 'name' ? null : 'name')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0 4px',
                    cursor: 'pointer',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: label ? 'var(--primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    height: '14px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}
            >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{label || 'Select Attribute'}</span>
                <ChevronDown size={8} style={{ opacity: 0.6 }} />
            </div>

            {/* VALUE SELECTOR (CELL) */}
            <div
                onClick={() => !disabled && setIsMenuOpen(isMenuOpen === 'value' ? null : 'value')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    height: '28px',
                    transition: 'all 0.1s',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                    justifyContent: 'space-between'
                }}
                onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => !disabled && (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            >
                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '85%'
                }}>
                    {value || 'Pick...'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.4 }}>
                    <ChevronDown size={10} />
                </div>
            </div>

            {isMenuOpen && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
                        onClick={() => setIsMenuOpen(null)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: isMenuOpen === 'name' ? '14px' : 'calc(100% + 2px)',
                        left: 0,
                        minWidth: '180px',
                        background: 'white',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        padding: '10px',
                        zIndex: 1001,
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                            {isMenuOpen === 'name' ? 'Select Attribute Name' : `Select ${label} Value`}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                            {isMenuOpen === 'name' ? (
                                nameOptions.map(name => (
                                    <div
                                        key={name}
                                        onClick={() => { onNameChange(name); setIsMenuOpen(null); }}
                                        style={{
                                            background: label === name ? 'var(--primary)' : '#f3f4f6',
                                            color: label === name ? 'white' : 'var(--text-primary)',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: '1px solid transparent'
                                        }}
                                        onMouseEnter={e => { if (label !== name) e.currentTarget.style.background = '#e5e7eb'; }}
                                        onMouseLeave={e => { if (label !== name) e.currentTarget.style.background = '#f3f4f6'; }}
                                    >
                                        {name}
                                    </div>
                                ))
                            ) : (
                                options.length > 0 ? options.map((opt) => (
                                    <div
                                        key={opt}
                                        onClick={() => {
                                            onValueChange(opt);
                                            setIsMenuOpen(null);
                                        }}
                                        style={{
                                            background: value === opt ? 'var(--primary)' : '#f3f4f6',
                                            color: value === opt ? 'white' : 'var(--text-primary)',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.1s',
                                        }}
                                        onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = '#e5e7eb'; }}
                                        onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = '#f3f4f6'; }}
                                    >
                                        {opt}
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', padding: '4px' }}>No options defined</div>
                                )
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export const VariationMatrix: React.FC<VariationMatrixProps> = ({ onGenerate, initialAttributes = [] }) => {
    const [attributes, setAttributes] = useState<MatrixAttribute[]>(
        initialAttributes.length > 0 ? initialAttributes : [{ name: '', values: '' }]
    );
    const [previewVariants, setPreviewVariants] = useState<GeneratedVariant[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [basePrice, setBasePrice] = useState('0');
    const [baseStock, setBaseStock] = useState('100');
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkStock, setBulkStock] = useState('');

    // Fetch predefined attributes
    const { data: systemAttributesData } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: adminService.getAttributes,
    });

    const { data: builderConfigData, isLoading: isConfigLoading } = useQuery({
        queryKey: ['variant-builder-config'],
        queryFn: adminService.getVariantBuilderConfig,
    });

    const builderConfig = builderConfigData?.data?.data as BuilderConfig;
    const systemAttributes = Array.isArray(systemAttributesData?.data?.data)
        ? systemAttributesData.data.data
        : [];

    if (isConfigLoading) {
        return (
            <div className="flex-center p-12 card" style={{ gap: '12px', border: '1px dashed var(--border-strong)', background: 'var(--bg-surface)' }}>
                <RefreshCw size={24} className="animate-spin text-primary" />
                <span className="text-muted font-bold uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Loading Variant Builder Configuration...</span>
            </div>
        );
    }

    // Add Attribute Row
    const addAttribute = () => {
        setAttributes([...attributes, { name: '', values: '' }]);
    };

    // Remove Attribute Row
    const removeAttribute = (index: number) => {
        const newAttrs = attributes.filter((_, i) => i !== index);
        setAttributes(newAttrs);
    };

    // Update Attribute
    const updateAttribute = (index: number, field: keyof MatrixAttribute, value: string) => {
        const newAttrs = [...attributes];
        newAttrs[index] = { ...newAttrs[index], [field]: value };
        setAttributes(newAttrs);
    };

    // Handle System Attribute Selection
    const handleSystemAttributeSelect = (index: number, attrId: string) => {
        const selected = systemAttributes.find((a: any) => a.id.toString() === attrId);
        if (selected) {
            const values = selected.options?.map((o: any) => o.value).join(', ') || '';
            updateAttribute(index, 'name', selected.name);
            updateAttribute(index, 'values', values);
        }
    };

    // Generate Combinations
    const generateCombinations = () => {
        const validAttributes = attributes.filter(a => a.name.trim() !== '' && a.values.trim() !== '');

        if (validAttributes.length === 0) {
            setPreviewVariants([]);
            return;
        }

        const combinations = validAttributes.reduce((acc, curr) => {
            const values = curr.values.split(',').map(v => v.trim()).filter(v => v !== '');
            if (values.length === 0) return acc;

            const newCombos: any[] = [];
            if (acc.length === 0) {
                return values.map(v => ({ [curr.name]: v }));
            }

            acc.forEach(existing => {
                values.forEach(v => {
                    newCombos.push({ ...existing, [curr.name]: v });
                });
            });

            return newCombos;
        }, [] as any[]);

        const variants: GeneratedVariant[] = combinations.map((combo, index) => {
            const skuSuffix = Object.values(combo).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
            // Convert combo Record to Attribute Array
            const attrs = Object.entries(combo).map(([name, value]) => ({ name, value: value as string }));

            return {
                id: `temp-${Date.now()}-${index}`,
                sku: `${basePrice}-${skuSuffix}`, // Placeholder prefix, will be refined if needed
                attributes: attrs,
                price: basePrice,
                sale_price: '',
                cost_price: '',
                images: [],
                weight: '0',
                dimensions: {
                    length: '0',
                    breadth: '0',
                    height: '0'
                },
                stock: parseInt(baseStock) || 0,
                enabled: true
            };
        });

        setPreviewVariants(variants);
        notifyParent(variants);
    };

    const notifyParent = (variants: GeneratedVariant[]) => {
        const validVariants = variants.map(({ id, ...rest }) => {
            // Convert Array attributes back to Record for the parent/API
            const attrRecord: Record<string, string> = {};
            rest.attributes.forEach(a => {
                if (a.name) attrRecord[a.name] = a.value as string;
            });

            return {
                ...rest,
                attributes: attrRecord,
                stock_quantity: rest.stock,
                is_active: rest.enabled
            };
        });
        onGenerate(validVariants);
    };

    const updateVariant = (index: number, field: keyof GeneratedVariant, value: any) => {
        const newVariants = [...previewVariants];
        // @ts-ignore
        newVariants[index][field] = value;
        setPreviewVariants(newVariants);
        notifyParent(newVariants);
    };

    const getAttributeValues = (attrName: string) => {
        // 1. Check if it exists in the generator section (Section 1)
        const local = attributes.find(a => a.name === attrName);
        if (local && local.values) return local.values;

        // 2. Check if it's a system attribute
        const system = systemAttributes.find((sa: any) => sa.name === attrName);
        if (system && system.options) {
            return system.options.map((o: any) => o.value).join(', ');
        }

        return '';
    };

    const addManualVariant = () => {
        // Build initial attributes array based on Current Section 1 schema
        const initialAttrs = attributes.map(attr => ({
            name: attr.name || 'New Trait',
            value: getAttributeValues(attr.name).split(',')[0]?.trim() || ''
        }));

        const newVariant: GeneratedVariant = {
            id: `manual-${Date.now()}`,
            sku: `SKU-MAN-VAL-${Date.now().toString().slice(-4)}`,
            attributes: initialAttrs,
            price: basePrice,
            sale_price: '',
            cost_price: '',
            weight: '0',
            dimensions: {
                length: '0',
                breadth: '0',
                height: '0'
            },
            stock: parseInt(baseStock) || 0,
            enabled: true,
            images: []
        };

        const updated = [...previewVariants, newVariant];
        setPreviewVariants(updated);
        notifyParent(updated);
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const duplicateVariant = async (index: number) => {
        const variant = previewVariants[index];
        if (!variant.id || variant.id.startsWith('temp-') || variant.id.startsWith('manual-')) {
            const newVariant: GeneratedVariant = {
                ...variant,
                id: `dup-${Date.now()}`,
                sku: `${variant.sku}-COPY`
            };
            const updated = [...previewVariants];
            updated.splice(index + 1, 0, newVariant);
            setPreviewVariants(updated);
            notifyParent(updated);
        } else {
            try {
                const response = await adminService.duplicateVariant(parseInt(variant.id));
                if (response.data.success) {
                    const backendVariant = response.data.data;
                    const newVariant: GeneratedVariant = {
                        id: backendVariant.id.toString(),
                        sku: backendVariant.sku,
                        attributes: backendVariant.attributes || variant.attributes,
                        price: backendVariant.price.toString(),
                        sale_price: backendVariant.sale_price?.toString() || '',
                        cost_price: backendVariant.cost_price?.toString() || '',
                        stock: backendVariant.stock_quantity,
                        enabled: !!backendVariant.is_active,
                        images: backendVariant.images || [],
                        weight: backendVariant.weight?.toString() || '0',
                        dimensions: {
                            length: backendVariant.length?.toString() || '0',
                            breadth: backendVariant.breadth?.toString() || '0',
                            height: backendVariant.height?.toString() || '0'
                        }
                    };
                    const updated = [...previewVariants];
                    updated.splice(index + 1, 0, newVariant);
                    setPreviewVariants(updated);
                    notifyParent(updated);
                }
            } catch (err) {
                console.error("Duplicate failed", err);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === previewVariants.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(previewVariants.map(v => v.id)));
        }
    };

    // Bulk Actions
    const bulkDelete = async () => {
        if (selectedIds.size === 0) return;

        const realIdsToDelete = Array.from(selectedIds)
            .filter(id => !id.startsWith('temp-') && !id.startsWith('manual-') && !id.startsWith('dup-'))
            .map(id => parseInt(id));

        if (realIdsToDelete.length > 0) {
            try {
                await adminService.bulkDeleteVariants(realIdsToDelete);
            } catch (err) {
                console.error("Bulk delete failed", err);
            }
        }

        const updated = previewVariants.filter(v => !selectedIds.has(v.id));
        setPreviewVariants(updated);
        setSelectedIds(new Set());
        notifyParent(updated);
    };

    const bulkAction = (type: 'enable' | 'disable' | 'delete' | 'price' | 'stock') => {
        if (type === 'delete') {
            bulkDelete();
            return;
        }

        let newVariants = [...previewVariants];
        newVariants = newVariants.map(v => {
            if (!selectedIds.has(v.id)) return v;
            switch (type) {
                case 'enable': return { ...v, enabled: true };
                case 'disable': return { ...v, enabled: false };
                case 'price': return { ...v, price: bulkPrice || v.price };
                case 'stock': return { ...v, stock: parseInt(bulkStock) || v.stock };
                default: return v;
            }
        });

        setPreviewVariants(newVariants);
        setSelectedIds(new Set());
        notifyParent(newVariants);
    };

    return (
        <div className="flex-column" style={{ gap: 'var(--space-xl)' }}>
            {/* Section 1: Auto-Generate Variation */}
            <div className="form-section card" style={{ padding: 'var(--space-lg)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}>
                <div className="flex-between mb-6">
                    <h3 className="section-title" style={{ marginBottom: 0, color: 'var(--primary)' }}>
                        <RefreshCw size={20} className="mr-2" /> 1. Auto Generate Variation
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <div className="form-group mb-0">
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: '100px', height: '36px' }}
                                placeholder="Base Price"
                                value={basePrice}
                                onChange={e => setBasePrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: '100px', height: '36px' }}
                                placeholder="Base Stock"
                                value={baseStock}
                                onChange={e => setBaseStock(e.target.value)}
                            />
                        </div>
                        <Button variant="primary" size="sm" onClick={generateCombinations} leftIcon={<RefreshCw size={16} />}>
                            Generate Matrix
                        </Button>
                    </div>
                </div>

                <div className="flex-column" style={{ gap: 'var(--space-md)' }}>
                    {attributes.map((attr, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr auto', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>System Attribute</label>
                                <select
                                    className="form-input"
                                    onChange={(e) => handleSystemAttributeSelect(index, e.target.value)}
                                    value=""
                                >
                                    <option value="" disabled>Pick Attribute...</option>
                                    {systemAttributes.map((sa: any) => (
                                        <option key={sa.id} value={sa.id}>{sa.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Manual Entry</label>
                                <input
                                    className="form-input"
                                    placeholder="Attribute Name"
                                    value={attr.name}
                                    onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Values (S, M, L)</label>
                                <input
                                    className="form-input"
                                    placeholder="Enter values separated by commas"
                                    value={attr.values}
                                    onChange={(e) => updateAttribute(index, 'values', e.target.value)}
                                />
                                <div className="flex-wrap mt-2" style={{ gap: '4px' }}>
                                    {attr.values.split(',').map(v => v.trim()).filter(v => v !== '').map((v, i) => (
                                        <span key={i} className="badge badge-info" style={{ borderRadius: '4px', fontSize: '0.7rem' }}>{v}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ paddingTop: '28px' }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttribute(index)}
                                    style={{ color: 'var(--error)' }}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="mt-2">
                        <Button variant="ghost" size="sm" onClick={addAttribute} leftIcon={<Plus size={16} />}>
                            Add Another Attribute
                        </Button>
                    </div>
                </div>
            </div>

            {/* Manual Variant Section Header */}
            <div className="flex-between">
                <div className="flex-center" style={{ gap: 'var(--space-md)' }}>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>
                        <PlusCircle size={20} className="mr-2" style={{ color: 'var(--success)' }} /> 2. Manual Variation Section
                    </h3>
                    <Button variant="secondary" size="sm" onClick={addManualVariant} leftIcon={<Plus size={16} />}>
                        Add Single Variant
                    </Button>
                </div>
                {previewVariants.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <Button size="sm" variant="ghost" onClick={toggleSelectAll}>
                            {selectedIds.size === previewVariants.length ? 'Unselect All' : 'Select All'}
                        </Button>
                        {selectedIds.size > 0 && (
                            <Button size="sm" style={{ background: 'var(--error)', color: 'white' }} onClick={() => bulkAction('delete')}>
                                Trash {selectedIds.size}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* List of Variant Cards (Manual/Generated) */}
            {previewVariants.length > 0 ? (
                <div className="grid-1" style={{ gap: 'var(--space-md)' }}>
                    {previewVariants.map((variant, index) => {
                        const variantDisplayName = Object.entries(variant.attributes)
                            .filter(([_, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ') || 'New Variant';

                        return (
                            <div key={variant.id} className="card variant-card-detailed" style={{
                                padding: 'var(--space-md)',
                                border: '1px solid var(--border)',
                                background: variant.enabled ? 'var(--bg-surface)' : 'var(--bg-sidebar)',
                                opacity: variant.enabled ? 1 : 0.8,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}>
                                <div className="flex-column" style={{ gap: 'var(--space-md)' }}>
                                    {/* Card header with Title and Index */}
                                    <div className="flex-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '-4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                                #{index + 1}
                                            </span>
                                            <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {variantDisplayName}
                                            </h4>
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            ID: {variant.id.split('-').pop()}
                                        </div>
                                    </div>

                                    {/* Row 1: Spreadsheet Matrix Layout */}
                                    <div style={{ display: 'flex', gap: '1px', alignItems: 'stretch', background: 'var(--border-subtle)', padding: '1px', borderRadius: '8px', border: '1px solid var(--border-strong)', width: '100%', flexWrap: 'nowrap', overflowX: 'auto' }}>
                                        {/* ATTRIBUTES GROUP (TRAITS) */}
                                        <div style={{ display: 'flex', background: 'var(--bg-sidebar)', padding: '8px', borderRight: '2px solid var(--border-strong)', gap: '8px', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variant Traits</div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {variant.attributes.map((attr, attrIdx) => {
                                                        const attrValuesStr = getAttributeValues(attr.name);
                                                        const options = attrValuesStr.split(',').map(v => v.trim()).filter(v => v !== '');

                                                        // Get list of all available system and local attribute names
                                                        const allNameOptions = [
                                                            ...systemAttributes.map((sa: any) => sa.name),
                                                            ...attributes.map(a => a.name).filter(n => n && !systemAttributes.some((sa: any) => sa.name === n))
                                                        ];

                                                        return (
                                                            <div key={attrIdx} style={{ position: 'relative' }} className="group">
                                                                <BadgePicker
                                                                    label={attr.name}
                                                                    value={attr.value}
                                                                    options={options}
                                                                    nameOptions={allNameOptions}
                                                                    onNameChange={(newName) => {
                                                                        const newVariants = [...previewVariants];
                                                                        newVariants[index].attributes[attrIdx].name = newName;
                                                                        const newOpts = getAttributeValues(newName).split(',')[0]?.trim() || '';
                                                                        newVariants[index].attributes[attrIdx].value = newOpts;
                                                                        setPreviewVariants(newVariants);
                                                                        notifyParent(newVariants);
                                                                    }}
                                                                    onValueChange={(val) => {
                                                                        const newVariants = [...previewVariants];
                                                                        newVariants[index].attributes[attrIdx].value = val;
                                                                        setPreviewVariants(newVariants);
                                                                        notifyParent(newVariants);
                                                                    }}
                                                                />
                                                                {/* Delete Trait Slot Button */}
                                                                <div
                                                                    onClick={() => {
                                                                        const newVariants = [...previewVariants];
                                                                        newVariants[index].attributes.splice(attrIdx, 1);
                                                                        setPreviewVariants(newVariants);
                                                                        notifyParent(newVariants);
                                                                    }}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '-4px',
                                                                        right: '-4px',
                                                                        background: 'var(--error)',
                                                                        color: 'white',
                                                                        borderRadius: '50%',
                                                                        width: '12px',
                                                                        height: '12px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        fontSize: '8px',
                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                        zIndex: 5
                                                                    }}
                                                                    title="Remove Trait"
                                                                >
                                                                    <X size={8} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Add Trait Button per card */}
                                                    <div
                                                        onClick={() => {
                                                            const newVariants = [...previewVariants];
                                                            newVariants[index].attributes.push({ name: '', value: '' });
                                                            setPreviewVariants(newVariants);
                                                        }}
                                                        style={{ alignSelf: 'flex-end', padding: '6px', cursor: 'pointer', opacity: 0.5 }}
                                                    >
                                                        <PlusCircle size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DATA CELLS (SKU, PRICE, STOCK...) */}
                                        <div style={{ display: 'flex', flex: 1, padding: '8px', gap: '12px', background: 'var(--bg-surface)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            {/* SKU */}
                                            <div className="form-group mb-0" style={{ flex: '1.5', minWidth: '120px' }}>
                                                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>SKU</label>
                                                <input className="form-input" style={{ height: '28px', fontSize: '0.7rem', border: '1px solid var(--border-strong)' }} value={variant.sku} onChange={e => updateVariant(index, 'sku', e.target.value)} />
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', flex: '3', minWidth: '400px' }}>
                                                {/* Pricing Group */}
                                                <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <div className="form-group mb-0" style={{ width: '70px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.cost || 'Cost'}</label>
                                                        <input type="number" className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.cost_price} onChange={e => updateVariant(index, 'cost_price', e.target.value)} />
                                                    </div>
                                                    <div className="form-group mb-0" style={{ width: '70px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', display: 'block', color: 'var(--primary)' }}>{builderConfig?.fieldLabels.price || 'Price'}</label>
                                                        <input type="number" className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px', borderColor: 'var(--primary)' }} value={variant.price} onChange={e => updateVariant(index, 'price', e.target.value)} />
                                                    </div>
                                                    <div className="form-group mb-0" style={{ width: '70px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.salePrice || 'Sale'}</label>
                                                        <input type="number" className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.sale_price} onChange={e => updateVariant(index, 'sale_price', e.target.value)} />
                                                    </div>
                                                </div>

                                                {/* Inventory Group */}
                                                <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <div className="form-group mb-0" style={{ width: '60px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.stock || 'Stock'}</label>
                                                        <input type="number" className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.stock} onChange={e => updateVariant(index, 'stock', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="form-group mb-0" style={{ width: '60px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.weight || 'W(kg)'}</label>
                                                        <input className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.weight} onChange={e => updateVariant(index, 'weight', e.target.value)} />
                                                    </div>
                                                </div>

                                                {/* Dimensions Group */}
                                                <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <div className="form-group mb-0" style={{ width: '40px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.length || 'L'}</label>
                                                        <input className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.dimensions.length} onChange={e => {
                                                            const newV = [...previewVariants];
                                                            newV[index].dimensions.length = e.target.value;
                                                            setPreviewVariants(newV);
                                                        }} />
                                                    </div>
                                                    <div className="form-group mb-0" style={{ width: '40px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.breadth || 'B'}</label>
                                                        <input className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.dimensions.breadth} onChange={e => {
                                                            const newV = [...previewVariants];
                                                            newV[index].dimensions.breadth = e.target.value;
                                                            setPreviewVariants(newV);
                                                        }} />
                                                    </div>
                                                    <div className="form-group mb-0" style={{ width: '40px' }}>
                                                        <label style={{ fontSize: '0.55rem', fontWeight: 700, marginBottom: '2px', display: 'block' }}>{builderConfig?.fieldLabels.height || 'H'}</label>
                                                        <input className="form-input" style={{ height: '24px', fontSize: '0.7rem', padding: '0 4px' }} value={variant.dimensions.height} onChange={e => {
                                                            const newV = [...previewVariants];
                                                            newV[index].dimensions.height = e.target.value;
                                                            setPreviewVariants(newV);
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
                                                <Button variant="ghost" size="sm" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => duplicateVariant(index)} title="Duplicate">
                                                    <Copy size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" style={{ width: '28px', height: '28px', padding: 0, color: 'var(--error)' }} onClick={() => {
                                                    const newV = [...previewVariants];
                                                    newV.splice(index, 1);
                                                    setPreviewVariants(newV);
                                                    notifyParent(newV);
                                                }} title="Delete">
                                                    <Trash2 size={14} />
                                                </Button>
                                                <label className="checkbox-item" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }} title="Active Status">
                                                    <input type="checkbox" checked={variant.enabled} onChange={e => updateVariant(index, 'enabled', e.target.checked)} />
                                                    <span style={{ fontSize: '0.55rem', fontWeight: 800 }}>ACT</span>
                                                </label>
                                                <input type="checkbox" checked={selectedIds.has(variant.id)} onChange={() => toggleSelection(variant.id)} title="Select" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Image Slots (Dynamic from configuration) */}
                                    <div className="flex-center" style={{ gap: '8px', padding: '0 14px' }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '4px', textTransform: 'uppercase' }}>Images:</div>
                                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
                                            {[...Array(builderConfig?.maxImagesPerVariant || 10)].map((_, slotIdx) => (
                                                <div
                                                    key={slotIdx}
                                                    className="flex-center"
                                                    style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        background: variant.images[slotIdx] ? `url(${variant.images[slotIdx]}) center/cover no-repeat` : 'var(--bg-sidebar)',
                                                        border: '1px dashed var(--border-strong)',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        color: 'var(--text-muted)',
                                                        transition: 'all 0.2s',
                                                        opacity: variant.images[slotIdx] ? 1 : 0.7,
                                                        position: 'relative'
                                                    }}
                                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
                                                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = variant.images[slotIdx] ? `url(${variant.images[slotIdx]}) center/cover no-repeat` : 'var(--bg-sidebar)'; }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const files = e.dataTransfer.files;
                                                        if (files && files.length > 0) {
                                                            const newImages = [...variant.images];
                                                            Array.from(files).forEach((file, i) => {
                                                                if (slotIdx + i < 10) {
                                                                    newImages[slotIdx + i] = URL.createObjectURL(file);
                                                                }
                                                            });
                                                            updateVariant(index, 'images', newImages);
                                                        }
                                                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                                                    }}
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.multiple = true;
                                                        input.accept = 'image/*';
                                                        input.onchange = (e) => {
                                                            const files = (e.target as HTMLInputElement).files;
                                                            if (files && files.length > 0) {
                                                                const newImages = [...variant.images];
                                                                Array.from(files).forEach((file, i) => {
                                                                    if (slotIdx + i < 10) {
                                                                        newImages[slotIdx + i] = URL.createObjectURL(file);
                                                                    }
                                                                });
                                                                updateVariant(index, 'images', newImages);
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                    title={variant.images[slotIdx] ? 'Change Image' : 'Add Image'}
                                                >
                                                    {!variant.images[slotIdx] && <Plus size={14} style={{ opacity: 0.5 }} />}
                                                    {variant.images[slotIdx] && (
                                                        <div
                                                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--error)', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newImages = [...variant.images];
                                                                newImages[slotIdx] = '';
                                                                updateVariant(index, 'images', newImages);
                                                            }}
                                                        >
                                                            <X size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                            VARIATION #{index + 1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card text-center p-12 text-muted" style={{ border: '1px dashed var(--border)' }}>
                    <Layers size={32} className="mx-auto mb-4 opacity-20" />
                    No variants added yet. Use the auto-generator above or add one manually.
                </div>
            )}
        </div>
    );
};
