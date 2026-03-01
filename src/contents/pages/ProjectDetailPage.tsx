"use client";

import React from "react";
import {
    ArrowLeft,
    FileUp,
    Table,
    Code,
    Settings,
    Database,
    Clock,
    ExternalLink,
    Loader2,
    Calendar,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectApi } from "@/services/api";
import { Project } from "@/types/project";
import { useAuth } from "@/context/auth-context";

export function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const projectId = params.id as string;

    const fetchProjectDetails = React.useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const data = await projectApi.getById(projectId);
            setProject(data);
        } catch (err: any) {
            console.error("Failed to fetch project details:", err);
            setError("Could not load project details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchProjectDetails();
        }
    }, [authLoading, isAuthenticated, router, fetchProjectDetails]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
                    <Database className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground max-w-md">{error || "Project not found"}</p>
                <Button onClick={() => router.push("/project")} className="mt-6" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="py-8 px-6 md:px-12 bg-background/50">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation Breadcrumb */}
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-muted-foreground hover:text-primary"
                        onClick={() => router.push("/project")}
                    >
                        Projects
                    </Button>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground font-medium truncate">{project.name}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg bg-primary/10 text-primary"
                                style={{ backgroundColor: `${project.color_code}20` }}
                            >
                                <Database className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {project.name}
                            </h1>
                            <Badge variant={project.status === "archived" ? "secondary" : "outline"} className="capitalize">
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {project.description || "No description provided for this project."}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                Updated {new Date(project.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                            <FileUp className="mr-2 h-4 w-4" />
                            Import Data
                        </Button>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="data" className="w-full">
                    <TabsList className="bg-card w-full justify-start border-b border-border/40 p-0 h-10 gap-6 rounded-none bg-transparent">
                        <TabsTrigger
                            value="data"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-10"
                        >
                            <Table className="mr-2 h-4 w-4" />
                            Data
                        </TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-10"
                        >
                            <Code className="mr-2 h-4 w-4" />
                            Analysis
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 h-10"
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Activity Logs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-border/30 bg-card/40 backdrop-blur-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileUp className="h-5 w-5 text-primary" />
                                            Upload Dataset
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        Import your CSV, Excel, or JSON files to start analyzing.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-2 border-dashed border-border/60 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                                        <div className="p-4 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                                            <FileUp className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Click to upload or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">CSV, XLSX, JSON (Max 50MB)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/30 bg-card/40 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Code className="h-5 w-5 text-primary" />
                                        Raw Data Paste
                                    </CardTitle>
                                    <CardDescription>
                                        Quickly paste CSV data or logs from your clipboard.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        className="w-full h-40 bg-background/50 border border-border/40 rounded-lg p-3 text-sm font-mono focus:ring-1 focus:ring-primary/40 outline-none resize-none placeholder:text-muted-foreground/50"
                                        placeholder="Paste your CSV data here...&#10;header1,header2&#10;data1,data2"
                                    />
                                    <Button className="w-full mt-4 bg-secondary hover:bg-secondary/80">
                                        Process Raw Data
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Datasets</h3>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            placeholder="Search datasets..."
                                            className="pl-9 h-9 w-64 bg-card/40 border border-border/40 rounded-md text-sm focus:ring-1 focus:ring-primary/40 outline-none"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </div>

                            <Card className="border-border/10 bg-card/20 shadow-none py-12">
                                <div className="flex flex-col items-center justify-center text-center space-y-3">
                                    <Table className="h-12 w-12 text-muted-foreground/30" />
                                    <p className="text-muted-foreground font-medium">No datasets found in this project.</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[250px]">Upload a file or paste data above to see your tables here.</p>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-8">
                        <Card className="border-border/30 bg-card/40 backdrop-blur-md py-20">
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 bg-secondary/30 text-muted-foreground/50 rounded-full">
                                    <Code className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Analysis Workspace</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        Import some data first to start generating insights, visualizations, and automated reports.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="logs" className="mt-8">
                        <Card className="border-border/30 bg-card/40 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-lg">Project Activity</CardTitle>
                                <CardDescription>Tracking changes and updates to this project.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                                            {i === 1 && <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border/40" />}
                                            <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center z-10 mt-1">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Project Created</p>
                                                <p className="text-xs text-muted-foreground">March 1, 2026 - 12:00 PM</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
