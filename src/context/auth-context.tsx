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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        // Initial state from localStorage for faster flicker-free UI
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('user_data');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

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
        if (!tokenManager.isAuthenticated()) {
            setUser(null);
            localStorage.removeItem('user_data');
            setIsLoading(false);
            return;
        }

        try {
            // Fetch fresh user data to stay in sync with backend
            const userData = await authApi.getCurrentUser();
            if (userData) {
                setUser(userData);
                localStorage.setItem('user_data', JSON.stringify(userData));
            } else if (!tokenManager.isAuthenticated()) {
                // If fetching fails and we have no token, definitely log out
                logout();
            }
            // If fetching fails but we HAVE a token, we keep the existing state (cached)
            // as it might be a temporary network issue or endpoint not ready
        } catch (error) {
            console.error('Failed to synchronize user state:', error);
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser
        }}>
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
