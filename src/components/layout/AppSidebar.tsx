"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Database,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Settings,
    User,
    Trash2,
    BarChart3,
    TrendingUp,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { VISUALIZATIONS_CATALOG, ChartArchitecture } from "@/lib/visualizations-data";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Datasets", href: "/datasets", icon: Database },
    { label: "Issues", href: "/issues", icon: AlertCircle },
    { label: "Clean", href: "/clean", icon: Trash2 },
    { label: "Analysis", href: "/analysis", icon: BarChart3 },
    { label: "Visualization", href: "/visualization", icon: TrendingUp },
    { label: "Insight", href: "/insight", icon: Lightbulb },
];

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: Readonly<AppSidebarProps>) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Placeholder for future dataset fetching logic
    React.useEffect(() => {
        // ...
    }, []);

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 230 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full z-51 flex flex-col border-r border-border/40 bg-background backdrop-blur-xl"
        >
            {/* Toggle Button Hanging on Border */}
            <button
                onClick={onToggle}
                title={collapsed ? "Expand" : "Collapse"}
                className="absolute -right-3 bottom-10 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-background shadow-md hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-muted-foreground hover:text-blue-500"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            {/* Header */}
            <div className={cn("flex items-center h-14 border-b border-border/40 shrink-0 transition-all px-4", collapsed && "justify-center px-0")}>
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
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const safePathname = pathname || "";
                    const isActive = safePathname === href || (href !== "/dashboard" && safePathname.startsWith(href));
                    const isVisualsFolder = label === "Visualizations";

                    return (
                        <div key={href} className="space-y-1">
                            <Link
                                href={href}
                                title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                    collapsed ? "justify-center px-0" : "px-3",
                                    isActive
                                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                        : "text-muted-foreground hover:bg-blue-500/5 hover:text-foreground border border-transparent"
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
                                {!collapsed && isActive && !isVisualsFolder && (
                                    <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />
                                )}
                            </Link>

                            {/* Dropdown for Visualizations Architectures */}
                            {!collapsed && isVisualsFolder && (isActive || safePathname.includes("/templates")) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="pl-9 pr-2 space-y-1 pb-4"
                                >
                                    <div className="space-y-4">
                                        {/* Scenarios Grouping */}
                                        {["Correlations", "Proportions", "Networks", "Distributions", "Hierarchies", "Time Series", "Time Chunks"].map((scenario) => (
                                            <div key={scenario} className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold px-2">
                                                    {scenario}
                                                </span>
                                                <div className="space-y-0.5">
                                                    {VISUALIZATIONS_CATALOG.filter((v: ChartArchitecture) => v.scenarios.includes(scenario)).map((v: ChartArchitecture) => {
                                                        const isSelected = searchParams?.get('chart') === v.id;
                                                        const Icon = v.icon;
                                                        const projectIdMatch = /\/project\/([^/?]+)/.exec(pathname ?? "");
                                                        const targetHref = projectIdMatch
                                                            ? `/project/${projectIdMatch[1]}?tab=Analyze&chart=${v.id}`
                                                            : `/templates?chart=${v.id}`;

                                                        return (
                                                            <Link
                                                                key={v.id}
                                                                href={targetHref}
                                                                className={cn(
                                                                    "flex items-center gap-2 py-1.5 px-2 rounded-md text-[11px] transition-all",
                                                                    isSelected
                                                                        ? "bg-primary/10 text-primary font-bold"
                                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                                                                )}
                                                            >
                                                                <Icon size={12} className="shrink-0 opacity-70" />
                                                                <span className="truncate">{v.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </nav>
            
            {/* Footer Items */}
            <div className="p-2 border-t border-border/40 space-y-1">
                <Link
                    href="/profile"
                    title={collapsed ? "Profile" : undefined}
                    className={cn(
                        "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed ? "justify-center px-0" : "px-3",
                        pathname === "/profile"
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            : "text-muted-foreground hover:bg-blue-500/5 hover:text-foreground border border-transparent"
                    )}
                >
                    <User size={20} className="shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -6, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                exit={{ opacity: 0, x: -6, width: 0 }}
                                transition={{ duration: 0.16 }}
                                className="whitespace-nowrap overflow-hidden"
                            >
                                Profile
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>

                <Link
                    href="/profile/setting"
                    title={collapsed ? "Settings" : undefined}
                    className={cn(
                        "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed ? "justify-center px-0" : "px-3",
                        pathname?.startsWith("/profile/setting")
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            : "text-muted-foreground hover:bg-blue-500/5 hover:text-foreground border border-transparent"
                    )}
                >
                    <Settings size={20} className="shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -6, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                exit={{ opacity: 0, x: -6, width: 0 }}
                                transition={{ duration: 0.16 }}
                                className="whitespace-nowrap overflow-hidden"
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>
        </motion.aside>
    );
}
