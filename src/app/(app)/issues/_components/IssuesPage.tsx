"use client";

import React from "react";
import {
    AlertCircle,
    Search,
    Loader2,
    ShieldAlert,
    Database,
    ChevronDown,
    Sparkles,
    Columns,
    TableProperties,
    Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Issue, Dataset, DiagnoseOverview, IssueSummaryResponse } from "@/types/dataset";
import { toast } from "sonner";
import { OverviewPanel } from "./OverviewPanel";
import { IssuesPanel } from "./IssuesPanel";
import { PreviewPanel } from "./PreviewPanel";

type PreviewRow = Record<string, unknown>;

function safeParseJson(input: unknown): unknown {
    if (typeof input !== "string") return input;
    const trimmed = input.trim();
    if (!trimmed) return input;
    if (!(trimmed.startsWith("[") || trimmed.startsWith("{"))) return input;
    try { return JSON.parse(trimmed); } catch { return input; }
}

function extractPreviewRows(payload: unknown): PreviewRow[] {
    const parsed = safeParseJson(payload);
    if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item === "object") as PreviewRow[];
    }
    if (!parsed || typeof parsed !== "object") return [];
    const obj = parsed as Record<string, unknown>;
    for (const key of ["data_preview", "preview", "data", "rows", "records", "results", "items"]) {
        const nested = extractPreviewRows(obj[key]);
        if (nested.length > 0) return nested;
    }
    return [];
}

