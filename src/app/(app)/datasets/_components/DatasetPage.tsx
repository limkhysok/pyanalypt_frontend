"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    Database,
    Search,
    Plus,
    Loader2,
    FileText,
    Download,
    Eye,
    Bug,
    Sparkles,
    ArrowUpDown,
    Calendar,
    Filter,
    Trash2,
    MoreVertical,
    Edit2,
    BrainCircuit,
    HardDrive,
    Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi, framingApi } from "@/services/api";
import { Dataset, DatasetExportFormat } from "@/types/dataset";
import { tokenManager } from "@/lib/token";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function isExportNotFoundError(error: unknown, status: number | undefined): boolean {
    return (
        status === 404 ||
        (error instanceof Error && error.message.includes("Export endpoint not found"))
    );
}

/** Color class per file format. */
const FORMAT_COLORS: Record<string, string> = {
    csv:     "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    json:    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    xlsx:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    xls:     "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    parquet: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
};

function FormatBadge({ format }: Readonly<{ format: string }>) {
    const key = format.toLowerCase();
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                FORMAT_COLORS[key] ?? "bg-muted text-muted-foreground border-border"
            )}
        >
            {key}
        </span>
    );
}

function storageBarColor(pct: number): string {
    if (pct < 70) return "bg-emerald-500";
    if (pct < 90) return "bg-amber-500";
    return "bg-red-500";
}

function getUsageLabel(pct: number): string {
    return pct > 0 && pct < 1 ? "<1%" : `${Math.round(pct)}%`;
}

function getFilterLabel(filterType: string): string {
    return filterType === "all" ? "All formats" : filterType.toUpperCase();
}

function getCountLabel(isFiltering: boolean, filteredCount: number, totalCount: number): string {
    const suffix = totalCount === 1 ? "" : "s";
    return isFiltering ? `${filteredCount} of ${totalCount}` : `${totalCount} dataset${suffix}`;
}

function getSortLabel(sortBy: string): string {
    switch (sortBy) {
        case "newest":    return "Newest first";
        case "oldest":    return "Oldest first";
        case "name_asc":  return "Name (a-z)";
        case "name_desc": return "Name (z-a)";
        default:          return "Sort";
    }
}

function compareDatasets(a: Dataset, b: Dataset, sortBy: string): number {
    switch (sortBy) {
        case "newest":    return new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime();
        case "oldest":    return new Date(a.uploaded_date).getTime() - new Date(b.uploaded_date).getTime();
        case "name_asc":  return a.file_name.localeCompare(b.file_name);
        case "name_desc": return b.file_name.localeCompare(a.file_name);
        default:          return 0;
    }
}

function getImportAccept(format: DatasetExportFormat | null): string {
    if (format === "csv")     return ".csv";
    if (format === "xlsx")    return ".xlsx,.xls";
    if (format === "json")    return ".json";
    if (format === "parquet") return ".parquet,.pq";
    return ".csv,.xlsx,.xls,.json,.parquet,.pq";
}

function normalizeExportFormat(fileFormat: string): DatasetExportFormat | undefined {
    const normalized = fileFormat.trim().toLowerCase();
    if (normalized === "csv")                            return "csv";
    if (normalized === "json")                           return "json";
    if (normalized === "xlsx" || normalized === "xls")  return "xlsx";
    if (normalized === "parquet" || normalized === "pq") return "parquet";
    return undefined;
}

function triggerDownload(blob: Blob, filename: string): void {
    const url    = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href     = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    globalThis.URL.revokeObjectURL(url);
}

