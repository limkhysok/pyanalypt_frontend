/**
 * Centralized API exports
 * Import everything you need from '@/services/api'
 */

// API Client
export { default as apiClient } from '@/lib/axios';

// Services
export { authApi } from './auth.service';

// Utilities
export { tokenManager } from '@/lib/token';
export { parseApiError, getErrorMessage, formatFieldErrors } from '@/lib/error-handler';

// Types
export type {
    User,
    AuthResponse,
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ApiError,
} from '@/types/api';
