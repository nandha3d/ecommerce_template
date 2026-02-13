import React from 'react';
import { DollarSign } from 'lucide-react';

const PricingPage: React.FC = () => {
    return (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="flex-center" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-xl)', borderRadius: '50%', backgroundColor: 'var(--bg-surface)' }}>
                    <DollarSign size={64} strokeWidth={1} />
                </div>
            </div>
            <h1>Pricing Rules</h1>
            <p>Advanced pricing rules and discounts.</p>
        </div>
    );
};

export default PricingPage;
