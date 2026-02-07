import { loadStripe, Stripe, StripeElements, PaymentIntent } from '@stripe/stripe-js';
import api from './api';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

export interface PaymentIntentData {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
}

export interface PaymentMethod {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    };
    billing_details?: {
        name: string;
        email: string;
        address?: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };
}

export const paymentService = {
    // Create payment intent for order
    async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
        const response = await api.post('/payments/create-intent', data);
        return response.data.data;
    },

    // Confirm payment intent
    async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
        const response = await api.post(`/payments/confirm/${paymentIntentId}`);
        return response.data.data;
    },

    // Get saved payment methods
    async getPaymentMethods(): Promise<PaymentMethod[]> {
        const response = await api.get('/payments/methods');
        return response.data.data;
    },

    // Save payment method
    async savePaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
        const response = await api.post('/payments/methods', { payment_method_id: paymentMethodId });
        return response.data.data;
    },

    // Delete payment method
    async deletePaymentMethod(paymentMethodId: string): Promise<void> {
        await api.delete(`/payments/methods/${paymentMethodId}`);
    },

    // Process refund
    async processRefund(orderId: number, amount?: number, reason?: string): Promise<any> {
        const response = await api.post(`/orders/${orderId}/refund`, { amount, reason });
        return response.data.data;
    }
};

export default paymentService;
