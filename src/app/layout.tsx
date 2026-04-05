import type { Metadata } from "next";
import "@/styles/globals.css";
import { outfit } from "@/styles/fonts";
import { CursorFollower } from "@/components/ui/cursor-follower";
import { Providers } from "@/context/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "PyAnalypt",
    description: "Advanced Data Analysis Dashboard",
};

// Root layout — global providers only.
// Navbar/Footer → (marketing)/layout.tsx
// SmoothScroll   → (marketing)/layout.tsx
// Auth shell     → (auth)/layout.tsx
// App shell      → (app)/layout.tsx + each route's own layout.tsx
export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning className={outfit.variable}>
            <body className={`${outfit.className} antialiased VscScrollbar bg-background text-foreground relative`}>
                <Providers>
                    <CursorFollower />
                    {children}
                    <Toaster position="bottom-right" richColors closeButton />
                </Providers>
            </body>
        </html>
    );
}
