import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

/**
 * Parse API error response into a user-friendly format
 */
export function parseApiError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const responseData = error.response?.data;

        // Handle different error response formats
        if (responseData) {
            // Django REST Framework error format
            if (typeof responseData === 'object') {
                // Check for detail field (common in DRF)
                if ('detail' in responseData) {
                    return {
                        message: responseData.detail as string,
                        status: statusCode,
                    };
                }

                // Check for field-specific errors
                const errors: Record<string, string[]> = {};
                let hasFieldErrors = false;

                Object.keys(responseData).forEach((key) => {
                    const value = responseData[key];
                    if (Array.isArray(value)) {
                        errors[key] = value;
                        hasFieldErrors = true;
                    } else if (typeof value === 'string') {
                        errors[key] = [value];
                        hasFieldErrors = true;
                    }
                });

                if (hasFieldErrors) {
                    // Create a combined message from field errors
                    const firstError = Object.values(errors)[0]?.[0];
                    return {
                        message: firstError || 'Validation error',
                        errors,
                        status: statusCode,
                    };
                }
            }

            // If responseData is a string
            if (typeof responseData === 'string') {
                return {
                    message: responseData,
                    status: statusCode,
                };
            }
        }

        // Network errors
        if (error.code === 'ECONNABORTED') {
            return {
                message: 'Request timeout. Please try again.',
                status: 408,
            };
        }

        if (error.code === 'ERR_NETWORK') {
            return {
                message: 'Network error. Please check your connection.',
                status: 0,
            };
        }

        // Default Axios error
        return {
            message: error.message || 'An error occurred',
            status: statusCode,
        };
    }

    // Generic error
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    }

    // Unknown error
    return {
        message: 'An unexpected error occurred',
    };
}

/**
 * Get a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
    const apiError = parseApiError(error);
    return apiError.message;
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
