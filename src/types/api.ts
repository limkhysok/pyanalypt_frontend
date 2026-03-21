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

export interface ApiError {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
    status?: number;
}
