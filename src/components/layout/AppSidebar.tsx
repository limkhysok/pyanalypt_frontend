"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Database,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Settings,
    User,
    Trash2,
    BarChart3,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Datasets", href: "/datasets", icon: Database },
    { label: "Issues", href: "/issues", icon: AlertCircle },
    { label: "Clean", href: "/clean", icon: Trash2 },
    { label: "Analysis", href: "/analysis", icon: BarChart3 },
    { label: "Insight", href: "/insight", icon: Lightbulb },
];

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: Readonly<AppSidebarProps>) {
    const pathname = usePathname();

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-full z-51 flex flex-col border-r border-border/40 bg-background backdrop-blur-xl transition-all"
        >
            {/* Toggle Button Hanging on Border — TOP POSITIONED */}
            <button
                onClick={onToggle}
                title={collapsed ? "Expand" : "Collapse"}
                className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-background shadow-lg hover:bg-foreground hover:text-background transition-all text-muted-foreground hover:scale-110 active:scale-95"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
            {/* Header */}
            <div className={cn("flex items-center h-14 border-b border-border/40 shrink-0 transition-all pl-8", collapsed && "justify-center px-0")}>
                {/* Logo with signature transition */}
                <Link href="/dashboard" className="flex items-center gap-3 group/logo min-w-0">
                    <Logo className="w-6 h-6 transition-all duration-500 group-hover/logo:rotate-12 grayscale group-hover/logo:grayscale-0 shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-[14px] font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden"
                            >
                                PyAnalypt
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-8 px-3 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const safePathname = pathname || "";
                    const isActive = safePathname === href || (href !== "/dashboard" && safePathname.startsWith(href));

                    return (
                        <div key={href} className="space-y-1">
                            <Link
                                href={href}
                                title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3.5 h-11 rounded-xl text-[13px] font-semibold transition-all duration-300 relative",
                                    collapsed ? "justify-center px-0" : "px-4",
                                    isActive
                                        ? "bg-foreground text-background shadow-xl shadow-foreground/5 scale-[1.02]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon size={18} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="whitespace-nowrap overflow-hidden flex-1"
                                        >
                                            {label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-1 w-1 h-5 bg-background rounded-full opacity-30"
                                    />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Footer Items */}
            <div className="p-4 border-t border-border/40 space-y-1.5 bg-muted/5">
                <Link
                    href="/profile"
                    title={collapsed ? "Profile" : undefined}
                    className={cn(
                        "group flex items-center gap-3.5 h-11 rounded-xl text-[13px] font-semibold transition-all duration-300",
                        collapsed ? "justify-center px-0" : "px-4",
                        pathname === "/profile"
                            ? "bg-foreground text-background shadow-lg"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    <User size={18} className="shrink-0 opacity-40 group-hover:opacity-100" />
                    {!collapsed && <span className="flex-1">Profile</span>}
                </Link>

                <Link
                    href="/profile/setting"
                    title={collapsed ? "Settings" : undefined}
                    className={cn(
                        "group flex items-center gap-3.5 h-11 rounded-xl text-[13px] font-semibold transition-all duration-300",
                        collapsed ? "justify-center px-0" : "px-4",
                        pathname?.startsWith("/profile/setting")
                            ? "bg-foreground text-background shadow-lg"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    <Settings size={18} className="shrink-0 opacity-40 group-hover:opacity-100" />
                    {!collapsed && <span className="flex-1">Settings</span>}
                </Link>
            </div>
        </motion.aside>
    );
}
