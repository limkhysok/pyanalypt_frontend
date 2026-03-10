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
            animate={{ width: collapsed ? 72 : 230 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full z-[51] flex flex-col border-r border-border bg-background/95 backdrop-blur-xl overflow-hidden"
        >
            {/* Header */}
            <div className={cn("flex items-center h-14 border-b border-border shrink-0 transition-all", collapsed ? "justify-center gap-1.5 px-0" : "justify-between px-4")}>
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-foreground text-background shrink-0 flex items-center justify-center">
                        <Sparkles size={16} fill="currentColor" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden"
                            >
                                PyAnalypt
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Toggle icon */}
                <button
                    onClick={onToggle}
                    title={collapsed ? "Expand" : "Collapse"}
                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center justify-center"
                >
                    <PanelLeft size={18} />
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
                                "group flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                collapsed ? "justify-center px-0" : "px-3",
                                isActive
                                    ? "bg-foreground text-background shadow-md"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                        >
                            <Icon size={20} className="shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -6, width: 0 }}
                                        animate={{ opacity: 1, x: 0, width: "auto" }}
                                        exit={{ opacity: 0, x: -6, width: 0 }}
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
