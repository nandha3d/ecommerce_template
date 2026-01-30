import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Palette, Image as ImageIcon, Type, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { Button, Card, Badge, Modal, Input } from '../../../components/ui';
import api from '../../../services/api';

interface AttributeOption {
    id?: number;
    value: string;
    label?: string;
    color_code?: string;
    image?: string;
    price_modifier?: number;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'color' | 'image' | 'select' | 'button' | 'radio';
    type_display: string;
    is_active: boolean;
    show_price_diff: boolean;
    sort_order: number;
    options_count: number;
    options: AttributeOption[];
}

const swatchTypes = [
    { value: 'text', label: 'Text (S, M, L, XL)', icon: Type },
    { value: 'color', label: 'Color Swatch', icon: Palette },
    { value: 'image', label: 'Image Swatch', icon: ImageIcon },
];

const AttributesPage: React.FC = () => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'text' as 'text' | 'color' | 'image',
        is_active: true,
        show_price_diff: false,
        options: [] as AttributeOption[],
    });

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/attributes');
            setAttributes(response.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load attributes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const openCreateModal = () => {
        setEditingAttribute(null);
        setFormData({ name: '', type: 'text', is_active: true, show_price_diff: false, options: [] });
        setShowModal(true);
    };

    const openEditModal = (attr: Attribute) => {
        setEditingAttribute(attr);
        setFormData({
            name: attr.name,
            type: attr.type as 'text' | 'color' | 'image',
            is_active: attr.is_active,
            show_price_diff: attr.show_price_diff ?? false,
            options: attr.options || [],
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Attribute name is required');
            return;
        }

        setSaving(true);
        try {
            if (editingAttribute) {
                await api.put(`/admin/attributes/${editingAttribute.id}`, formData);
            } else {
                await api.post('/admin/attributes', formData);
            }
            setShowModal(false);
            fetchAttributes();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save attribute');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this attribute and all its options?')) return;
        try {
            await api.delete(`/admin/attributes/${id}`);
            fetchAttributes();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete attribute');
        }
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { value: '', label: '', color_code: '', image: '' }],
        }));
    };

    const updateOption = (index: number, field: keyof AttributeOption, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt),
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'color': return <Palette className="w-4 h-4 text-purple-500" />;
            case 'image': return <ImageIcon className="w-4 h-4 text-blue-500" />;
            default: return <Type className="w-4 h-4 text-neutral-500" />;
        }
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900">Product Attributes</h1>
                    <p className="text-neutral-500">Manage global variant attributes (Color, Size, Pattern, etc.)</p>
                </div>
                <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Attribute
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Attributes List */}
            <Card padding="none">
                {loading ? (
                    <div className="p-8 text-center text-neutral-500">Loading attributes...</div>
                ) : attributes.length === 0 ? (
                    <div className="p-8 text-center">
                        <Palette className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p className="text-neutral-500 mb-4">No attributes yet. Create your first attribute.</p>
                        <Button onClick={openCreateModal}>Create Attribute</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {attributes.map(attr => (
                            <div key={attr.id}>
                                <div
                                    className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer"
                                    onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon(attr.type)}
                                        <div>
                                            <span className="font-medium">{attr.name}</span>
                                            <span className="text-sm text-neutral-500 ml-2">({attr.options_count} options)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={attr.is_active ? 'success' : 'default'}>
                                            {attr.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant="info">{attr.type_display}</Badge>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(attr); }}
                                            className="p-2 hover:bg-neutral-100 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4 text-neutral-500" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(attr.id); }}
                                            className="p-2 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                        {expandedId === attr.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Expanded Options */}
                                {expandedId === attr.id && attr.options.length > 0 && (
                                    <div className="px-4 pb-4 bg-neutral-50">
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {attr.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200">
                                                    {attr.type === 'color' && opt.color_code && (
                                                        <div
                                                            className="w-6 h-6 rounded-full border-2 border-neutral-200"
                                                            style={{ backgroundColor: opt.color_code }}
                                                        />
                                                    )}
                                                    {attr.type === 'image' && opt.image && (
                                                        <img src={opt.image} alt={opt.value} className="w-8 h-8 rounded object-cover" />
                                                    )}
                                                    <span>{opt.label || opt.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
                size="lg"
            >
                <div className="p-4 space-y-6">
                    {/* Name */}
                    <Input
                        label="Attribute Name *"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Color, Size, Pattern"
                    />

                    {/* Swatch Type */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Swatch Type *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {swatchTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as 'text' | 'color' | 'image' }))}
                                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${formData.type === type.value
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-neutral-200 hover:border-primary-300'
                                        }`}
                                >
                                    <type.icon className={`w-6 h-6 mb-2 ${formData.type === type.value ? 'text-primary-500' : 'text-neutral-400'}`} />
                                    <span className="text-sm text-center">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-neutral-700">Options</label>
                            <Button size="sm" variant="outline" onClick={addOption}>
                                <Plus className="w-4 h-4 mr-1" /> Add Option
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {formData.options.map((opt, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                    <input
                                        type="text"
                                        value={opt.value}
                                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                                        placeholder="Value (e.g., Red, Small)"
                                        className="flex-1 px-3 py-2 rounded border border-neutral-300 text-sm"
                                    />

                                    {formData.type === 'color' && (
                                        <input
                                            type="color"
                                            value={opt.color_code || '#000000'}
                                            onChange={(e) => updateOption(index, 'color_code', e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                            title="Pick color"
                                        />
                                    )}

                                    {formData.type === 'image' && (
                                        <input
                                            type="text"
                                            value={opt.image || ''}
                                            onChange={(e) => updateOption(index, 'image', e.target.value)}
                                            placeholder="Image URL"
                                            className="flex-1 px-3 py-2 rounded border border-neutral-300 text-sm"
                                        />
                                    )}

                                    <button
                                        onClick={() => removeOption(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {formData.options.length === 0 && (
                                <p className="text-sm text-neutral-400 text-center py-4">
                                    No options yet. Click "Add Option" to create values.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
                        <label className="flex items-center justify-between">
                            <div>
                                <span className="font-medium text-neutral-800">Active</span>
                                <p className="text-xs text-neutral-500">Show this attribute on products</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded accent-primary-500"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <div>
                                <span className="font-medium text-neutral-800">Show Price Difference</span>
                                <p className="text-xs text-neutral-500">Display +/- price on variant options</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.show_price_diff}
                                onChange={(e) => setFormData(prev => ({ ...prev, show_price_diff: e.target.checked }))}
                                className="w-5 h-5 rounded accent-primary-500"
                            />
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button fullWidth onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Attribute</>}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default AttributesPage;
