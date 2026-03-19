import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './token';
import { RefreshTokenResponse } from '@/types/api';

// Base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_VERSION = '/api/v1/';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}${API_VERSION}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

async function handleTokenRefresh(error: AxiosError, originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
        tokenManager.clearTokens();
        if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
        }
        throw error;
    }

    try {
        const response = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}${API_VERSION}auth/token/refresh/`,
            { refresh: refreshToken }
        );

        const { access, refresh } = response.data;
        
        if (refresh) {
            tokenManager.setTokens(access, refresh);
        } else {
            tokenManager.setAccessToken(access);
        }

        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue(null, access);
        isRefreshing = false;

        return apiClient(originalRequest);
    } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        tokenManager.clearTokens();

        if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
        }

        isRefreshing = false;
        throw refreshError;
    }
}

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }).catch((err) => {
                    throw err;
                });
            }

            return handleTokenRefresh(error, originalRequest);
        }

        throw error;
    }
);

export default apiClient;
