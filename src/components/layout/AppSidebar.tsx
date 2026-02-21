"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderKanban,
    BookOpenCheck,
    ChevronRight,
    PanelLeft,
    Sparkles,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Project", href: "/project", icon: FolderKanban },
    { label: "Tutorials", href: "/tutorials", icon: BookOpenCheck },
];

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 220 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full z-[51] flex flex-col border-r border-border bg-background/95 backdrop-blur-xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
                {/* Logo — hidden when collapsed */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-foreground text-background shrink-0">
                                    <Sparkles size={14} fill="currentColor" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
                                    PyAnalypt
                                </span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle icon — centered when collapsed, right-aligned when expanded */}
                <button
                    onClick={onToggle}
                    title={collapsed ? "Expand" : "Collapse"}
                    className={cn(
                        "shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                        collapsed && "mx-auto"
                    )}
                >
                    <PanelLeft size={16} />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={collapsed ? label : undefined}
                            className={cn(
                                "group flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                isActive
                                    ? "bg-foreground text-background"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon size={17} className="shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{ duration: 0.16 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {!collapsed && isActive && (
                                <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />
                            )}
                        </Link>
                    );
                })}
            </nav>


        </motion.aside>
    );
}
