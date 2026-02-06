import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CheckoutSession } from '../../types';
import { checkoutService } from '../../services/checkout.service';

interface CheckoutState {
    session: CheckoutSession | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CheckoutState = {
    session: null,
    isLoading: false,
    error: null,
};

export const initiateCheckout = createAsyncThunk(
    'checkout/initiate',
    async (_, { rejectWithValue }) => {
        try {
            return await checkoutService.startCheckout();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start checkout');
        }
    }
);

export const fetchCheckoutSummary = createAsyncThunk(
    'checkout/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            // Check if we have a summary available
            return await checkoutService.getCheckoutSummary();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load checkout summary');
        }
    }
);

// New slice strictly for checkout flow
const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        resetCheckout: (state) => {
            state.session = null;
            state.error = null;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Initiate
            .addCase(initiateCheckout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(initiateCheckout.fulfilled, (state, action) => {
                state.isLoading = false;
                state.session = action.payload;
            })
            .addCase(initiateCheckout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Summary
            .addCase(fetchCheckoutSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCheckoutSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.session = action.payload;
            })
            .addCase(fetchCheckoutSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
