"use client";

import React from "react";
import {
    Loader2, Info, KeyRound,
    ChevronUp, ChevronDown, ChevronsUpDown, Search, X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabPreview, DataLabInspect, CastColumnResult, CastWarning } from "@/services/api";
import { toast } from "sonner";
import { DatasetMetaStrip } from "./DatasetMetaStrip";

import { CAST_TYPES, formatBytes } from "../_lib";

type SortKey = "column" | "non_null_count" | "unique_count" | "null_count" | "null_pct";

export function InspectTab({ data, preview, datasetId, onRefetchAll }: Readonly<{
    data: DataLabInspect;
    preview: DataLabPreview;
    datasetId: number;
    onRefetchAll: () => void;
}>) {
    const [pendingCasts, setPendingCasts] = React.useState<Record<string, string>>({});
    const [casting, setCasting] = React.useState(false);
    const [castResults, setCastResults] = React.useState<CastColumnResult[] | null>(null);
    const [castWarnings, setCastWarnings] = React.useState<CastWarning[] | null>(null);
    const [search, setSearch] = React.useState("");
    const [sortKey, setSortKey] = React.useState<SortKey | null>(null);
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

    const hasPending = Object.keys(pendingCasts).length > 0;

    React.useEffect(() => {
        setPendingCasts({});
        setCastResults(null);
        setCastWarnings(null);
        setSearch("");
        setSortKey(null);
        setSortDir("asc");
    }, [data]);

    function toggleSort(key: SortKey) {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else if (sortDir === "asc") {
            setSortDir("desc");
        } else {
            setSortKey(null);
        }
    }

    const visibleColumns = React.useMemo(() => {
        let cols = data.info.columns;
        if (search.trim()) {
            const q = search.toLowerCase();
            cols = cols.filter((c) => c.column.toLowerCase().includes(q));
        }
        if (!sortKey) return cols;
        return [...cols].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            const cmp = typeof av === "string"
                ? av.localeCompare(bv as string)
                : av - (bv as number);
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [data.info.columns, search, sortKey, sortDir]);


    async function handleCast(force = false) {
        setCasting(true);
        try {
            const result = await datalabApi.cast(datasetId, pendingCasts, force);
            setCastWarnings(null);
            setCastResults(result.updated_columns);
            const hasErrors = result.updated_columns.some((c) => c.status.startsWith("error"));
            const hasWarnings = result.updated_columns.some((c) => c.status === "warning");
            if (hasErrors) {
                toast.warning("Some columns could not be cast. Check highlighted rows.");
            } else if (hasWarnings) {
                toast.warning("Cast completed with warnings — null values may have become literal 'nan' strings.");
                setPendingCasts({});
                onRefetchAll();
            } else {
                toast.success("Columns cast successfully.");
                setPendingCasts({});
                onRefetchAll();
            }
        } catch (err: unknown) {
            const errRes = (err as { response?: { status?: number; data?: { warnings?: CastWarning[]; validation_errors?: string[]; updated_columns?: CastColumnResult[] } } })?.response;
            const errData = errRes?.data;
            if (errRes?.status === 422 && errData?.updated_columns) {
                setCastResults(errData.updated_columns);
                toast.error("All columns failed to cast. Check highlighted rows.");
            } else if (errData?.warnings && errData.warnings.length > 0) {
                setCastWarnings(errData.warnings);
            } else if (errData?.validation_errors && errData.validation_errors.length > 0) {
                toast.error(errData.validation_errors.join(" "));
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

            <Card className="rounded-none shadow-sm overflow-hidden">
                        <CardHeader className="px-5 py-3 border-b border-border bg-muted/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    <CardTitle className="text-sm font-semibold font-mono">df.info()</CardTitle>
                                </div>
                                <div className="flex items-center gap-3">
                                    {hasPending && (
                                        <Button
                                            size="sm"
                                            className="h-7 text-sm rounded-none gap-1.5"
                                            onClick={() => handleCast(false)}
                                            disabled={casting}
                                        >
                                            {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                            Apply Casts
                                        </Button>
                                    )}
                                    <span className="text-xs text-gray-400 font-mono">
                                        {formatBytes(data.info.memory_usage_bytes)} memory
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Search bar */}
                        <div className="border-b border-border px-5 py-2 flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                            <input
                                type="text"
                                placeholder="Filter columns…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 font-mono text-foreground"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="text-muted-foreground/40 hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {search && (
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                    {visibleColumns.length} / {data.info.columns.length}
                                </span>
                            )}
                        </div>

                        {castWarnings && (
                            <div className="border-b border-amber-500/30 bg-amber-500/5 px-5 py-3 space-y-2">
                                <p className="text-xs font-semibold text-amber-600">Conversion warnings — confirm to proceed:</p>
                                <ul className="space-y-1">
                                    {castWarnings.map((w) => (
                                        <li key={w.column} className="text-xs text-muted-foreground font-mono">
                                            <span className="font-semibold">{w.column}:</span> {w.warning}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2 pt-1">
                                    <Button size="sm" className="h-7 text-sm rounded-none gap-1.5" onClick={() => handleCast(true)} disabled={casting}>
                                        {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                        Confirm
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-sm rounded-none" onClick={() => setCastWarnings(null)} disabled={casting}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <CardContent className="p-0">
                            <ScrollArea className="w-full h-[calc(100vh-340px)] min-h-[400px]">
                                <table className="w-full text-left border-collapse relative">
                                    <thead className="sticky top-0 z-30 bg-background shadow-sm">
                                        <tr className="bg-muted/40 border-b border-border">
                                        <th
                                            className="px-5 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort("column")}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                Column <SortIcon col="column" activeKey={sortKey} dir={sortDir} />
                                            </span>
                                        </th>
                                        <th className="px-5 py-2.5 text-xs font-semibold text-muted-foreground">
                                            Dtype
                                        </th>
                                        <th
                                            className="px-5 py-2.5 text-xs font-semibold text-muted-foreground text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort("non_null_count")}
                                        >
                                            <span className="inline-flex items-center justify-end gap-1 w-full">
                                                Non-Null <SortIcon col="non_null_count" activeKey={sortKey} dir={sortDir} />
                                            </span>
                                        </th>
                                        <th
                                            className="px-5 py-2.5 text-xs font-semibold text-muted-foreground text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort("unique_count")}
                                        >
                                            <span className="inline-flex items-center justify-end gap-1 w-full">
                                                Unique <SortIcon col="unique_count" activeKey={sortKey} dir={sortDir} />
                                            </span>
                                        </th>
                                        <th
                                            className="px-5 py-2.5 text-xs font-semibold text-muted-foreground text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort("null_count")}
                                        >
                                            <span className="inline-flex items-center justify-end gap-1 w-full">
                                                Nulls <SortIcon col="null_count" activeKey={sortKey} dir={sortDir} />
                                            </span>
                                        </th>
                                        <th
                                            className="px-5 py-2.5 text-xs font-semibold text-muted-foreground text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort("null_pct")}
                                        >
                                            <span className="inline-flex items-center justify-end gap-1 w-full">
                                                Null % <SortIcon col="null_pct" activeKey={sortKey} dir={sortDir} />
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleColumns.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-6 text-sm text-center text-muted-foreground">
                                                No columns match &ldquo;{search}&rdquo;
                                            </td>
                                        </tr>
                                    )}
                                    {visibleColumns.map((col) => {
                                        const result = castResults?.find((r) => r.column === col.column);
                                        const hasError = result?.status.startsWith("error");
                                        const hasWarning = result?.status === "warning";

                                        let statusClassName = "bg-green-500/10 text-green-600 border-green-500/20";
                                        let statusLabel = "Success";

                                        if (hasError) {
                                            statusClassName = "bg-red-500/10 text-red-500 border-red-500/20";
                                            statusLabel = result?.status ?? "Error";
                                        } else if (hasWarning) {
                                            statusClassName = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                                            statusLabel = "Warning";
                                        }
                                        return (
                                            <tr
                                                key={col.column}
                                                className={cn(
                                                    "border-b border-border hover:bg-muted/30 transition-colors even:bg-muted/10",
                                                    hasError && "bg-destructive/5"
                                                )}
                                            >
                                                <td className="px-5 py-2.5 text-xs font-medium text-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        {col.is_unique && (
                                                            <TooltipProvider delayDuration={200}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <KeyRound className="h-3 w-3 text-amber-500 shrink-0 cursor-help" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>All non-null values are unique</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                        {col.column}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-xs font-mono font-black border border-border px-2 py-0.5 bg-muted/40 text-foreground tracking-tighter shrink-0">
                                                            {result ? result.to_dtype : col.dtype}
                                                        </div>

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
                                                            <SelectTrigger className="h-7 text-xs font-mono w-30 rounded-none border-border/60 bg-background/50 focus:ring-0 focus:ring-offset-0 transition-all hover:bg-muted/50">
                                                                <SelectValue placeholder="Cast to..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-none border-border/60">
                                                                <SelectItem value="none" className="text-xs font-mono rounded-none focus:bg-primary focus:text-primary-foreground">
                                                                    none
                                                                </SelectItem>
                                                                {CAST_TYPES.map((t) => (
                                                                    <SelectItem
                                                                        key={t}
                                                                        value={t}
                                                                        className="text-xs font-mono rounded-none focus:bg-primary focus:text-primary-foreground"
                                                                    >
                                                                        {t}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {result && (
                                                            <TooltipProvider delayDuration={200}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className={cn(
                                                                            "text-xs font-mono px-1.5 py-0.5 rounded-none border cursor-default",
                                                                            statusClassName
                                                                        )}>
                                                                            {statusLabel}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    {(hasWarning || hasError) && result.validation?.message && (
                                                                        <TooltipContent>{result.validation.message}</TooltipContent>
                                                                    )}
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5 text-xs tabular-nums text-right text-muted-foreground/60">{col.non_null_count.toLocaleString()}</td>
                                                <td className="px-5 py-2.5 text-xs tabular-nums text-right text-muted-foreground/60">{col.unique_count.toLocaleString()}</td>
                                                <td className={cn(
                                                    "px-5 py-2.5 text-xs tabular-nums text-right font-semibold",
                                                    col.null_count > 0 ? "text-destructive" : "text-muted-foreground/30"
                                                )}>
                                                    {col.null_count.toLocaleString()}
                                                </td>

                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-14 h-1.5 bg-border/40 overflow-hidden shrink-0">
                                                            <div
                                                                className={cn("h-full transition-all", col.null_pct > 0 ? "bg-destructive/60" : "")}
                                                                style={{ width: `${Math.min(col.null_pct, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={cn(
                                                            "text-xs tabular-nums w-10 text-right shrink-0",
                                                            col.null_pct > 0 ? "text-destructive/80" : "text-muted-foreground/30"
                                                        )}>
                                                            {col.null_pct.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        </CardContent>
                    </Card>

        </div>
    );
}

function SortIcon({ col, activeKey, dir }: Readonly<{ col: SortKey; activeKey: SortKey | null; dir: "asc" | "desc" }>) {
    if (activeKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
    return dir === "asc"
        ? <ChevronUp className="h-3 w-3" />
        : <ChevronDown className="h-3 w-3" />;
}
