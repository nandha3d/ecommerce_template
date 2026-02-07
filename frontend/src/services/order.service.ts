import api from './api';
import { Order, Address, ApiResponse, PaginatedResponse } from '../types';

export interface CreateOrderData {
    billing_address_id?: number;
    shipping_address_id?: number;
    billing_address?: Omit<Address, 'id' | 'user_id'>;
    shipping_address?: Omit<Address, 'id' | 'user_id'>;
    payment_method: string;
    payment_intent_id?: string;
    notes?: string;
    same_as_billing?: boolean;
    reserve_inventory?: boolean; // New: inventory reservation
}

export interface OrderValidationResponse {
    valid: boolean; // mapped from validation_status === 'valid'
    validation_status?: 'valid' | 'invalid';
    checkout_id?: number;
    recalculated_totals?: {
        subtotal: number;
        tax: number;
        shipping: number;
        discount: number;
        total: number;
    };
    locked_currency?: {
        code: string;
        symbol: string;
        precision: number;
    };
    expires_at?: string;
    errors?: {
        items?: Array<{
            product_id: number;
            variant_id?: number;
            requested: number;
            available: number;
            message: string;
        }>;
        shipping?: string;
        payment?: string;
        general?: string;
    };
    warnings?: string[];
}

export const orderService = {
    // Validate order before creation
    async validateOrder(cartId?: number): Promise<OrderValidationResponse> {
        const response = await api.post('/orders/validate', { cart_id: cartId });
        return response.data.data;
    },

    // Create order with enhanced options
    async createOrder(data: CreateOrderData): Promise<Order> {
        try {
            const response = await api.post<ApiResponse<Order>>('/orders', {
                ...data,
                reserve_inventory: true, // Always reserve inventory by default
            });
            return response.data.data;
        } catch (error: any) {
            // Handle specific order creation errors
            if (error.response?.status === 422) {
                const validationError = error.response.data;
                if (validationError.errors?.inventory) {
                    throw new Error('Some items in your cart are no longer available. Please review your cart before placing the order.');
                }
                if (validationError.errors?.payment) {
                    throw new Error('Payment processing failed. Please try a different payment method.');
                }
            }
            throw error;
        }
    },

    // Get orders with enhanced filtering
    async getOrders(page: number = 1, status?: string): Promise<PaginatedResponse<Order>> {
        const params: any = { page };
        if (status) params.status = status;

        const response = await api.get<PaginatedResponse<Order>>('/orders', { params });
        return response.data;
    },

    async getOrder(id: number): Promise<Order> {
        const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
        return response.data.data;
    },

    async getOrderByNumber(orderNumber: string): Promise<Order> {
        const response = await api.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`);
        return response.data.data;
    },

    // Enhanced order cancellation with reason
    async cancelOrder(id: number, reason?: string): Promise<Order> {
        const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
        return response.data.data;
    },

    // Request return/exchange
    async requestReturn(orderId: number, items: Array<{
        order_item_id: number;
        quantity: number;
        reason: string;
        type: 'return' | 'exchange';
    }>): Promise<any> {
        const response = await api.post(`/orders/${orderId}/return`, { items });
        return response.data.data;
    },

    // Track order
    async trackOrder(orderNumber: string): Promise<{
        status: string;
        estimated_delivery?: string;
        tracking_events: Array<{
            date: string;
            status: string;
            location?: string;
            description: string;
        }>;
    }> {
        const response = await api.get(`/orders/track/${orderNumber}`);
        return response.data.data;
    },

    // Reorder items from previous order
    async reorderItems(orderId: number): Promise<any> {
        const response = await api.post(`/orders/${orderId}/reorder`);
        return response.data.data;
    },

    // Addresses (enhanced)
    async getAddresses(): Promise<Address[]> {
        const response = await api.get<ApiResponse<Address[]>>('/addresses');
        return response.data.data;
    },

    async createAddress(data: Omit<Address, 'id' | 'user_id'>): Promise<Address> {
        const response = await api.post<ApiResponse<Address>>('/addresses', data);
        return response.data.data;
    },

    async updateAddress(id: number, data: Partial<Address>): Promise<Address> {
        const response = await api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
        return response.data.data;
    },

    async deleteAddress(id: number): Promise<void> {
        await api.delete(`/addresses/${id}`);
    },

    async setDefaultAddress(id: number, type: 'billing' | 'shipping'): Promise<void> {
        await api.post(`/addresses/${id}/set-default`, { type });
    },
};

export default orderService;
