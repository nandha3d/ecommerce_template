import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { setCartOpen, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { Button, Loader } from '../ui';

const CartDrawer: React.FC = () => {
    const dispatch = useAppDispatch();
    const { cart, isOpen, isLoading } = useAppSelector((state) => state.cart);

    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            dispatch(removeFromCart(itemId));
        } else {
            dispatch(updateCartItem({ itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId: number) => {
        dispatch(removeFromCart(itemId));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={() => dispatch(setCartOpen(false))}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold">Shopping Cart</h2>
                        {cart?.items && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm font-medium rounded">
                                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => dispatch(setCartOpen(false))}
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader text="Loading cart..." />
                        </div>
                    ) : !cart?.items?.length ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Looks like you haven't added any items yet.
                            </p>
                            <Button onClick={() => dispatch(setCartOpen(false))}>
                                <Link to="/products">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-3 bg-neutral-50 rounded-xl"
                                >
                                    {/* Product Image */}
                                    <Link
                                        to={`/products/${item.product.slug}`}
                                        onClick={() => dispatch(setCartOpen(false))}
                                        className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0"
                                    >
                                        <img
                                            src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/products/${item.product.slug}`}
                                            onClick={() => dispatch(setCartOpen(false))}
                                            className="font-medium text-neutral-900 hover:text-primary-500 line-clamp-2"
                                        >
                                            {item.product.name}
                                        </Link>
                                        {item.variant && (
                                            <p className="text-sm text-neutral-500 mt-1">
                                                {Object.values(item.variant.attributes).join(' / ')}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center hover:border-primary-500 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 bg-white border border-neutral-200 rounded flex items-center justify-center hover:border-primary-500 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="font-bold text-primary-900">
                                                ${item.total_price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-1 text-neutral-400 hover:text-danger self-start transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart?.items && cart.items.length > 0 && (
                    <div className="p-4 border-t border-neutral-100 space-y-4">
                        {/* Subtotals */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-neutral-600">
                                <span>Subtotal</span>
                                <span>${cart.subtotal.toFixed(2)}</span>
                            </div>
                            {cart.discount > 0 && (
                                <div className="flex justify-between text-success">
                                    <span>Discount</span>
                                    <span>-${cart.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-neutral-600">
                                <span>Shipping</span>
                                <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-primary-900 pt-2 border-t border-neutral-100">
                                <span>Total</span>
                                <span>${cart.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                to="/cart"
                                onClick={() => dispatch(setCartOpen(false))}
                                className="btn-outline text-center"
                            >
                                View Cart
                            </Link>
                            <Link
                                to="/checkout"
                                onClick={() => dispatch(setCartOpen(false))}
                                className="btn-primary text-center"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
