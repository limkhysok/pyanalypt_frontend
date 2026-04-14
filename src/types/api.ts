// API Response Types

export interface User {
    id: number;
    username: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    profile_picture: string | null;
    email_verified: boolean;
    is_staff?: boolean;
    is_active?: boolean;
    date_joined?: string;
    last_login?: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

/** Returned by POST /auth/login/ when 2FA is required. No tokens are issued yet. */
export interface TwoFactorLoginResponse {
    requires_2fa: true;
    totp_token: string;
}

export type LoginResponse = AuthResponse | TwoFactorLoginResponse;

export interface RegisterRequest {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface RegisterResponse {
    detail: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleAuthRequest {
    access_token: string;
}

export interface RefreshTokenRequest {
    refresh: string;
}

export interface RefreshTokenResponse {
    access: string;
    refresh?: string;
}

/** Matches GET /auth/sessions/ response shape */
export interface Session {
    id: number;
    device: string;
    browser: string;
    ip_address: string;
    created_at: string;
    last_active: string;
}

/** Returned by GET /auth/2fa/setup/ */
export interface TwoFactorSetupResponse {
    secret: string;
    otpauth_uri: string;
}

export interface TwoFactorVerifyLoginRequest {
    totp_token: string;
    code: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirmRequest {
    uid: string;
    token: string;
    new_password1: string;
    new_password2: string;
}

export interface ApiError {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
    status?: number;
}
