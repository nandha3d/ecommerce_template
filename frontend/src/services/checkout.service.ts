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
    initiatePayment: async (sessionId: string, method: string): Promise<{ redirect_url: string; order_id?: number }> => {
        const response = await api.post<ApiResponse<{ redirect_url: string; order_id?: number }>>('/payment/initiate', {
            checkout_session_id: sessionId,
            payment_method: method
        });
        return response.data.data;
    }
};
