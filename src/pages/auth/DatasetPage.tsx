"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Database,
    Search,
    Plus,
    Loader2,
    FileText,
    Download,
    Eye,
    BarChart3,
    Bug,
    Sparkles,
    ArrowUpRight,
    Copy,
    ArrowUpDown,
    ChevronDown,
    Calendar,
    ArrowDownAz,
    ArrowUpAz,
    Filter,
    Trash2,
    MoreVertical,
    Edit2,
    TrendingUp,
    Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Dataset, PasteDatasetRequest } from "@/types/dataset";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function DatasetPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [issueLoading, setIssueLoading] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<string>("newest");
    const [filterType, setFilterType] = useState<string>("all");
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [newName, setNewName] = useState("");

    // Paste data state
    const [pasteData, setPasteData] = useState<PasteDatasetRequest>({
        file_name: "",
        raw_data: "",
        format: "csv"
    });

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
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchDatasets();
        }
    }, [authLoading, isAuthenticated, router, fetchDatasets]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadLoading(true);
        try {
            await datasetApi.uploadDataset(file);
            toast.success("Dataset uploaded successfully");
            setIsImportOpen(false);
            fetchDatasets();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed");
        } finally {
            setUploadLoading(false);
        }
    };

    const handlePasteSubmit = async () => {
        if (!pasteData.file_name || !pasteData.raw_data) {
            toast.error("Please fill in both name and data");
            return;
        }

        setUploadLoading(true);
        try {
            await datasetApi.pasteDataset(pasteData);
            toast.success("Data ingested successfully");
            setIsImportOpen(false);
            setPasteData({ file_name: "", raw_data: "", format: "csv" });
            fetchDatasets();
        } catch (error) {
            console.error("Paste failed", error);
            toast.error("Data ingestion failed");
        } finally {
            setUploadLoading(false);
        }
    };
    const handleDiagnose = async (id: number) => {
        try {
            setIssueLoading(id);
            toast.info("Processing issue detection...");
            await datasetApi.diagnoseDataset(id, "both");
            toast.success("Issue detection complete. Issues logged.");
            router.push("/issues");
        } catch (error) {
            console.error("Issue detection error:", error);
            toast.error("Issue detection failed.");
        } finally {
            setIssueLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = globalThis.window.confirm("Are you sure you want to permanently purge this artifact?");
        if (!confirmed) return;

        try {
            await datasetApi.deleteDataset(id);
            toast.success("Artifact purged from the vault.");
            fetchDatasets();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to purge artifact.");
        }
    };

    const handleRename = async () => {
        if (!selectedDataset || !newName) return;
        try {
            await datasetApi.updateDataset(selectedDataset.id, { file_name: newName });
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


    const filteredDatasets = useMemo(() => {
        let result = datasets.filter((dataset) =>
            dataset.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterType !== "all") {
            result = result.filter((d) => d.file_format.toUpperCase() === filterType.toUpperCase());
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "newest": return new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime();
                case "oldest": return new Date(a.uploaded_date).getTime() - new Date(b.uploaded_date).getTime();
                case "name_asc": return a.file_name.localeCompare(b.file_name);
                case "name_desc": return b.file_name.localeCompare(a.file_name);
                default: return 0;
            }
        });

        return result;
    }, [datasets, searchQuery, sortBy, filterType]);

    const getSortLabel = () => {
        switch (sortBy) {
            case "newest": return "Newest";
            case "oldest": return "Oldest";
            case "name_asc": return "Name (A-Z)";
            case "name_desc": return "Name (Z-A)";
            default: return "Sort";
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    const renderListView = () => (
        <div className="rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/20 bg-muted/20 flex items-center justify-between gap-3">
                <Badge variant="outline" className="rounded-lg px-2.5 py-1 h-auto text-[10px] font-black uppercase tracking-wider bg-background/70">
                    {filteredDatasets.length} files
                </Badge>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            <th className="px-4 py-4 text-xs w-12 text-center">#</th>
                            <th className="px-6 py-4 text-xs">File Name</th>
                            <th className="px-6 py-4 text-xs">Format</th>
                            <th className="px-6 py-4 text-xs text-right">Size</th>
                            <th className="px-6 py-4 text-xs">Upload Date</th>
                            <th className="px-6 py-4 text-xs text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredDatasets.map((dataset, idx) => (
                                <motion.tr
                                    key={dataset.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                                    className="border-b border-border/10 hover:bg-primary/5 transition-colors group"
                                >
                                    <td className="px-4 py-4 text-center text-xs font-bold text-muted-foreground/60">
                                        {idx + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-black tracking-tight">{dataset.file_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="text-[8px] font-black uppercase bg-secondary/40 border-none h-5 px-1.5">
                                            {dataset.file_format}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-right tabular-nums text-muted-foreground/70">
                                        {formatFileSize(dataset.file_size)}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                        {new Date(dataset.uploaded_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => router.push(`/datasets/${dataset.id}/preview`)}
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={issueLoading === dataset.id}
                                                className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                onClick={() => handleDiagnose(dataset.id)}
                                                title="Issue"
                                            >
                                                {issueLoading === dataset.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Bug className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => router.push(`/datasets/${dataset.id}/clean`)}
                                                title="Clean"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => router.push(`/datasets/${dataset.id}/analyze`)}
                                                title="Analysis"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => router.push(`/datasets/${dataset.id}/visualize`)}
                                                title="Visualization"
                                            >
                                                <TrendingUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => router.push(`/datasets/${dataset.id}/insight`)}
                                                title="Insight"
                                            >
                                                <Lightbulb className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg hover:bg-muted/50 transition-colors"
                                                        title="More"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32 rounded-xl p-1 bg-background/95 backdrop-blur-xl border-border/40 shadow-xl">
                                                    <DropdownMenuRadioItem
                                                        value="rename"
                                                        className="rounded-lg py-2 font-bold text-[10px] uppercase tracking-wider cursor-pointer focus:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            setSelectedDataset(dataset);
                                                            setNewName(dataset.file_name);
                                                            setIsRenameOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="mr-2 h-3.5 w-3.5" /> Rename
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuSeparator className="bg-border/20 my-1" />
                                                    <DropdownMenuRadioItem
                                                        value="delete"
                                                        className="rounded-lg py-2 font-bold text-[10px] uppercase tracking-wider cursor-pointer focus:bg-red-500/10 focus:text-red-500 transition-colors text-red-500/70"
                                                        onClick={() => handleDelete(dataset.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            {filteredDatasets.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm font-bold italic">
                    No intelligence assets matching your criteria.
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl overflow-hidden shadow-sm">
                    <div className="h-14 border-b border-border/20 bg-muted/20 animate-pulse" />
                    <div className="space-y-2 p-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse border border-border/20" />
                        ))}
                    </div>
                </div>
            )
        }

        if (datasets.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-muted/5 rounded-[3rem] border border-dashed border-border/60"
                >
                    <div className="p-8 rounded-[2.5rem] bg-secondary/30 text-muted-foreground/30 shadow-inner">
                        <Database className="h-12 w-12" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">No Datasets Yet</h3>
                        <p className="text-muted-foreground font-bold text-base italic">
                            Upload your first file to get started.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="rounded-xl h-12 px-8 font-black tracking-widest uppercase text-[10px] shadow-lg shadow-primary/10"
                        onClick={() => setIsImportOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />{" "}
                        Upload File
                    </Button>
                </motion.div>
            )
        }

        return renderListView();
    }

    return (
        <main className="min-h-screen pt-20 pb-8 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header omitted for brevity in search but included in full content if needed */}
                {/* ... existing header logic ... */}
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-primary font-bold text-[9px] tracking-[0.25em] uppercase">
                            <span className="p-1 rounded-sm bg-primary/10">
                                <Database size={10} className="text-primary" />
                            </span>{" "}
                            Import Your Dataset
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-tight">
                            Datasets
                        </h1>
                        <p className="text-muted-foreground mt-2 text-base max-w-lg leading-relaxed font-medium">
                            Upload and manage your data files for analysis.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto"
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm font-bold text-xs gap-2 hover:bg-background/80 transition-all">
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary/70" />
                                    <span className="hidden lg:inline">{getSortLabel()}</span>
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/50 px-3 py-2">Sort By</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                    <DropdownMenuRadioItem value="newest" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        <Calendar className="mr-2 h-3.5 w-3.5 opacity-50" /> Newest First
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="oldest" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        <Calendar className="mr-2 h-3.5 w-3.5 opacity-50" /> Oldest First
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_asc" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        <ArrowUpAz className="mr-2 h-3.5 w-3.5 opacity-50" /> Name (A-Z)
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="name_desc" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        <ArrowDownAz className="mr-2 h-3.5 w-3.5 opacity-50" /> Name (Z-A)
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm font-bold text-xs gap-2 hover:bg-background/80 transition-all">
                                    <Filter className="h-3.5 w-3.5 text-primary/70" />
                                    <span className="hidden lg:inline">{filterType === 'all' ? 'All Files' : filterType}</span>
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/50 px-3 py-2">Filter By Format</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={filterType} onValueChange={setFilterType}>
                                    <DropdownMenuRadioItem value="all" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        All Formats
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="CSV" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        CSV
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="JSON" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        JSON
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="XLSX" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                                        Excel
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="relative group/search flex-1 sm:min-w-[280px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 group-focus-within/search:text-primary transition-colors" />
                            <Input
                                placeholder="Search files..."
                                className="pl-10 h-10 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-xl text-xs font-bold transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="h-10 px-6 rounded-xl font-black tracking-widest text-[10px] uppercase bg-foreground text-background hover:bg-primary transition-all duration-300 hover:ambient-glow-mono shadow-lg shadow-foreground/5 group"
                                >
                                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                    Import
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] border-border/40 bg-background/95 backdrop-blur-xl rounded-[2rem] p-0 overflow-hidden">
                                <div className="p-8 pb-4">
                                    <DialogHeader className="space-y-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <ArrowUpRight className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-black tracking-tight">Import Dataset</DialogTitle>
                                            <DialogDescription className="text-muted-foreground text-sm mt-1 font-bold">
                                                Upload or paste your data.
                                            </DialogDescription>
                                        </div>
                                    </DialogHeader>

                                    <Tabs defaultValue="upload" className="mt-6">
                                        <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/30 p-1 rounded-xl border border-border/20">
                                            <TabsTrigger value="upload" className="rounded-lg font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background">
                                                <Download className="mr-1.5 h-3.5 w-3.5" /> Upload File
                                            </TabsTrigger>
                                            <TabsTrigger value="paste" className="rounded-lg font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background">
                                                <Copy className="mr-1.5 h-3.5 w-3.5" /> Paste Data
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="upload" className="mt-5 pb-4">
                                            <div className="border-2 border-dashed border-border/30 rounded-2xl p-10 text-center space-y-3 group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                    accept=".csv,.xlsx,.xls,.json"
                                                    disabled={uploadLoading}
                                                />
                                                <div className="h-16 w-16 rounded-2xl bg-secondary/30 text-muted-foreground/30 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:text-primary/40 transition-all">
                                                    {uploadLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-base font-black tracking-tight">Drop your file here</p>
                                                    <p className="text-muted-foreground text-[11px] font-bold">CSV, JSON, or Excel files</p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="paste" className="mt-5 space-y-5 pb-4">
                                            <div className="space-y-4">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="filename" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">File Name</Label>
                                                    <Input
                                                        id="filename"
                                                        placeholder="e.g. market_trends.csv"
                                                        className="h-10 rounded-xl bg-muted/20 border-border/40 font-bold text-xs"
                                                        value={pasteData.file_name}
                                                        onChange={(e) => setPasteData({ ...pasteData, file_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <div className="flex justify-between items-end px-1">
                                                        <Label htmlFor="rawdata" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Paste Data</Label>
                                                        <div className="flex gap-1.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`h-6 px-3 rounded-md font-black text-[8px] ${pasteData.format === 'csv' ? 'bg-primary/20 text-primary' : ''}`}
                                                                onClick={() => setPasteData({ ...pasteData, format: 'csv' })}
                                                            >CSV</Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`h-6 px-3 rounded-md font-black text-[8px] ${pasteData.format === 'json' ? 'bg-primary/20 text-primary' : ''}`}
                                                                onClick={() => setPasteData({ ...pasteData, format: 'json' })}
                                                            >JSON</Button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        id="rawdata"
                                                        rows={6}
                                                        placeholder="Paste your data here..."
                                                        className="w-full p-3 rounded-xl bg-muted/20 border border-border/40 font-mono text-[10px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                                        value={pasteData.raw_data}
                                                        onChange={(e) => setPasteData({ ...pasteData, raw_data: e.target.value })}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handlePasteSubmit}
                                                    className="w-full h-11 rounded-xl font-black tracking-widest uppercase text-[10px] shadow-lg shadow-primary/10"
                                                    disabled={uploadLoading}
                                                >
                                                    {uploadLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                                    Upload
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                </div>

                <Separator className="bg-border/40 opacity-30" />

                {/* Content Area */}
                <div className="relative">
                    {renderContent()}
                </div>
            </div>
            
            {/* Rename Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent className="sm:max-w-[425px] border-border/40 bg-background/95 backdrop-blur-xl rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Rename File</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                            Update the filename.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">File Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-11 rounded-xl bg-muted/20 border-border/40 font-bold"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" className="rounded-xl font-bold text-xs" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                        <Button className="rounded-xl font-black text-xs uppercase tracking-widest bg-primary px-6 h-11" onClick={handleRename}>Update</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
