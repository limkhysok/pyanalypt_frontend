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
import { Badge } from "../../components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
        } catch (error) {
            console.error("Failed to update project:", error);
            throw error;
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await projectApi.delete(id);
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Failed to delete project:", error);
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
        <div className="py-8 px-6 md:px-12 bg-background/50">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Your Projects
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Manage, organize and collaborate on your data science workspace.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-9 bg-card/40 backdrop-blur-md border-border/40 focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={openCreateModal}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Filters/Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {["All Projects", "Recent", "Starred", "Archived"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "whitespace-nowrap transition-all",
                                activeTab === tab ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-secondary/50"
                            )}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* Project Grid */}
                <div className="relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredProjects.map((project, i) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                    >
                                        <Card
                                            onClick={() => router.push(`/project/${project.id}`)}
                                            className="h-full border-border/30 bg-card/30 backdrop-blur-xl hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative cursor-pointer"
                                        >
                                            {project.is_favorite && (
                                                <div className="absolute top-0 right-0 p-1">
                                                    <div className="bg-primary/10 text-primary p-1 rounded-bl-lg">
                                                        <Star className="h-3 w-3 fill-primary" />
                                                    </div>
                                                </div>
                                            )}

                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div
                                                        className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-300 shadow-sm"
                                                        style={{ backgroundColor: `${project.color_code}20` }}
                                                    >
                                                        {getIconForCategory(project.category)}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary/80">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-1">
                                                            <DropdownMenuItem onClick={() => toggleFavorite(project)} className="flex items-center gap-2">
                                                                <Star className={cn("h-4 w-4", project.is_favorite && "fill-primary text-primary")} />
                                                                {project.is_favorite ? "Unstar" : "Star"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(project)} className="flex items-center gap-2">
                                                                <Edit2 className="h-4 w-4" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toggleArchive(project)} className="flex items-center gap-2">
                                                                <Archive className="h-4 w-4" />
                                                                {project.status === "archived" ? "Restore from Archive" : "Move to Archive"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteProject(project.id)}
                                                                className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <CardTitle className="mt-5 text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="mt-2 line-clamp-2 min-h-[40px] text-muted-foreground/80 leading-relaxed">
                                                    {project.description || "No description provided."}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                                                        {project.category}
                                                    </Badge>
                                                    {project.status === "active" && (
                                                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/10">
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {project.status === "archived" && (
                                                        <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/10">
                                                            Archived
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/5 bg-secondary/5 mt-auto py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {formatDate(project.updated_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full animate-pulse"
                                                        style={{ backgroundColor: project.color_code || "#4F46E5" }}
                                                    />
                                                    <span className="font-medium text-[10px] uppercase tracking-wider">
                                                        {project.status || "Active"}
                                                    </span>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="p-6 rounded-full bg-secondary/30 text-muted-foreground/50">
                                <Projector className="h-16 w-16" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <h3 className="text-xl font-semibold">No projects found</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery ? "No projects match your search query." : "You haven't created any projects yet. Start by creating your first one!"}
                                </p>
                            </div>
                            {!searchQuery && (
                                <Button onClick={openCreateModal} variant="outline" className="mt-4 border-dashed border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/50">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Initialize Project
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
        </div>
    );
}
