import api from './api';
import { Cart, CartItem, Coupon, ApiResponse } from '../types';

export const cartService = {
    async getCart(): Promise<Cart> {
        const response = await api.get<ApiResponse<Cart>>('/cart');
        return response.data.data;
    },

    async addItem(productId: number, quantity: number = 1, variantId?: number): Promise<Cart> {
        const response = await api.post<ApiResponse<Cart>>('/cart/items', {
            product_id: productId,
            variant_id: variantId,
            quantity,
        });
        return response.data.data;
    },

    async updateItem(itemId: number, quantity: number): Promise<Cart> {
        const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
            quantity,
        });
        return response.data.data;
    },

    async removeItem(itemId: number): Promise<Cart> {
        const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
        return response.data.data;
    },

    async clearCart(): Promise<void> {
        await api.delete('/cart');
    },

    async applyCoupon(code: string): Promise<Cart> {
        const response = await api.post<ApiResponse<Cart>>('/cart/coupon', { code });
        return response.data.data;
    },

    async removeCoupon(): Promise<Cart> {
        const response = await api.delete<ApiResponse<Cart>>('/cart/coupon');
        return response.data.data;
    },

    async mergeGuestCart(guestCartId: string): Promise<Cart> {
        const response = await api.post<ApiResponse<Cart>>('/cart/merge', {
            guest_cart_id: guestCartId,
        });
        return response.data.data;
    },

    // Guest cart (stored in localStorage)
    getGuestCart(): Cart | null {
        const cart = localStorage.getItem('guest_cart');
        return cart ? JSON.parse(cart) : null;
    },

    saveGuestCart(cart: Cart): void {
        localStorage.setItem('guest_cart', JSON.stringify(cart));
    },

    clearGuestCart(): void {
        localStorage.removeItem('guest_cart');
    },
};

export default cartService;
