import React from 'react';
import { Box } from 'lucide-react';

const ModulesPage: React.FC = () => {
    return (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="flex-center" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-xl)', borderRadius: '50%', backgroundColor: 'var(--bg-surface)' }}>
                    <Box size={64} strokeWidth={1} />
                </div>
            </div>
            <h1>Modules</h1>
            <p>Manage application modules and plugins.</p>
        </div>
    );
};

export default ModulesPage;
