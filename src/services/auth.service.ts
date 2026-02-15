import apiClient from '@/lib/axios';
import { tokenManager } from '@/lib/token';
import {
    User,
    AuthResponse,
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenResponse,
} from '@/types/api';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
    /**
     * Register a new user with email and password
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/registration/', data);

        // Store tokens after successful registration
        if (response.data.access && response.data.refresh) {
            tokenManager.setTokens(response.data.access, response.data.refresh);
        }

        return response.data;
    },

    /**
     * Login with email and password
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login/', data);

        // Store tokens after successful login
        if (response.data.access && response.data.refresh) {
            tokenManager.setTokens(response.data.access, response.data.refresh);
        }

        return response.data;
    },

    /**
     * Login or register using Google OAuth
     * @param accessToken - Google access token from Google Sign-In
     */
    async googleAuth(accessToken: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/google/', {
            access_token: accessToken,
        } as GoogleAuthRequest);

        // Store tokens after successful Google auth
        if (response.data.access && response.data.refresh) {
            tokenManager.setTokens(response.data.access, response.data.refresh);
        }

        return response.data;
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        const response = await apiClient.post<RefreshTokenResponse>('/auth/token/refresh/', {
            refresh: refreshToken,
        });

        // Update access token
        if (response.data.access) {
            tokenManager.setAccessToken(response.data.access);
        }

        return response.data;
    },

    /**
     * Logout user (client-side only)
     * Note: Add backend logout endpoint if you implement token blacklisting
     */
    logout(): void {
        tokenManager.clearTokens();

        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return tokenManager.isAuthenticated();
    },

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return tokenManager.getAccessToken();
    },

    /**
     * Get current user profile from backend
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiClient.get<User>('/auth/user/');
            return response.data;
        } catch (error) {
            // If it's a 401, let the axios interceptor handle it or rethrow
            // For other errors, return null so we can handle it gracefully
            return null;
        }
    },
};
