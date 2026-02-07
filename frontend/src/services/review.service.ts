import api from './api';
import { Review, ApiResponse, PaginatedResponse } from '../types';

export const reviewService = {
    async getProductReviews(productId: number, page: number = 1): Promise<PaginatedResponse<Review>> {
        const response = await api.get<PaginatedResponse<Review>>(
            `/products/${productId}/reviews`,
            { params: { page } }
        );
        return response.data;
    },

    async createReview(productId: number, data: {
        rating: number;
        title?: string;
        comment: string
    }): Promise<Review> {
        const response = await api.post<ApiResponse<Review>>(
            `/products/${productId}/reviews`,
            data
        );
        return response.data.data;
    },

    async updateReview(reviewId: number, data: {
        rating?: number;
        title?: string;
        comment?: string
    }): Promise<Review> {
        const response = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}`, data);
        return response.data.data;
    },

    async deleteReview(reviewId: number): Promise<void> {
        await api.delete(`/reviews/${reviewId}`);
    },
};

export default reviewService;
