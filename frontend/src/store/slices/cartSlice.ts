import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../../types';
import { cartService } from '../../services';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    isOpen: boolean;
}

const initialState: CartState = {
    cart: null,
    isLoading: false,
    error: null,
    isOpen: false,
};

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const cart = await cartService.getCart();
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity, variantId }: { productId: number; quantity?: number; variantId?: number }, { rejectWithValue }) => {
        try {
            const cart = await cartService.addItem(productId, quantity, variantId);
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add item');
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ itemId, quantity }: { itemId: number; quantity: number }, { rejectWithValue }) => {
        try {
            const cart = await cartService.updateItem(itemId, quantity);
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update item');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (itemId: number, { rejectWithValue }) => {
        try {
            const cart = await cartService.removeItem(itemId);
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
        }
    }
);

export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async (code: string, { rejectWithValue }) => {
        try {
            const cart = await cartService.applyCoupon(code);
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
        }
    }
);

export const removeCoupon = createAsyncThunk(
    'cart/removeCoupon',
    async (_, { rejectWithValue }) => {
        try {
            const cart = await cartService.removeCoupon();
            return cart;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen = action.payload;
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        clearCart: (state) => {
            state.cart = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cart = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cart = action.payload;
                state.isOpen = true;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Cart Item
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            // Remove from Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            // Apply Coupon
            .addCase(applyCoupon.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(applyCoupon.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Remove Coupon
            .addCase(removeCoupon.fulfilled, (state, action) => {
                state.cart = action.payload;
            });
    },
});

export const { setCartOpen, toggleCart, clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;
