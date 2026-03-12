"use client";

import React from "react";
import {
    FolderPlus,
    Search,
    MoreVertical,
    Star,
    Clock,
    Code,
    Database,
    Layers,
    Trash2,
    Edit2,
    Pin,
    Projector,
    Plus,
    Loader2,
    Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { projectApi } from "@/services/api";
import { Project, CreateProjectRequest } from "@/types/project";
import { ProjectModal } from "@/components/projects/ProjectModal";

export function ProjectPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("All Projects");

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingProject, setEditingProject] = React.useState<Project | undefined>();

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

    const fetchProjects = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await projectApi.getAll();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchProjects();
        }
    }, [authLoading, isAuthenticated, router, fetchProjects]);

    const handleCreateProject = async (data: CreateProjectRequest) => {
        try {
            const newProject = await projectApi.create(data);
            setProjects((prev) => [newProject, ...prev]);
            window.dispatchEvent(new CustomEvent('projects-changed'));
        } catch (error) {
            console.error("Failed to create project:", error);
            throw error;
        }
    };

    const handleUpdateProject = async (data: CreateProjectRequest) => {
        if (!editingProject) return;
        try {
            const updated = await projectApi.patch(editingProject.id, data);
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            window.dispatchEvent(new CustomEvent('projects-changed'));
        } catch (error) {
            console.error("Failed to update project:", error);
            throw error;
        }
    };

    const confirmDeleteProject = (id: string) => {
        setProjectToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await projectApi.delete(projectToDelete);
            setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
            window.dispatchEvent(new CustomEvent('projects-changed'));
        } catch (error) {
            console.error("Failed to delete project:", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
        }
    };

    const toggleFavorite = async (project: Project) => {
        try {
            const updated = await projectApi.patch(project.id, { is_favorite: !project.is_favorite });
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const toggleArchive = async (project: Project) => {
        try {
            const newStatus = project.status === "archived" ? "active" : "archived";
            const updated = await projectApi.patch(project.id, { status: newStatus });
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } catch (error) {
            console.error("Failed to toggle archive:", error);
        }
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (activeTab === "Archived") {
            return matchesSearch && project.status === "archived";
        }

        // For all other tabs, hide archived projects
        if (project.status === "archived") return false;

        if (activeTab === "Starred") return matchesSearch && project.is_favorite;
        if (activeTab === "Recent") {
            return matchesSearch;
        }
        return matchesSearch;
    });

    const openCreateModal = () => {
        setEditingProject(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const getIconForCategory = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes("analysis") || cat.includes("data")) return <Layers className="h-5 w-5" />;
        if (cat.includes("model") || cat.includes("ml")) return <Code className="h-5 w-5" />;
        if (cat.includes("research")) return <Search className="h-5 w-5" />;
        return <Database className="h-5 w-5" />;
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.3em] uppercase">
                            <FolderPlus size={14} className="text-primary" /> Repository
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]">Project Intelligence</h1>
                        <p className="text-muted-foreground mt-1 text-base max-w-xl leading-relaxed">
                            Orchestrate your data workflows, specialized models, and high-fidelity analytical artifacts in one unified workspace.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto"
                    >
                        <div className="relative group/search flex-1 sm:min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/search:text-primary transition-colors" />
                            <Input
                                placeholder="Locate intelligence assets..."
                                className="pl-12 h-10 bg-background/50 border-border/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-full text-xs font-bold transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="h-10 px-6 rounded-full font-bold tracking-widest text-[10px] uppercase bg-foreground text-background hover:bg-primary transition-all duration-300 hover:ambient-glow-mono shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Initialize Forge
                        </Button>
                    </motion.div>
                </div>

                {/* Filters/Tabs with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
                >
                    {["All Projects", "Recent", "Starred", "Archived"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-9 px-5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                                activeTab === tab ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-primary" : "bg-background/50 border-border/40 text-muted-foreground hover:bg-secondary/50"
                            )}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </motion.div>

                {/* Project Grid with Premium Cards */}
                <div className="relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-12 w-12 text-primary animate-spin opacity-40" />
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground animate-pulse">Syncing Repository</p>
                            </div>
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {filteredProjects.map((project, i) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <Card
                                            onClick={() => router.push(`/project/${project.id}`)}
                                            className="h-full group relative bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-2 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-background/60 cursor-pointer flex flex-col"
                                        >
                                            <div className="bg-secondary/10 rounded-[2.5rem] border border-white/5 h-full transition-all duration-700 group-hover:bg-secondary/20 relative z-10 flex flex-col overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                <CardHeader className="space-y-6 p-6 pb-4 relative z-20">
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="p-3.5 rounded-2xl bg-background border border-border/40 shadow-sm text-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 relative overflow-hidden group-hover:scale-110"
                                                        >
                                                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: project.color_code || "#3b82f6" }} />
                                                            <div className="relative z-10">
                                                                {(() => {
                                                                    const icon = getIconForCategory(project.category);
                                                                    return React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5" }) : null;
                                                                })()}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {project.is_favorite && (
                                                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                                                                    <Star className="h-4 w-4 fill-current" />
                                                                </div>
                                                            )}
                                                            <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 rounded-full transition-all">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end" className="w-60 p-2 shadow-2xl rounded-2xl border-border/40 backdrop-blur-xl">
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFavorite(project); }} className="rounded-xl gap-3 py-3 text-sm font-bold">
                                                                            <Star className={cn("h-4 w-4 transition-colors", project.is_favorite && "fill-amber-500 text-amber-500")} />
                                                                            {project.is_favorite ? "Remove Star" : "Star Project"}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(project); }} className="rounded-xl gap-3 py-3 text-sm font-bold">
                                                                            <Edit2 className="h-4 w-4" />
                                                                            Configure Workspace
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleArchive(project); }} className="rounded-xl gap-3 py-3 text-sm font-bold">
                                                                            <Archive className="h-4 w-4" />
                                                                            {project.status === "archived" ? "Restore to Active" : "Archive Workspace"}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator className="my-2 opacity-10" />
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => { e.stopPropagation(); confirmDeleteProject(project.id); }}
                                                                            className="rounded-xl gap-3 py-3 text-sm font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            Dissolve Project
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <CardTitle className="text-xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                                                {project.name}
                                                            </CardTitle>
                                                            <div
                                                                className="h-2 w-2 rounded-full animate-pulse"
                                                                style={{ backgroundColor: project.color_code || "#3b82f6", boxShadow: `0 0 10px ${project.color_code || "#3b82f6"}80` }}
                                                            />
                                                        </div>
                                                        <CardDescription className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed font-bold tracking-tight">
                                                            {project.description || "Initialize descriptive metadata for this analytical container."}
                                                        </CardDescription>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="px-6 pb-6 flex-grow relative z-20">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary" className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] bg-background shadow-sm border border-border/20">
                                                            {project.category}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] border-none shadow-sm",
                                                                project.status === "active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                            )}
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="px-6 py-4 border-t border-border/20 bg-background/30 flex items-center justify-between mt-auto relative z-20 rounded-b-[2.5rem]">
                                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(project.updated_at)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-[8px] uppercase tracking-[0.3em] text-foreground/20 group-hover:text-primary transition-colors duration-500">
                                                            SYS_V1
                                                        </span>
                                                        <div className="h-6 w-1 rounded-full overflow-hidden bg-muted/50">
                                                            <div
                                                                className="h-1/2 w-full transition-all duration-1000 group-hover:h-full"
                                                                style={{ backgroundColor: project.color_code || "#3b82f6" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardFooter>
                                            </div>
                                            <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary/20 rounded-[3rem] transition-colors duration-700 z-20" />
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-muted/5 rounded-[3.5rem] border border-dashed border-border/60">
                            <div className="p-10 rounded-[3rem] bg-secondary/30 text-muted-foreground/30 shadow-inner">
                                <Projector className="h-20 w-20" />
                            </div>
                            <div className="max-w-md space-y-3">
                                <h3 className="text-3xl font-black tracking-tight">Vortex Empty</h3>
                                <p className="text-muted-foreground font-medium text-lg italic">
                                    {searchQuery ? `No artifacts found for "${searchQuery}"` : "The project repository is currently dormant. Initialize your first intelligence forge to begin."}
                                </p>
                            </div>
                            {!searchQuery && (
                                <Button
                                    onClick={openCreateModal}
                                    size="lg"
                                    className="rounded-2xl h-14 px-10 font-black tracking-widest uppercase text-xs shadow-xl shadow-primary/10"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Initialize Repository
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                project={editingProject}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="border-border/40 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 border border-destructive/20">
                            <Trash2 className="h-8 w-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center tracking-tight">Dissolve Project?</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground/80 leading-relaxed font-medium">
                            Are you absolutely sure you want to dissolve this project? This action cannot be undone. All analytical containers, metadata, and connected resources will be permanently erased from the network.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1 rounded-xl h-12 font-bold bg-background shadow-sm hover:bg-muted/50 border-border/50 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProject}
                            className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-destructive/20 hover:shadow-none transition-all"
                        >
                            Dissolve Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
