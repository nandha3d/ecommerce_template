import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Settings2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const AttributeList: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: adminService.getAttributes,
    });

    const attributes: any[] = data?.data?.data || [];

    // Avoid unused warning
    console.log(queryClient);

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Settings2 size={24} color="var(--primary)" />
                    <h1>Product Attributes</h1>
                </div>
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                    Add Attribute
                </Button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {isLoading ? (
                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: 'var(--space-md)' }}>Attribute Name</th>
                                <th>Slug</th>
                                <th>Type</th>
                                <th>Options</th>
                                <th>Status</th>
                                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attr: any) => (
                                <tr key={attr.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{attr.name}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{attr.slug}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--bg-main)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            {attr.type}
                                        </span>
                                    </td>
                                    <td>{attr.options_count} options</td>
                                    <td>
                                        {attr.is_active ?
                                            <CheckCircle2 size={18} color="var(--success)" /> :
                                            <XCircle size={18} color="var(--text-muted)" />
                                        }
                                    </td>
                                    <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-xs)' }}>
                                            <Button variant="ghost" size="sm" title="Edit"><Edit size={16} /></Button>
                                            <Button variant="ghost" size="sm" title="Delete" style={{ color: 'var(--error)' }}><Trash2 size={16} /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '500px', backgroundColor: 'var(--bg-surface)' }}>
                        <h3>Add New Attribute</h3>
                        <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)' }}>This would be a complex form to add attributes and their swatch options.</p>
                        <div className="flex-between" style={{ marginTop: 'var(--space-xl)' }}>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => setIsModalOpen(false)}>Create</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttributeList;
