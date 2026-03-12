"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Routes that use the authenticated app layout (AppNavbar + AppSidebar)
// The public Navbar and Footer must NOT render on these routes
const APP_ROUTES = ["/dashboard", "/profile", "/project", "/tutorials", "/settings"];

export function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAppRoute = pathname ? APP_ROUTES.some((route) => pathname.startsWith(route)) : false;

    if (isAppRoute) {
        // App pages handle their own layout — render children only
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    );
}
