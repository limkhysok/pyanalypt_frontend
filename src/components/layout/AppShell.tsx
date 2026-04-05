"use client";

import * as React from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { motion } from "motion/react";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
    const { collapsed, toggleSidebar } = useSidebar();

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            <AppNavbar collapsed={collapsed} />
            <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />
            <motion.main
                animate={{ marginLeft: collapsed ? 72 : 230 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="pt-14 min-h-screen relative"
            >
                {children}
            </motion.main>
        </div>
    );
}
