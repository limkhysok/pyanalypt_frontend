"use client";

import * as React from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider className="bg-background text-foreground" style={{ "--sidebar-width": "13rem" } as React.CSSProperties}>
            {/* Precision Blueprint Grid Backdrop */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none opacity-20 shadow-inner" />

            <AppSidebar />

            <SidebarInset className="overflow-x-hidden w-full min-w-0">
                <AppNavbar />
                <div className="flex-1 w-full min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
