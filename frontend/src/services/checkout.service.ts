import api from './api';
import { CheckoutSession, ApiResponse } from '../types';

export const checkoutService = {
    /**
     * Start a checkout session (Locks cart, creates session)
     */
    startCheckout: async (): Promise<CheckoutSession> => {
        const response = await api.post<ApiResponse<CheckoutSession>>('/checkout/start');
        return response.data.data;
    },

    /**
     * Get the current checkout session based on the stored session ID (handled by cookies/headers)
     */
    getCheckoutSummary: async (): Promise<CheckoutSession> => {
        const response = await api.get<ApiResponse<CheckoutSession>>('/checkout/summary');
        return response.data.data;
    },

    /**
     * Initiate payment for the current session
     */
    initiatePayment: async (sessionId: string, method: string, source?: string, extraData?: Record<string, string>): Promise<{ redirect_url?: string; order_id?: number; client_secret?: string; transaction_id?: string }> => {
        const payload: any = {
            checkout_id: sessionId,
            payment_method: method
        };
        if (source) payload.source = source;
        if (extraData) Object.assign(payload, extraData);

        const response = await api.post<ApiResponse<{ redirect_url?: string; order_id?: number; client_secret?: string; transaction_id?: string }>>('/payment/initiate', payload);
        return response.data.data;
    }
};
