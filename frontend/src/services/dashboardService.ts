import api from './api';

export const dashboardService = {
    getStats: async () => {
        const { data } = await api.get('/admin/analytics/dashboard');
        return data.data;
    },
};
