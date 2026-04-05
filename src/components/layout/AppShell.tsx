"use client";

import * as React from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { motion } from "motion/react";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
    const { collapsed, toggleSidebar } = useSidebar();

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Precision Blueprint Grid Backdrop */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20 shadow-inner" />

            <AppNavbar collapsed={collapsed} />
            <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />

            <motion.main
                animate={{ marginLeft: collapsed ? 72 : 240 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="pt-14 min-h-screen relative z-10"
            >
                {children}
            </motion.main>
        </div>
    );
}
