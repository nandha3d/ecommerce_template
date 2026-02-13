import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../../store';
import { toggleCart, removeFromCart, updateQuantity } from '../../../store/cartSlice';
import {
    X,
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalization } from '../../../context/GlobalizationContext';

const CartDrawer: React.FC = () => {
    const { items, isOpen } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { formatPrice } = useGlobalization();

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)'
        }} onClick={() => dispatch(toggleCart())}>
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '100%',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-2xl)',
                    animation: 'slideIn 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-between" style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex-center" style={{ gap: 'var(--space-sm)' }}>
                        <ShoppingCart size={24} />
                        <h2 style={{ fontSize: '1.25rem' }}>Your Cart ({items.length})</h2>
                    </div>
                    <button onClick={() => dispatch(toggleCart())} className="btn-ghost">
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }}>
                    {items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            {items.map((item: any) => (
                                <div key={`${item.id}-${item.variant_id}`} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                                        <div className="flex-between">
                                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                                            <button
                                                onClick={() => dispatch(removeFromCart({ id: item.id, variant_id: item.variant_id }))}
                                                className="btn-ghost"
                                                style={{ color: 'var(--error)', padding: 0 }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {item.attributes && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {Object.values(item.attributes).join(' / ')}
                                            </span>
                                        )}
                                        <div className="flex-between" style={{ marginTop: 'var(--space-xs)' }}>
                                            <div className="flex-center" style={{ gap: 'var(--space-sm)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, quantity: Math.max(1, item.quantity - 1) }))}
                                                    className="btn-ghost"
                                                    style={{ padding: 0 }}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '15px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, quantity: item.quantity + 1 }))}
                                                    className="btn-ghost"
                                                    style={{ padding: 0 }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span style={{ fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: 'var(--space-md)', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={64} strokeWidth={1} />
                            <p>Your cart is empty.</p>
                            <button onClick={() => { dispatch(toggleCart()); navigate('/products'); }} className="btn btn-primary">Start Shopping</button>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border)', gap: 'var(--space-md)', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-between" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Taxes and shipping calculated at checkout.</p>
                        <button className="btn btn-primary" style={{ height: '54px', width: '100%', fontSize: '1.1rem' }}>
                            Checkout
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
};

export default CartDrawer;
