import api from './api';

export const shopService = {
    // Products
    getProducts: (params?: any) => api.get('/products', { params }),
    getProductBySlug: (slug: string) => api.get(`/products/${slug}`),

    // Categories
    getCategories: () => api.get('/categories'),

    // Search
    searchProducts: (query: string) => api.get('/search', { params: { q: query } }),
};
