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
    Filter,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    Info,
    PieChart,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { projectApi } from "@/services/api";
import { Project, DatasetPreview } from "@/types/project";
import { useAuth } from "@/context/auth-context";

export function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Dataset State
    const [rawData, setRawData] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedDatasetId, setSelectedDatasetId] = React.useState<number | string | null>(null);
    const [previewData, setPreviewData] = React.useState<DatasetPreview | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [rowCount, setRowCount] = React.useState<number>(10);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !projectId) return;

        setIsProcessing(true);
        try {
            await projectApi.uploadDataset({
                project: projectId,
                file: file
            });
            // Reset and refresh
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Dataset uploaded successfully!");
            fetchProjectDetails();
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Failed to upload dataset.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRawDataPaste = async () => {
        if (!rawData.trim() || !projectId) return;

        setIsProcessing(true);
        try {
            await projectApi.pasteDataset({
                project: projectId,
                raw_data: rawData,
                name: `Manual Entry ${new Date().toLocaleTimeString()}`,
                format: "csv"
            });
            setRawData("");
            toast.success("Data processed successfully!");
            fetchProjectDetails();
        } catch (err) {
            console.error("Paste failed:", err);
            toast.error("Failed to process raw data.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteDataset = async (datasetId: number | string) => {
        if (!confirm("Are you sure you want to delete this dataset?")) return;

        try {
            await projectApi.deleteDataset(datasetId);
            toast.success("Dataset deleted successfully!");
            if (selectedDatasetId === datasetId) {
                setSelectedDatasetId(null);
                setPreviewData(null);
            }
            fetchProjectDetails();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete dataset.");
        }
    };

    const handleViewPreview = async (datasetId: number | string, limit: number = rowCount) => {
        setSelectedDatasetId(datasetId);
        setIsPreviewLoading(true);
        try {
            const data = await projectApi.getDatasetPreview(datasetId, limit);
            setPreviewData(data);
        } catch (err) {
            console.error("Failed to fetch preview:", err);
            toast.error("Failed to load data preview.");
            setPreviewData(null);
        } finally {
            setIsPreviewLoading(false);
        }
    };

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
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv, .xlsx, .xls, .json"
                        />
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
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
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border/60 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="p-4 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                                            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <FileUp className="h-8 w-8" />}
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
                                        value={rawData}
                                        onChange={(e) => setRawData(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    <Button
                                        className="w-full mt-4 bg-secondary hover:bg-secondary/80"
                                        onClick={handleRawDataPaste}
                                        disabled={isProcessing || !rawData.trim()}
                                    >
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
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

                            <Card className="border-border/10 bg-card/20 shadow-none overflow-hidden">
                                {project.datasets && project.datasets.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-secondary/30 text-muted-foreground font-medium">
                                                <tr>
                                                    <th className="px-6 py-4">Name</th>
                                                    <th className="px-6 py-4">Format</th>
                                                    <th className="px-6 py-4">Rows</th>
                                                    <th className="px-6 py-4">Cols</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/10">
                                                {project.datasets.map((ds) => (
                                                    <tr key={ds.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                                                            {ds.name}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                                {ds.file_format || "csv"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">
                                                            {ds.row_count?.toLocaleString() || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">
                                                            {ds.column_count?.toLocaleString() || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteDataset(ds.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                                        <Table className="h-12 w-12 text-muted-foreground/30" />
                                        <p className="text-muted-foreground font-medium">No datasets found in this project.</p>
                                        <p className="text-xs text-muted-foreground/60 max-w-[250px]">Upload a file or paste data above to see your tables here.</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Dataframe Preview Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Table className="h-5 w-5 text-primary" />
                                    Dataframe Preview
                                </h3>
                                <div className="flex items-center gap-3">
                                    {/* Dataset Selector Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-card/40 border-border/40 min-w-[180px] justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <span className="truncate">
                                                        {selectedDatasetId ? (project.datasets?.find(d => d.id === selectedDatasetId)?.name) : "Select Dataset"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
                                            {project.datasets && project.datasets.length > 0 ? (
                                                project.datasets.map((ds) => (
                                                    <DropdownMenuItem
                                                        key={ds.id}
                                                        onClick={() => handleViewPreview(ds.id, rowCount)}
                                                        className={cn("cursor-pointer", selectedDatasetId === ds.id && "bg-primary/10 text-primary")}
                                                    >
                                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                                        <span className="truncate">{ds.name}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            ) : (
                                                <div className="px-2 py-4 text-center text-xs text-muted-foreground">No datasets available</div>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Row Count Selector Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-card/40 border-border/40 w-24 justify-between">
                                                <span>{rowCount} rows</span>
                                                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-24">
                                            {[10, 50, 100, 999].map((count) => (
                                                <DropdownMenuItem
                                                    key={count}
                                                    onClick={() => {
                                                        setRowCount(count);
                                                        if (selectedDatasetId) handleViewPreview(selectedDatasetId, count);
                                                    }}
                                                    className={cn("cursor-pointer justify-center", rowCount === count && "bg-primary/10 text-primary")}
                                                >
                                                    {count}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <Card className="border-border/10 bg-card/20 shadow-none overflow-hidden min-h-[300px] relative">
                                {isPreviewLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-10">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                ) : null}

                                {previewData ? (
                                    <div className="space-y-4 p-1">
                                        <div className="overflow-x-auto rounded-md border border-border/10">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-secondary/50 text-muted-foreground uppercase font-semibold">
                                                    <tr>
                                                        {previewData?.columns?.map((col) => (
                                                            <th key={col} className="px-4 py-3 border-r border-border/10 last:border-0">
                                                                {col}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/10">
                                                    {previewData?.rows?.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                                            {previewData.columns.map((col) => (
                                                                <td key={col} className="px-4 py-3 whitespace-nowrap border-r border-border/10 last:border-0">
                                                                    {String(row[col] ?? "")}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-4 py-2 text-[10px] text-muted-foreground flex justify-between items-center bg-secondary/10 rounded-md">
                                            <div className="flex items-center gap-4">
                                                <span>Showing first {rowCount} rows</span>
                                                {previewData.metadata?.shape && (
                                                    <span className="opacity-60 italic">
                                                        Shape: ({previewData.metadata.shape[0]}, {previewData.metadata.shape[1]})
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-medium">Total Rows: {previewData.metadata?.shape?.[0] || previewData.total_rows_hint}</span>
                                        </div>

                                        {/* Analyst Insights: Metadata & Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                            {/* Metadata / Data Types */}
                                            {previewData.metadata?.dtypes && (
                                                <div className="bg-card border-2 border-primary/10 rounded-xl p-5 space-y-4 shadow-sm">
                                                    <div className="flex items-center gap-3 text-base font-bold text-foreground border-b border-border/10 pb-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <Info className="h-5 w-5 text-primary" />
                                                        </div>
                                                        Column Schema (Data Types)
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {Object.entries(previewData.metadata.dtypes).map(([col, type]) => (
                                                            <div key={col} className="flex flex-col p-3 bg-secondary/20 rounded-lg border border-border/40 hover:border-primary/30 transition-colors">
                                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 truncate" title={col}>
                                                                    {col}
                                                                </span>
                                                                <span className="font-mono text-sm font-bold text-foreground">
                                                                    {String(type)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary Statistics */}
                                            {previewData.summary && Object.keys(previewData.summary).length > 0 && (
                                                <div className="bg-card border-2 border-primary/10 rounded-xl p-5 space-y-4 shadow-sm">
                                                    <div className="flex items-center gap-3 text-base font-bold text-foreground border-b border-border/10 pb-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <BarChart3 className="h-5 w-5 text-primary" />
                                                        </div>
                                                        Descriptive Statistics Summary
                                                    </div>
                                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {Object.entries(previewData.summary).map(([col, stats]) => (
                                                            <div key={col} className="overflow-hidden rounded-lg border border-border/40 bg-secondary/5">
                                                                <div className="bg-secondary/30 px-3 py-2 text-xs font-bold text-foreground border-b border-border/20 truncate">
                                                                    {col}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-px bg-border/20">
                                                                    {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                        <div key={stat} className="flex justify-between items-center bg-card p-2 text-xs">
                                                                            <span className="text-muted-foreground capitalize">{stat}</span>
                                                                            <span className="font-bold text-foreground">
                                                                                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : String(val)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                                        <div className="p-4 bg-secondary/20 rounded-full">
                                            <Table className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Select a dataset to view its dataframe preview.</p>
                                    </div>
                                )}
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
