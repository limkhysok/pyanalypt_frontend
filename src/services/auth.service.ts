import apiClient from '@/lib/axios';
import { tokenManager } from '@/lib/token';
import {
    User,
    Session,
    AuthResponse,
    LoginResponse,
    TwoFactorSetupResponse,
    TwoFactorVerifyLoginRequest,
    RegisterRequest,
    RegisterResponse,
    VerifyOtpRequest,
    CompleteProfileRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenResponse,
    PasswordResetConfirmRequest,
} from '@/types/api';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
    /**
     * Register a new user — returns { detail } only; tokens are issued after email verification
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        console.log("[AuthApi] Registering user:", data.email);
        const response = await apiClient.post<RegisterResponse>('auth/registration/', data);
        console.log("[AuthApi] Registration Response:", response.data);
        return response.data;
    },

    /**
     * Login with email and password.
     * Returns AuthResponse (tokens + user) when 2FA is off.
     * Returns TwoFactorLoginResponse ({ requires_2fa, totp_token }) when 2FA is on.
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        console.log("[AuthApi] Logging in user:", data.email);
        const response = await apiClient.post<LoginResponse>('auth/login/', data);
        console.log("[AuthApi] Login Response:", response.data);

        // Only store tokens on a normal (non-2FA) login
        if ('access' in response.data && response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] Tokens stored successfully.");
        }

        return response.data;
    },

    /**
     * Complete a 2FA-gated login using the totp_token from the login response
     * and a 6-digit code from the authenticator app.
     */
    async verify2FALogin(data: TwoFactorVerifyLoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('auth/2fa/verify-login/', data);
        if (response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] 2FA tokens stored successfully.");
        }
        return response.data;
    },

    /**
     * Login or register using Google OAuth
     * @param accessToken - Google access token from Google Sign-In
     */
    async googleAuth(accessToken: string): Promise<LoginResponse> {
        console.log("[AuthApi] Authenticating with Google...");
        const response = await apiClient.post<LoginResponse>('auth/google/', {
            access_token: accessToken,
        } as GoogleAuthRequest);
        console.log("[AuthApi] Google Auth Response:", response.data);

        if ('access' in response.data && response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
            console.log("[AuthApi] Tokens stored successfully.");
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

        const { access, refresh } = response.data;
        if (refresh) {
            tokenManager.setTokens(access, refresh);
        } else if (access) {
            tokenManager.setAccessToken(access);
        }

        return response.data;
    },

    /**
     * Verify whether an access or refresh token is still valid.
     * Returns true if valid, false if expired/invalid.
     */
    async verifyToken(token: string): Promise<boolean> {
        try {
            await apiClient.post('auth/token/verify/', { token });
            return true;
        } catch {
            return false;
        }
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
            if (error.response?.status === 401) {
                console.log("[AuthApi] auth/user/ session expired or invalid (401). State will be updated.");
            } else {
                console.error("[AuthApi] auth/user/ fetch error:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message || "Unknown transport error",
                    endpoint: error.config?.url,
                });
            }
            return null;
        }
    },

    /**
     * Resend registration OTP
     */
    async resendOtp(email: string): Promise<{ detail: string }> {
        console.log("[AuthApi] Resending OTP to:", email);
        const response = await apiClient.post<{ detail: string }>('auth/registration/resend-otp/', { email });
        return response.data;
    },

    /**
     * Verify registration OTP — returns AuthResponse (tokens + user)
     */
    async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
        console.log("[AuthApi] Verifying registration OTP for:", data.email);
        const response = await apiClient.post<AuthResponse>('auth/registration/verify-otp/', data);
        console.log("[AuthApi] OTP Verification Response:", response.data);

        if (response.data.access) {
            tokenManager.setTokens(response.data.access, response.data.refresh || "");
        }

        return response.data;
    },

    /**
     * Complete user profile (Step 3) — sets username, full_name, and birthday
     */
    async completeProfile(data: CompleteProfileRequest): Promise<{ detail: string; user: User }> {
        console.log("[AuthApi] Completing profile for user...");
        const response = await apiClient.post<{ detail: string; user: User }>('auth/registration/complete-profile/', data);
        console.log("[AuthApi] Complete Profile Response:", response.data);
        return response.data;
    },

    /**
     * Update current user profile (Partial).
     * Accepts both JSON (for text fields) and FormData (for file uploads).
     */
    async updateProfile(data: Partial<User> | FormData): Promise<User> {
        console.log("[AuthApi] Updating user profile...");
        const response = await apiClient.patch<User>("auth/user/", data);
        return response.data;
    },

    /**
     * Change password while authenticated.
     */
    async changePassword(data: {
        old_password: string;
        new_password1: string;
        new_password2: string;
    }): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/password/change/', data);
        return response.data;
    },

    /**
     * Send a password reset link to the given email address.
     */
    async forgotPassword(email: string): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/password/reset/', { email });
        return response.data;
    },

    /**
     * Confirm a password reset using the uid and token from the reset link.
     */
    async resetPasswordConfirm(data: PasswordResetConfirmRequest): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/password/reset/confirm/', data);
        return response.data;
    },

    // ─── 2FA ────────────────────────────────────────────────────────────────────

    /**
     * Get the TOTP secret and otpauth URI to render a QR code.
     * Does NOT enable 2FA yet — must call enable2FA() after the user scans.
     */
    async setup2FA(): Promise<TwoFactorSetupResponse> {
        const response = await apiClient.get<TwoFactorSetupResponse>('auth/2fa/setup/');
        return response.data;
    },

    /**
     * Activate 2FA by verifying the first code from the authenticator app.
     */
    async enable2FA(code: string): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/2fa/enable/', { code });
        return response.data;
    },

    /**
     * Deactivate 2FA. Requires both the current password and a valid TOTP code.
     */
    async disable2FA(code: string, password: string): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/2fa/disable/', { code, password });
        return response.data;
    },

    // ─── Verify-email (allauth confirmation link flow) ───────────────────────────

    /**
     * Confirm an allauth email verification link by posting its key.
     * Used by the /verify-email/[key] page when a user clicks the link in their inbox.
     */
    async verifyEmail(key: string): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/registration/verify-email/', { key });
        return response.data;
    },

    /**
     * Resend an email verification link (alias of resendOtp for the verify-email page).
     */
    async resendVerificationEmail(email: string): Promise<{ detail: string }> {
        return this.resendOtp(email);
    },

    // ─── Sessions ───────────────────────────────────────────────────────────────

    /**
     * Get all active sessions for the current user
     */
    async getSessions(): Promise<Session[]> {
        const response = await apiClient.get<Session[]>('auth/sessions/');
        return response.data;
    },

    /**
     * Revoke a specific session by ID
     */
    async revokeSession(sessionId: number): Promise<void> {
        await apiClient.delete(`auth/sessions/${sessionId}/`);
    },

    /**
     * Revoke ALL sessions for the current user, including the current one.
     * Immediately clears stored tokens.
     */
    async revokeAllSessions(): Promise<{ detail: string }> {
        const response = await apiClient.post<{ detail: string }>('auth/sessions/revoke-all/');
        tokenManager.clearTokens();
        return response.data;
    },
};
