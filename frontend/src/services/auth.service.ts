import api, { setTokens, clearTokens } from './api';
import {
    User,
    AuthTokens,
    LoginCredentials,
    RegisterData,
    ApiResponse
} from '../types';

export const authService = {
    async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
        const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
            '/auth/login',
            credentials
        );
        const { user, tokens } = response.data.data;
        setTokens(tokens);
        return { user, tokens };
    },

    async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
        const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
            '/auth/register',
            data
        );
        const { user, tokens } = response.data.data;
        setTokens(tokens);
        return { user, tokens };
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            clearTokens();
        }
    },

    async getMe(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email });
    },

    async resetPassword(data: {
        email: string;
        token: string;
        password: string;
        password_confirmation: string
    }): Promise<void> {
        await api.post('/auth/reset-password', data);
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.put<ApiResponse<User>>('/auth/profile', data);
        return response.data.data;
    },

    async changePassword(data: {
        current_password: string;
        password: string;
        password_confirmation: string
    }): Promise<void> {
        await api.put('/auth/password', data);
    },
};

export default authService;
