"use client";

import React, { Suspense } from "react";
import {
    FlaskConical,
    Database,
    ChevronDown,
    Loader2,
    Table2,
    Info,
    MemoryStick,

} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { datasetApi, datalabApi } from "@/services/api";
import type { DataLabPreview, DataLabInspect } from "@/services/api";
import { Dataset } from "@/types/dataset";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function displayCell(val: unknown): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ label }: Readonly<{ label: string }>) {
    return (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed bg-muted/5">
            <FlaskConical className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground/60">{label}</p>
        </div>
    );
}

function PreviewTab({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="space-y-3">
            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                    <Table2 className="h-3 w-3" />
                    {data.total_rows.toLocaleString()} rows
                </Badge>
                <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                    <Database className="h-3 w-3" />
                    {data.total_columns} columns
                </Badge>
            </div>

            {/* Data table */}
            <Card className="shadow-sm overflow-hidden">
                <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-12 text-center select-none">#</th>
                                {data.columns.map((col) => (
                                    <th key={col} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.length === 0 ? (
                                <tr>
                                    <td colSpan={data.columns.length + 1} className="px-4 py-12 text-center text-xs text-muted-foreground italic">
                                        No rows available.
                                    </td>
                                </tr>
                            ) : (
                                data.rows.map((row, rowIndex) => (
                                    <tr key={JSON.stringify(row)} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground/50 text-center font-mono select-none tabular-nums">
                                            {rowIndex + 1}
                                        </td>
                                        {data.columns.map((col) => {
                                            const raw = row[col];
                                            const val = displayCell(raw);
                                            const isNull = raw === null || raw === undefined;
                                            return (
                                                <td
                                                    key={col}
                                                    className={cn(
                                                        "px-4 py-2.5 text-xs font-mono whitespace-nowrap max-w-48 truncate",
                                                        isNull ? "text-muted-foreground/30 italic" : "text-foreground/80"
                                                    )}
                                                    title={val || "null"}
                                                >
                                                    {isNull ? "null" : val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Card>
        </div>
    );
}

function InspectTab({ data }: Readonly<{ data: DataLabInspect }>) {
    return (
        <div className="space-y-4">

            {/* df.info() — column breakdown table */}
            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <CardTitle className="text-xs font-semibold font-mono">df.info()</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Column</th>
                                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dtype</th>
                                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Non-Null</th>
                                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Nulls</th>
                                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Null %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.info.columns.map((col) => {
                                const total = col.non_null_count + col.null_count;
                                const pct = total > 0 ? ((col.null_count / total) * 100).toFixed(1) : "0.0";
                                return (
                                    <tr key={col.column} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-2.5 text-xs font-medium">{col.column}</td>
                                        <td className="px-5 py-2.5">
                                            <Badge variant="secondary" className="text-[10px] font-mono font-semibold">
                                                {col.dtype}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-2.5 text-xs tabular-nums text-right text-muted-foreground">{col.non_null_count.toLocaleString()}</td>
                                        <td className={cn(
                                            "px-5 py-2.5 text-xs tabular-nums text-right font-semibold",
                                            col.null_count > 0 ? "text-red-500" : "text-muted-foreground/40"
                                        )}>
                                            {col.null_count.toLocaleString()}
                                        </td>
                                        <td className={cn(
                                            "px-5 py-2.5 text-xs tabular-nums text-right",
                                            col.null_count > 0 ? "text-red-400" : "text-muted-foreground/40"
                                        )}>
                                            {pct}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {data.info.text && (
                        <pre className="px-5 py-4 text-[11px] font-mono text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre-wrap border-t bg-muted/20">
                            {data.info.text}
                        </pre>
                    )}
                </CardContent>
            </Card>

            {/* df.shape */}
            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <CardTitle className="text-xs font-semibold font-mono">df.shape</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-3 divide-x divide-border">
                        <div className="px-5 py-4">
                            <p className="text-2xl font-bold tabular-nums leading-none">{data.shape.rows.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Rows</p>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-2xl font-bold tabular-nums leading-none">{data.shape.columns}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Columns</p>
                        </div>
                        <div className="px-5 py-4 flex items-center gap-2">
                            <MemoryStick className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-lg font-bold leading-none">{formatBytes(data.info.memory_usage_bytes)}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Memory</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* df.dtypes() */}
            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <CardTitle className="text-xs font-semibold font-mono">df.dtypes()</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-wrap gap-2">
                    {Object.entries(data.dtypes).map(([col, dtype]) => (
                        <div key={col} className="flex items-center gap-1.5 bg-muted/40 border rounded-md px-2.5 py-1">
                            <span className="text-xs font-medium">{col}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{dtype}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function DataLabContent() {
    const searchParams = useSearchParams();

    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedId, setSelectedId] = React.useState<string>(searchParams.get("dataset") ?? "");
    const [preview, setPreview] = React.useState<DataLabPreview | null>(null);
    const [inspect, setInspect] = React.useState<DataLabInspect | null>(null);
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);
    const [loadingPreview, setLoadingPreview] = React.useState(false);
    const [loadingInspect, setLoadingInspect] = React.useState(false);

    // ── Load dataset list ─────────────────────────────────────────────────────

    React.useEffect(() => {
        datasetApi.listDatasets()
            .then((res) => {
                const list: Dataset[] = (res as { results?: Dataset[] }).results ?? (res as unknown as Dataset[]);
                setDatasets(list);
                if (!selectedId && list.length > 0) setSelectedId(String(list[0].id));
            })
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    // ── Load preview + inspect when dataset changes ───────────────────────────

    React.useEffect(() => {
        if (!selectedId) return;
        const id = Number(selectedId);

        setPreview(null);
        setInspect(null);

        setLoadingPreview(true);
        datalabApi.preview(id)
            .then(setPreview)
            .catch(() => toast.error("Failed to load preview."))
            .finally(() => setLoadingPreview(false));

        setLoadingInspect(true);
        datalabApi.inspect(id)
            .then(setInspect)
            .catch(() => toast.error("Failed to load inspection data."))
            .finally(() => setLoadingInspect(false));
    }, [selectedId]);

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;

    return (
        <div className="flex flex-col gap-6 p-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <FlaskConical className="h-7 w-7 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight leading-none font-mono">DataLab</h1>
                        <p className="text-xs text-muted-foreground mt-1">Inspect and preview your datasets</p>
                    </div>
                </div>

                {/* Dataset picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2 min-w-44 justify-between text-xs" disabled={loadingDatasets}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-36">
                                    {loadingDatasets ? "Loading…" : selectedName ?? "Select dataset"}
                                </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">
                            Dataset
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={selectedId} onValueChange={setSelectedId}>
                            {datasets.length === 0
                                ? <DropdownMenuRadioItem value="" disabled className="text-xs opacity-50">No datasets found</DropdownMenuRadioItem>
                                : datasets.map((d) => (
                                    <DropdownMenuRadioItem key={d.id} value={String(d.id)} className="text-xs truncate cursor-pointer">
                                        {d.file_name}
                                    </DropdownMenuRadioItem>
                                ))
                            }
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── Content ── */}
            {selectedId ? (
                <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="preview" className="gap-2">
                            <Table2 className="h-3.5 w-3.5" /> Data Preview
                        </TabsTrigger>
                        <TabsTrigger value="inspect" className="gap-2">
                            <Info className="h-3.5 w-3.5" /> Inspect
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Preview tab ── */}
                    <TabsContent value="preview">
                        {loadingPreview && (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                            </div>
                        )}
                        {!loadingPreview && preview && <PreviewTab data={preview} />}
                        {!loadingPreview && !preview && <EmptyState label="No preview data" />}
                    </TabsContent>

                    {/* ── Inspect tab ── */}
                    <TabsContent value="inspect">
                        {loadingInspect && (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                            </div>
                        )}
                        {!loadingInspect && inspect && <InspectTab data={inspect} />}
                        {!loadingInspect && !inspect && <EmptyState label="No inspection data" />}
                    </TabsContent>
                </Tabs>
            ) : (
                <EmptyState label="Select a dataset to begin" />
            )}

        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataLabPage() {
    return (
        <Suspense fallback={
            <div className="flex h-full items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
            </div>
        }>
            <DataLabContent />
        </Suspense>
    );
}
