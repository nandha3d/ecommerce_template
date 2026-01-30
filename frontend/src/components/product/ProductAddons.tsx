import React from 'react';

interface Addon {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    is_required: boolean;
    max_quantity: number;
}

interface SelectedAddon {
    addon_id: number;
    quantity: number;
}

interface Props {
    addons: Addon[];
    selected: SelectedAddon[];
    onChange: (selected: SelectedAddon[]) => void;
}

const ProductAddons: React.FC<Props> = ({ addons, selected, onChange }) => {
    const isSelected = (addonId: number) => {
        return selected.some(s => s.addon_id === addonId);
    };

    const getQuantity = (addonId: number) => {
        const item = selected.find(s => s.addon_id === addonId);
        return item?.quantity || 1;
    };

    const toggleAddon = (addon: Addon) => {
        if (isSelected(addon.id)) {
            onChange(selected.filter(s => s.addon_id !== addon.id));
        } else {
            onChange([...selected, { addon_id: addon.id, quantity: 1 }]);
        }
    };

    const updateQuantity = (addonId: number, quantity: number) => {
        onChange(selected.map(s =>
            s.addon_id === addonId ? { ...s, quantity } : s
        ));
    };

    const getTotalPrice = () => {
        return selected.reduce((total, item) => {
            const addon = addons.find(a => a.id === item.addon_id);
            return total + (addon?.price || 0) * item.quantity;
        }, 0);
    };

    if (addons.length === 0) return null;

    return (
        <div className="product-addons">
            <h3 className="addons-title">
                <span>📦</span> Add-ons & Extras
            </h3>

            <div className="addons-list">
                {addons.map(addon => (
                    <div
                        key={addon.id}
                        className={`addon-item ${isSelected(addon.id) ? 'selected' : ''} ${addon.is_required ? 'required' : ''}`}
                        onClick={() => !addon.is_required && toggleAddon(addon)}
                    >
                        <div className="addon-checkbox">
                            <input
                                type="checkbox"
                                checked={isSelected(addon.id) || addon.is_required}
                                onChange={() => toggleAddon(addon)}
                                disabled={addon.is_required}
                            />
                            <span className="checkmark"></span>
                        </div>

                        {addon.image && (
                            <img src={addon.image} alt={addon.name} className="addon-image" />
                        )}

                        <div className="addon-info">
                            <span className="addon-name">
                                {addon.name}
                                {addon.is_required && <span className="required-badge">Required</span>}
                            </span>
                            {addon.description && (
                                <span className="addon-desc">{addon.description}</span>
                            )}
                        </div>

                        <div className="addon-price">
                            +₹{addon.price.toFixed(2)}
                        </div>

                        {isSelected(addon.id) && addon.max_quantity > 1 && (
                            <div className="addon-quantity" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => updateQuantity(addon.id, Math.max(1, getQuantity(addon.id) - 1))}
                                >
                                    −
                                </button>
                                <span>{getQuantity(addon.id)}</span>
                                <button
                                    onClick={() => updateQuantity(addon.id, Math.min(addon.max_quantity, getQuantity(addon.id) + 1))}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selected.length > 0 && (
                <div className="addons-total">
                    <span>Add-ons Total:</span>
                    <span className="total-price">+₹{getTotalPrice().toFixed(2)}</span>
                </div>
            )}

            <style>{`
        .product-addons {
          background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%);
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
        }

        .addons-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px;
          color: #92400e;
        }

        .addons-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .addon-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .addon-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .addon-item.selected {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .addon-item.required {
          cursor: default;
          opacity: 0.8;
        }

        .addon-checkbox {
          position: relative;
          width: 24px;
          height: 24px;
        }

        .addon-checkbox input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          background: #fff;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .addon-checkbox input:checked + .checkmark {
          background: #f59e0b;
          border-color: #f59e0b;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 8px;
          top: 4px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .addon-checkbox input:checked + .checkmark:after {
          display: block;
        }

        .addon-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
        }

        .addon-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .addon-name {
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .required-badge {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          background: #dc2626;
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .addon-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .addon-price {
          font-weight: 700;
          color: #059669;
          font-size: 16px;
        }

        .addon-quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .addon-quantity button {
          width: 28px;
          height: 28px;
          border: none;
          background: #fff;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .addon-quantity button:hover {
          background: #e5e7eb;
        }

        .addon-quantity span {
          min-width: 24px;
          text-align: center;
          font-weight: 600;
        }

        .addons-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px dashed #fcd34d;
        }

        .total-price {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }

        @media (max-width: 480px) {
          .addon-item {
            flex-wrap: wrap;
          }

          .addon-price {
            width: 100%;
            text-align: right;
            margin-top: 8px;
          }
        }
      `}</style>
        </div>
    );
};

export default ProductAddons;
