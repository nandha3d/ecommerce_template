import api from './api';
import { ApiResponse, PaginatedResponse, Product, Category, Brand } from '../types';

export const adminService = {
    // Dashboard
    async getDashboardStats() {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    },

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await api.get<ApiResponse<Category[]>>('/admin/categories');
        return response.data.data;
    },

    async createCategory(data: any): Promise<Category> {
        const response = await api.post<ApiResponse<Category>>('/admin/categories', data);
        return response.data.data;
    },

    async updateCategory(id: number, data: any): Promise<Category> {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await api.post<ApiResponse<Category>>(`/admin/categories/${id}`, data);
            return response.data.data;
        }
        const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
        return response.data.data;
    },

    async deleteCategory(id: number): Promise<void> {
        await api.delete(`/admin/categories/${id}`);
    },

    // Products (Placeholder for now)
    async getProducts(): Promise<Product[]> {
        const response = await api.get<ApiResponse<Product[]>>('/admin/products');
        return response.data.data;
    },
};

export default adminService;
