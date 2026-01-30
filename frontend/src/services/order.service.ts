import api from './api';
import { Order, Address, ApiResponse, PaginatedResponse } from '../types';

export interface CreateOrderData {
    billing_address_id?: number;
    shipping_address_id?: number;
    billing_address?: Omit<Address, 'id' | 'user_id'>;
    shipping_address?: Omit<Address, 'id' | 'user_id'>;
    payment_method: string;
    notes?: string;
    same_as_billing?: boolean;
}

export const orderService = {
    async getOrders(page: number = 1): Promise<PaginatedResponse<Order>> {
        const response = await api.get<PaginatedResponse<Order>>('/orders', {
            params: { page },
        });
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

    async createOrder(data: CreateOrderData): Promise<Order> {
        const response = await api.post<ApiResponse<Order>>('/orders', data);
        return response.data.data;
    },

    async cancelOrder(id: number): Promise<Order> {
        const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
        return response.data.data;
    },

    // Addresses
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
