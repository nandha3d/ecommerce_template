import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
    clearable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    label,
    className = '',
    style,
    clearable = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`custom-select-container ${className}`} ref={containerRef} style={style}>
            {label && <label className="label">{label}</label>}
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
            >
                <span onClick={() => setIsOpen(!isOpen)} style={{ flex: 1 }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {clearable && value && (
                        <X
                            size={14}
                            className="select-clear-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setIsOpen(false);
                            }}
                            style={{ cursor: 'pointer', opacity: 0.6 }}
                        />
                    )}
                    <ChevronDown
                        size={18}
                        className={`chevron ${isOpen ? 'rotated' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="custom-select-options">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="custom-select-option-empty">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};
