import React from 'react';
import {
    Check, X, Copy, Trash2, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import type {
    GeneratedVariant,
    BuilderConfig,
    AttributeConfig
} from './types';
import AttributeSelector from './AttributeSelector';

interface VariantCardProps {
    variant: GeneratedVariant;
    index: number;
    title: string;
    config: BuilderConfig;
    availableAttributes: AttributeConfig[];
    isSelected: boolean;
    isCollapsed: boolean;
    onToggleSelect: () => void;
    onToggleCollapse: () => void;
    onUpdate: (field: string, value: any) => void;
    onUpdateAttribute: (attrName: string, attrValue: string) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onToggleStatus: () => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number) => void;
    onRemoveImage: (slotIdx: number) => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
    variant,
    index,
    title,
    config,
    availableAttributes,
    isSelected,
    isCollapsed,
    onToggleSelect,
    onToggleCollapse,
    onUpdate,
    onUpdateAttribute,
    onDelete,
    onDuplicate,
    onToggleStatus,
    onImageUpload,
    onRemoveImage
}) => {
    // Defensive checks for legacy data
    const dimensions = variant.dimensions || { length: '0', breadth: '0', height: '0' };
    const attributes = variant.attributes || [];

    return (
        <div className={`variant-card ${variant.enabled ? '' : 'inactive'} ${isSelected ? 'selected' : ''}`}>
            {/* Header: ID, Title, Status, Actions */}
            <div className="variant-card-header">
                <div className="header-left">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        className="checkmark-vb"
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div className="variant-id-badge">#{index + 1}</div>
                    <div className="variant-title-group">
                        <h3>{title || 'New Variant'}</h3>
                        <span className="variant-sku-sub">{variant.sku}</span>
                    </div>
                </div>
                <div className="header-right">
                    <label className="switch" title={variant.enabled ? 'Active' : 'Inactive'} style={{ transform: 'scale(0.8)' }}>
                        <input
                            type="checkbox"
                            checked={variant.enabled}
                            onChange={onToggleStatus}
                        />
                        <span className="slider"></span>
                    </label>
                    <button onClick={onDuplicate} className="btn-ghost btn-sm" title="Duplicate">
                        <Copy size={16} />
                    </button>
                    <button onClick={onDelete} className="btn-ghost btn-sm text-error" title="Delete">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={onToggleCollapse} className="btn-ghost btn-sm">
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>
            </div>

            {/* Body: EXACTLY 2 ROWS */}
            {!isCollapsed && (
                <div className="variant-card-body">
                    {/* ROW 1: Attributes | SKU Override | Cost | Selling | Offer */}
                    <div className="row-line-1">
                        <div className="attributes-group">
                            {availableAttributes.map(attr => (
                                <AttributeSelector
                                    key={attr.id}
                                    attribute={attr}
                                    value={attributes.find(a => a.name === attr.name)?.value || ''}
                                    onChange={(value) => onUpdateAttribute(attr.name, value)}
                                />
                            ))}
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">SKU Override</span>
                            <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => onUpdate('sku', e.target.value)}
                                className="input vb-input-compact"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">{config.fieldLabels.cost}</span>
                            <input
                                type="number"
                                value={variant.cost_price}
                                onChange={(e) => onUpdate('cost_price', e.target.value)}
                                className="input vb-input-price"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">{config.fieldLabels.price}</span>
                            <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => onUpdate('price', e.target.value)}
                                className="input vb-input-price"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">{config.fieldLabels.salePrice}</span>
                            <input
                                type="number"
                                value={variant.sale_price}
                                onChange={(e) => onUpdate('sale_price', e.target.value)}
                                className="input vb-input-price"
                            />
                        </div>
                    </div>

                    {/* ROW 2: Stock | Net Wt | L | B | H | Images */}
                    <div className="row-line-2">
                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">{config.fieldLabels.stock}</span>
                            <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => onUpdate('stock', parseInt(e.target.value) || 0)}
                                className="input vb-input-shipping"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">{config.fieldLabels.weight}</span>
                            <input
                                type="number"
                                value={variant.weight}
                                onChange={(e) => onUpdate('weight', e.target.value)}
                                className="input vb-input-shipping"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">L</span>
                            <input
                                type="number"
                                value={dimensions.length}
                                onChange={(e) => onUpdate('dimensions.length', e.target.value)}
                                className="input vb-input-shipping"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">B</span>
                            <input
                                type="number"
                                value={dimensions.breadth}
                                onChange={(e) => onUpdate('dimensions.breadth', e.target.value)}
                                className="input vb-input-shipping"
                            />
                        </div>

                        <div className="vb-field-group-horizontal">
                            <span className="vb-label-compact">H</span>
                            <input
                                type="number"
                                value={dimensions.height}
                                onChange={(e) => onUpdate('dimensions.height', e.target.value)}
                                className="input vb-input-shipping"
                            />
                        </div>

                        {/* Images integrated into Row 2 */}
                        <div className="images-inline-group">
                            {[...Array(config.maxImagesPerVariant)].map((_, slotIdx) => (
                                <div key={slotIdx} className="image-slot-wrapper" style={{ position: 'relative' }}>
                                    {variant.images[slotIdx] ? (
                                        <div className="image-slot-mini">
                                            <img src={variant.images[slotIdx]} alt={`Slot ${slotIdx + 1}`} />
                                            <button
                                                onClick={() => onRemoveImage(slotIdx)}
                                                className="absolute -top-1 -right-1"
                                                style={{ background: 'var(--error)', color: 'white', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0 }}
                                            >
                                                <X size={8} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="image-slot-mini">
                                            <input
                                                type="file"
                                                accept={config.allowedImageFormats.join(',')}
                                                onChange={(e) => onImageUpload(e, slotIdx)}
                                                style={{ display: 'none' }}
                                            />
                                            <Plus size={12} />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantCard;