export function IssuesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [issues, setIssues] = React.useState<Issue[]>([]);
    const [issuesByColumn, setIssuesByColumn] = React.useState<Record<string, Issue[]>>({});
    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isScanning, setIsScanning] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedDataset, setSelectedDataset] = React.useState<string>("all");
    const [previewRows, setPreviewRows] = React.useState<PreviewRow[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [overview, setOverview] = React.useState<DiagnoseOverview | null>(null);
    const [summary, setSummary] = React.useState<IssueSummaryResponse | null>(null);

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
            setIssuesByColumn({});
            setSummary(null);
            setOverview(null);
            return;
        }
        const issuesData = await datasetApi.listIssues({ dataset: Number(datasetId) });
        setIssues(issuesData);
        const grouped: Record<string, Issue[]> = {};
        for (const issue of issuesData) {
            const key = issue.column_name || "__dataset__";
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(issue);
        }
        setIssuesByColumn(grouped);
        try {
            const summaryData = await datasetApi.getIssueSummary(Number(datasetId));
            setSummary(summaryData);
        } catch {
            setSummary(null);
        }
    }, []);

    const fetchPreviewForDataset = React.useCallback(async (datasetId: string) => {
        if (datasetId === "all") { setPreviewRows([]); return; }
        setIsPreviewLoading(true);
        try {
            const payload = await datasetApi.previewDataset(Number(datasetId), 50);
            setPreviewRows(extractPreviewRows(payload));
        } catch {
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
                await Promise.all([fetchIssuesForDataset(datasetId), fetchPreviewForDataset(datasetId)]);
            } else {
                setIssues([]);
                setPreviewRows([]);
            }
        } catch {
            toast.error("Failed to load issues data.");
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
        const load = async () => {
            try {
                setIsLoading(true);
                await Promise.all([fetchIssuesForDataset(selectedDataset), fetchPreviewForDataset(selectedDataset)]);
            } catch {
                toast.error("Failed to load issues.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [selectedDataset, isAuthenticated, fetchIssuesForDataset, fetchPreviewForDataset]);

    const handleScan = async () => {
        if (selectedDataset === "all") {
            toast.error("Please select a dataset first.");
            return;
        }
        try {
            setIsScanning(true);
            const result = await datasetApi.diagnoseDataset(Number(selectedDataset));
            setOverview(result.overview);
            setIssuesByColumn(result.issues_by_column || {});
            setIssues(Object.values(result.issues_by_column || {}).flat());
            try {
                setSummary(await datasetApi.getIssueSummary(Number(selectedDataset)));
            } catch { setSummary(null); }
            toast.success(`Scan complete — ${result.total_issues} issue(s) detected.`);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Diagnose endpoint not found")) {
                toast.warning("Issue scan endpoint is unavailable in the current API version.");
            } else {
                toast.error("Issue detection failed.");
            }
        } finally {
            setIsScanning(false);
        }
    };

    const handleDeleteIssue = async (issueId: number) => {
        try {
            await datasetApi.deleteIssue(issueId);
            setIssues((prev) => prev.filter((i) => i.id !== issueId));
            setIssuesByColumn((prev) => {
                const next: Record<string, Issue[]> = {};
                for (const [col, colIssues] of Object.entries(prev)) {
                    const filtered = colIssues.filter((i) => i.id !== issueId);
                    if (filtered.length > 0) next[col] = filtered;
                }
                return next;
            });
            toast.success("Issue deleted.");
        } catch {
            toast.error("Failed to delete issue.");
        }
    };

    const filteredIssues = React.useMemo(() => {
        const q = searchQuery.toLowerCase();
        return issues.filter((issue) =>
            issue.description.toLowerCase().includes(q) ||
            issue.column_name?.toLowerCase().includes(q) ||
            issue.issue_type.toLowerCase().includes(q)
        );
    }, [issues, searchQuery]);

    const previewColumns = React.useMemo(() => {
        if (previewRows.length === 0) return [];
        return Object.keys(previewRows[0]);
    }, [previewRows]);

    const stats = React.useMemo(() => {
        if (summary) {
            return {
                total: summary.total_issues,
                uniqueColumns: Object.keys(summary.by_column).length,
                datasetLevel: summary.dataset_level_issues,
            };
        }
        return {
            total: issues.length,
            uniqueColumns: new Set(issues.map((i) => i.column_name || "__dataset__")).size,
            datasetLevel: issues.filter((i) => !i.column_name || i.column_name === "__dataset__").length,
        };
    }, [issues, summary]);

    const selectedDatasetName = datasets.find((d) => d.id === Number.parseInt(selectedDataset))?.file_name;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="p-10 flex flex-col items-center gap-4 shadow-lg">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading…</p>
                </Card>
            </div>
        );
    }

    let mainContent: React.ReactNode;
    if (isLoading) {
        mainContent = (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse border" />
                ))}
            </div>
        );
    } else if (selectedDataset === "all") {
        mainContent = (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 rounded-xl border border-dashed">
                <Database className="h-8 w-8 text-muted-foreground/20" />
                <div>
                    <p className="text-sm font-medium">Select a dataset</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose a dataset to begin scanning for issues.</p>
                </div>
            </div>
        );
    } else {
        mainContent = (
            <div className="space-y-4">

                {/* Overview */}
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <TableProperties className="h-3.5 w-3.5 text-muted-foreground" />
                            <CardTitle className="text-xs font-semibold">Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <OverviewPanel overview={overview} />
                    </CardContent>
                </Card>

                {/* Issues */}
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="px-4 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                <CardTitle className="text-xs font-semibold">Issues</CardTitle>
                            </div>
                            {filteredIssues.length > 0 ? (
                                <Badge variant="destructive" className="text-[10px] font-semibold rounded-full">
                                    {filteredIssues.length} found
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-[10px] font-semibold rounded-full text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">
                                    Clean
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        <IssuesPanel
                            issuesByColumn={issuesByColumn}
                            searchQuery={searchQuery}
                            onDeleteIssue={handleDeleteIssue}
                        />
                    </CardContent>
                </Card>

                {/* Data Preview */}
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <CardTitle className="text-xs font-semibold">Data Preview</CardTitle>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                                {previewRows.length} rows
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <PreviewPanel
                            isLoading={isPreviewLoading}
                            previewRows={previewRows}
                            previewColumns={previewColumns}
                        />
                    </CardContent>
                </Card>

            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-10 px-4 md:px-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* ── Toolbar: title + controls in one row ── */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none">Issue Scanner</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Data quality issues per column</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 min-w-36 justify-between text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Database className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <span className="truncate max-w-28">
                                            {selectedDataset === "all" ? "Select dataset" : (selectedDatasetName ?? "Select dataset")}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                                <DropdownMenuLabel className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">
                                    Select Dataset
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={selectedDataset} onValueChange={setSelectedDataset}>
                                    {datasets.length === 0 ? (
                                        <DropdownMenuRadioItem value="all" className="text-xs opacity-60 cursor-default">
                                            No datasets available
                                        </DropdownMenuRadioItem>
                                    ) : (
                                        datasets.map((d) => (
                                            <DropdownMenuRadioItem key={d.id} value={d.id.toString()} className="text-xs cursor-pointer truncate">
                                                {d.file_name}
                                            </DropdownMenuRadioItem>
                                        ))
                                    )}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium"
                            disabled={isScanning || selectedDataset === "all"}
                            onClick={handleScan}
                        >
                            {isScanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Run Scan
                        </Button>
                    </div>
                </div>

                {/* ── Stats + Search ── */}
                <Card className="shadow-sm">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            <div>
                                <p className="text-base font-bold tabular-nums leading-none">{stats.total}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Total Issues</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="hidden sm:block h-auto my-2" />
                        <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1">
                            <Columns className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <div>
                                <p className="text-base font-bold tabular-nums leading-none">{stats.uniqueColumns}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Cols Affected</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="hidden sm:block h-auto my-2" />
                        <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1">
                            <Database className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-base font-bold tabular-nums leading-none">{stats.datasetLevel}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Dataset-Level</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="hidden sm:block h-auto my-2" />
                        <div className="flex items-center px-4 py-2.5 flex-2 relative">
                            <Search className="absolute left-7 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search issues…"
                                className="pl-8 h-8 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ── Main content ── */}
                {mainContent}
            </div>
        </main>
    );
}
