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
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

const mockProjects = [
    {
        id: "1",
        name: "E-commerce Sales Analysis",
        description: "Analyzing seasonal trends and customer purchasing behavior for Q4 2025.",
        lastModified: "2 hours ago",
        type: "Analysis",
        language: "Python",
        stars: 12,
        status: "Active"
    },
    {
        id: "2",
        name: "Predictive Maintenance Model",
        description: "ML model to predict equipment failure based on sensor telemetry data.",
        lastModified: "Yesterday",
        type: "Model",
        language: "Python",
        stars: 8,
        status: "Completed"
    },
    {
        id: "3",
        name: "Global Weather Patterns",
        description: "Visualizing historical weather data to identify long-term climate shifts.",
        lastModified: "3 days ago",
        type: "Visualization",
        language: "R",
        stars: 5,
        status: "Draft"
    },
    {
        id: "4",
        name: "Stock Market Sentiment",
        description: "NLP analysis of financial news to predict short-term stock movements.",
        lastModified: "1 week ago",
        type: "Research",
        language: "Python/SQL",
        stars: 24,
        status: "Active"
    }
];

export function ProjectPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage, organize and collaborate on your data science projects.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search projects..." className="pl-9 bg-card/50" />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Filters/Tabs (Simple for now) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {["All Projects", "Recent", "Starred", "Archived"].map((tab, i) => (
                        <Button
                            key={tab}
                            variant={i === 0 ? "secondary" : "ghost"}
                            size="sm"
                            className="whitespace-nowrap"
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {project.type === "Analysis" && <Layers className="h-5 w-5" />}
                                            {project.type === "Model" && <Code className="h-5 w-5" />}
                                            {project.type === "Visualization" && <Database className="h-5 w-5" />}
                                            {project.type === "Research" && <Search className="h-5 w-5" />}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Pin Project</DropdownMenuItem>
                                                <DropdownMenuItem>Rename</DropdownMenuItem>
                                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardTitle className="mt-4 line-clamp-1">{project.name}</CardTitle>
                                    <CardDescription className="mt-2 line-clamp-2 min-h-[40px]">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {project.language}
                                        </Badge>
                                        <Badge variant="outline" className="bg-secondary/50">
                                            {project.type}
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border/10 mt-auto py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {project.lastModified}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            {project.stars}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1.5`}>
                                        <span className={`h-2 w-2 rounded-full ${project.status === 'Active' ? 'bg-emerald-500' :
                                            project.status === 'Completed' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`} />
                                        {project.status}
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
