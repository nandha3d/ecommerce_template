import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import { ApiError, AuthTokens } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standardized application error
 */
export interface StandardError {
    code: string;
    message: string;
    status: number;
    details?: Record<string, string[]>;
    retryable: boolean;
}

/**
 * Transform API errors into standardized format
 */
export const standardizeError = (error: AxiosError<ApiError>): StandardError => {
    if (!error.response) {
        // Network error or timeout
        return {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network connection failed. Please check your internet.',
            status: 0,
            retryable: true,
        };
    }

    const { status, data } = error.response;

    // Map common HTTP status codes
    const errorMap: Record<number, { code: string; message: string; retryable: boolean }> = {
        400: { code: 'BAD_REQUEST', message: 'Invalid request data', retryable: false },
        401: { code: 'UNAUTHORIZED', message: 'Please login to continue', retryable: false },
        403: { code: 'FORBIDDEN', message: 'You do not have permission', retryable: false },
        404: { code: 'NOT_FOUND', message: 'Resource not found', retryable: false },
        422: { code: 'VALIDATION_ERROR', message: 'Please check your input', retryable: false },
        429: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait.', retryable: true },
        500: { code: 'SERVER_ERROR', message: 'Server error. Please try again later.', retryable: true },
        502: { code: 'BAD_GATEWAY', message: 'Service temporarily unavailable', retryable: true },
        503: { code: 'SERVICE_UNAVAILABLE', message: 'Service is down for maintenance', retryable: true },
    };

    const defaultError = errorMap[status] || {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        retryable: false,
    };

    return {
        code: defaultError.code,
        message: data?.message || defaultError.message,
        status,
        details: data?.errors,
        retryable: defaultError.retryable,
    };
};

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Configure axios-retry with exponential backoff
axiosRetry(api, {
    retries: 3,
    retryDelay: (retryCount) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.pow(2, retryCount - 1) * 1000;
    },
    retryCondition: (error) => {
        // Retry on network errors and 5xx responses (except 501)
        if (isNetworkOrIdempotentRequestError(error)) {
            return true;
        }
        const status = error.response?.status;
        return status !== undefined && status >= 500 && status !== 501;
    },
    onRetry: (retryCount, error, requestConfig) => {
        console.warn(`Retry attempt ${retryCount} for ${requestConfig.url}`, error.message);
    },
});

// Token management
let accessToken: string | null = localStorage.getItem('access_token');
let refreshToken: string | null = localStorage.getItem('refresh_token');
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export const setTokens = (tokens: AuthTokens) => {
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
};

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => accessToken;

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const newTokens: AuthTokens = response.data.data;
                setTokens(newTokens);
                onTokenRefreshed(newTokens.access_token);

                originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearTokens();
                // Redirect to login if refresh fails
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login?session_expired=true';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Standardize and reject the error
        const standardError = standardizeError(error);
        return Promise.reject({ ...error, standardError });
    }
);

export default api;
