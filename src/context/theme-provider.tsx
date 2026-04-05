"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: Readonly<React.ComponentProps<typeof NextThemesProvider>>) {
    // Suppress React 19 script tag error in development for next-themes compatibility
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const originalError = console.error;
            console.error = (...args) => {
                if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
                    return;
                }
                originalError.apply(console, args);
            };
            return () => {
                console.error = originalError;
            };
        }
    }, []);

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
