import api from './api';
import {
    Product,
    Category,
    Brand,
    ProductFilters,
    ApiResponse,
    PaginatedResponse
} from '../types';

export const productService = {
    async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(`${key}[]`, v));
                    } else {
                        params.append(key, String(value));
                    }
                }
            });
        }
        const response = await api.get<PaginatedResponse<Product>>('/products', { params });
        return response.data;
    },

    async getProduct(slug: string): Promise<Product> {
        const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
        return response.data.data;
    },

    async getFeaturedProducts(): Promise<Product[]> {
        const response = await api.get<ApiResponse<Product[]>>('/products/featured');
        return response.data.data;
    },

    async getBestSellers(): Promise<Product[]> {
        const response = await api.get<ApiResponse<Product[]>>('/products/best-sellers');
        return response.data.data;
    },

    async getNewArrivals(): Promise<Product[]> {
        const response = await api.get<ApiResponse<Product[]>>('/products/new-arrivals');
        return response.data.data;
    },

    async getRelatedProducts(productId: number): Promise<Product[]> {
        const response = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related`);
        return response.data.data;
    },

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await api.get<ApiResponse<Category[]>>('/products/categories');
        return response.data.data;
    },

    async getCategory(slug: string): Promise<Category> {
        const response = await api.get<ApiResponse<Category>>(`/products/categories/${slug}`);
        return response.data.data;
    },

    // Brands
    async getBrands(): Promise<Brand[]> {
        const response = await api.get<ApiResponse<Brand[]>>('/products/brands');
        return response.data.data;
    },
};

export default productService;
