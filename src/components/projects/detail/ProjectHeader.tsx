import React from 'react';
import { useRouter } from "next/navigation";
import { 
    ChevronRight, 
    Calendar, 
    Database, 
    ArrowLeft,
    BarChart3,
    Upload,
    FileSpreadsheet,
    Sliders,
    BrainCircuit,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
    project: Project;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, activeTab, setActiveTab }) => {
    const router = useRouter();

    return (
        <div className="space-y-8">
            <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground/60 hover:text-primary transition-colors no-underline uppercase tracking-widest text-[10px] font-black"
                    onClick={() => router.push("/project")}
                >
                    Projects
                </Button>
                <ChevronRight className="h-3 w-3 text-black dark:text-white opacity-40" />
                <span className="text-primary font-black tracking-widest">{project.name}</span>
            </nav>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_1.5fr] items-stretch min-h-[128px]">
                    {/* Category Panel */}
                    <div className="relative flex flex-col justify-center px-7 py-7 bg-background border-b md:border-b-0 md:border-r border-border overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <span className="relative text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                            Category
                        </span>
                        <span className="relative text-sm font-black uppercase tracking-widest text-foreground">
                            {project.category || "General"}
                        </span>
                        <div className="relative mt-3">
                            <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                project.status === 'completed'
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : project.status === 'archived'
                                        ? "bg-muted text-muted-foreground border-border"
                                        : "bg-primary/10 text-primary border-primary/20"
                            )}>
                                {project.status ?? 'active'}
                            </span>
                        </div>
                    </div>

                    {/* Project Name */}
                    <div className="flex flex-col justify-center px-8 py-6 border-b md:border-b-0 md:border-r border-border">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">Project</span>
                        <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
                            {project.name}
                        </h1>
                        <p className="text-[10px] text-muted-foreground/40 font-mono mt-2 tracking-wider">
                            #{project.id?.slice(0, 8)}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col justify-center px-8 py-6 bg-muted/20">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">Objective</span>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-lg">
                            {project.description || "No description provided for this analytical workspace."}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Database className="h-3 w-3" />
                                {project.datasets?.length ?? 0} datasets
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex items-center border-t border-border bg-muted/30 overflow-x-auto scrollbar-none">
                    {[
                        { name: 'Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
                        { name: 'Import', icon: <Upload className="h-3.5 w-3.5" /> },
                        { name: 'Dataset', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
                        { name: 'Analyze', icon: <Sliders className="h-3.5 w-3.5" /> },
                        { name: 'Models', icon: <BrainCircuit className="h-3.5 w-3.5" /> },
                        { name: 'Activities', icon: <Clock className="h-3.5 w-3.5" /> },
                    ].map(({ name, icon }) => (
                        <button
                            key={name}
                            onClick={() => setActiveTab(name)}
                            className={cn(
                                "flex items-center gap-2 shrink-0 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all relative border-r border-border/60 last:border-r-0",
                                activeTab === name
                                    ? "text-primary bg-background"
                                    : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("transition-colors", activeTab === name ? "text-primary" : "text-muted-foreground/40")}>
                                {icon}
                            </span>
                            {name}
                            {activeTab === name && (
                                <motion.div
                                    layoutId="activeTabAccent"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
