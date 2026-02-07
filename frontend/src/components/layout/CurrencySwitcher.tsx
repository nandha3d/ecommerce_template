import React, { useState, useRef, useEffect } from 'react';
import { useGlobalization } from '../../context/GlobalizationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { getFlagUrl } from '../../utils/currency';

export const CurrencySwitcher: React.FC = () => {
    const { currency, switchCurrency, isLoading } = useGlobalization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading || currency.available.length <= 1) return null;

    const activeFlagUrl = getFlagUrl(currency.active_code);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
                    border border-white/20 hover:border-white/40
                    ${isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/90 hover:text-white'}
                `}
            >
                <div className="flex items-center gap-2">
                    <img
                        src={activeFlagUrl}
                        alt={currency.active_code}
                        className="w-5 h-3.5 object-cover rounded shadow-sm"
                    />
                    <span className="font-bold tracking-wide text-sm">{currency.active_code}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden origin-top-left"
                    >
                        <div className="p-2 space-y-0.5">
                            {currency.available.map((c) => {
                                const isActive = c.code === currency.active_code;
                                const flagUrl = getFlagUrl(c.code);

                                return (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            switchCurrency(c.code);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-3 text-sm rounded-lg transition-colors group
                                            ${isActive
                                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center">
                                                <img
                                                    src={flagUrl}
                                                    alt={c.code}
                                                    className="w-6 h-4 object-cover rounded shadow-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col items-start leading-none gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{c.code}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                                        {c.symbol}
                                                    </span>
                                                </div>
                                                <span className={`text-[11px] truncate max-w-[120px] ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'}`}>
                                                    {c.name}
                                                </span>
                                            </div>
                                        </div>
                                        {isActive && <Check className="w-5 h-5 text-primary-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
