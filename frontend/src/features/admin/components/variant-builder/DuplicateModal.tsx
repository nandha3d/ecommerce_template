import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

interface DuplicateModalProps {
    maxCount: number;
    onConfirm: (count: number) => void;
    onCancel: () => void;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({ maxCount, onConfirm, onCancel }) => {
    const [count, setCount] = useState<number>(1);
    const [error, setError] = useState<string>('');

    const handleConfirm = () => {
        if (count < 1 || count > maxCount) {
            setError(`Count must be between 1 and ${maxCount}`);
            return;
        }
        onConfirm(count);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="flex-center" style={{ gap: '8px' }}>
                        <Copy size={20} className="text-primary" />
                        <h3 className="text-lg font-bold">Duplicate Variant</h3>
                    </div>
                    <button onClick={onCancel} className="btn-ghost btn-sm">
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-field">
                        <label className="mb-2 block text-sm font-bold">How many duplicates?</label>
                        <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                            min={1}
                            max={maxCount}
                            autoFocus
                            className="w-full"
                        />
                        <p className="mt-2 text-xs text-muted">Maximum: {maxCount} duplicates allowed</p>
                    </div>
                    {error && <div className="mt-3 text-sm text-error font-bold">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="btn-primary" onClick={handleConfirm}>
                        Create {count} Duplicate{count !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateModal;
