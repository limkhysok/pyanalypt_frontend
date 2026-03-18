"use client";

import React from "react";
import {
    AlertCircle,
    Search,
    Loader2,
    ShieldAlert,
    Filter,
    Database,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Issue, Dataset } from "@/types/dataset";
import { toast } from "sonner";

type PreviewRow = Record<string, unknown>;

function safeParseJson(input: unknown): unknown {
    if (typeof input !== "string") return input;
    const trimmed = input.trim();
    if (!trimmed) return input;
    if (!(trimmed.startsWith("[") || trimmed.startsWith("{"))) return input;

    try {
        return JSON.parse(trimmed);
    } catch {
        return input;
    }
}

function extractPreviewRows(payload: unknown): PreviewRow[] {
    const parsed = safeParseJson(payload);

    if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item === "object") as PreviewRow[];
    }

    if (!parsed || typeof parsed !== "object") return [];

    const obj = parsed as Record<string, unknown>;
    const wrappedKeys = ["data_preview", "preview", "data", "rows", "records", "results", "items"];

    for (const key of wrappedKeys) {
        const nested = obj[key];
        const nestedRows = extractPreviewRows(nested);
        if (nestedRows.length > 0) return nestedRows;
    }

    return [];
}

export function IssuesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [issues, setIssues] = React.useState<Issue[]>([]);
    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isScanning, setIsScanning] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedDataset, setSelectedDataset] = React.useState<string>("all");
    const [previewRows, setPreviewRows] = React.useState<PreviewRow[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

    const fetchDatasets = React.useCallback(async () => {
        const datasetsData = await datasetApi.listDatasets();
        setDatasets(datasetsData);
        if (datasetsData.length > 0 && selectedDataset === "all") {
            setSelectedDataset(String(datasetsData[0].id));
        }
        return datasetsData;
    }, [selectedDataset]);

    const fetchIssuesForDataset = React.useCallback(async (datasetId: string) => {
        if (datasetId === "all") {
            setIssues([]);
            return;
        }
        const issuesData = await datasetApi.listIssues({ dataset: Number(datasetId) });
        setIssues(issuesData);
    }, []);

    const fetchPreviewForDataset = React.useCallback(async (datasetId: string) => {
        if (datasetId === "all") {
            setPreviewRows([]);
            return;
        }

        setIsPreviewLoading(true);
        try {
            const previewPayload = await datasetApi.previewDataset(Number(datasetId), 50);
            setPreviewRows(extractPreviewRows(previewPayload));
        } catch (error) {
            console.error("Failed to fetch preview rows:", error);
            setPreviewRows([]);
        } finally {
            setIsPreviewLoading(false);
        }
    }, []);

    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const datasetsData = await fetchDatasets();

            if (datasetsData.length > 0) {
                const datasetId = selectedDataset === "all" ? String(datasetsData[0].id) : selectedDataset;
                await Promise.all([
                    fetchIssuesForDataset(datasetId),
                    fetchPreviewForDataset(datasetId),
                ]);
            } else {
                setIssues([]);
                setPreviewRows([]);
            }
        } catch (error) {
            console.error("Failed to fetch issues data:", error);
            toast.error("Cloud synchronization failed.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchDatasets, fetchIssuesForDataset, fetchPreviewForDataset, selectedDataset]);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchData();
        }
    }, [authLoading, isAuthenticated, router, fetchData]);

    React.useEffect(() => {
        if (!isAuthenticated || selectedDataset === "all") return;

        const loadIssues = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    fetchIssuesForDataset(selectedDataset),
                    fetchPreviewForDataset(selectedDataset),
                ]);
            } catch (error) {
                console.error("Failed to fetch issues for selected dataset:", error);
                toast.error("Failed to load issues.");
            } finally {
                setIsLoading(false);
            }
        };

        loadIssues();
    }, [selectedDataset, isAuthenticated, fetchIssuesForDataset, fetchPreviewForDataset]);

    const handleScan = async () => {
        if (selectedDataset === "all") {
            toast.error("Please select a dataset before running diagnosis.");
            return;
        }

        try {
            setIsScanning(true);
            const result = await datasetApi.diagnoseDataset(Number(selectedDataset));

            // Render issues immediately from scan response so users see results without backend lag.
            const issuesFromScan = Object.values(result.issues_by_column || {}).flat();
            setIssues(issuesFromScan);

            // Sync from canonical endpoint afterward.
            await fetchIssuesForDataset(selectedDataset);
            toast.success(`Scan complete: ${result.total_issues} issue(s) detected.`);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Diagnose endpoint not found")) {
                toast.warning("Issue scan endpoint is unavailable in current backend API version.");
            } else {
                console.error("Diagnosis scan failed:", error);
                toast.error("Issue detection failed.");
            }
        } finally {
            setIsScanning(false);
        }
    };

    const filteredIssues = React.useMemo(() => {
        return issues.filter((issue) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                issue.description.toLowerCase().includes(q) ||
                issue.column_name?.toLowerCase().includes(q) ||
                issue.issue_type.toLowerCase().includes(q);

            return matchesSearch;
        });
    }, [issues, searchQuery]);

    const previewColumns = React.useMemo(() => {
        if (previewRows.length === 0) return [];
        return Object.keys(previewRows[0]);
    }, [previewRows]);

    const stats = React.useMemo(() => {
        const total = issues.length;
        const uniqueColumns = new Set(issues.map((i) => i.column_name || "__dataset__")).size;
        const datasetLevel = issues.filter((i) => !i.column_name || i.column_name === "__dataset__").length;
        return { total, uniqueColumns, datasetLevel };
    }, [issues]);

    const renderDataframePreview = () => {
        if (selectedDataset === "all") return null;

        return (
            <Card className="rounded-[2rem] border border-border/40 bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="p-5 border-b border-border/20">
                    <CardTitle className="text-lg font-black tracking-tight">Dataset Preview (50 rows)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isPreviewLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : previewRows.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-sm font-bold text-muted-foreground">
                            No preview rows available for this dataset.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border/20">
                                        {previewColumns.map((column) => (
                                            <th key={column} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map((row, rowIndex) => (
                                        <tr key={`preview-row-${rowIndex}`} className="border-b border-border/10 hover:bg-primary/5">
                                            {previewColumns.map((column) => (
                                                <td key={`${rowIndex}-${column}`} className="px-4 py-3 text-xs font-medium text-foreground/80 whitespace-nowrap max-w-[260px] truncate">
                                                    {String(row[column] ?? "")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const renderIssuesContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-56 rounded-[2rem] bg-muted/20 animate-pulse border border-border/40" />
                    ))}
                </div>
            );
        }

        if (selectedDataset === "all") {
            return (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-muted/5 rounded-[3rem] border border-dashed border-border/60">
                    <div className="p-8 rounded-[2.5rem] bg-secondary/30 text-muted-foreground/30 shadow-inner">
                        <Database className="h-12 w-12" />
                    </div>
                    <div className="max-w-lg space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">Select a Dataset</h3>
                        <p className="text-muted-foreground font-bold text-base italic">
                            Choose a dataset first, then run diagnosis to generate issue records.
                        </p>
                    </div>
                </div>
            );
        }

        if (filteredIssues.length > 0) {
            return (
                <div className="rounded-[1.5rem] border border-border/30 bg-background/50 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-black tracking-wide">All Issues</h3>
                        <Badge variant="outline" className="text-[10px] font-black tracking-wider uppercase rounded-md">
                            {filteredIssues.length} issue{filteredIssues.length > 1 ? "s" : ""}
                        </Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border/20">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">#</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Column</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Description</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Affected</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Suggested Fix</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIssues.map((issue, issueIndex) => (
                                    <tr key={issue.id} className="border-b border-border/10 hover:bg-primary/5 align-top">
                                        <td className="px-4 py-3 text-xs font-black text-muted-foreground">{issueIndex + 1}</td>
                                        <td className="px-4 py-3 text-xs font-bold">{issue.column_name || "__dataset__"}</td>
                                        <td className="px-4 py-3 text-xs font-black">{issue.issue_type}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[320px]">{issue.description}</td>
                                        <td className="px-4 py-3 text-xs font-bold">{issue.affected_rows ?? "-"}</td>
                                        <td className="px-4 py-3 text-xs max-w-[300px] text-foreground/80">{issue.suggested_fix || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-muted/5 rounded-[3.5rem] border border-dashed border-border/60">
                <div className="p-10 rounded-[3rem] bg-emerald-500/10 text-emerald-500/30 shadow-inner">
                    <ShieldAlert className="h-20 w-20" />
                </div>
                <div className="max-w-md space-y-3">
                    <h3 className="text-3xl font-black tracking-tight text-emerald-500">No Issues Found</h3>
                    <p className="text-muted-foreground text-lg italic font-bold">
                        Review the dataframe preview, then run diagnosis to show issues grouped by column.
                    </p>
                </div>
            </div>
        );
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-red-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] tracking-[0.3em] uppercase">
                            <AlertCircle size={14} className="text-red-500" /> Data Integrity Unit
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]">
                            Incident Ledger
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl leading-relaxed italic font-medium">
                            Dataset-scoped dirty-data issues from Pandas and Gemini scans.
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap gap-3">
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Total Issues</p>
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={14} className="text-red-500" />
                                <span className="text-xl font-black">{stats.total}</span>
                            </div>
                        </Card>
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Columns Affected</p>
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-emerald-500" />
                                <span className="text-xl font-black">{stats.uniqueColumns}</span>
                            </div>
                        </Card>
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Dataset-Level</p>
                            <div className="flex items-center gap-2">
                                <Database size={14} className="text-amber-500" />
                                <span className="text-xl font-black">{stats.datasetLevel}</span>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative group/search flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/search:text-red-500 transition-colors" />
                        <Input
                            placeholder="Search anomaly fingerprints..."
                            className="pl-12 h-12 bg-background/50 border-border/40 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 rounded-2xl text-xs font-bold transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-12 px-5 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm font-bold text-xs gap-3 hover:bg-background/80 transition-all min-w-[140px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Database className="h-3.5 w-3.5 text-primary/70" />
                                        <span className="max-w-[120px] truncate">
                                            {selectedDataset === "all"
                                                ? "Select Dataset"
                                                : datasets.find((d) => d.id === Number.parseInt(selectedDataset))?.file_name || "Select Dataset"}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl"
                            >
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50 px-3 py-2">
                                    Select Dataset
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={selectedDataset} onValueChange={setSelectedDataset}>
                                    {datasets.length === 0 && (
                                        <DropdownMenuRadioItem
                                            value="all"
                                            className="rounded-lg py-2.5 font-bold text-xs cursor-default opacity-60"
                                        >
                                            No datasets available
                                        </DropdownMenuRadioItem>
                                    )}
                                    {datasets.map((d) => (
                                        <DropdownMenuRadioItem
                                            key={d.id}
                                            value={d.id.toString()}
                                            className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 transition-colors truncate"
                                        >
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                            disabled={isScanning || selectedDataset === "all"}
                            onClick={handleScan}
                        >
                            {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Run Scan
                        </Button>
                    </div>
                </div>

                {renderDataframePreview()}

                {renderIssuesContent()}
            </div>
        </main>
    );
}
