"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-8 w-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppNavbar collapsed={collapsed} />
            <AppSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((prev) => !prev)}
            />
            <motion.main
                animate={{ marginLeft: collapsed ? 64 : 220 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="pt-14 min-h-screen"
            >
                {children}
            </motion.main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