async function handleExportFallback(
    dataset: Dataset,
    explicitFormat: DatasetExportFormat | undefined,
    error: unknown,
): Promise<void> {
    const sourceFormat   = normalizeExportFormat(dataset.file_format);
    const status         = (error as { response?: { status?: number } })?.response?.status;
    const isNotFound     = isExportNotFoundError(error, status);
    const shouldFallback = !explicitFormat || explicitFormat === sourceFormat || isNotFound;

    if (!shouldFallback) {
        console.error("Export failed", error);
        toast.error(`Failed to export ${explicitFormat}.`);
        return;
    }

    try {
        const token    = tokenManager.getAccessToken();
        const response = await fetch(dataset.file, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error(`Direct download failed: ${response.status}`);

        const blob         = await response.blob();
        const fallbackExt  = normalizeExportFormat(dataset.file_format) ?? "csv";
        const fallbackName = dataset.file_name || `dataset-${dataset.id}.${fallbackExt}`;
        triggerDownload(blob, fallbackName);

        const formatMismatch = explicitFormat && explicitFormat !== sourceFormat;
        if (formatMismatch) {
            toast.warning(`Converted export unavailable. Downloaded original ${dataset.file_format} file instead.`);
        } else {
            toast.success("Export ready.");
        }
    } catch (fallbackError) {
        console.error("Export failed", error);
        console.error("Direct file fallback failed", fallbackError);
        toast.error("Failed to export dataset.");
    }
}

async function exportDataset(dataset: Dataset, explicitFormat?: DatasetExportFormat): Promise<void> {
    try {
        const format       = explicitFormat ?? normalizeExportFormat(dataset.file_format);
        const { blob, filename } = await datasetApi.exportDataset(dataset.id, format);
        const fallbackExt  = format ?? "csv";
        const fallbackName = `${dataset.file_name.replace(/\.[^.]+$/, "")}.${fallbackExt}`;
        const downloadName = filename ? decodeURIComponent(filename) : fallbackName;
        triggerDownload(blob, downloadName);
        toast.success("Export ready.");
    } catch (error) {
        await handleExportFallback(dataset, explicitFormat, error);
    }
}

// ─────────────────────────────────────────────
// DatasetPage
// ─────────────────────────────────────────────

export default function DatasetPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [datasets, setDatasets]                     = useState<Dataset[]>([]);
    const [isLoading, setIsLoading]                   = useState(true);
    const [searchQuery, setSearchQuery]               = useState("");
    const [uploadLoading, setUploadLoading]           = useState(false);
    const [issueLoading, setIssueLoading]             = useState<number | null>(null);
    const [sortBy, setSortBy]                         = useState<string>("newest");
    const [filterType, setFilterType]                 = useState<string>("all");
    const [isImportOpen, setIsImportOpen]             = useState(false);
    const [selectedImportFormat, setSelectedImportFormat] = useState<DatasetExportFormat | null>(null);
    const [isRenameOpen, setIsRenameOpen]             = useState(false);
    const [isDeleteOpen, setIsDeleteOpen]             = useState(false);
    const [selectedDataset, setSelectedDataset]       = useState<Dataset | null>(null);
    const [deleteTarget, setDeleteTarget]             = useState<Dataset | null>(null);
    const [newName, setNewName]                       = useState("");
    const [exportingDatasetId, setExportingDatasetId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading]           = useState(false);
    const [aiAnalysisLoading, setAiAnalysisLoading]   = useState<number | null>(null);
    const [aiAnalysisResult, setAiAnalysisResult]     = useState<{ fileName: string; statements: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchDatasets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await datasetApi.listDatasets();
            setDatasets(data);
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        fetchDatasets();
    }, [authLoading, isAuthenticated, fetchDatasets, router]);

    // ── Upload / import ────────────────────────────────────────────────────────

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadLoading(true);
        try {
            await datasetApi.uploadDataset(file);
            toast.success("Dataset uploaded successfully");
            fetchDatasets();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed");
        } finally {
            setUploadLoading(false);
            e.target.value = "";
            setSelectedImportFormat(null);
        }
    };

    const openFilePicker = (format?: DatasetExportFormat) => {
        if (uploadLoading) return;
        if (format) setSelectedImportFormat(format);
        fileInputRef.current?.click();
    };

    const openImportDialog = () => {
        if (uploadLoading) return;
        setIsImportOpen(true);
    };

    const handleImportFormatSelect = (format: DatasetExportFormat) => {
        setSelectedImportFormat(format);
        setIsImportOpen(false);
        globalThis.setTimeout(() => openFilePicker(format), 30);
    };

    const importAccept = getImportAccept(selectedImportFormat);

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleAIAnalysis = async (dataset: { id: number; file_name: string }) => {
        setAiAnalysisLoading(dataset.id);
        setAiAnalysisResult({ fileName: dataset.file_name, statements: "" });
        try {
            await framingApi.stream(
                dataset.id,
                (token) =>
                    setAiAnalysisResult((prev) =>
                        prev ? { ...prev, statements: prev.statements + token } : null
                    ),
                () => setAiAnalysisLoading(null),
                (err) => {
                    console.error("Problem Framing stream error", err);
                    toast.error("Problem Framing failed. Make sure Ollama is running.");
                    setAiAnalysisLoading(null);
                }
            );
        } catch (error) {
            console.error("Problem Framing failed", error);
            toast.error("Problem Framing failed. Make sure Ollama is running.");
            setAiAnalysisLoading(null);
        }
    };

    const handleDiagnose = async (id: number) => {
        try {
            setIssueLoading(id);
            toast.info("Processing issue detection...");
            await datasetApi.diagnoseDataset(id);
            toast.success("Issue detection complete. Issues logged.");
            router.push(`/issues?dataset=${id}`);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Diagnose endpoint not found")) {
                toast.warning("Issue scan endpoint is unavailable. Opening issues page.");
                router.push("/issues");
            } else {
                console.error("Issue detection error:", error);
                toast.error("Issue detection failed.");
            }
        } finally {
            setIssueLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        setDeleteLoading(true);
        try {
            await datasetApi.deleteDataset(id);
            toast.success("Dataset deleted.");
            setIsDeleteOpen(false);
            setDeleteTarget(null);
            fetchDatasets();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete dataset.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRename = async () => {
        if (!selectedDataset || !newName) return;
        try {
            await datasetApi.renameDataset(selectedDataset.id, { file_name: newName });
            toast.success("Artifact renamed.");
            setIsRenameOpen(false);
            setSelectedDataset(null);
            setNewName("");
            fetchDatasets();
        } catch (error) {
            console.error("Rename failed", error);
            toast.error("Failed to rename artifact.");
        }
    };

    const handleExport = async (dataset: Dataset, explicitFormat?: DatasetExportFormat) => {
        if (exportingDatasetId === dataset.id) return;
        setExportingDatasetId(dataset.id);
        try {
            await exportDataset(dataset, explicitFormat);
        } finally {
            setExportingDatasetId(null);
        }
    };

    // ── Filtering / sorting ────────────────────────────────────────────────────

    const filteredDatasets = useMemo(() => {
        let result = datasets.filter((d) =>
            d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filterType !== "all") {
            result = result.filter(
                (d) => d.file_format.toLowerCase() === filterType.toLowerCase()
            );
        }
        result.sort((a, b) => compareDatasets(a, b, sortBy));
        return result;
    }, [datasets, searchQuery, sortBy, filterType]);

    const stats = useMemo(() => ({
        total:     datasets.length,
        totalSize: datasets.reduce((sum, d) => sum + d.file_size, 0),
        formats:   new Set(datasets.map((d) => d.file_format.toLowerCase())).size,
    }), [datasets]);

    const isFiltering       = searchQuery !== "" || filterType !== "all";
    const usagePct          = Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100);
    const storageColorClass = storageBarColor(usagePct);
    const usageLabel        = getUsageLabel(usagePct);
    const filterLabel       = getFilterLabel(filterType);
    const countLabel        = getCountLabel(isFiltering, filteredDatasets.length, datasets.length);

    // ── Auth loading ───────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading workspace…</p>
                </div>
            </div>
        );
    }

    // ── Content block ──────────────────────────────────────────────────────────

    let pageContent: React.ReactNode;
    if (isLoading) {
        pageContent = (
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <div className="p-5 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </Card>
        );
    } else if (datasets.length === 0) {
        pageContent = (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/30 rounded-4xl bg-background/40 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                    <Database className="h-7 w-7 text-blue-500/60" />
                </div>
                <h3 className="text-lg font-black tracking-tight mb-1">No datasets yet</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mb-6">
                    Import your first file to start managing and analysing your data.
                </p>
                <Button
                    onClick={openImportDialog}
                    className="rounded-2xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-sm shadow-blue-500/20 transition-all"
                >
                    <Plus className="mr-1.5 h-4 w-4" /> Import Dataset
                </Button>
            </div>
        );
    } else {
        pageContent = (
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="border-b border-border/10">
                            <tr>
                                <th className="px-6 py-3 w-12 text-center text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">#</th>
                                <th className="px-6 py-3 text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">File Name</th>
                                <th className="px-6 py-3 text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">Format</th>
                                <th className="px-6 py-3 text-right text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">Size</th>
                                <th className="px-6 py-3 text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase hidden md:table-cell">Uploaded</th>
                                <th className="px-6 py-3 text-right text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                            <AnimatePresence mode="popLayout">
                                {filteredDatasets.length > 0 ? (
                                    filteredDatasets.map((dataset, idx) => (
                                        <motion.tr
                                            key={dataset.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="hover:bg-secondary/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-center text-[11px] text-muted-foreground/40 font-bold font-mono">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <FileText className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                                    <span className="font-bold text-foreground/80 text-sm truncate max-w-56">
                                                        {dataset.file_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <FormatBadge format={dataset.file_format} />
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs tabular-nums font-bold text-muted-foreground">
                                                {formatFileSize(dataset.file_size)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground hidden md:table-cell">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {new Date(dataset.uploaded_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <HoverCard openDelay={300} closeDelay={100}>
                                                        <HoverCardTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => router.push(`/datasets/${dataset.id}/preview`)}
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                            Preview
                                                        </HoverCardContent>
                                                    </HoverCard>

                                                    <HoverCard openDelay={300} closeDelay={100}>
                                                        <HoverCardTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => handleDiagnose(dataset.id)}
                                                                disabled={issueLoading === dataset.id}
                                                            >
                                                                {issueLoading === dataset.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Bug className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                            Diagnose issues
                                                        </HoverCardContent>
                                                    </HoverCard>

                                                    <HoverCard openDelay={300} closeDelay={100}>
                                                        <HoverCardTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => handleAIAnalysis(dataset)}
                                                                disabled={aiAnalysisLoading === dataset.id}
                                                            >
                                                                {aiAnalysisLoading === dataset.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <BrainCircuit className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                            Problem Framing
                                                        </HoverCardContent>
                                                    </HoverCard>

                                                    <HoverCard openDelay={300} closeDelay={100}>
                                                        <HoverCardTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => router.push(`/clean?dataset=${dataset.id}`)}
                                                            >
                                                                <Sparkles className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                            Clean dataset
                                                        </HoverCardContent>
                                                    </HoverCard>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedDataset(dataset);
                                                                    setNewName(dataset.file_name);
                                                                    setIsRenameOpen(true);
                                                                }}
                                                            >
                                                                <Edit2 className="mr-2 h-4 w-4" /> Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>
                                                                    <Download className="mr-2 h-4 w-4" /> Export
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuItem onClick={() => handleExport(dataset, "csv")}>CSV</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleExport(dataset, "xlsx")}>XLSX</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleExport(dataset, "json")}>JSON</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleExport(dataset, "parquet")}>Parquet</DropdownMenuItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    setDeleteTarget(dataset);
                                                                    setIsDeleteOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    /* Filtered empty state */
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="py-20 flex flex-col items-center gap-3 text-center">
                                                <div className="h-10 w-10 rounded-2xl bg-muted/60 border border-border/20 flex items-center justify-center">
                                                    <Search className="h-4 w-4 text-muted-foreground/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black tracking-tight">No matching datasets</p>
                                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                                        Try adjusting your search or format filter.
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen pb-20 px-6 md:px-10 bg-background relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 pt-8">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Database size={13} className="text-blue-500" aria-hidden="true" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                Workspace
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                            Datasets
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            Manage and process your data artifacts.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={openImportDialog}
                            disabled={uploadLoading}
                            className="rounded-2xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-sm shadow-blue-500/20 transition-all"
                        >
                            {uploadLoading ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="mr-1.5 h-4 w-4" />
                            )}
                            {uploadLoading ? "Uploading…" : "Import"}
                        </Button>
                    </div>
                </motion.div>

                {/* ── Stats bar ── */}
                {datasets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                        {/* Total Datasets */}
                        <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden order-1 hover:-translate-y-0.5 transition-all duration-300">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <Database className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black tabular-nums leading-none">{stats.total}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total Datasets</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formats */}
                        <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden order-2 sm:order-3 hover:-translate-y-0.5 transition-all duration-300">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                    <Layers className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black tabular-nums leading-none">{stats.formats}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Formats</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Storage — full-width on mobile, middle column on desktop */}
                        <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden col-span-2 sm:col-span-1 order-3 sm:order-2 hover:-translate-y-0.5 transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Storage</p>
                                    </div>
                                    <p className="text-[10px] tabular-nums text-muted-foreground font-bold">
                                        {formatFileSize(stats.totalSize)} / 2 GB
                                    </p>
                                </div>
                                <div className="relative h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                    <div
                                        className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", storageColorClass)}
                                        style={{ width: `${usagePct}%` }}
                                    />
                                </div>
                                <p className="text-2xl font-black tabular-nums leading-none mt-2.5">
                                    {usageLabel}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* ── Controls ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                >
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search datasets..."
                            className="pl-9 rounded-2xl h-10 border-border/30 bg-background/60 hover:bg-secondary/30 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {datasets.length > 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground hidden sm:block uppercase tracking-widest">
                                {countLabel}
                            </span>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-2xl h-10 px-4 border-border/30 bg-background/60 hover:bg-secondary/50 font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" /> {getSortLabel(sortBy)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                    <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_asc">Name (a-z)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_desc">Name (z-a)</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-2xl h-10 px-4 border-border/30 bg-background/60 hover:bg-secondary/50 font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <Filter className="mr-1.5 h-3.5 w-3.5" />
                                    {filterLabel}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                                <DropdownMenuRadioGroup value={filterType} onValueChange={setFilterType}>
                                    <DropdownMenuRadioItem value="all">All formats</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="csv">CSV</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="json">JSON</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="xlsx">XLSX</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="parquet">Parquet</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.div>

                {/* ── Content ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.18 }}
                >
                    {pageContent}
                </motion.div>

            </div>

            {/* ── Dialogs ── */}

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Dataset</DialogTitle>
                        <DialogDescription>Select the source format for your data import.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {(["csv", "xlsx", "json", "parquet"] as DatasetExportFormat[]).map((fmt) => (
                            <Button
                                key={fmt}
                                variant="outline"
                                className="h-12 font-semibold"
                                onClick={() => handleImportFormatSelect(fmt)}
                            >
                                {fmt.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Dataset</DialogTitle>
                        <DialogDescription>Enter a new name for your dataset.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="rename-input">New Name</Label>
                        <Input
                            id="rename-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Dataset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-bold text-foreground">{deleteTarget?.file_name}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? <Loader2 className="animate-spin" /> : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!aiAnalysisResult}
                onOpenChange={(open) => { if (!open) setAiAnalysisResult(null); }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" /> Problem Framing
                        </DialogTitle>
                        <DialogDescription>{aiAnalysisResult?.fileName}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto rounded-xl bg-muted/40 border p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {aiAnalysisResult?.statements}
                        {aiAnalysisLoading !== null && (
                            <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiAnalysisResult(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept={importAccept}
                disabled={uploadLoading}
            />
        </main>
    );
}
