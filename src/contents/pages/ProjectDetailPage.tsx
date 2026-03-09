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
    MoreVertical,
    Layers,
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
    const [activeTab, setActiveTab] = React.useState("data");

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
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto py-8 px-6 md:px-12 space-y-10">
                {/* Unified Header & Navigation */}
                <div className="space-y-6">
                    <nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-muted-foreground/60 hover:text-primary transition-colors"
                            onClick={() => router.push("/project")}
                        >
                            Hub
                        </Button>
                        <ChevronRight className="h-3 w-3 opacity-40" />
                        <span className="text-foreground tracking-normal lowercase first-letter:uppercase font-bold">{project.name}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3.5 rounded-2xl bg-secondary/50 text-primary shadow-inner shrink-0"
                                style={{ borderTop: `4px solid ${project.color_code || "#3b82f6"}` }}
                            >
                                <Database className="h-7 w-7" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                                        {project.name}
                                    </h1>
                                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                                        {project.status || "Active"}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-base max-w-3xl font-medium leading-relaxed">
                                    {project.description || "Describe the analytical objectives and data structures contained within this project workspace."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/60 hover:bg-secondary/50">
                                            <Settings className="h-5 w-5 opacity-60" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Workspace Parameters</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".csv, .xlsx, .xls, .json"
                            />
                            <Button
                                size="lg"
                                className="h-11 px-6 font-bold shadow-sm hover:shadow-md transition-all rounded-xl"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-white" /> : <FileUp className="mr-2.5 h-4 w-4" />}
                                Upload Intelligence
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="data" className="w-full">
                    <TabsList className="w-full flex justify-start items-center border-b border-border/40 bg-transparent h-12 p-0 gap-8 rounded-none">
                        <TabsTrigger
                            value="data"
                            className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-bold transition-all"
                        >
                            <Table className="mr-2 h-4 w-4" />
                            Repository
                        </TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-bold transition-all opacity-60 data-[state=active]:opacity-100"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Insights
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="bg-transparent border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-sm font-bold transition-all opacity-60 data-[state=active]:opacity-100"
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Historian
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="mt-10 space-y-12">
                        {/* Injection Zone */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <Card className="border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors shadow-sm overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FileUp className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">Standard Import</CardTitle>
                                            <CardDescription className="text-xs">Process structured file formats (CSV, Excel).</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border/40 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="p-5 bg-background border rounded-full group-hover:scale-110 group-hover:border-primary/20 transition-all shadow-sm">
                                            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <FileUp className="h-8 w-8 text-muted-foreground group-hover:text-primary" />}
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-sm tracking-tight text-foreground/80">Select Analytic Source</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">Drop local files or browse</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors shadow-sm overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Code className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold">Raw Stream Injection</CardTitle>
                                            <CardDescription className="text-xs">Directly paste text streams or CSV fragments.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <textarea
                                        className="w-full h-[148px] bg-background border border-border/60 rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/30 transition-all"
                                        placeholder="Paste CSV data header strings...&#10;val1,val2,val3"
                                        value={rawData}
                                        onChange={(e) => setRawData(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    <Button
                                        className="w-full h-11 font-bold rounded-lg shadow-sm"
                                        variant="secondary"
                                        onClick={handleRawDataPaste}
                                        disabled={isProcessing || !rawData.trim()}
                                    >
                                        {isProcessing ? <Loader2 className="mr-2.5 h-4 w-4 animate-spin" /> : <Plus className="mr-2.5 h-4 w-4 text-primary" />}
                                        Initialize From Stream
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Inventory Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        Data Asset Inventory
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium">Manage and explore contained analytical datasets.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Search inventory..."
                                            className="pl-9 h-9 w-64 bg-background border-border/60 text-xs shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Card className="border-border/60 shadow-sm overflow-hidden bg-card/10">
                                {project.datasets && project.datasets.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="bg-muted/40 text-muted-foreground font-black uppercase tracking-widest text-[9px] border-b border-border/40">
                                                    <th className="px-6 py-4">Descriptor</th>
                                                    <th className="px-6 py-4">Schema</th>
                                                    <th className="px-6 py-4">Volume</th>
                                                    <th className="px-6 py-4">Dimensions</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {project.datasets.map((ds) => (
                                                    <tr key={ds.id} className="hover:bg-primary/5 transition-colors group cursor-default">
                                                        <td className="px-6 py-5 font-bold text-foreground/80 flex items-center gap-3">
                                                            <div className="p-2 bg-secondary/50 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                                                                <FileSpreadsheet className="h-4 w-4 opacity-70" />
                                                            </div>
                                                            {ds.name}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-secondary/20 border-border/40 text-muted-foreground">
                                                                {ds.file_format || "CSV"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 font-mono text-[10px] text-muted-foreground font-bold">
                                                            {ds.row_count?.toLocaleString() || "0"} <span className="text-[8px] opacity-40">rows</span>
                                                        </td>
                                                        <td className="px-6 py-5 font-mono text-[10px] text-muted-foreground font-bold">
                                                            {ds.column_count?.toLocaleString() || "0"} <span className="text-[8px] opacity-40">cols</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:text-primary"
                                                                    onClick={() => handleViewPreview(ds.id, rowCount)}
                                                                >
                                                                    Analyze
                                                                </Button>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100 transition-opacity">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48">
                                                                        <DropdownMenuItem onClick={() => handleViewPreview(ds.id, rowCount)} className="gap-2">
                                                                            <Eye className="h-4 w-4" /> View Preview
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteDataset(ds.id)}
                                                                            className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" /> Purge Dataset
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-6 bg-muted/30 rounded-full text-muted-foreground/30 shadow-inner">
                                            <Layers className="h-10 w-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-foreground/40">No Data Assets Identified</p>
                                            <p className="text-xs text-muted-foreground/60 max-w-sm font-medium">Initialize the project by importing valid CSV or Excel data streams.</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Dataframe Preview Section */}
                        <div className="space-y-6 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        Dataframe Inspection
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium">Deep dive into the underlying data structures.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Column Selector */}
                                    {previewData && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                                    <Columns className="h-3.5 w-3.5 text-primary" />
                                                    Schema ({visibleColumns.length})
                                                    <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Column Visibility</DropdownMenuLabel>
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
                                                        className="text-xs font-medium py-2"
                                                    >
                                                        {col}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}

                                    {/* Dataset Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                                                <span className="max-w-[120px] truncate">
                                                    {selectedDatasetId ? (project.datasets?.find(d => d.id === selectedDatasetId)?.name) : "Source"}
                                                </span>
                                                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 max-h-[300px] overflow-y-auto">
                                            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Select Active Source</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {project.datasets && project.datasets.length > 0 ? (
                                                project.datasets.map((ds) => (
                                                    <DropdownMenuItem
                                                        key={ds.id}
                                                        onClick={() => handleViewPreview(ds.id, rowCount)}
                                                        className={cn("text-xs font-medium py-2.5 gap-3", selectedDatasetId === ds.id && "bg-primary/5 text-primary")}
                                                    >
                                                        <FileSpreadsheet className="h-4 w-4 opacity-40" />
                                                        <span className="truncate flex-1">{ds.name}</span>
                                                        {selectedDatasetId === ds.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                                    </DropdownMenuItem>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">Repository is currently empty.</div>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Rows Selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-9 w-24 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2 justify-between">
                                                <span>{rowCount} items</span>
                                                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-24">
                                            {[10, 25, 50, 100].map((count) => (
                                                <DropdownMenuItem
                                                    key={count}
                                                    onClick={() => {
                                                        setRowCount(count);
                                                        if (selectedDatasetId) handleViewPreview(selectedDatasetId, count);
                                                    }}
                                                    className={cn("text-xs font-medium py-2 justify-center", rowCount === count && "bg-primary/5 text-primary")}
                                                >
                                                    {count}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <Card className="border-border/60 shadow-sm overflow-hidden bg-background/50 relative min-h-[400px]">
                                {isPreviewLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-50 transition-all">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                            <p className="text-[10px] uppercase font-black tracking-widest text-primary animate-pulse">Scanning Vectors</p>
                                        </div>
                                    </div>
                                )}

                                {previewData ? (
                                    <div className="space-y-0">
                                        <div className="overflow-x-auto max-h-[600px] border-b border-border/40 custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-muted/60 backdrop-blur-md border-b border-border/60 shadow-sm">
                                                        {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                            <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 border-r border-border/20 last:border-0 min-w-[150px]">
                                                                <div className="flex items-center justify-between">
                                                                    {col}
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {previewData.rows?.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                            {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                                <td key={col} className="px-6 py-3.5 whitespace-nowrap border-r border-border/20 last:border-0 font-mono text-[11px] text-foreground/70 group-hover:text-foreground">
                                                                    {String(row[col] ?? "")}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-6 py-3 text-[10px] font-bold text-muted-foreground flex justify-between items-center bg-muted/20">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground/40">Visible Range:</span>
                                                    <span className="text-primary">{previewData.rows?.length || 0} items</span>
                                                </div>
                                                {previewData.metadata?.shape && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-foreground/40">Geometric Shape:</span>
                                                        <span className="text-foreground/60">{previewData.metadata.shape[0]} × {previewData.metadata.shape[1]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-foreground/40 text-[9px]">TOTAL ESTIMATED VOLUME:</span>
                                                <span className="text-foreground/80 px-2 py-0.5 bg-background border border-border/60 rounded uppercase tracking-tighter shadow-sm">{previewData.total_rows_hint.toLocaleString()} ROWS</span>
                                            </div>
                                        </div>

                                        {/* Statistical Snapshots */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 border-t border-border/40">
                                            {/* Data Types */}
                                            {previewData.metadata?.dtypes && (
                                                <div className="p-8 space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <Info className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-base font-black tracking-tight">Active Schema types</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {Object.entries(previewData.metadata.dtypes).map(([col, type]) => (
                                                            <div key={col} className="p-3 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all group">
                                                                <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1 truncate" title={col}>{col}</p>
                                                                <p className="font-mono text-[11px] font-bold text-primary group-hover:scale-105 transition-transform origin-left">{String(type)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Descriptive Summary */}
                                            {previewData.summary && Object.keys(previewData.summary).length > 0 && (
                                                <div className="p-8 space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <BarChart3 className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-base font-black tracking-tight">Analytical Snapshots</h4>
                                                    </div>
                                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {Object.entries(previewData.summary).map(([col, stats]) => (
                                                            <div key={col} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10">
                                                                <div className="bg-muted/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 border-b border-border/40 truncate">
                                                                    {col}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-px bg-border/20">
                                                                    {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                        <div key={stat} className="flex justify-between items-center bg-background p-3 text-[11px] font-medium">
                                                                            <span className="text-muted-foreground/60 capitalize">{stat}</span>
                                                                            <span className="font-mono font-bold text-foreground/80">
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
                                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                                        <div className="p-8 bg-muted/40 rounded-full text-muted-foreground shadow-inner">
                                            <Table className="h-12 w-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-black tracking-tight">Awaiting Source Selection</p>
                                            <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Select a valid dataset from the repository above to initialize the visual inspection workspace.</p>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Data Clean Workbench (EDA) */}
                            {previewData && (
                                <div className="space-y-6 pt-16" ref={workbenchRef}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                <Wand2 className="h-6 w-6 text-primary" />
                                                Data Transformation Engine
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Architectural Cleaning Workspace</p>
                                        </div>
                                        <Badge variant="secondary" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase">
                                            12 Active Operations
                                        </Badge>
                                    </div>

                                    <Card className="border-border/60 bg-muted/20 backdrop-blur-md overflow-hidden shadow-xl rounded-3xl">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-border/40">
                                            {/* Tier 1: Core Integrity */}
                                            <div className="p-8 space-y-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <AlertCircle className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Null Management</h4>
                                                    </div>
                                                    <div className="space-y-4 pl-1">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Target Dimensions</Label>
                                                            <select
                                                                value={cleaningNACol}
                                                                onChange={(e) => setCleaningNACol(e.target.value)}
                                                                className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                                            >
                                                                <option value="all">Global Workspace (All)</option>
                                                                {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Execution Strategy</Label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[
                                                                    { id: "drop", label: "Purge Rows" },
                                                                    { id: "fill_zero", label: "Zero Fill" },
                                                                    { id: "fill_mean", label: "Mean Imp" },
                                                                    { id: "fill_median", label: "Median Imp" }
                                                                ].map(strategy => (
                                                                    <Button
                                                                        key={strategy.id}
                                                                        variant={cleaningNAStrategy === strategy.id ? "default" : "secondary"}
                                                                        size="sm"
                                                                        className={cn(
                                                                            "text-[10px] h-9 font-bold rounded-lg shadow-sm transition-all",
                                                                            cleaningNAStrategy === strategy.id ? "bg-primary text-white" : "hover:bg-primary/5"
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

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <RefreshCw className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Deduplication</h4>
                                                    </div>
                                                    <Button
                                                        variant={isDeduplicationEnabled ? "default" : "secondary"}
                                                        className={cn(
                                                            "w-full h-12 gap-3 transition-all text-xs font-black tracking-widest uppercase rounded-xl",
                                                            isDeduplicationEnabled ? "bg-primary/90" : "bg-background/40 hover:bg-primary/5"
                                                        )}
                                                        onClick={() => setIsDeduplicationEnabled(!isDeduplicationEnabled)}
                                                    >
                                                        {isDeduplicationEnabled ? "active_scan_enabled" : "initialize_scan"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Tier 2: Vector Schema */}
                                            <div className="p-8 space-y-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <Type className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Type Casting</h4>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground/60">Source</Label>
                                                            <select
                                                                value={castingCol}
                                                                onChange={(e) => setCastingCol(e.target.value)}
                                                                className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-3 font-bold outline-none"
                                                            >
                                                                {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black tracking-widest text-muted-foreground/60">Target</Label>
                                                            <select
                                                                value={castingType}
                                                                onChange={(e) => setCastingType(e.target.value)}
                                                                className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-3 font-bold outline-none"
                                                            >
                                                                {["integer", "float", "string", "datetime"].map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <Trash className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Dimension Purge</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {previewData.columns.map(c => (
                                                            <Badge
                                                                key={c}
                                                                variant={dropCols.includes(c) ? "destructive" : "outline"}
                                                                className="cursor-pointer text-[10px] font-bold h-7 px-3 rounded-lg transition-all"
                                                                onClick={() => {
                                                                    if (dropCols.includes(c)) setDropCols(dropCols.filter(x => x !== c));
                                                                    else setDropCols([...dropCols, c]);
                                                                }}
                                                            >
                                                                {c}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tier 3: Value Dynamics */}
                                            <div className="p-8 space-y-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <Target className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Value Mapping</h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <select value={replaceCol} onChange={(e) => setReplaceCol(e.target.value)} className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-4 font-bold outline-none">
                                                            <option value="">Select Reference Column...</option>
                                                            {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Input placeholder="Search" className="h-11 rounded-xl text-xs font-bold" value={replaceOld} onChange={(e) => setReplaceOld(e.target.value)} />
                                                            <Input placeholder="Replace" className="h-11 rounded-xl text-xs font-bold" value={replaceNew} onChange={(e) => setReplaceNew(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                                            <Sliders className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <h4 className="text-sm font-black tracking-widest uppercase">Outlier Clamping</h4>
                                                    </div>
                                                    <div className="flex items-center gap-3 mb-4 bg-background/40 p-3 rounded-xl border border-border/40">
                                                        <Input type="number" step="0.01" value={outlierLower} onChange={e => setOutlierLower(Number(e.target.value))} className="h-8 w-20 text-[10px] font-black text-center" />
                                                        <span className="text-[10px] font-black text-muted-foreground">⇄</span>
                                                        <Input type="number" step="0.01" value={outlierUpper} onChange={e => setOutlierUpper(Number(e.target.value))} className="h-8 w-20 text-[10px] font-black text-center" />
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {previewData.columns.map(c => (
                                                            <Badge key={c} variant={outlierCols.includes(c) ? "default" : "outline"} className="cursor-pointer text-[10px] font-bold h-7 px-3 rounded-lg" onClick={() => {
                                                                if (outlierCols.includes(c)) setOutlierCols(outlierCols.filter(x => x !== c));
                                                                else setOutlierCols([...outlierCols, c]);
                                                            }}>{c}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Command Center Bottom Bar */}
                                        <div className="p-8 bg-muted/40 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="space-y-1 text-center md:text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Pipeline manifest</p>
                                                <p className="text-sm font-bold text-foreground/80">
                                                    {[
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
                                                    ].filter(Boolean).length} operations staged for execution
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <Button
                                                    variant="ghost"
                                                    className="h-12 px-8 font-black text-[11px] uppercase tracking-widest hover:text-destructive transition-colors shrink-0"
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
                                                    Resync System
                                                </Button>
                                                <Button
                                                    className="h-12 px-10 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex-1 md:flex-none rounded-2xl"
                                                    onClick={handleRunCleanup}
                                                    disabled={isCleaningActive || !previewData}
                                                >
                                                    {isCleaningActive ? (
                                                        <><Loader2 className="h-4 w-4 mr-3 animate-spin" /> Processing...</>
                                                    ) : (
                                                        "Execute pipeline"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Data Cleaning Result Preview Section */}
                                    {cleanedPreviewData && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-16 space-y-8 pb-20"
                                        >
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-emerald-500/20 rounded-2xl shadow-inner">
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-black tracking-tighter text-emerald-700">Cleaned dataset Ready</h3>
                                                        <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Operation success • Vector integrity verified</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-emerald-600 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                                                        {cleanedPreviewData.name || "Cleaned Result"}
                                                    </Badge>
                                                    {cleanedPreviewData.dataset_id && (
                                                        <Badge className="bg-background border-emerald-600/20 text-emerald-700 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase shadow-sm">
                                                            Persistent Asset No. {cleanedPreviewData.dataset_id}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <Card className="border-border/60 shadow-2xl rounded-3xl overflow-hidden bg-background/50">
                                                <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="sticky top-0 z-10">
                                                            <tr className="bg-muted border-b border-border/60">
                                                                {cleanedPreviewData.columns.map(col => (
                                                                    <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border/10 last:border-0 min-w-[150px]">
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/20">
                                                            {cleanedPreviewData.rows?.map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-emerald-500/5 transition-colors group">
                                                                    {cleanedPreviewData.columns.map((col) => (
                                                                        <td key={col} className="px-6 py-3.5 whitespace-nowrap border-r border-border/10 last:border-0 font-mono text-[11px] text-foreground/60 group-hover:text-foreground">
                                                                            {String(row[col] ?? "")}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="px-8 py-4 text-[10px] font-black text-muted-foreground flex justify-between items-center bg-emerald-500/5">
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-emerald-700">Preview: {cleanedPreviewData.rows?.length || 0} samples</span>
                                                        {cleanedPreviewData.metadata?.shape && (
                                                            <span className="opacity-40 italic">
                                                                Physical Architecture: ({cleanedPreviewData.metadata.shape[0]} × {cleanedPreviewData.metadata.shape[1]})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-emerald-700 tracking-[0.2em]">TOTAL_ROWS_INDEX: {cleanedPreviewData.total_rows_hint}</span>
                                                </div>

                                                {/* Results Deep Dive */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 border-t border-border/40">
                                                    {cleanedPreviewData.metadata?.dtypes && (
                                                        <div className="p-8 space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                    <Info className="h-5 w-5 text-emerald-600" />
                                                                </div>
                                                                <h4 className="text-base font-black tracking-tight text-emerald-700">Refined Schema</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {Object.entries(cleanedPreviewData.metadata.dtypes).map(([col, type]) => (
                                                                    <div key={col} className="p-3 bg-emerald-500/[0.03] rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                                                        <p className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 mb-1 truncate" title={col}>{col}</p>
                                                                        <p className="font-mono text-[11px] font-bold text-emerald-700">{String(type)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {cleanedPreviewData.summary && Object.keys(cleanedPreviewData.summary).length > 0 && (
                                                        <div className="p-8 space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                                                                </div>
                                                                <h4 className="text-base font-black tracking-tight text-emerald-700">Statistical Delta</h4>
                                                            </div>
                                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {Object.entries(cleanedPreviewData.summary).map(([col, stats]) => (
                                                                    <div key={col} className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02]">
                                                                        <div className="bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-500/10 truncate">
                                                                            {col}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-px bg-emerald-500/10">
                                                                            {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                                <div key={stat} className="flex justify-between items-center bg-background p-3 text-[11px]">
                                                                                    <span className="text-muted-foreground capitalize">{stat}</span>
                                                                                    <span className="font-mono font-bold text-emerald-700">{val}</span>
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
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-border/60 shadow-xl rounded-3xl p-12 bg-muted/20 backdrop-blur-md">
                                <div className="flex flex-col items-center justify-center text-center space-y-8 h-full">
                                    <div className="p-8 bg-primary/5 rounded-full ring-1 ring-primary/20">
                                        <BarChart3 className="h-16 w-16 text-primary/40 animate-pulse" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black tracking-tighter">AI-Driven Intelligence</h3>
                                        <p className="text-muted-foreground max-w-lg mx-auto text-base font-medium leading-relaxed">
                                            Synthesize multifaceted data structures into actionable insights. Select an active asset from the repository to initialize behavioral analytics.
                                        </p>
                                    </div>
                                    <Button size="lg" className="rounded-2xl h-14 px-10 font-black tracking-widest uppercase text-xs" variant="secondary" onClick={() => setActiveTab("data")}>
                                        Initalize Analysis
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-8">
                                <Card className="border-border/60 shadow-lg rounded-3xl p-6 bg-muted/20">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 mb-6 flex items-center gap-2">
                                        <Info className="h-3 w-3" /> System Parameters
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Vector Density", value: "High-Resolution" },
                                            { label: "Auto-Cluster", value: "Enabled" },
                                            { label: "Outlier Threshold", value: "0.95 quantile" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-background border border-border/40 rounded-2xl">
                                                <span className="text-xs font-bold text-muted-foreground/80">{item.label}</span>
                                                <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20">{item.value}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="logs" className="mt-12">
                        <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden bg-muted/20 backdrop-blur-md">
                            <CardHeader className="p-8 border-b border-border/40 bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Project Historian</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">System-wide event tracking</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/20">
                                    {[
                                        { event: "Asset Repository Initialized", date: "Mar 1, 2026 - 12:00 PM", icon: <Database /> },
                                        { event: "Vector Pipeline Configuration Update", date: "Mar 1, 2026 - 12:05 PM", icon: <Settings /> }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-8 hover:bg-primary/5 transition-colors group">
                                            <div className="h-12 w-12 rounded-2xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                                                {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { className: "h-5 w-5" }) : null}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-foreground/80">{item.event}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.date}</p>
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
