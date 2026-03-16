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
     * Register a new user with username and passwords
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        console.log("[AuthApi] Registering user:", data.username);
        const response = await apiClient.post<AuthResponse>('/auth/registration/', data);
        console.log("[AuthApi] Registration Response:", response.data);

        // Store tokens after successful registration
        if (response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] Tokens stored successfully.");
        } else {
            console.warn("[AuthApi] Access token missing in registration response!", response.data);
        }

        return response.data;
    },

    /**
     * Login with username/email and password
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        console.log("[AuthApi] Logging in user:", data.username);
        const response = await apiClient.post<AuthResponse>('/auth/login/', data);
        console.log("[AuthApi] Login Response:", response.data);

        // Store tokens after successful login
        if (response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] Tokens stored successfully.");
        } else {
            console.warn("[AuthApi] Access token missing in login response!", response.data);
        }

        return response.data;
    },

    /**
     * Login or register using Google OAuth
     * @param accessToken - Google access token from Google Sign-In
     */
    async googleAuth(accessToken: string): Promise<AuthResponse> {
        console.log("[AuthApi] Authenticating with Google...");
        const response = await apiClient.post<AuthResponse>('/auth/google/', {
            access_token: accessToken,
        } as GoogleAuthRequest);
        console.log("[AuthApi] Google Auth Response:", response.data);

        // Store tokens after successful Google auth
        if (response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] Tokens stored successfully.");
        } else {
            console.warn("[AuthApi] Access token missing in Google auth response!", response.data);
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
     * Logout user (client and server side)
     */
    async logout(): Promise<void> {
        const refreshToken = tokenManager.getRefreshToken();
        
        if (refreshToken) {
            try {
                await apiClient.post('/auth/logout/', { refresh: refreshToken });
                console.log("[AuthApi] Backend logout successful.");
            } catch (error) {
                console.error("[AuthApi] Backend logout failed:", error);
            }
        }

        tokenManager.clearTokens();

        // Redirect to login page
        if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
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
        console.log("[AuthApi] Calling /auth/user/...");
        try {
            const response = await apiClient.get<User>('/auth/user/');
            console.log("[AuthApi] /auth/user/ Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("[AuthApi] /auth/user/ Error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            // If it's a 401, let the axios interceptor handle it or rethrow
            // For other errors, return null so we can handle it gracefully
            return null;
        }
    },
};
