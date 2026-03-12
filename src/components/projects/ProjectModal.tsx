"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project, CreateProjectRequest } from "@/types/project";
import { cn } from "@/lib/utils";
import {
    FolderPlus,
    Pencil,
    Loader2,
    AlignLeft,
    Tag,
    Type,
    X,
} from "lucide-react";

const CATEGORY_PRESETS = [
    "General",
    "Sales",
    "Research",
    "ML Model",
    "Finance",
    "Marketing",
    "Operations",
];

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => Promise<void>;
    project?: Project;
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

    const isEdit = !!project;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-2xl gap-0">

                {/* Top glow accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

                <form onSubmit={handleSubmit} className="flex flex-col">

                    {/* Header */}
                    <DialogHeader className="relative px-8 pt-8 pb-6 border-b border-border/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
                        {/* Background glow blob */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-2xl border shadow-lg",
                                    isEdit
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                        : "bg-primary/10 border-primary/20 text-primary"
                                )}>
                                    {isEdit
                                        ? <Pencil className="h-5 w-5" />
                                        : <FolderPlus className="h-5 w-5" />
                                    }
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border",
                                            isEdit
                                                ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                                                : "text-primary bg-primary/10 border-primary/20"
                                        )}>
                                            {isEdit ? "Edit Mode" : "New Project"}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-xl font-black tracking-tight">
                                        {isEdit ? "Project Settings" : "Create a New Project"}
                                    </DialogTitle>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all mt-0.5 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <DialogDescription className="relative text-muted-foreground/60 text-sm font-medium mt-1 ml-[60px]">
                            {isEdit
                                ? "Update your project details and preferences."
                                : "Fill in the details below to initialize your analytical workspace."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form Body */}
                    <div className="px-8 py-7 space-y-6">

                        {/* Project Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                                <Type className="h-3 w-3" />
                                Project Name
                                <span className="text-destructive ml-0.5">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Q4 Market Analysis"
                                className="h-11 bg-muted/30 border-border/50 focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl font-medium placeholder:text-muted-foreground/30 text-sm"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                                <AlignLeft className="h-3 w-3" />
                                Description
                                <span className="text-muted-foreground/30 font-medium normal-case tracking-normal text-[10px]">— optional</span>
                            </Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the goals or scope of this project..."
                                rows={3}
                                className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/30 focus:bg-background focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
                                <Tag className="h-3 w-3" />
                                Category
                            </Label>

                            {/* Quick Chips */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setCategory(preset)}
                                        className={cn(
                                            "h-7 px-3.5 rounded-full text-[11px] font-bold border transition-all",
                                            category === preset
                                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                                : "bg-muted/30 text-muted-foreground/60 border-border/40 hover:border-primary/30 hover:text-foreground hover:bg-muted/60"
                                        )}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            {/* Custom input */}
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Or type a custom category…"
                                className="h-9 bg-muted/20 border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-xs font-medium placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-border/20 bg-muted/10 flex items-center justify-between gap-3">
                        <p className="text-[10px] text-muted-foreground/40 font-medium">
                            {isEdit ? `Editing: ${project?.name}` : "Fields marked * are required"}
                        </p>
                        <div className="flex items-center gap-2.5">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="h-9 px-5 text-xs font-bold hover:bg-muted/50 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !name.trim()}
                                className="h-9 px-6 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                        Saving…
                                    </>
                                ) : isEdit ? (
                                    "Save Changes"
                                ) : (
                                    "Create Project"
                                )}
                            </Button>
                        </div>
                    </div>

                </form>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            </DialogContent>
        </Dialog>
    );
}
