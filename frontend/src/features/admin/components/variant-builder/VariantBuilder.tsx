import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { adminService } from '../../../../services/adminService';
import type {
    GeneratedVariant,
    BuilderConfig,
    AttributeConfig,
    VariantAttribute,
    VariantDimensions
} from './types';
import VariantCard from './VariantCard';
import BulkActionsBar from './BulkActionsBar';
import DuplicateModal from './DuplicateModal';
import './VariantBuilder.css';

interface VariantBuilderProps {
    productId: string;
    productName: string;
    baseSku: string;
    onGenerate?: (variants: GeneratedVariant[]) => void;
    initialVariants?: GeneratedVariant[];
}

export const VariantBuilder: React.FC<VariantBuilderProps> = ({
    productId,
    productName,
    baseSku,
    onGenerate,
    initialVariants = []
}) => {
    // API Queries
    const { data: configData, isLoading: isConfigLoading, error: configError } = useQuery({
        queryKey: ['variant-builder-config'],
        queryFn: adminService.getVariantBuilderConfig
    });

    const { data: attributesData, isLoading: isAttributesLoading } = useQuery({
        queryKey: ['product-attributes', productId],
        queryFn: () => adminService.getAttributes()
    });

    // State
    const [variants, setVariants] = useState<GeneratedVariant[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
    const [showDuplicateModal, setShowDuplicateModal] = useState<number | null>(null);

    // Matrix Generation State
    const [matrixSelection, setMatrixSelection] = useState<Record<string, string[]>>({});
    const [isGenerating, setIsGenerating] = useState(false);

    const builderConfig = configData?.data?.data as BuilderConfig;
    const availableAttributes = (attributesData?.data?.data || []) as AttributeConfig[];

    // Defensive mapping for initialVariants
    useEffect(() => {
        if (initialVariants && initialVariants.length > 0) {
            const mapped = initialVariants.map(v => {
                // Determine if we have nested or flat dimensions
                const length = v.length ?? v.dimensions?.length ?? '0';
                const breadth = v.breadth ?? v.dimensions?.breadth ?? '0';
                const height = v.height ?? v.dimensions?.height ?? '0';

                return {
                    ...v,
                    // Map backend fields to frontend if missing (robustness)
                    sku: v.sku || '',
                    price: v.price || '0',
                    sale_price: v.sale_price || '',
                    cost_price: v.cost_price || '0',
                    stock_quantity: v.stock_quantity ?? (v as any).stock ?? 0,
                    is_active: v.is_active ?? (v as any).enabled ?? true,
                    weight: v.weight || '0',
                    length,
                    breadth,
                    height,
                    dimensions: { length, breadth, height },
                    attributes: v.attributes || [],
                    images: v.images || []
                };
            });
            setVariants(mapped);
        }
    }, [initialVariants]);

    // Loading State
    if (isConfigLoading || isAttributesLoading) {
        return (
            <div className="variant-builder-loading">
                <RefreshCw className="loading-spinner" />
                <p className="font-bold text-muted uppercase tracking-wider text-xs">Loading Variant Builder Configuration...</p>
            </div>
        );
    }

    // Error State
    if (configError || !builderConfig) {
        return (
            <div className="variant-builder-error flex-column flex-center p-12 card" style={{ gap: '16px', border: '1px dashed var(--error)' }}>
                <AlertCircle size={40} className="text-error" />
                <div className="text-center">
                    <p className="font-bold text-lg">Failed to load builder configuration</p>
                    <p className="text-muted text-sm mt-1">Please ensure the backend endpoint is accessible.</p>
                </div>
                <button onClick={() => window.location.reload()} className="btn-primary">Retry Connection</button>
            </div>
        );
    }

    // Matrix Handlers
    const toggleMatrixValue = (attrName: string, value: string) => {
        const current = matrixSelection[attrName] || [];
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setMatrixSelection({ ...matrixSelection, [attrName]: next });
    };

    const generateMatrix = () => {
        const selectedArrays = Object.entries(matrixSelection).filter(([_, vals]) => vals.length > 0);
        if (selectedArrays.length === 0) return;

        setIsGenerating(true);

        // Cartesian product
        const generate = (index: number, currentCombo: VariantAttribute[]): any[] => {
            if (index === selectedArrays.length) {
                const sku = generateSKU(currentCombo);
                return [{
                    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    sku,
                    attributes: [...currentCombo],
                    price: '0',
                    sale_price: '',
                    cost_price: '0',
                    stock_quantity: 0,
                    is_active: true,
                    images: [],
                    weight: '0',
                    length: '0',
                    breadth: '0',
                    height: '0',
                    dimensions: { length: '0', breadth: '0', height: '0' }
                }];
            }

            const [attrName, values] = selectedArrays[index];
            let results: any[] = [];
            for (const val of values) {
                results = results.concat(generate(index + 1, [...currentCombo, { name: attrName, value: val }]));
            }
            return results;
        };

        const newVariants = generate(0, []);
        const updated = [...variants, ...newVariants];
        setVariants(updated);
        onGenerate?.(updated);
        setMatrixSelection({});
        setIsGenerating(false);
    };

    // Generic Handlers
    const addManualVariant = () => {
        const newVariant: GeneratedVariant = {
            id: `manual-${Date.now()}`,
            sku: baseSku,
            attributes: availableAttributes.map(attr => ({
                name: attr.name,
                value: ''
            })),
            price: '0',
            sale_price: '',
            cost_price: '0',
            stock_quantity: 0,
            is_active: true,
            images: [],
            weight: '0',
            length: '0',
            breadth: '0',
            height: '0',
            dimensions: { length: '0', breadth: '0', height: '0' }
        };
        const updated = [...variants, newVariant];
        setVariants(updated);
        onGenerate?.(updated);
    };

    const generateSKU = (attributes: VariantAttribute[]): string => {
        const attributeCodes = attributes
            .filter(attr => attr.value)
            .map(attr => attr.value)
            .join('-');

        return builderConfig.skuFormat
            .replace('{baseSku}', baseSku)
            .replace('{attributeCodes}', attributeCodes);
    };

    const generateTitle = (attributes: VariantAttribute[]): string => {
        const attributeValues = attributes
            .filter(attr => attr.value)
            .map(attr => attr.value)
            .join(' - ');

        return builderConfig.titleFormat
            .replace('{productName}', productName)
            .replace('{attributes}', attributeValues);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const updated = [...variants];
        if (field.startsWith('dimensions.')) {
            const dimField = field.split('.')[1] as keyof VariantDimensions;
            updated[index].dimensions = updated[index].dimensions || { length: '0', breadth: '0', height: '0' };
            updated[index].dimensions[dimField] = value;
            // Also update flat fields for backend consistency
            (updated[index] as any)[dimField] = value;
        } else {
            (updated[index] as any)[field] = value;
        }
        setVariants(updated);
        onGenerate?.(updated);
    };

    const updateVariantAttribute = (index: number, attrName: string, attrValue: string) => {
        const updated = [...variants];
        const attrIndex = updated[index].attributes.findIndex(a => a.name === attrName);
        if (attrIndex !== -1) {
            updated[index].attributes[attrIndex].value = attrValue;
        } else {
            updated[index].attributes.push({ name: attrName, value: attrValue });
        }
        updated[index].sku = generateSKU(updated[index].attributes);
        setVariants(updated);
        onGenerate?.(updated);
    };

    const deleteVariant = async (index: number) => {
        const variant = variants[index];
        const vid = variant.id.toString();
        if (!vid.startsWith('manual-') && !vid.startsWith('temp-') && !vid.startsWith('dup-')) {
            try {
                await adminService.bulkDeleteVariants([parseInt(variant.id)]);
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
        const updated = variants.filter((_, i) => i !== index);
        setVariants(updated);
        onGenerate?.(updated);
    };

    const executeDuplicate = async (count: number) => {
        const index = showDuplicateModal;
        if (index === null) return;

        const variant = variants[index];

        const duplicates = Array.from({ length: count }, (_, i) => ({
            ...variant,
            id: `dup-${Date.now()}-${i}`,
            sku: `${variant.sku}-COPY${i + 1}`,
            images: [...variant.images],
            attributes: variant.attributes.map(a => ({ ...a })),
            dimensions: { ...(variant.dimensions || { length: '0', breadth: '0', height: '0' }) }
        }));
        const updated = [...variants];
        updated.splice(index + 1, 0, ...duplicates);
        setVariants(updated);
        onGenerate?.(updated);
        setShowDuplicateModal(null);
    };

    // Selection Handlers
    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleCollapse = (id: string) => {
        const next = new Set(collapsedCards);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCollapsedCards(next);
    };

    // Bulk Actions
    const bulkDelete = async () => {
        const realIds = Array.from(selectedIds)
            .filter(id => {
                const sid = id.toString();
                return !sid.startsWith('manual-') && !sid.startsWith('temp-') && !sid.startsWith('dup-');
            })
            .map(id => parseInt(id.toString()));

        if (realIds.length > 0) {
            await adminService.bulkDeleteVariants(realIds);
        }
        const updated = variants.filter(v => !selectedIds.has(v.id));
        setVariants(updated);
        setSelectedIds(new Set());
        onGenerate?.(updated);
    };

    const bulkUpdatePrice = (price: string) => {
        const updated = variants.map(v => selectedIds.has(v.id) ? { ...v, price } : v);
        setVariants(updated);
        setSelectedIds(new Set());
        onGenerate?.(updated);
    };

    const bulkUpdateStock = (stock: number) => {
        const updated = variants.map(v => selectedIds.has(v.id) ? { ...v, stock_quantity: stock } : v);
        setVariants(updated);
        setSelectedIds(new Set());
        onGenerate?.(updated);
    };

    return (
        <div className="variant-builder">
            {/* Matrix Creator Section */}
            <div className="matrix-creator">
                <div className="matrix-header">
                    <div className="header-info">
                        <h2 className="text-xl font-bold">Variation Matrix</h2>
                        <span>Select attribute values to generate combinations</span>
                    </div>
                    <button
                        onClick={generateMatrix}
                        disabled={Object.values(matrixSelection).flat().length === 0 || isGenerating}
                        className="btn-primary"
                    >
                        {isGenerating ? <RefreshCw className="vb-spin" /> : <Plus size={18} />}
                        Generate Matrix
                    </button>
                </div>

                <div className="matrix-grid">
                    {availableAttributes.map(attr => (
                        <div key={attr.id} className="matrix-attr-card">
                            <div className="matrix-attr-header">
                                <span>{attr.name}</span>
                                <span className="text-primary">{matrixSelection[attr.name]?.length || 0} selected</span>
                            </div>
                            <div className="flex-wrap" style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                {attr.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleMatrixValue(attr.name, opt.value)}
                                        className={`btn-tag ${matrixSelection[attr.name]?.includes(opt.value) ? 'active' : ''}`}
                                    >
                                        {opt.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="variant-builder-header">
                <div className="header-info">
                    <h2 className="text-xl font-bold">Active Variants</h2>
                    <span>{variants.length} variant{variants.length !== 1 ? 's' : ''} defined</span>
                </div>

                {selectedIds.size > 0 && (
                    <BulkActionsBar
                        selectedCount={selectedIds.size}
                        onActivate={() => {
                            const updated = variants.map(v => selectedIds.has(v.id) ? { ...v, is_active: true } : v);
                            setVariants(updated);
                            onGenerate?.(updated);
                        }}
                        onDeactivate={() => {
                            const updated = variants.map(v => selectedIds.has(v.id) ? { ...v, is_active: false } : v);
                            setVariants(updated);
                            onGenerate?.(updated);
                        }}
                        onDelete={bulkDelete}
                        onUpdatePrice={bulkUpdatePrice}
                        onUpdateStock={bulkUpdateStock}
                        onDeselectAll={() => setSelectedIds(new Set())}
                        config={builderConfig}
                    />
                )}

                <button
                    onClick={addManualVariant}
                    className="btn btn-primary btn-sm"
                >
                    <Plus size={16} /> Add Single Variant
                </button>
            </div>

            <div className="variant-list">
                {variants.map((v, i) => (
                    <VariantCard
                        key={v.id}
                        variant={v}
                        index={i}
                        title={generateTitle(v.attributes)}
                        config={builderConfig}
                        availableAttributes={availableAttributes}
                        isSelected={selectedIds.has(v.id)}
                        isCollapsed={collapsedCards.has(v.id)}
                        onToggleSelect={() => toggleSelect(v.id)}
                        onToggleCollapse={() => toggleCollapse(v.id)}
                        onUpdate={(field, val) => updateVariant(i, field, val)}
                        onUpdateAttribute={(name, val) => updateVariantAttribute(i, name, val)}
                        onDelete={() => deleteVariant(i)}
                        onDuplicate={() => setShowDuplicateModal(i)}
                        onToggleStatus={() => updateVariant(i, 'is_active', !v.is_active)}
                        onImageUpload={() => { }} // Placeholder per user spec
                        onRemoveImage={(slot) => {
                            const updated = [...variants];
                            updated[i].images.splice(slot, 1);
                            setVariants(updated);
                            onGenerate?.(updated);
                        }}
                    />
                ))}
            </div>

            {showDuplicateModal !== null && (
                <DuplicateModal
                    maxCount={builderConfig.maxDuplicateCount}
                    onConfirm={executeDuplicate}
                    onCancel={() => setShowDuplicateModal(null)}
                />
            )}
        </div>
    );
};
