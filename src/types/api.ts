// API Response Types

export interface User {
    pk: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    profile_picture?: string;
    bio?: string;
    email_verified?: boolean;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    password1: string;
    password2: string;
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
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}
