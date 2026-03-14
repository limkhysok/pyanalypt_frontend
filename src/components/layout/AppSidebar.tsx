"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    FolderKanban,
    BarChart3,
    BookOpenCheck,
    ChevronRight,
    PanelLeft,
    Sparkles,
    Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { projectApi } from "@/services/project.service";
import { Project } from "@/types/project";
import { VISUALIZATIONS_CATALOG, ChartArchitecture } from "@/lib/visualizations-data";

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);

    React.useEffect(() => {
        const fetchProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const data = await projectApi.getAll();
                setProjects(data);
            } catch (err) {
                console.error("Failed to load sidebar projects:", err);
            } finally {
                setIsLoadingProjects(false);
            }
        };

        fetchProjects();

        // Listen for global project changes
        window.addEventListener('projects-changed', fetchProjects);
        return () => window.removeEventListener('projects-changed', fetchProjects);
    }, []);

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
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const safePathname = pathname || "";
                    const isActive = safePathname === href || (href !== "/dashboard" && safePathname.startsWith(href));
                    const isProjectFolder = label === "Project";
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
                                {!collapsed && isActive && !isProjectFolder && !isVisualsFolder && (
                                    <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />
                                )}
                            </Link>

                            {/* Dropdown for Projects */}
                            {!collapsed && isProjectFolder && (isActive || safePathname.includes("/project/")) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="pl-9 pr-2 space-y-1 overflow-hidden"
                                >
                                    {projects.length > 0 ? (
                                        projects.map((p) => {
                                            const isCurrentProject = safePathname.includes(`/project/${p.id}`);
                                            return (
                                                <Link
                                                    key={p.id}
                                                    href={`/project/${p.id}`}
                                                    className={cn(
                                                        "flex items-center gap-2 py-1.5 px-2 rounded-md text-xs transition-colors",
                                                        isCurrentProject
                                                            ? "text-foreground font-bold bg-accent/30"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                                                    )}
                                                >
                                                    <Hash size={12} className={cn("shrink-0", isCurrentProject ? "text-primary" : "opacity-40")} />
                                                    <span className="truncate">{p.name}</span>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        !isLoadingProjects && (
                                            <p className="text-[10px] text-muted-foreground/60 italic py-1 px-2">No projects found</p>
                                        )
                                    )}
                                    {isLoadingProjects && (
                                        <div className="h-4 w-4 border-2 border-primary/30 border-t-primary animate-spin rounded-full mx-auto my-2" />
                                    )}
                                </motion.div>
                            )}

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
                                                        const projectIdMatch = safePathname.match(/\/project\/([^\/?]+)/);
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


        </motion.aside>
    );
}
