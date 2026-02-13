import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string | number;
    variant_id?: string | number;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    attributes?: Record<string, string>;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(item =>
                item.id === action.payload.id && item.variant_id === action.payload.variant_id
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            state.isOpen = true;
        },
        removeFromCart: (state, action: PayloadAction<{ id: string | number, variant_id?: string | number }>) => {
            state.items = state.items.filter(item =>
                !(item.id === action.payload.id && item.variant_id === action.payload.variant_id)
            );
        },
        updateQuantity: (state, action: PayloadAction<{ id: string | number, variant_id?: string | number, quantity: number }>) => {
            const item = state.items.find(item =>
                item.id === action.payload.id && item.variant_id === action.payload.variant_id
            );
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        clearCart: (state) => {
            state.items = [];
        }
    },
});

export const { addToCart, removeFromCart, updateQuantity, toggleCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
