// Token Management Utilities

const TOKEN_KEYS = {
    ACCESS: 'access_token',
    REFRESH: 'refresh_token',
} as const;

export const tokenManager = {
    // Get access token
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEYS.ACCESS);
    },

    // Get refresh token
    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEYS.REFRESH);
    },

    // Set both tokens
    setTokens(access: string, refresh: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEYS.ACCESS, access);
        localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    },

    // Set only access token (for refresh scenarios)
    setAccessToken(access: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    },

    // Clear all tokens
    clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
};
