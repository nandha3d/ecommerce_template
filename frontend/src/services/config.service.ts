import axios from 'axios';

// Define the shape of our configuration
export interface ConfigState {
    settings: Record<string, any>;
    loaded: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL && import.meta.env.PROD) {
    console.error('ConfigService: VITE_API_URL is missing. API calls will fail.');
}

const BASE_URL = API_URL || 'http://localhost:8000/api/v1';

export const configService = {
    async getPublicSettings(): Promise<Record<string, any>> {
        try {
            const response = await axios.get(`${API_URL}/config/public`);
            // Assuming response structure { success: true, data: { ... } }
            return response.data.data || {};
        } catch (error) {
            console.error('Failed to load public settings', error);
            return {};
        }
    },

    // Helper to get typed values from a settings object
    getInt(settings: Record<string, any>, key: string, defaultValue: number): number {
        const val = settings[key];
        return val !== undefined && val !== null ? parseInt(val, 10) : defaultValue;
    },

    getFloat(settings: Record<string, any>, key: string, defaultValue: number): number {
        const val = settings[key];
        return val !== undefined && val !== null ? parseFloat(val) : defaultValue;
    },

    getBool(settings: Record<string, any>, key: string, defaultValue: boolean): boolean {
        const val = settings[key];
        if (val === '1' || val === 1 || val === true || val === 'true') return true;
        if (val === '0' || val === 0 || val === false || val === 'false') return false;
        return defaultValue;
    },

    getArray(settings: Record<string, any>, key: string, defaultValue: any[]): any[] {
        const val = settings[key];
        return Array.isArray(val) ? val : defaultValue;
    }
};
