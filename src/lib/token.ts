// Token Management Utilities
// Stores JWT tokens in localStorage AND keeps a lightweight cookie in sync
// so Next.js Edge middleware can perform server-side route protection.

const TOKEN_KEYS = {
    ACCESS: "access_token",
    REFRESH: "refresh_token",
} as const;

/** Cookie written for middleware — non-httpOnly so client JS can manage it. */
const SESSION_COOKIE = "auth_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setSessionCookie(): void {
    if (typeof document === "undefined") return;
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Strict`;
}

function clearSessionCookie(): void {
    if (typeof document === "undefined") return;
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

export const tokenManager = {
    // Get access token
    getAccessToken(): string | null {
        if (globalThis.window === undefined) return null;
        return localStorage.getItem(TOKEN_KEYS.ACCESS);
    },

    // Get refresh token
    getRefreshToken(): string | null {
        if (globalThis.window === undefined) return null;
        return localStorage.getItem(TOKEN_KEYS.REFRESH);
    },

    // Set both tokens — also activates the session cookie for middleware
    setTokens(access: string, refresh: string): void {
        if (globalThis.window === undefined) return;
        localStorage.setItem(TOKEN_KEYS.ACCESS, access);
        localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
        setSessionCookie();
    },

    // Set only access token (for refresh token rotation scenarios)
    setAccessToken(access: string): void {
        if (globalThis.window === undefined) return;
        localStorage.setItem(TOKEN_KEYS.ACCESS, access);
        setSessionCookie();
    },

    // Clear all tokens — also removes the session cookie
    clearTokens(): void {
        if (globalThis.window === undefined) return;
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        clearSessionCookie();
    },

    // Check if the user has an access token stored
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
};
