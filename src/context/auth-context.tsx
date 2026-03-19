'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/api';
import { authApi } from '@/services/auth.service';
import { tokenManager } from '@/lib/token';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Sync from localStorage only ONCE on mount to avoid hydration mismatch
    useEffect(() => {
        const hydrate = () => {
            console.log("[AuthContext] Hydrating state from localStorage...");
            try {
                const savedUser = localStorage.getItem('user_data');
                const hasTokens = !!tokenManager.getAccessToken();

                console.log("[AuthContext] Cached user:", savedUser ? "Found" : "None");
                console.log("[AuthContext] Has tokens:", hasTokens);

                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    console.log("[AuthContext] User state hydrated:", parsedUser.username);
                }
            } catch (err) {
                console.error("[AuthContext] Failed to hydrate auth state:", err);
                localStorage.removeItem('user_data');
            } finally {
                setIsInitialized(true);
                console.log("[AuthContext] Initialization complete.");
            }
        };

        hydrate();
    }, []);

    const logout = useCallback(() => {
        authApi.logout();
        setUser(null);
        localStorage.removeItem('user_data');
    }, []);

    const login = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
    }, []);

    const refreshUser = useCallback(async () => {
        console.log("[AuthContext] refreshUser() triggered");

        if (!tokenManager.isAuthenticated()) {
            console.log("[AuthContext] No authentication tokens found. Clearing state.");
            setUser(null);
            localStorage.removeItem('user_data');
            setIsLoading(false);
            return;
        }

        try {
            console.log("[AuthContext] Fetching fresh user data from backend...");
            const userData = await authApi.getCurrentUser();

            if (userData) {
                console.log("[AuthContext] User data sync success:", userData.username);
                // Fallback for missing username
                if (!userData.username) {
                    userData.username = userData.full_name || userData.first_name || (userData.email ? userData.email.split('@')[0] : "User");
                }
                setUser(userData);
                localStorage.setItem('user_data', JSON.stringify(userData));
            } else {
                console.warn("[AuthContext] getCurrentUser() returned null.");
                if (!tokenManager.isAuthenticated()) {
                    console.log("[AuthContext] Token lost during fetch. Logging out.");
                    setUser(null);
                    localStorage.removeItem('user_data');
                }
            }
        } catch (error) {
            console.error("[AuthContext] Sync failed (Network/Backend Error):", error);
        } finally {
            setIsLoading(false);
            console.log("[AuthContext] User data sync ended.");
        }
    }, []); // Removed user dependency to prevent infinite loop

    useEffect(() => {
        if (isInitialized) {
            refreshUser();
        }
    }, [isInitialized, refreshUser]);

    const contextValue = React.useMemo(() => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser
    }), [user, isLoading, login, logout, refreshUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
