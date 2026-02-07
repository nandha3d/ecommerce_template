import React from 'react';
import { Check } from 'lucide-react';

interface SwatchOption {
    value: string;
    label?: string;
    color_code?: string;
    image?: string;
}

interface VariantSwatchSelectorProps {
    label: string;
    type: 'text' | 'color' | 'image' | 'select' | 'button' | 'radio';
    options: SwatchOption[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const VariantSwatchSelector: React.FC<VariantSwatchSelectorProps> = ({
    label,
    type,
    options,
    selectedValue,
    onSelect,
    disabled = false,
}) => {
    if (!options || options.length === 0) return null;

    const renderTextSwatches = () => (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => !disabled && onSelect(option.value)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${isSelected
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-neutral-200 hover:border-primary-300 text-neutral-700'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {option.label || option.value}
                    </button>
                );
            })}
        </div>
    );

    const renderColorSwatches = () => (
        <div className="flex flex-wrap gap-3">
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => !disabled && onSelect(option.value)}
                        disabled={disabled}
                        className={`relative group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={option.label || option.value}
                    >
                        <div
                            className={`w-10 h-10 rounded-full border-2 transition-all ${isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2'
                                    : 'border-neutral-200 hover:border-neutral-400'
                                }`}
                            style={{ backgroundColor: option.color_code || '#cccccc' }}
                        />
                        {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check
                                    className={`w-5 h-5 ${isLightColor(option.color_code) ? 'text-neutral-900' : 'text-white'
                                        }`}
                                    strokeWidth={3}
                                />
                            </div>
                        )}
                        {/* Tooltip */}
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-neutral-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {option.label || option.value}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    const renderImageSwatches = () => (
        <div className="flex flex-wrap gap-3">
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => !disabled && onSelect(option.value)}
                        disabled={disabled}
                        className={`relative group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={option.label || option.value}
                    >
                        <div
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2'
                                    : 'border-neutral-200 hover:border-neutral-400'
                                }`}
                        >
                            {option.image ? (
                                <img
                                    src={option.image}
                                    alt={option.label || option.value}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
                                    No img
                                </div>
                            )}
                        </div>
                        {isSelected && (
                            <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                        {/* Tooltip */}
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-neutral-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {option.label || option.value}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    const renderContent = () => {
        switch (type) {
            case 'color':
                return renderColorSwatches();
            case 'image':
                return renderImageSwatches();
            case 'text':
            case 'button':
            case 'select':
            case 'radio':
            default:
                return renderTextSwatches();
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">
                {label}
                {selectedValue && (
                    <span className="ml-2 font-normal text-neutral-500">
                        — {options.find(o => o.value === selectedValue)?.label || selectedValue}
                    </span>
                )}
            </label>
            {renderContent()}
        </div>
    );
};

// Helper function to determine if a color is light
function isLightColor(hexColor?: string): boolean {
    if (!hexColor) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

export default VariantSwatchSelector;
