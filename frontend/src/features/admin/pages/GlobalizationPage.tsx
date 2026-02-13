import React from 'react';
import { Globe } from 'lucide-react';

const GlobalizationPage: React.FC = () => {
    return (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="flex-center" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-xl)', borderRadius: '50%', backgroundColor: 'var(--bg-surface)' }}>
                    <Globe size={64} strokeWidth={1} />
                </div>
            </div>
            <h1>Globalization</h1>
            <p>Manage languages, currencies, and regions.</p>
        </div>
    );
};

export default GlobalizationPage;
