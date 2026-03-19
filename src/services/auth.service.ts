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
        const response = await apiClient.post<AuthResponse>('auth/registration/', data);
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
        const response = await apiClient.post<AuthResponse>('auth/login/', data);
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
        const response = await apiClient.post<AuthResponse>('auth/google/', {
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
        const response = await apiClient.post<RefreshTokenResponse>('auth/token/refresh/', {
            refresh: refreshToken,
        });

        // Update tokens (handle optional refresh rotation)
        const { access, refresh } = response.data;
        if (refresh) {
            tokenManager.setTokens(access, refresh);
        } else if (access) {
            tokenManager.setAccessToken(access);
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
                await apiClient.post('auth/logout/', { refresh: refreshToken });
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
        console.log("[AuthApi] Calling auth/user/...");
        try {
            const response = await apiClient.get<User>('auth/user/');
            console.log("[AuthApi] auth/user/ Response:", response.data);
            return response.data;
        } catch (error: any) {
            // Silently handle 401s during background fetch as the interceptor or AuthContext will manage it
            if (error.response?.status === 401) {
                console.log("[AuthApi] auth/user/ session expired or invalid (401). State will be updated.");
            } else {
                const errorReport = {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message || "Unknown transport error",
                    endpoint: error.config?.url
                };
                console.error("[AuthApi] auth/user/ fetch error:", errorReport);
            }
            return null;
        }
    },

    /**
     * Update current user profile (Partial)
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        console.log("[AuthApi] Updating user profile...");
        const response = await apiClient.patch<User>('auth/user/', data);
        return response.data;
    },
};
