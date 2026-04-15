"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        if (!isLoading && user) {
            const isProfileIncomplete = !user.full_name || !user.birthday;
            
            // If profile is incomplete and user is not already on the complete-profile page
            // (Note: /complete-profile is outside of (app) group, so this layout won't even run for it,
            // but it's good to be safe if routes change)
            if (isProfileIncomplete && pathname !== "/complete-profile") {
                console.log("[AppShell] Profile incomplete, redirecting to onboarding step 3...");
                router.push("/complete-profile");
            }
        }
    }, [user, isLoading, router, pathname]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 opacity-20" />
            </div>
        );
    }

    return (
        <SidebarProvider className="bg-background text-foreground" style={{ "--sidebar-width": "13rem" } as React.CSSProperties}>
            {/* Precision Blueprint Grid Backdrop */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none opacity-20 shadow-inner" />

            <AppSidebar />

            <SidebarInset className="overflow-x-clip w-full min-w-0">
                <AppNavbar />
                <div className="flex-1 w-full min-w-0 overflow-x-clip">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
