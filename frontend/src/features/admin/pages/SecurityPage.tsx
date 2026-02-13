import React from 'react';
import { ShieldCheck } from 'lucide-react';

const SecurityPage: React.FC = () => {
    return (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="flex-center" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-xl)', borderRadius: '50%', backgroundColor: 'var(--bg-surface)' }}>
                    <ShieldCheck size={64} strokeWidth={1} />
                </div>
            </div>
            <h1>Security</h1>
            <p>Security settings, roles, and permissions.</p>
        </div>
    );
};

export default SecurityPage;
