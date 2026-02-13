import React, { useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import type { BuilderConfig } from './types';

interface BulkActionsBarProps {
    selectedCount: number;
    onActivate: () => void;
    onDeactivate: () => void;
    onDelete: () => void;
    onUpdatePrice: (price: string) => void;
    onUpdateStock: (stock: number) => void;
    onDeselectAll: () => void;
    config: BuilderConfig;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    onActivate,
    onDeactivate,
    onDelete,
    onUpdatePrice,
    onUpdateStock,
    onDeselectAll,
    config
}) => {
    const [showPriceInput, setShowPriceInput] = useState(false);
    const [showStockInput, setShowStockInput] = useState(false);
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkStock, setBulkStock] = useState('');

    return (
        <div className="bulk-actions-right">
            <div className="flex-center" style={{ gap: '8px', marginRight: '16px', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
                <span className="font-bold text-sm text-primary">{selectedCount} selected</span>
                <button
                    onClick={onDeselectAll}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                    Deselect
                </button>
            </div>

            <button className="btn-success btn-sm flex-center" onClick={onActivate} style={{ gap: '4px', height: '28px', fontSize: '11px' }}>
                <Check size={12} /> Activate
            </button>
            <button className="btn-secondary btn-sm flex-center" onClick={onDeactivate} style={{ gap: '4px', height: '28px', fontSize: '11px' }}>
                <X size={12} /> Deactivate
            </button>

            {showPriceInput ? (
                <div className="input-wrapper">
                    <input
                        type="number"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        placeholder="Price"
                        min={config.validationRules.priceMinimum}
                    />
                    <button onClick={() => { onUpdatePrice(bulkPrice); setShowPriceInput(false); }}>
                        <Check size={12} className="text-success" />
                    </button>
                    <button onClick={() => setShowPriceInput(false)}>
                        <X size={12} className="text-error" />
                    </button>
                </div>
            ) : (
                <button className="btn-ghost btn-sm" onClick={() => setShowPriceInput(true)} style={{ height: '28px', fontSize: '11px' }}>
                    Set Price
                </button>
            )}

            {showStockInput ? (
                <div className="input-wrapper">
                    <input
                        type="number"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        placeholder="Stock"
                        min={config.validationRules.stockMinimum}
                    />
                    <button onClick={() => { onUpdateStock(parseInt(bulkStock)); setShowStockInput(false); }}>
                        <Check size={12} className="text-success" />
                    </button>
                    <button onClick={() => setShowStockInput(false)}>
                        <X size={12} className="text-error" />
                    </button>
                </div>
            ) : (
                <button className="btn-ghost btn-sm" onClick={() => setShowStockInput(true)} style={{ height: '28px', fontSize: '11px' }}>
                    Set Stock
                </button>
            )}

            <button className="btn-error btn-sm flex-center" onClick={onDelete} style={{ gap: '4px', height: '28px', fontSize: '11px' }}>
                <Trash2 size={12} /> Delete
            </button>
        </div>
    );
};

export default BulkActionsBar;
