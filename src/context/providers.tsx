'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from "@/context/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        console.warn("Google Client ID is not defined in environment variables.");
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId || ""}>
            <AuthProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                </ThemeProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
