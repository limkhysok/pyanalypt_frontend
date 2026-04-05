import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

/**
 * Handle different error response formats from the backend (DRF)
 */
function parseResponseData(responseData: any, statusCode?: number): ApiError | null {
    if (!responseData) return null;

    // Handle String response
    if (typeof responseData === 'string') {
        return {
            message: responseData,
            status: statusCode,
        };
    }

    // Handle Object response (Django REST Framework)
    if (typeof responseData === 'object') {
        // Check for 'detail' field (common in DRF)
        if ('detail' in responseData) {
            return {
                message: responseData.detail as string,
                status: statusCode,
            };
        }

        // Check for field-specific errors
        const errors: Record<string, string[]> = {};
        let hasFieldErrors = false;

        Object.entries(responseData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                errors[key] = value;
                hasFieldErrors = true;
            } else if (typeof value === 'string') {
                errors[key] = [value];
                hasFieldErrors = true;
            }
        });

        if (hasFieldErrors) {
            const firstError = Object.values(errors)[0]?.[0];
            return {
                message: firstError || 'Validation error',
                errors,
                status: statusCode,
            };
        }
    }

    return null;
}

/**
 * Handle network-level errors (timeouts, connection issues)
 */
function handleNetworkError(errorCode?: string): ApiError | null {
    if (errorCode === 'ECONNABORTED') {
        return {
            message: 'Request timeout. Please try again.',
            status: 408,
        };
    }

    if (errorCode === 'ERR_NETWORK') {
        return {
            message: 'Network error. Please check your connection.',
            status: 0,
        };
    }

    return null;
}

/**
 * Parse API error response into a user-friendly format
 */
export function parseApiError(error: unknown): ApiError {
    // 1. Specific handling for Axios Errors
    if (error instanceof AxiosError) {
        // Try parsing specialized response data first
        const parsedResponse = parseResponseData(error.response?.data, error.response?.status);
        if (parsedResponse) return parsedResponse;

        // Try network specific error codes
        const networkError = handleNetworkError(error.code);
        if (networkError) return networkError;

        // Fallback for generic Axios error
        return {
            message: error.message || 'An error occurred',
            status: error.response?.status,
        };
    }

    // 2. Generic JS Error objects
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    }

    // 3. Complete unknowns
    return {
        message: 'An unexpected error occurred',
    };
}

/**
 * Get a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
    const apiError = parseApiError(error);
    return apiError.message ?? 'An unexpected error occurred';
}

/**
 * Format field errors for display in forms
 */
export function formatFieldErrors(
    error: unknown
): Record<string, string> | null {
    const apiError = parseApiError(error);

    if (!apiError.errors) {
        return null;
    }

    const formattedErrors: Record<string, string> = {};

    Object.entries(apiError.errors).forEach(([field, messages]) => {
        formattedErrors[field] = messages[0]; // Take first error message
    });

    return formattedErrors;
}
