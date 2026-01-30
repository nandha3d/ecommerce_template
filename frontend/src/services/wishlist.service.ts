import api from './api';
import { WishlistItem, Product, ApiResponse } from '../types';

export const wishlistService = {
    async getWishlist(): Promise<WishlistItem[]> {
        const response = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
        return response.data.data;
    },

    async addToWishlist(productId: number): Promise<WishlistItem> {
        const response = await api.post<ApiResponse<WishlistItem>>('/wishlist', {
            product_id: productId,
        });
        return response.data.data;
    },

    async removeFromWishlist(productId: number): Promise<void> {
        await api.delete(`/wishlist/${productId}`);
    },

    async isInWishlist(productId: number): Promise<boolean> {
        try {
            const response = await api.get<ApiResponse<{ in_wishlist: boolean }>>(
                `/wishlist/check/${productId}`
            );
            return response.data.data.in_wishlist;
        } catch {
            return false;
        }
    },

    async moveToCart(productId: number): Promise<void> {
        await api.post(`/wishlist/${productId}/move-to-cart`);
    },
};

export default wishlistService;
