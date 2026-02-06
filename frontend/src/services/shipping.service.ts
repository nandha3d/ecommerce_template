import api from './api';

export interface ShippingConfig {
    email: string;
    password: string;
    pickup_location?: string;
    channel_id?: string;
}

class ShippingService {
    /**
     * Update Shipping Configuration
     */
    async updateConfig(config: ShippingConfig) {
        const response = await api.post('/modules/shipping/shiprocket/config', config);
        return response.data;
    }

    /**
     * Test Connection
     */
    async testConnection() {
        const response = await api.get('/modules/shipping/shiprocket/test');
        return response.data;
    }

    /**
     * Create Shiprocket Order
     */
    async createOrder(orderData: any) {
        const response = await api.post('/modules/shipping/shiprocket/orders', orderData);
        return response.data;
    }
}

export const shippingService = new ShippingService();
