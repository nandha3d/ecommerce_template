import React from 'react';
import type { AttributeConfig } from './types';

interface AttributeSelectorProps {
    attribute: AttributeConfig;
    value: string;
    onChange: (value: string) => void;
}

import { Select } from '../../../../components/ui/Select';

const AttributeSelector: React.FC<AttributeSelectorProps> = ({ attribute, value, onChange }) => {
    const options = (attribute.options || []).map(opt => ({
        value: opt.value,
        label: opt.value
    }));

    return (
        <div className="attribute-field">
            {attribute.options && attribute.options.length > 0 ? (
                <Select
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={attribute.name}
                    className="vb-select-custom"
                    clearable={true}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={attribute.name}
                    className="input vb-input-compact"
                />
            )}
        </div>
    );
};

export default AttributeSelector;
