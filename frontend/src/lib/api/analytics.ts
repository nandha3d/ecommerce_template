/**
 * Analytics API Service
 * 
 * CRITICAL REQUIREMENTS:
 * 1. All functions must handle errors gracefully
 * 2. All responses must be typed
 * 3. All requests must include auth token from interceptor
 * 4. Use consistent error format
 */

import api from '../../services/api';
import type { DashboardStats, DashboardStatsParams, ApiResponse } from '../../types/analytics';

/**
 * Analytics Service - handles all analytics-related API calls
 */
export const analyticsService = {
    /**
      * Fetch dashboard statistics
      * 
      * @param params - Optional parameters for filtering
      * @returns Promise with dashboard statistics
      */
    getDashboardStats: async (params?: DashboardStatsParams): Promise<DashboardStats> => {
        const response = await api.get<ApiResponse<DashboardStats>>(
            '/admin/analytics/dashboard',
            { params }
        );
        return response.data.data;
    },

    /**
      * Fetch revenue chart data for a specific period
      * 
      * @param params - Time period parameters
      * @returns Promise with revenue chart data points
      */
    getRevenueChart: async (params?: DashboardStatsParams) => {
        const response = await api.get<ApiResponse<any>>(
            '/admin/analytics/revenue-chart',
            { params }
        );
        return response.data.data;
    },

    /**
      * Fetch top selling products
      * 
      * @param limit - Number of products to fetch (default: 10)
      * @param period - Time period filter
      * @returns Promise with top products
      */
    getTopProducts: async (limit: number = 10, period?: any) => {
        const response = await api.get<ApiResponse<any>>(
            '/admin/analytics/top-products',
            { params: { limit, period } }
        );
        return response.data.data;
    },

    /**
      * Fetch sales by category
      * 
      * @param period - Time period filter
      * @returns Promise with category sales data
      */
    getSalesByCategory: async (period?: any) => {
        const response = await api.get<ApiResponse<any>>(
            '/admin/analytics/sales-by-category',
            { params: { period } }
        );
        return response.data.data;
    },

    /**
      * Export dashboard data to CSV
      * 
      * @param params - Filter parameters
      * @returns Promise with blob data
      */
    exportDashboard: async (params?: DashboardStatsParams): Promise<Blob> => {
        const response = await api.get(
            '/admin/analytics/export',
            {
                params,
                responseType: 'blob'
            }
        );
        return response.data;
    },
};

export default analyticsService;
