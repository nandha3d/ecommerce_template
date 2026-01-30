import React, { useState } from 'react';
import api from '../../../services/api';

interface Attribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  options: { id: number; value: string; label?: string; color_code?: string }[];
}

interface Variant {
  id?: number;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
  is_active: boolean;
  image?: string;
}

interface Props {
  productId: number;
  attributes: Attribute[];
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  basePrice: number;
  baseSku: string;
}

const ProductVariationsEditor: React.FC<Props> = ({
  productId,
  attributes,
  variants,
  onVariantsChange,
  basePrice,
  baseSku,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);

  const handleAttributeSelect = (attrSlug: string, value: string, checked: boolean) => {
    setSelectedAttributes(prev => {
      const current = prev[attrSlug] || [];
      if (checked) {
        return { ...prev, [attrSlug]: [...current, value] };
      } else {
        return { ...prev, [attrSlug]: current.filter(v => v !== value) };
      }
    });
  };

  const generateVariants = async () => {
    if (Object.keys(selectedAttributes).length === 0) {
      alert('Please select at least one attribute value');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/variants/generate-matrix', {
        attributes: selectedAttributes,
        base_price: basePrice,
        base_sku: baseSku,
      });
      const data = response.data;
      if (data.success) {
        onVariantsChange([...variants, ...data.data.map((v: any) => ({ ...v, is_active: true }))]);
      }
    } catch (error) {
      console.error('Failed to generate variants:', error);
    } finally {
      setGenerating(false);
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'variant');

    try {
      const response = await api.post('/admin/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      const data = response.data;
      if (data.success && data.data?.url) {
        updateVariant(index, 'image', data.data.url);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <div className="variations-editor">
      <div className="variations-header">
        <h3>Product Variations</h3>
        <p>Create different versions of your product (sizes, flavors, colors)</p>
      </div>

      {/* Attribute Selector */}
      <div className="attribute-selector">
        <h4>Select Attributes</h4>
        <div className="attributes-grid">
          {attributes.map(attr => (
            <div key={attr.id} className="attribute-group">
              <label className="attribute-label">{attr.name}</label>
              <div className="attribute-options">
                {attr.options.map(opt => (
                  <label key={opt.id} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={(selectedAttributes[attr.slug] || []).includes(opt.value)}
                      onChange={(e) => handleAttributeSelect(attr.slug, opt.value, e.target.checked)}
                    />
                    {attr.type === 'color' && opt.color_code && (
                      <span
                        className="color-swatch"
                        style={{ backgroundColor: opt.color_code }}
                      />
                    )}
                    <span>{opt.label || opt.value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          className="generate-btn"
          onClick={generateVariants}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Variants'}
        </button>
      </div>

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="variants-table-container">
          <h4>Variants ({variants.length})</h4>
          <div className="variants-table">
            <div className="table-header">
              <span>Image</span>
              <span>Variant</span>
              <span>SKU</span>
              <span>Price</span>
              <span>Sale Price</span>
              <span>Stock</span>
              <span>Active</span>
              <span></span>
            </div>
            {variants.map((variant, index) => (
              <div key={index} className="table-row">
                {/* Image Upload */}
                <div className="variant-image-cell">
                  {variant.image ? (
                    <div className="image-preview">
                      <img src={variant.image.startsWith('http') ? variant.image : `/storage/${variant.image}`} alt="Variant" />
                      <button
                        className="remove-image-btn"
                        onClick={() => updateVariant(index, 'image', undefined)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                        hidden
                      />
                      <span>+</span>
                    </label>
                  )}
                </div>
                <span className="variant-attrs">
                  {Object.entries(variant.attributes).map(([k, v]) => (
                    <span key={k} className="attr-badge">{v}</span>
                  ))}
                </span>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  className="input-sku"
                />
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                  className="input-price"
                />
                <input
                  type="number"
                  value={variant.sale_price || ''}
                  onChange={(e) => updateVariant(index, 'sale_price', e.target.value ? parseFloat(e.target.value) : null)}
                  className="input-price"
                  placeholder="Optional"
                />
                <input
                  type="number"
                  value={variant.stock_quantity}
                  onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value))}
                  className="input-stock"
                />
                <label className="toggle-small">
                  <input
                    type="checkbox"
                    checked={variant.is_active}
                    onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                  />
                  <span className="toggle-slider-small"></span>
                </label>
                <button
                  className="remove-btn"
                  onClick={() => removeVariant(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .variations-editor {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
        }

        .variations-header h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .variations-header p {
          color: #666;
          margin: 0 0 24px;
        }

        .attribute-selector {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .attribute-selector h4 {
          margin: 0 0 16px;
          font-size: 16px;
        }

        .attributes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .attribute-group {
          background: #fff;
          padding: 16px;
          border-radius: 8px;
        }

        .attribute-label {
          font-weight: 600;
          display: block;
          margin-bottom: 12px;
        }

        .attribute-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .option-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
          padding: 6px 10px;
          background: #f0f0f0;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .option-checkbox:hover {
          background: #e0e0e0;
        }

        .option-checkbox input {
          margin: 0;
        }

        .color-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #ccc;
        }

        .generate-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .variants-table-container h4 {
          margin: 0 0 16px;
        }

        .variants-table {
          overflow-x: auto;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 60px 2fr 1fr 100px 100px 80px 60px 40px;
          gap: 12px;
          align-items: center;
          padding: 12px;
        }

        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          font-size: 13px;
          color: #666;
          border-radius: 8px;
        }

        .table-row {
          border-bottom: 1px solid #eee;
        }

        .variant-attrs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .attr-badge {
          background: #e0e7ff;
          color: #4338ca;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .input-sku, .input-price, .input-stock {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
        }

        .input-price, .input-stock {
          text-align: right;
        }

        .toggle-small {
          position: relative;
          width: 40px;
          height: 22px;
        }

        .toggle-small input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider-small {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #ccc;
          transition: .2s;
          border-radius: 22px;
        }

        .toggle-slider-small:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider-small {
          background: #10b981;
        }

        input:checked + .toggle-slider-small:before {
          transform: translateX(18px);
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 6px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #fecaca;
        }

        .variant-image-cell {
          width: 50px;
          height: 50px;
        }

        .image-preview {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          border: none;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-preview:hover .remove-image-btn {
          opacity: 1;
        }

        .upload-placeholder {
          width: 50px;
          height: 50px;
          border: 2px dashed #ddd;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .upload-placeholder:hover {
          border-color: #6366f1;
          background: #f0f0ff;
        }

        .upload-placeholder span {
          font-size: 24px;
          color: #aaa;
        }

        .upload-placeholder:hover span {
          color: #6366f1;
        }

        @media (max-width: 768px) {
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .table-header {
            display: none;
          }

          .table-row {
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 8px;
            border: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductVariationsEditor;
