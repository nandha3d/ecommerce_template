import api from './api';

export const adminService = {
    // Dashboard
    getStats: () => api.get('/admin/analytics/dashboard'),

    // Products
    getProducts: (params?: any) => api.get('/admin/products', { params }),
    getProduct: (id: string | number) => api.get(`/admin/products/${id}`),
    createProduct: (data: any) => api.post('/admin/products', data),
    updateProduct: (id: string | number, data: any) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id: string | number) => api.delete(`/admin/products/${id}`),
    importProducts: (formData: FormData) => api.post('/admin/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    exportProducts: () => api.get('/admin/products/export', { responseType: 'blob' }),

    // Attributes
    getAttributes: () => api.get('/admin/attributes'),
    getAttributeTypes: () => api.get('/admin/attributes/types'),
    getVariantBuilderConfig: () => api.get('/configuration/variant-builder'),

    // Categories
    getCategories: () => api.get('/admin/categories'),

    // Brands
    getBrands: () => api.get('/admin/brands'),

    // Orders
    getOrders: (params?: any) => api.get('/admin/orders', { params }),
    getOrder: (id: string | number) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id: string | number, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
    cancelOrder: (id: string | number) => api.post(`/admin/orders/${id}/cancel`),

    // Customers
    getCustomers: (params?: any) => api.get('/admin/customers', { params }),
    getCustomer: (id: string | number) => api.get(`/admin/customers/${id}`),

    // Coupons
    getCoupons: (params?: any) => api.get('/admin/coupons', { params }),
    getCoupon: (id: string | number) => api.get(`/admin/coupons/${id}`),
    createCoupon: (data: any) => api.post('/admin/coupons', data),
    updateCoupon: (id: string | number, data: any) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id: string | number) => api.delete(`/admin/coupons/${id}`),

    // System Settings
    getSystemSettings: (group?: string) => api.get('/admin/settings/system', { params: { group } }),
    updateSystemSettings: (settings: any) => api.post('/admin/settings/system', { settings }),

    // Taxes
    getTaxRates: () => api.get('/admin/settings/taxes'),
    createTaxRate: (data: any) => api.post('/admin/settings/taxes', data),
    updateTaxRate: (id: number, data: any) => api.put(`/admin/settings/taxes/${id}`, data),
    deleteTaxRate: (id: number) => api.delete(`/admin/settings/taxes/${id}`),

    // Localization
    getCurrencies: () => api.get('/admin/settings/currencies'),
    getTimezones: () => api.get('/admin/settings/timezones'),

    // Refund Management
    getRefunds: (params?: any) => api.get('/admin/refunds', { params }),
    approveRefund: (id: number, notes?: string) => api.post(`/admin/refunds/${id}/approve`, { notes }),
    rejectRefund: (id: number, notes?: string) => api.post(`/admin/refunds/${id}/reject`, { notes }),

    // Review Management
    getReviews: (params?: any) => api.get('/admin/reviews', { params }),
    approveReview: (id: number) => api.post(`/admin/reviews/${id}/approve`),
    rejectReview: (id: number) => api.post(`/admin/reviews/${id}/reject`),
    deleteReview: (id: number) => api.delete(`/admin/reviews/${id}`),

    // Advanced Variant Operations
    persistMatrix: (productId: number, variants: any[]) => api.post(`/admin/products/${productId}/variants/persist-matrix`, { variants }),
    duplicateVariant: (id: number) => api.post(`/admin/variants/${id}/duplicate`),
    bulkUpdateStock: (items: { id: number, change: number, reason: string }[]) => api.post('/admin/variants/bulk-stock', { variants: items }),
    bulkUpdatePrice: (items: { id: number, price: number, sale_price?: number }[]) => api.post('/admin/variants/bulk-price', { variants: items }),
    bulkDeleteVariants: (ids: number[]) => api.post('/admin/variants/bulk-delete', { ids }),

    // User Management
    getUsers: (params?: any) => api.get('/admin/users', { params }),
    getUser: (id: string | number) => api.get(`/admin/users/${id}`),
    createUser: (data: any) => api.post('/admin/users', data),
    updateUser: (id: string | number, data: any) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string | number) => api.delete(`/admin/users/${id}`),
    toggleUserStatus: (id: string | number) => api.post(`/admin/users/${id}/toggle-status`),
    changeUserRole: (id: string | number, role: string) => api.post(`/admin/users/${id}/role`, { role }),
    resetUserPassword: (id: string | number, data: any) => api.post(`/admin/users/${id}/reset-password`, data),
    getUserActivity: (id: string | number, params?: any) => api.get(`/admin/users/${id}/activity`, { params }),

    // Location / Globalization
    getCountries: () => api.get('/settings/locations/countries'),
    getStates: (countryCode: string) => api.get(`/settings/locations/states/${countryCode}`),
};
