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
    Trash2,
    Columns,
    BarChart3,
    TableProperties,
    Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Issue, Dataset, DiagnoseOverview, IssueSummaryResponse } from "@/types/dataset";
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
        const nestedRows = extractPreviewRows(obj[key]);
        if (nestedRows.length > 0) return nestedRows;
    }
    return [];
}

export default function IssuesPage() {
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
                await Promise.all([fetchIssuesForDataset(datasetId), fetchPreviewForDataset(datasetId)]);
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
                await Promise.all([fetchIssuesForDataset(selectedDataset), fetchPreviewForDataset(selectedDataset)]);
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
            setOverview(result.overview);
            setIssuesByColumn(result.issues_by_column || {});
            const issuesFromScan = Object.values(result.issues_by_column || {}).flat();
            setIssues(issuesFromScan);
            try {
                const summaryData = await datasetApi.getIssueSummary(Number(selectedDataset));
                setSummary(summaryData);
            } catch { setSummary(null); }
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
        return issues.filter((issue) => {
            const q = searchQuery.toLowerCase();
            return (
                issue.description.toLowerCase().includes(q) ||
                issue.column_name?.toLowerCase().includes(q) ||
                issue.issue_type.toLowerCase().includes(q)
            );
        });
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
                byType: summary.by_type,
            };
        }
        const total = issues.length;
        const uniqueColumns = new Set(issues.map((i) => i.column_name || "__dataset__")).size;
        const datasetLevel = issues.filter((i) => !i.column_name || i.column_name === "__dataset__").length;
        return { total, uniqueColumns, datasetLevel, byType: {} as Record<string, number> };
    }, [issues, summary]);

    const renderOverviewPanel = () => {
        if (!overview) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <TableProperties className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/60 italic font-medium">Run a scan to see the dataset overview.</p>
                </div>
            );
        }
        return (
            <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                        {overview.shape.rows} rows × {overview.shape.columns} cols
                    </Badge>
                    <Badge variant={overview.duplicate_rows > 0 ? "destructive" : "secondary"} className="text-[10px] font-bold">
                        {overview.duplicate_rows} duplicates
                    </Badge>
                    <Badge variant={overview.total_missing > 0 ? "destructive" : "secondary"} className="text-[10px] font-bold">
                        {overview.total_missing} missing
                    </Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Columns className="h-3 w-3" /> Columns
                        </h4>
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/20">
                                        <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Name</th>
                                        <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right">Nulls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(overview.columns).map(([colName, info]) => (
                                        <tr key={colName} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-2 text-xs font-bold">{colName}</td>
                                            <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{info.dtype}</td>
                                            <td className={cn("px-4 py-2 text-xs font-bold text-right tabular-nums", info.null_count > 0 ? "text-red-500" : "text-muted-foreground/40")}>{info.null_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {Object.keys(overview.numeric_summary).length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                                <BarChart3 className="h-3 w-3" /> Numeric Stats
                            </h4>
                            <div className="rounded-xl border border-border/30 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border/20">
                                            <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Column</th>
                                            <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right">Mean</th>
                                            <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right">Std</th>
                                            <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right">Min</th>
                                            <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-right">Max</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(overview.numeric_summary).map(([colName, s]) => (
                                            <tr key={colName} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-2 text-xs font-bold">{colName}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{s.mean?.toFixed(2) ?? "-"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{s.std?.toFixed(2) ?? "-"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{s.min?.toFixed(2) ?? "-"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{s.max?.toFixed(2) ?? "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const previewScrollRef = React.useRef<HTMLDivElement>(null);

    const renderPreviewPanel = () => {
        if (isPreviewLoading) {
            return (
                <div className="h-48 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                </div>
            );
        }
        if (previewRows.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <Table2 className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/60 italic font-medium">No preview rows available.</p>
                </div>
            );
        }
        return (
            <div
                ref={previewScrollRef}
                className="overflow-auto max-h-[calc(100vh-22rem)]"
                onWheel={(e) => {
                    if (e.shiftKey && previewScrollRef.current) {
                        e.preventDefault();
                        previewScrollRef.current.scrollLeft += e.deltaY;
                    }
                }}
            >
                <table className="text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-muted/80 backdrop-blur-sm border-b border-border/20">
                            {previewColumns.map((column) => (
                                <th key={column} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {previewRows.map((row, rowIndex) => {
                            const rowId = (row.id as string | number) || (row.ID as string | number) || rowIndex;
                            return (
                                <tr key={`preview-row-${rowId}`} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                                    {previewColumns.map((column) => {
                                        const value = row[column];
                                        let displayValue: string;
                                        if (value === null || value === undefined) displayValue = "";
                                        else if (typeof value === "string") displayValue = value;
                                        else if (typeof value === "number" || typeof value === "boolean") displayValue = String(value);
                                        else displayValue = JSON.stringify(value);
                                        return (
                                            <td key={`${rowId}-${column}`} className="px-3 py-1.5 text-[11px] font-medium text-foreground/80 whitespace-nowrap">
                                                {displayValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <p className="sticky left-0 px-3 py-2 text-[9px] text-muted-foreground/40 font-bold italic border-t border-border/10 bg-muted/10">
                    Shift + Scroll to pan horizontally
                </p>
            </div>
        );
    };

    const renderIssueRows = (issuesToRender: Issue[]) => (
        <AnimatePresence>
            {issuesToRender.map((issue) => (
                <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-border/10 hover:bg-muted/20 transition-colors align-top group"
                >
                    <td className="px-5 py-3">
                        <Badge variant="secondary" className="text-[9px] font-black whitespace-nowrap">{issue.issue_type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{issue.description}</td>
                    <td className="px-5 py-3 text-xs font-bold text-center tabular-nums">{issue.affected_rows ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-foreground/70">{issue.suggested_fix || "—"}</td>
                    <td className="px-5 py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleDeleteIssue(issue.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </td>
                </motion.tr>
            ))}
        </AnimatePresence>
    );

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-muted-foreground/30 animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Issue Scanner</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Inspect and manage data quality issues per column</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 px-3 rounded-xl border-border/40 font-bold text-xs gap-2 min-w-36 justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate max-w-32 text-xs">
                                            {selectedDataset === "all"
                                                ? "Select dataset"
                                                : datasets.find((d) => d.id === Number.parseInt(selectedDataset))?.file_name || "Select dataset"}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50 px-2 py-1.5">Select Dataset</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={selectedDataset} onValueChange={setSelectedDataset}>
                                    {datasets.length === 0 && (
                                        <DropdownMenuRadioItem value="all" className="rounded-lg py-2 font-bold text-xs cursor-default opacity-60">No datasets available</DropdownMenuRadioItem>
                                    )}
                                    {datasets.map((d) => (
                                        <DropdownMenuRadioItem key={d.id} value={d.id.toString()} className="rounded-lg py-2 font-bold text-xs cursor-pointer focus:bg-primary/10 transition-colors truncate">
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            className="h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isScanning || selectedDataset === "all"}
                            onClick={handleScan}
                        >
                            {isScanning ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                            Run Scan
                        </Button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="flex items-stretch divide-x divide-border/30 border border-border/40 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 flex-1">
                        <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                        <div>
                            <p className="text-2xl font-black tabular-nums leading-none">{stats.total}</p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Total Issues</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 flex-1">
                        <Columns className="h-4 w-4 text-blue-500 shrink-0" />
                        <div>
                            <p className="text-2xl font-black tabular-nums leading-none">{stats.uniqueColumns}</p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Columns Affected</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 flex-1">
                        <Database className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-2xl font-black tabular-nums leading-none">{stats.datasetLevel}</p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Dataset-Level</p>
                        </div>
                    </div>
                    <div className="flex-2 flex items-center px-4 py-2 relative group/search">
                        <Search className="absolute left-7 h-4 w-4 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search issues…"
                            className="pl-9 h-9 bg-transparent border-border/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-xs font-bold transition-all placeholder:text-muted-foreground/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main inspector */}
                <IssuesContent
                    isLoading={isLoading}
                    selectedDataset={selectedDataset}
                    renderPreviewPanel={renderPreviewPanel}
                    renderOverviewPanel={renderOverviewPanel}
                    issuesByColumn={issuesByColumn}
                    searchQuery={searchQuery}
                    renderIssueRows={renderIssueRows}
                    filteredIssues={filteredIssues}
                    overview={overview}
                />
            </div>
        </main>
    );
}

interface IssuesContentProps {
    isLoading: boolean;
    selectedDataset: string;
    renderPreviewPanel: () => React.ReactNode;
    renderOverviewPanel: () => React.ReactNode;
    issuesByColumn: Record<string, Issue[]>;
    searchQuery: string;
    renderIssueRows: (issues: Issue[]) => React.ReactNode;
    filteredIssues: Issue[];
    overview?: DiagnoseOverview | null;
}

function SectionHeader({ icon, title, badge }: Readonly<{ icon: React.ReactNode; title: string; badge?: React.ReactNode }>) {
    return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-muted/60 border border-border/30">
                    {icon}
                </div>
                <h2 className="text-sm font-black tracking-tight">{title}</h2>
            </div>
            {badge}
        </div>
    );
}

function IssuesContent({
    isLoading,
    selectedDataset,
    renderPreviewPanel,
    renderOverviewPanel,
    issuesByColumn,
    searchQuery,
    renderIssueRows,
    filteredIssues,
}: Readonly<IssuesContentProps>) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-2xl bg-muted/20 animate-pulse border border-border/30" />
                ))}
            </div>
        );
    }

    if (selectedDataset === "all") {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 rounded-2xl border border-dashed border-border/40">
                <Database className="h-8 w-8 text-muted-foreground/20" />
                <div>
                    <p className="text-sm font-bold">Select a dataset</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose a dataset to begin scanning for issues.</p>
                </div>
            </div>
        );
    }

    const visibleByColumn: Record<string, Issue[]> = {};
    for (const [col, colIssues] of Object.entries(issuesByColumn)) {
        const visible = colIssues.filter((issue) => {
            const q = searchQuery.toLowerCase();
            return (
                issue.description.toLowerCase().includes(q) ||
                issue.column_name?.toLowerCase().includes(q) ||
                issue.issue_type.toLowerCase().includes(q)
            );
        });
        if (visible.length > 0) visibleByColumn[col] = visible;
    }

    return (
        <div className="space-y-8">

            {/* ── Overview ── */}
            <section>
                <SectionHeader
                    icon={<TableProperties className="h-3.5 w-3.5 text-muted-foreground" />}
                    title="Overview"
                />
                <div className="rounded-2xl border border-border/40 overflow-hidden">
                    {renderOverviewPanel()}
                </div>
            </section>

            {/* ── Issues ── */}
            <section>
                <SectionHeader
                    icon={<AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                    title="Issues"
                    badge={
                        filteredIssues.length > 0 ? (
                            <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-black">
                                {filteredIssues.length} found
                            </span>
                        ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black">
                                Clean
                            </span>
                        )
                    }
                />
                {Object.keys(visibleByColumn).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/40">
                        <ShieldAlert className="h-7 w-7 text-emerald-500/40" />
                        <div>
                            <p className="text-sm font-bold text-emerald-500">No issues found</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Run a scan to detect dirty data.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(visibleByColumn).map(([col, colIssues]) => (
                            <div key={col} className="rounded-2xl border border-border/40 overflow-hidden">
                                <div className="px-4 py-3 bg-muted/20 border-b border-border/20 flex items-center justify-between">
                                    <span className="text-xs font-black flex items-center gap-2">
                                        <Columns className="h-3.5 w-3.5 text-blue-500/60" />
                                        {col === "__dataset__" ? "Dataset-Level" : col}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] font-black rounded-md">{colIssues.length}</Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/10 border-b border-border/20">
                                                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Type</th>
                                                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Description</th>
                                                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground text-center">Rows</th>
                                                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Suggested Fix</th>
                                                <th className="px-4 py-2.5 w-10" />
                                            </tr>
                                        </thead>
                                        <tbody>{renderIssueRows(colIssues)}</tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Data Preview ── */}
            <section>
                <SectionHeader
                    icon={<Table2 className="h-3.5 w-3.5 text-muted-foreground" />}
                    title="Data Preview"
                />
                <div className="rounded-2xl border border-border/40 overflow-hidden">
                    {renderPreviewPanel()}
                </div>
            </section>

        </div>
    );
}
