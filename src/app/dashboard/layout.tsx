"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSidebar } from "@/hooks/use-sidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { collapsed, toggleSidebar } = useSidebar();

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Show nothing while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top Navbar */}
            <AppNavbar collapsed={collapsed} />

            {/* Left Sidebar */}
            <AppSidebar
                collapsed={collapsed}
                onToggle={toggleSidebar}
            />

            {/* Main Content — offset by sidebar width */}
            <motion.main
                animate={{ marginLeft: collapsed ? 72 : 230 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="pt-14 min-h-screen"
            >
                {children}
            </motion.main>
        </div>
    );
}
