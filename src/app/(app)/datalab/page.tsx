"use client";

import React, { Suspense } from "react";
import {
    FlaskConical,
    Database,
    ChevronDown,
    Loader2,
    Table2,
    Info,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { datasetApi, datalabApi } from "@/services/api";
import type { DataLabPreview, DataLabInspect, CastColumnResult, CastWarning } from "@/services/api";
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


function DatasetMetaStrip({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-[11px] font-semibold gap-1.5 font-mono">
                {data.file_name}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5 font-mono">
                {data.file_format}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                {data.dataset_size}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                <Table2 className="h-3 w-3" />
                {data.total_rows.toLocaleString()} rows
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                <Database className="h-3 w-3" />
                {data.total_columns} columns
            </Badge>
        </div>
    );
}

function PreviewTab({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="space-y-3">
            <DatasetMetaStrip data={data} />

            {/* Data table */}
            <Card className="shadow-sm overflow-hidden rounded-none">
                <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground w-12 text-center select-none">#</th>
                                {data.columns.map((col) => (
                                    <th key={col} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
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
                                    <tr key={`${rowIndex}_${displayCell(row[data.columns[0]])}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
                                                    title={val || "—"}
                                                >
                                                    {isNull ? "—" : val}
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

const CAST_TYPES = ["datetime", "numeric", "float", "integer", "string", "boolean", "category"] as const;

function InspectTab({ data, preview, datasetId, onRefetchInspect }: Readonly<{
    data: DataLabInspect;
    preview: DataLabPreview;
    datasetId: number;
    onRefetchInspect: () => void;
}>) {
    const [pendingCasts, setPendingCasts] = React.useState<Record<string, string>>({});
    const [casting, setCasting] = React.useState(false);
    const [castResults, setCastResults] = React.useState<CastColumnResult[] | null>(null);
    const [castWarnings, setCastWarnings] = React.useState<CastWarning[] | null>(null);

    const hasPending = Object.keys(pendingCasts).length > 0;

    React.useEffect(() => {
        setPendingCasts({});
        setCastResults(null);
        setCastWarnings(null);
    }, [data]);

    async function handleCast(force = false) {
        setCasting(true);
        try {
            const result = await datalabApi.cast(datasetId, pendingCasts, force);
            setCastWarnings(null);
            setCastResults(result.updated_columns);
            const hasErrors = result.updated_columns.some((c) => c.status.startsWith("error"));
            if (hasErrors) {
                toast.warning("Some columns could not be cast. Check highlighted rows.");
            } else {
                toast.success("Columns cast successfully.");
                setPendingCasts({});
                onRefetchInspect();
            }
        } catch (err: unknown) {
            const data = (err as { response?: { data?: { warnings?: CastWarning[]; errors?: string[] } } })?.response?.data;
            if (data?.warnings && data.warnings.length > 0) {
                setCastWarnings(data.warnings);
            } else if (data?.errors && data.errors.length > 0) {
                toast.error(data.errors.join(" "));
            } else {
                toast.error("Failed to cast columns.");
            }
        } finally {
            setCasting(false);
        }
    }

    return (
        <div className="space-y-4">
            <DatasetMetaStrip data={preview} />

            {/* df.info() — column breakdown table */}
            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            <CardTitle className="text-xs font-semibold font-mono">df.info()</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasPending && (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs rounded-none gap-1.5"
                                    onClick={() => handleCast(false)}
                                    disabled={casting}
                                >
                                    {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Apply Casts
                                </Button>
                            )}
                            <span className="text-[11px] text-muted-foreground font-mono">
                                {formatBytes(data.info.memory_usage_bytes)} memory
                            </span>
                        </div>
                    </div>
                </CardHeader>

                {castWarnings && (
                    <div className="border-b border-amber-500/30 bg-amber-500/5 px-5 py-3 space-y-2">
                        <p className="text-[11px] font-semibold text-amber-600">Conversion warnings — confirm to proceed:</p>
                        <ul className="space-y-1">
                            {castWarnings.map((w) => (
                                <li key={w.column} className="text-[11px] text-muted-foreground font-mono">
                                    <span className="font-semibold">{w.column}:</span> {w.warning}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2 pt-1">
                            <Button size="sm" className="h-7 text-xs rounded-none gap-1.5" onClick={() => handleCast(true)} disabled={casting}>
                                {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                Confirm
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-none" onClick={() => setCastWarnings(null)} disabled={casting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                <CardContent className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Column</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Dtype</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Non-Null</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Nulls</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Null %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.info.columns.map((col) => {
                                const result = castResults?.find((r) => r.column === col.column);
                                const hasError = result?.status.startsWith("error");
                                return (
                                    <tr
                                        key={col.column}
                                        className={cn(
                                            "border-b border-border/50 hover:bg-muted/30 transition-colors",
                                            (hasError || col.null_count > 0 || col.null_pct > 0) && "bg-red-600/5"
                                        )}
                                    >
                                        <td className="px-5 py-2.5 text-xs font-medium">{col.column}</td>
                                        <td className="px-5 py-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[11px] font-mono font-semibold shrink-0">
                                                    {result ? result.to_dtype : col.dtype}
                                                </Badge>

                                                <Select
                                                    value={pendingCasts[col.column] ?? "none"}
                                                    onValueChange={(val) => {
                                                        setPendingCasts((prev) => {
                                                            if (val === "none") {
                                                                const next = { ...prev };
                                                                delete next[col.column];
                                                                return next;
                                                            }
                                                            return { ...prev, [col.column]: val };
                                                        });
                                                    }}
                                                    disabled={casting}
                                                >
                                                    <SelectTrigger
                                                        className="h-7 text-[11px] font-mono w-30 rounded-none border-border/60 bg-background/50 focus:ring-0 focus:ring-offset-0 transition-all hover:bg-muted/50"
                                                    >
                                                        <SelectValue placeholder="Cast to..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none border-border/60">
                                                        <SelectItem value="none" className="text-[11px] font-mono focus:bg-primary focus:text-primary-foreground">
                                                            none
                                                        </SelectItem>
                                                        {CAST_TYPES.map((t) => (
                                                            <SelectItem
                                                                key={t}
                                                                value={t}
                                                                className="text-[11px] font-mono focus:bg-primary focus:text-primary-foreground"
                                                            >
                                                                {t}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {result && (
                                                    <span className={cn(
                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded-none border",
                                                        hasError
                                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                            : "bg-green-500/10 text-green-600 border-green-500/20"
                                                    )}>
                                                        {hasError ? result.status : "Success"}
                                                    </span>
                                                )}
                                            </div>
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
                                            col.null_pct > 0 ? "text-red-400" : "text-muted-foreground/40"
                                        )}>
                                            {col.null_pct.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function DataLabContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedId, setSelectedId] = React.useState<string>(searchParams.get("dataset") ?? "");
    const [preview, setPreview] = React.useState<DataLabPreview | null>(null);
    const [inspect, setInspect] = React.useState<DataLabInspect | null>(null);
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);
    const [loadingData, setLoadingData] = React.useState(false);

    // ── Persist selection in URL so refresh restores it ──────────────────────

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) {
            params.set("dataset", selectedId);
        } else {
            params.delete("dataset");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedId]);

    // ── Load dataset list ─────────────────────────────────────────────────────

    React.useEffect(() => {
        datasetApi.listDatasets()
            .then((res) => {
                const list: Dataset[] = (res as { results?: Dataset[] }).results ?? (res as unknown as Dataset[]);
                setDatasets(list);
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
        setLoadingData(true);

        Promise.all([
            datalabApi.preview(id),
            datalabApi.inspect(id),
        ])
            .then(([previewData, inspectData]) => {
                setPreview(previewData);
                setInspect(inspectData);
            })
            .catch(() => toast.error("Failed to load dataset."))
            .finally(() => setLoadingData(false));
    }, [selectedId]);

    function refetchInspect() {
        if (!selectedId) return;
        datalabApi.inspect(Number(selectedId))
            .then(setInspect)
            .catch(() => toast.error("Failed to refresh inspect data."));
    }

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;

    return (
        <div className="flex flex-col gap-6 p-8">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <FlaskConical className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight leading-none font-mono">DataLab</h1>
                    <p className="text-xs text-muted-foreground mt-1">Inspect and preview your datasets</p>
                </div>
            </div>

            {/* ── Content ── */}
            <Tabs defaultValue="preview" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="rounded-none">
                        <TabsTrigger value="preview" className="gap-2 rounded-none">
                            <Table2 className="h-3.5 w-3.5" /> Data Preview
                        </TabsTrigger>
                        <TabsTrigger value="inspect" className="gap-2 rounded-none">
                            <Info className="h-3.5 w-3.5" /> Inspect
                        </TabsTrigger>
                    </TabsList>

                    {/* Dataset picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 min-w-44 justify-between text-xs rounded-none" disabled={loadingDatasets}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-36">
                                        {loadingDatasets ? "Loading…" : selectedName ?? "Select dataset"}
                                    </span>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-none">
                            <DropdownMenuLabel className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
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

                {/* ── Preview tab ── */}
                <TabsContent value="preview">
                    {!selectedId && (
                        <div className="border bg-muted/5 h-105" />
                    )}
                    {selectedId && loadingData && (
                        <div className="flex items-center justify-center border bg-muted/5 h-105">
                            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                        </div>
                    )}
                    {selectedId && !loadingData && preview && <PreviewTab data={preview} />}
                    {selectedId && !loadingData && !preview && (
                        <div className="border bg-muted/5 h-105" />
                    )}
                </TabsContent>

                {/* ── Inspect tab ── */}
                <TabsContent value="inspect">
                    {!selectedId && (
                        <div className="border bg-muted/5 h-105" />
                    )}
                    {selectedId && loadingData && (
                        <div className="flex items-center justify-center border bg-muted/5 h-105">
                            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                        </div>
                    )}
                    {selectedId && !loadingData && inspect && preview && <InspectTab data={inspect} preview={preview} datasetId={Number(selectedId)} onRefetchInspect={refetchInspect} />}
                    {selectedId && !loadingData && !inspect && (
                        <div className="border bg-muted/5 h-105" />
                    )}
                </TabsContent>
            </Tabs>

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
