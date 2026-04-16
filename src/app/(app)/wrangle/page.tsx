"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, RotateCcw, PlusCircle, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { IssuesPanel } from "./_components/IssuesPanel";
import { OverviewPanel } from "./_components/OverviewPanel";
import { wranglingApi } from "@/services/wrangling.service";
import { datasetApi } from "@/services/dataset.service";
import { Dataset, WrangleOperation, Issue, DiagnoseOverview, IssueSummaryResponse } from "@/types/dataset";

export default function WranglePage() {
    const searchParams = useSearchParams();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
    const [operations, setOperations] = useState<WrangleOperation[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [issuesByColumn, setIssuesByColumn] = useState<Record<string, Issue[]>>({});
    const [overview, setOverview] = useState<DiagnoseOverview | null>(null);
    const [summary, setSummary] = useState<IssueSummaryResponse | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewOp, setShowNewOp] = useState(false);

    useEffect(() => {
        datasetApi.listDatasets().then((data) => {
            const list = data.results || [];
            setDatasets(list);
            const paramId = searchParams.get("dataset");
            if (paramId) {
                const id = Number(paramId);
                if (list.some((d: Dataset) => d.id === id)) {
                    setSelectedDataset(id);
                    fetchDatasetMeta(id);
                }
            }
        });
    }, [searchParams]);

    const fetchDatasetMeta = async (id: number) => {
        try {
            const [ops, existingIssues] = await Promise.all([
                wranglingApi.list(id),
                datasetApi.listIssues({ dataset: id })
            ]);
            setOperations(ops);
            setIssues(existingIssues);
            
            const grouped: Record<string, Issue[]> = {};
            for (const issue of existingIssues) {
                const key = issue.column_name || "__dataset__";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(issue);
            }
            setIssuesByColumn(grouped);

            try {
                const s = await datasetApi.getIssueSummary(id);
                setSummary(s);
            } catch { setSummary(null); }
        } catch (err) {
            console.error("Meta fetch error:", err);
        }
    };

    const handleScan = async () => {
        if (!selectedDataset) {
            toast.error("Please select a dataset first.");
            return;
        }
        try {
            setIsScanning(true);
            const result = await datasetApi.diagnoseDataset(selectedDataset);
            setOverview(result.overview);
            const flatIssues = result.issues || [];
            setIssues(flatIssues);

            const grouped: Record<string, Issue[]> = {};
            for (const issue of flatIssues) {
                const key = issue.column_name || "__dataset__";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(issue);
            }
            setIssuesByColumn(grouped);

            try {
                setSummary(await datasetApi.getIssueSummary(selectedDataset));
            } catch { setSummary(null); }
            toast.success(`Scan complete — ${result.total_issues} issue(s) detected.`);
        } catch (error) {
            console.error("Scan error:", error);
            toast.error("Diagnostic scan failed.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleRevert = async (id: number) => {
        try {
            await wranglingApi.revert(id);
            if (selectedDataset) fetchDatasetMeta(selectedDataset);
            toast.success("Operation reverted.");
        } catch {
            toast.error("Revert failed.");
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

    const onDatasetChange = (id: number) => {
        setSelectedDataset(id);
        fetchDatasetMeta(id);
    };

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold font-mono">Data Wrangling</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                        onClick={handleScan}
                        disabled={!selectedDataset || isScanning}
                    >
                        {isScanning ? "Scanning..." : "Run Quality Scan"}
                    </button>
                    <button
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                        onClick={() => setShowNewOp(true)}
                        disabled={!selectedDataset}
                    >
                        <PlusCircle className="h-4 w-4" /> New Operation
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-border/40">
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Active Dataset</span>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm bg-background/50 hover:bg-background transition-colors outline-none focus:ring-1 ring-primary/20"
                        value={selectedDataset ?? ""}
                        onChange={e => onDatasetChange(Number(e.target.value))}
                    >
                        <option value="" disabled>Select dataset</option>
                        {datasets.map(ds => (
                            <option key={ds.id} value={ds.id}>{ds.file_name}</option>
                        ))}
                    </select>
                </div>
                {!!selectedDataset && (
                    <div className="flex items-center gap-3 ml-4 animate-in fade-in slide-in-from-left-2 duration-500">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Quality Score</span>
                            <span className="text-lg font-mono font-bold leading-none">{summary ? clamp(100 - (summary.total_issues * 2), 0, 100) : "—"}%</span>
                        </div>
                        <div className="h-8 w-px bg-border/40 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Issues</span>
                            <span className="text-lg font-mono font-bold leading-none text-red-500">{summary?.total_issues ?? issues.length}</span>
                        </div>
                    </div>
                )}
            </div>

            {selectedDataset ? (
                <Tabs defaultValue="operations" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-6">
                        <TabsTrigger value="operations">History</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="operations" className="space-y-4">
                        <div className="rounded-xl border bg-card/30 overflow-hidden">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">ID</th>
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Column</th>
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground text-right">Rows</th>
                                        <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Applied</th>
                                        <th className="p-4 w-20" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {operations.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-muted-foreground italic">No wrangling operations found.</td>
                                        </tr>
                                    ) : (
                                        operations.map(op => (
                                            <tr key={op.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                                                <td className="p-4 font-mono text-[11px] opacity-40">{op.id}</td>
                                                <td className="p-4">
                                                    <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                                                        {op.operation_type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground font-medium">{op.column_name || "—"}</td>
                                                <td className="p-4">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                                        op.status === 'APPLIED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                    )}>
                                                        {op.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right tabular-nums font-mono">{op.rows_affected ?? '-'}</td>
                                                <td className="p-4 text-muted-foreground text-[11px]">{op.applied_at ? new Date(op.applied_at).toLocaleString() : '-'}</td>
                                                <td className="p-4">
                                                    {op.status === "APPLIED" && (
                                                        <button
                                                            className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRevert(op.id)}
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Revert
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="issues">
                        <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-dashed mb-6">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Search detected issues..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <IssuesPanel 
                            issuesByColumn={issuesByColumn} 
                            searchQuery={searchQuery}
                            onDeleteIssue={handleDeleteIssue} 
                        />
                    </TabsContent>

                    <TabsContent value="overview">
                        <OverviewPanel overview={overview} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-3xl bg-muted/5">
                    <Sparkles className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h2 className="text-xl font-bold text-muted-foreground/60">No Dataset Selected</h2>
                    <p className="text-sm text-muted-foreground/40 mt-1">Select a dataset from the dropdown to start wrangling.</p>
                </div>
            )}

            {showNewOp && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-background rounded-3xl p-10 max-w-lg w-full shadow-2xl border-2 border-border/50 scale-in-center">
                        <h3 className="text-2xl font-bold mb-2">New Transformation</h3>
                        <p className="text-sm text-muted-foreground mb-8">Define a new wrangling step for your data pipeline.</p>
                        <div className="p-6 bg-muted/20 rounded-2xl border border-dashed text-center text-xs text-muted-foreground mb-8">
                            Wrangling Wizard coming soon.
                        </div>
                        <div className="flex justify-end">
                            <button 
                                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold text-sm hover:bg-secondary/80 transition-all active:scale-95" 
                                onClick={() => setShowNewOp(false)}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper for numeric clamp
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
