"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project, CreateProjectRequest } from "@/types/project";
import { cn } from "@/lib/utils";
import { FolderPlus, Pencil, Sparkles } from "lucide-react";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => Promise<void>;
    project?: Project; // If provided, it's an edit
}

export function ProjectModal({ isOpen, onClose, onSubmit, project }: ProjectModalProps) {
    const [name, setName] = React.useState(project?.name || "");
    const [description, setDescription] = React.useState(project?.description || "");
    const [category, setCategory] = React.useState(project?.category || "General");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName(project?.name || "");
            setDescription(project?.description || "");
            setCategory(project?.category || "General");
        }
    }, [isOpen, project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ name, description, category });
            onClose();
        } catch (error) {
            console.error("Failed to submit project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-border/40 bg-background/80 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        <DialogHeader className="space-y-2">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    {project ? <Pencil className="h-5 w-5" /> : <FolderPlus className="h-5 w-5" />}
                                </div>
                                <DialogTitle className="text-2xl font-bold">
                                    {project ? "Project Settings" : "Draft New Project"}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-muted-foreground/80 text-base">
                                {project ? "Update project details and preferences." : "Fill in the details below to initialize your new workspace."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-sm font-medium ml-1">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Q4 Market Analysis"
                                    className="h-12 bg-secondary/30 border-border/40 focus:bg-background transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="description" className="text-sm font-medium ml-1">Description (Optional)</Label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the goals or scope of this project..."
                                    className="w-full min-h-[100px] rounded-md border border-border/40 bg-secondary/30 p-3 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="category" className="text-sm font-medium ml-1">Category</Label>
                                <div className="relative">
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g. Sales, ML Model, Research"
                                        className="h-12 bg-secondary/30 border-border/40 focus:bg-background transition-all pl-10"
                                    />
                                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-secondary/20 p-6 flex flex-row items-center justify-end gap-3 border-t border-border/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="hover:bg-secondary/50 font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-8 h-11 font-semibold transition-all hover:scale-105 active:scale-95"
                        >
                            {isSubmitting ? "Syncing..." : project ? "Save Changes" : "Initialize Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
