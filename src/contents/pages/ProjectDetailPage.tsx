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
    AlertCircle,
    CheckCircle2,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    Info,
    PieChart,
    BarChart3,
    Columns,
    Settings2,
    Wand2,
    Eraser,
    X,
    Plus,
    RefreshCw,
    Scissors,
    Edit3,
    Hash,
    Type,
    Sliders,
    Target,
    CaseLower,
    Variable,
    Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { projectApi } from "@/services/api";
import { Project, DatasetPreview, DatasetAnalysis } from "@/types/project";
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
    const [cleanedPreviewData, setCleanedPreviewData] = React.useState<DatasetPreview | null>(null);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [isCleaningOpen, setIsCleaningOpen] = React.useState(false);
    const [rowCount, setRowCount] = React.useState<number>(10);
    const [analysisResult, setAnalysisResult] = React.useState<DatasetAnalysis | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = React.useState(false);

    // Cleaning Workbench State
    const [cleaningNACol, setCleaningNACol] = React.useState<string>("all");
    const [cleaningNAStrategy, setCleaningNAStrategy] = React.useState<string>("fill_mean");
    const [isDeduplicationEnabled, setIsDeduplicationEnabled] = React.useState(false);
    const [castingCol, setCastingCol] = React.useState<string>("");
    const [castingType, setCastingType] = React.useState<string>("integer");
    const [isCleaningActive, setIsCleaningActive] = React.useState(false);

    // Advanced Cleaning State
    const [dropCols, setDropCols] = React.useState<string[]>([]);
    const [renameMapping, setRenameMapping] = React.useState<Record<string, string>>({});
    const [trimCols, setTrimCols] = React.useState<string>("none"); // none, all, or specific
    const [caseCols, setCaseCols] = React.useState<string[]>([]);
    const [caseType, setCaseType] = React.useState<string>("lower");
    const [replaceCol, setReplaceCol] = React.useState<string>("");
    const [replaceOld, setReplaceOld] = React.useState<string>("");
    const [replaceNew, setReplaceNew] = React.useState<string>("");
    const [outlierCols, setOutlierCols] = React.useState<string[]>([]);
    const [outlierLower, setOutlierLower] = React.useState<number>(0.05);
    const [outlierUpper, setOutlierUpper] = React.useState<number>(0.95);
    const [roundCols, setRoundCols] = React.useState<string[]>([]);
    const [roundDecimals, setRoundDecimals] = React.useState<number>(2);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const workbenchRef = React.useRef<HTMLDivElement>(null);

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

    const handleAnalyzeDataset = async (datasetId: number | string) => {
        setIsAnalysisLoading(true);
        try {
            const data = await projectApi.analyzeDataset(datasetId);
            setAnalysisResult(data);
        } catch (err) {
            console.error("Analysis failed:", err);
            // Don't toast error here as it might be secondary to preview
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleViewPreview = async (datasetId: number | string, limit: number = rowCount) => {
        setSelectedDatasetId(datasetId);
        setIsPreviewLoading(true);
        setCleanedPreviewData(null); // Reset result when viewing new dataset
        setAnalysisResult(null); // Reset analysis when viewing new dataset
        try {
            const data = await projectApi.getDatasetPreview(datasetId, limit);
            setPreviewData(data);
            // If it's a new dataset or columns haven't been set, initialize visible columns
            if (data.columns) {
                setVisibleColumns(data.columns);
                if (!castingCol && data.columns.length > 0) setCastingCol(data.columns[0]);
            }
            // Fetch smart insights
            handleAnalyzeDataset(datasetId);
        } catch (err) {
            console.error("Failed to fetch preview:", err);
            toast.error("Failed to load data preview.");
            setPreviewData(null);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleRunCleanup = async () => {
        if (!selectedDatasetId) return;

        setIsCleaningActive(true);
        const pipeline = [];

        // 1. Missing Values
        if (cleaningNAStrategy) {
            pipeline.push({
                operation: "handle_na",
                params: {
                    columns: cleaningNACol === "all" ? "all" : [cleaningNACol],
                    strategy: cleaningNAStrategy
                }
            });
        }

        // 2. Deduplication
        if (isDeduplicationEnabled) {
            pipeline.push({
                operation: "drop_duplicates",
                params: { columns: "all" }
            });
        }

        // 3. Type Casting
        if (castingCol && castingType) {
            pipeline.push({
                operation: "astype",
                params: {
                    column: castingCol,
                    target_type: castingType
                }
            });
        }

        // 4. Drop Columns
        if (dropCols.length > 0) {
            pipeline.push({
                operation: "drop_columns",
                params: { columns: dropCols }
            });
        }

        // 5. Rename Columns
        if (Object.keys(renameMapping).length > 0) {
            pipeline.push({
                operation: "rename_columns",
                params: { mapping: renameMapping }
            });
        }

        // 6. Trim Strings
        if (trimCols !== "none") {
            pipeline.push({
                operation: "trim_strings",
                params: { columns: trimCols === "all" ? "all" : [trimCols] }
            });
        }

        // 7. Case Convert
        if (caseCols.length > 0) {
            pipeline.push({
                operation: "case_convert",
                params: { columns: caseCols, case: caseType }
            });
        }

        // 8. Replace Value
        if (replaceCol && (replaceOld !== "" || replaceNew !== "")) {
            pipeline.push({
                operation: "replace_value",
                params: {
                    column: replaceCol,
                    old_value: replaceOld,
                    new_value: replaceNew
                }
            });
        }

        // 9. Outlier Clip
        if (outlierCols.length > 0) {
            pipeline.push({
                operation: "outlier_clip",
                params: {
                    columns: outlierCols,
                    lower_quantile: outlierLower,
                    upper_quantile: outlierUpper
                }
            });
        }

        // 10. Round Numeric
        if (roundCols.length > 0) {
            pipeline.push({
                operation: "round_numeric",
                params: {
                    columns: roundCols,
                    decimals: roundDecimals
                }
            });
        }

        if (pipeline.length === 0) {
            toast.error("Please configure at least one cleaning operation.");
            setIsCleaningActive(false);
            return;
        }

        try {
            const response = await projectApi.cleanDataset(selectedDatasetId, { pipeline });
            toast.success("Cleanup pipeline executed successfully!");

            // The response returns a new cleaned dataset preview
            setCleanedPreviewData(response);

            // If the response contains the new dataset_id, we should refresh the project to see it in the list
            if (response.dataset_id) {
                fetchProjectDetails();
            }

            // Reset complex states that depend on specific columns as they might have changed
            setDropCols([]);
            setRenameMapping({});
            setCaseCols([]);
            setOutlierCols([]);
            setRoundCols([]);
        } catch (err: any) {
            console.error("Cleaning failed:", err);
            toast.error(err.response?.data?.message || "Cleaning operation failed.");
        } finally {
            setIsCleaningActive(false);
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
                                    {/* Column Selector Dropdown */}
                                    {previewData && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="bg-card/40 border-border/40 min-w-[140px] justify-between">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Columns className="h-3.5 w-3.5 text-primary shrink-0" />
                                                        <span className="truncate">Columns ({visibleColumns.length})</span>
                                                    </div>
                                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px] max-h-[400px] overflow-y-auto">
                                                <DropdownMenuLabel>Select Columns</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {previewData.columns.map((col) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={col}
                                                        checked={visibleColumns.includes(col)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setVisibleColumns([...visibleColumns, col]);
                                                            } else {
                                                                setVisibleColumns(visibleColumns.filter(c => c !== col));
                                                            }
                                                        }}
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        {col}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}

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
                                                        {previewData?.columns?.filter(c => visibleColumns.includes(c)).map((col) => (
                                                            <th key={col} className="px-4 py-3 border-r border-border/10 last:border-0">
                                                                {col}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/10">
                                                    {previewData?.rows?.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                                            {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
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

                            {/* Data Clean Workbench (EDA) - Positioned under Preview */}
                            {previewData && (
                                <div
                                    className="mt-8 space-y-4"
                                    ref={workbenchRef}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Wand2 className="h-5 w-5 text-primary" />
                                            Data Clean Workbench (EDA)
                                        </h3>
                                        <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                            10 Power Operations
                                        </Badge>
                                    </div>

                                    <Card className="border-border/30 bg-card/40 backdrop-blur-md overflow-hidden">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-y lg:divide-y-0 divide-border/10">
                                            {/* Column 1: Core Operations */}
                                            <div className="p-6 space-y-10">
                                                {/* 1. Missing Values */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <AlertCircle className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">1. Missing Values (NA)</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Columns</Label>
                                                            <select
                                                                value={cleaningNACol}
                                                                onChange={(e) => setCleaningNACol(e.target.value)}
                                                                className="w-full bg-secondary/20 border border-border/20 rounded-md h-9 text-xs px-2 outline-none focus:ring-1 focus:ring-primary/40"
                                                            >
                                                                <option value="all">All Columns</option>
                                                                {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Action Strategy</Label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[
                                                                    { id: "drop", label: "Drop Rows" },
                                                                    { id: "fill_zero", label: "Fill Zero" },
                                                                    { id: "fill_mean", label: "Fill Mean" },
                                                                    { id: "fill_median", label: "Fill Median" }
                                                                ].map(strategy => (
                                                                    <Button
                                                                        key={strategy.id}
                                                                        variant={cleaningNAStrategy === strategy.id ? "secondary" : "outline"}
                                                                        size="sm"
                                                                        className={cn(
                                                                            "text-[10px] h-8 justify-start font-medium",
                                                                            cleaningNAStrategy === strategy.id && "ring-1 ring-primary/40"
                                                                        )}
                                                                        onClick={() => setCleaningNAStrategy(strategy.id)}
                                                                    >
                                                                        {strategy.label}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Deduplication */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <RefreshCw className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">2. Deduplication</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <Button
                                                            variant={isDeduplicationEnabled ? "secondary" : "outline"}
                                                            className={cn(
                                                                "w-full h-10 gap-2 border-dashed transition-all text-xs",
                                                                isDeduplicationEnabled ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40"
                                                            )}
                                                            onClick={() => setIsDeduplicationEnabled(!isDeduplicationEnabled)}
                                                        >
                                                            {isDeduplicationEnabled ? "Deduplication Enabled" : "Enable Deduplication Scan"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* 3. Type Casting */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Variable className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">3. Type Casting</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-muted-foreground">Target Col</Label>
                                                                <select
                                                                    value={castingCol}
                                                                    onChange={(e) => setCastingCol(e.target.value)}
                                                                    className="w-full bg-secondary/20 border border-border/20 rounded-md h-8 text-[10px] px-1"
                                                                >
                                                                    {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-muted-foreground">To Type</Label>
                                                                <select
                                                                    value={castingType}
                                                                    onChange={(e) => setCastingType(e.target.value)}
                                                                    className="w-full bg-secondary/20 border border-border/20 rounded-md h-8 text-[10px] px-1"
                                                                >
                                                                    {["integer", "float", "string", "datetime"].map(t => <option key={t} value={t}>{t}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Structural & Text */}
                                            <div className="p-6 space-y-10">
                                                {/* 4. Drop Columns */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Trash className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">4. Drop Columns</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {previewData?.columns.map(c => (
                                                                <Badge
                                                                    key={c}
                                                                    variant={dropCols.includes(c) ? "destructive" : "outline"}
                                                                    className="cursor-pointer text-[10px]"
                                                                    onClick={() => {
                                                                        if (dropCols.includes(c)) setDropCols(dropCols.filter(x => x !== c));
                                                                        else setDropCols([...dropCols, c]);
                                                                    }}
                                                                >
                                                                    {dropCols.includes(c) && <X className="h-2.5 w-2.5 mr-1" />}
                                                                    {c}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 5. Rename Columns */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Edit3 className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">5. Rename Columns</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8 max-h-[150px] overflow-y-auto custom-scrollbar">
                                                        {Object.entries(renameMapping).map(([old, newVal]) => (
                                                            <div key={old} className="flex items-center gap-2 mb-2">
                                                                <div className="text-[10px] font-mono bg-secondary/40 px-2 py-1 rounded border border-border/20 w-1/3 truncate">{old}</div>
                                                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                <Input
                                                                    value={newVal}
                                                                    onChange={(e) => setRenameMapping({ ...renameMapping, [old]: e.target.value })}
                                                                    className="h-7 text-[10px] w-1/3"
                                                                />
                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                                                    const next = { ...renameMapping };
                                                                    delete next[old];
                                                                    setRenameMapping(next);
                                                                }}>
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <select
                                                            className="w-full bg-secondary/20 border border-border/20 rounded-md h-8 text-[10px] px-1 outline-none"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setRenameMapping({ ...renameMapping, [e.target.value]: e.target.value });
                                                                    e.target.value = "";
                                                                }
                                                            }}
                                                        >
                                                            <option value="">+ Add Rename Mapping...</option>
                                                            {previewData?.columns.filter(c => !renameMapping[c]).map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* 6. Trim & Strings */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Scissors className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">6. Trim & Case</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <select
                                                            value={trimCols}
                                                            onChange={(e) => setTrimCols(e.target.value)}
                                                            className="w-full bg-secondary/20 border border-border/20 rounded-md h-8 text-[10px] px-1 mb-2"
                                                        >
                                                            <option value="none">Trim: Disabled</option>
                                                            <option value="all">Trim: All Columns</option>
                                                            {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <div className="flex gap-1.5 mb-2">
                                                            {["lower", "upper", "title"].map(t => (
                                                                <Button key={t} size="sm" variant={caseType === t ? "secondary" : "ghost"} className="text-[10px] h-6 px-2 capitalize" onClick={() => setCaseType(t)}>{t}</Button>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                                            {previewData?.columns.map(c => (
                                                                <Badge key={c} variant={caseCols.includes(c) ? "secondary" : "outline"} className="cursor-pointer text-[9px] h-5 px-1.5 font-normal" onClick={() => {
                                                                    if (caseCols.includes(c)) setCaseCols(caseCols.filter(x => x !== c));
                                                                    else setCaseCols([...caseCols, c]);
                                                                }}>{c}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 3: Advanced Values & Math */}
                                            <div className="p-6 space-y-10">
                                                {/* 8. Replace Values */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Target className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">8. Replace Value</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <select value={replaceCol} onChange={(e) => setReplaceCol(e.target.value)} className="w-full bg-secondary/20 border border-border/20 rounded-md h-8 text-[10px] px-1">
                                                            <option value="">Select Column...</option>
                                                            {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input placeholder="Old" className="h-8 text-[10px]" value={replaceOld} onChange={(e) => setReplaceOld(e.target.value)} />
                                                            <Input placeholder="New" className="h-8 text-[10px]" value={replaceNew} onChange={(e) => setReplaceNew(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 9. Outliers */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Sliders className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">9. Outlier Clipping</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <div className="flex gap-2 items-center mb-2">
                                                            <Input type="number" step="0.01" value={outlierLower} onChange={e => setOutlierLower(Number(e.target.value))} className="h-7 w-20 text-[10px]" />
                                                            <span className="text-[10px]">to</span>
                                                            <Input type="number" step="0.01" value={outlierUpper} onChange={e => setOutlierUpper(Number(e.target.value))} className="h-7 w-20 text-[10px]" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {previewData?.columns.map(c => (
                                                                <Badge key={c} variant={outlierCols.includes(c) ? "secondary" : "outline"} className="cursor-pointer text-[9px] h-5" onClick={() => {
                                                                    if (outlierCols.includes(c)) setOutlierCols(outlierCols.filter(x => x !== c));
                                                                    else setOutlierCols([...outlierCols, c]);
                                                                }}>{c}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 10. Rounding */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                                            <Variable className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-bold">10. Round Decimals</h4>
                                                    </div>
                                                    <div className="space-y-3 pl-8">
                                                        <Input type="number" value={roundDecimals} onChange={e => setRoundDecimals(Number(e.target.value))} className="h-8 w-20 text-[10px] mb-2" />
                                                        <div className="flex flex-wrap gap-1">
                                                            {previewData?.columns.map(c => (
                                                                <Badge key={c} variant={roundCols.includes(c) ? "secondary" : "outline"} className="cursor-pointer text-[9px] h-5" onClick={() => {
                                                                    if (roundCols.includes(c)) setRoundCols(roundCols.filter(x => x !== c));
                                                                    else setRoundCols([...roundCols, c]);
                                                                }}>{c}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bottom Bar */}
                                        <div className="p-6 bg-secondary/10 border-t border-border/10 flex items-center justify-between gap-4">
                                            <div className="text-xs text-muted-foreground italic">
                                                Constructed pipeline ready with {[
                                                    cleaningNAStrategy,
                                                    isDeduplicationEnabled,
                                                    castingCol && castingType,
                                                    dropCols.length > 0,
                                                    Object.keys(renameMapping).length > 0,
                                                    trimCols !== "none",
                                                    caseCols.length > 0,
                                                    replaceCol && (replaceOld !== "" || replaceNew !== ""),
                                                    outlierCols.length > 0,
                                                    roundCols.length > 0
                                                ].filter(Boolean).length} operations.
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="ghost"
                                                    className="text-xs h-10 px-6"
                                                    onClick={() => {
                                                        setCleaningNAStrategy("fill_mean");
                                                        setIsDeduplicationEnabled(false);
                                                        setDropCols([]);
                                                        setRenameMapping({});
                                                        setTrimCols("none");
                                                        setCaseCols([]);
                                                        setReplaceCol("");
                                                        setReplaceOld("");
                                                        setReplaceNew("");
                                                        setOutlierCols([]);
                                                        setRoundCols([]);
                                                    }}
                                                >
                                                    Reset Workspace
                                                </Button>
                                                <Button
                                                    className="font-bold h-10 px-8 shadow-lg shadow-primary/20"
                                                    onClick={handleRunCleanup}
                                                    disabled={isCleaningActive || !previewData}
                                                >
                                                    {isCleaningActive ? (
                                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Executing...</>
                                                    ) : (
                                                        "Run Power Cleanup"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Data Cleaning Result Preview Section */}
                            {cleanedPreviewData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-12 space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-full">
                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">Cleaned Data Results</h3>
                                                <p className="text-xs text-muted-foreground italic">Operation successful. Review the results below.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 px-3 py-1 font-bold">
                                                {cleanedPreviewData.name || "Cleaned Result"}
                                            </Badge>
                                            {cleanedPreviewData.dataset_id && (
                                                <Badge className="bg-green-600 text-white border-none text-[9px] h-5">
                                                    Saved as New Dataset
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Card className="border-green-500/20 bg-green-500/[0.03] backdrop-blur-md p-6">
                                        <div className="rounded-xl border border-green-500/10 overflow-hidden bg-card/60 shadow-sm">
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="text-[10px] uppercase bg-green-500/5 text-muted-foreground border-b border-green-500/10">
                                                        <tr>
                                                            {cleanedPreviewData.columns.map(col => (
                                                                <th key={col} className="px-4 py-3 border-r border-green-500/5 last:border-0 font-bold text-green-700/70">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-green-500/5">
                                                        {cleanedPreviewData.rows?.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-green-500/5 transition-colors">
                                                                {cleanedPreviewData.columns.map((col) => (
                                                                    <td key={col} className="px-4 py-3 whitespace-nowrap border-r border-green-500/5 last:border-0 font-mono text-[11px]">
                                                                        {String(row[col] ?? "")}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="px-4 py-2 text-[10px] text-muted-foreground flex justify-between items-center bg-green-500/10">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-green-700">Preview: {cleanedPreviewData.rows?.length || 0} items</span>
                                                    {cleanedPreviewData.metadata?.shape && (
                                                        <span className="opacity-60 italic text-green-600">
                                                            Actual Dataset Shape: ({cleanedPreviewData.metadata.shape[0]}, {cleanedPreviewData.metadata.shape[1]})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-green-700">Total Rows: {cleanedPreviewData.total_rows_hint}</span>
                                            </div>
                                        </div>

                                        {/* Result Insights: Metadata & Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                            {/* Metadata / Data Types */}
                                            {cleanedPreviewData.metadata?.dtypes && (
                                                <div className="bg-card/80 border-2 border-green-500/10 rounded-xl p-5 space-y-4 shadow-sm">
                                                    <div className="flex items-center gap-3 text-base font-bold text-foreground border-b border-green-500/10 pb-3">
                                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                                            <Info className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        New Column Schema
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {Object.entries(cleanedPreviewData.metadata.dtypes).map(([col, type]) => (
                                                            <div key={col} className="flex flex-col p-3 bg-green-500/[0.02] rounded-lg border border-green-500/10 hover:border-green-500/30 transition-colors">
                                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 truncate">
                                                                    {col}
                                                                </span>
                                                                <span className="font-mono text-sm font-bold text-green-700">
                                                                    {String(type)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary Statistics */}
                                            {cleanedPreviewData.summary && Object.keys(cleanedPreviewData.summary).length > 0 && (
                                                <div className="bg-card/80 border-2 border-green-500/10 rounded-xl p-5 space-y-4 shadow-sm">
                                                    <div className="flex items-center gap-3 text-base font-bold text-foreground border-b border-green-500/10 pb-3">
                                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                                            <BarChart3 className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        Statistics Comparison
                                                    </div>
                                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {Object.entries(cleanedPreviewData.summary).map(([col, stats]) => (
                                                            <div key={col} className="overflow-hidden rounded-lg border border-green-500/10 bg-green-500/[0.02]">
                                                                <div className="bg-green-500/5 px-3 py-2 text-xs font-bold text-foreground border-b border-green-500/10 truncate">
                                                                    {col}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-px bg-green-500/10">
                                                                    {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                        <div key={stat} className="flex justify-between items-center bg-card p-2 text-xs">
                                                                            <span className="text-muted-foreground capitalize">{stat}</span>
                                                                            <span className="font-bold text-green-700">
                                                                                {val}
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
                                    </Card>
                                </motion.div>
                            )}
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
