"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Search,
    ChevronDown,
    Database,
    Rows3,
    Columns3,
    PencilLine,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { datasetApi } from "@/services/api";
import { DatasetDetail } from "@/types/dataset";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";


const ROW_LIMIT_OPTIONS = [
    { value: "10", label: "10 rows" },
    { value: "50", label: "50 rows" },
    { value: "100", label: "100 rows" },
    { value: "max", label: "All rows" },
] as const;

type RowLimit = (typeof ROW_LIMIT_OPTIONS)[number]["value"];

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

function rowsFromSplitTable(payload: Record<string, unknown>): Record<string, unknown>[] {
    const columns = Array.isArray(payload.columns) ? payload.columns : [];
    const rows = Array.isArray(payload.data) ? payload.data : [];
    if (!columns.length || !rows.length) return [];
    if (!rows.every((row) => Array.isArray(row))) return [];
    return (rows as unknown[][]).map((rowValues) => {
        const row: Record<string, unknown> = {};
        columns.forEach((columnName, index) => {
            if (typeof columnName === "string") row[columnName] = rowValues[index];
        });
        return row;
    });
}

function extractPreviewRows(payload: unknown): Record<string, unknown>[] {
    const parsed = safeParseJson(payload);
    if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
    }
    if (!parsed || typeof parsed !== "object") return [];
    const obj = parsed as Record<string, unknown>;
    const wrappedKeys = ["data_preview", "preview", "data", "rows", "records", "results", "items"];
    for (const key of wrappedKeys) {
        const nestedRows = extractPreviewRows(obj[key]);
        if (nestedRows.length > 0) return nestedRows;
    }
    const splitRows = rowsFromSplitTable(obj);
    if (splitRows.length > 0) return splitRows;
    return [];
}

function safeStringify(val: unknown): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
}

export default function DatasetPreviewPage() {
    interface DatasetRow {
        [key: string]: unknown;
    }
    interface DataTableRow {
        payload: DatasetRow;
        position: number;
    }

    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [dataset, setDataset] = useState<DatasetDetail | null>(null);
    const [previewData, setPreviewData] = useState<DatasetRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowLimit, setRowLimit] = useState<RowLimit>("100");
    const [editingCell, setEditingCell] = useState<{ sourceIndex: number; column: string } | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [savingCellKey, setSavingCellKey] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    useEffect(() => {
        const loadPreview = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Determine how many rows to fetch from the API (max 1000 as per service contract)
                const requestedRows = rowLimit === "max" ? 1000 : Number(rowLimit);

                // Concurrent data fetching for efficiency
                // - getDataset: for metadata (file name, format)
                // - previewDataset: for the actual rows based on user count selection
                const [detail, fetchedRows] = await Promise.all([
                    datasetApi.getDataset(Number(id)),
                    datasetApi.previewDataset(Number(id), requestedRows)
                ]);

                setDataset(detail);

                // If detail didn't have data_preview but fetchedRows did, use fetchedRows
                const dataFromPreview = extractPreviewRows(fetchedRows);
                if (dataFromPreview.length > 0) {
                    setPreviewData(dataFromPreview);
                } else {
                    // Fallback to what's in the detail object
                    setPreviewData(extractPreviewRows(detail?.data_preview));
                }

            } catch (err) {
                console.error("Failed to load dataset preview:", err);
                // Fallback to basic dataset detail if preview fails
                try {
                    const detail = await datasetApi.getDataset(Number(id));
                    setDataset(detail);
                    setPreviewData(extractPreviewRows(detail.data_preview));
                } catch {
                    setPreviewData([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadPreview();
    }, [id, rowLimit]);

    const indexedPreviewData = useMemo<DataTableRow[]>(() => {
        return previewData.map((payload, position) => ({ payload, position }));
    }, [previewData]);

    const columns = useMemo(() => {
        if (!previewData.length || !previewData[0]) return [];
        return Object.keys(previewData[0]);
    }, [previewData]);

    const filteredData = useMemo<DataTableRow[]>(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return indexedPreviewData;
        return indexedPreviewData.filter(({ payload }) => {
            if (!payload || typeof payload !== "object") return false;
            return Object.values(payload).some((val) => {
                if (val === null || val === undefined) return false;
                let s: string;
                if (typeof val === "string") s = val;
                else if (typeof val === "number" || typeof val === "boolean") s = String(val);
                else s = JSON.stringify(val);
                return s.toLowerCase().includes(query);
            });
        });
    }, [indexedPreviewData, searchTerm]);

    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a.payload[sortConfig.key];
            const bVal = b.payload[sortConfig.key];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const direction = sortConfig.direction === "asc" ? 1 : -1;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal) * direction;
            }

            return (aVal < (bVal as any) ? -1 : 1) * direction;
        });
    }, [filteredData, sortConfig]);

    const visibleRows = useMemo(() => {
        if (rowLimit === "max") return sortedData;
        return sortedData.slice(0, Number(rowLimit));
    }, [sortedData, rowLimit]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                if (prev.direction === "asc") return { key, direction: "desc" };
                return null;
            }
            return { key, direction: "asc" };
        });
    };

    const startEditCell = (sourceIndex: number, column: string, value: unknown) => {
        setEditingCell({ sourceIndex, column });
        setEditingValue(safeStringify(value));
    };

    const cancelEditCell = () => {
        setEditingCell(null);
        setEditingValue("");
    };

    const normalizeCellValue = (raw: string, original: unknown): unknown => {
        if (raw === "") return "";
        if (typeof original === "number") {
            const parsed = Number(raw);
            return Number.isNaN(parsed) ? raw : parsed;
        }
        if (typeof original === "boolean") {
            if (raw.toLowerCase() === "true") return true;
            if (raw.toLowerCase() === "false") return false;
        }
        return raw;
    };

    const commitEditCell = async () => {
        if (!editingCell || !id) return;
        const { sourceIndex, column } = editingCell;
        const currentRow = previewData[sourceIndex];
        if (!currentRow) { cancelEditCell(); return; }

        const originalValue = currentRow[column];
        const normalizedValue = normalizeCellValue(editingValue, originalValue);
        const cellKey = `${sourceIndex}-${column}`;

        if (safeStringify(originalValue) === safeStringify(normalizedValue)) {
            cancelEditCell();
            return;
        }

        setSavingCellKey(cellKey);
        try {
            await datasetApi.updateCell(Number(id), {
                row_index: sourceIndex,
                column_name: column,
                value: normalizedValue,
            });
            setPreviewData((prev) => {
                const next = [...prev];
                if (!next[sourceIndex]) return prev;
                next[sourceIndex] = { ...next[sourceIndex], [column]: normalizedValue };
                return next;
            });
            toast.success("Cell updated.");
            cancelEditCell();
        } catch {
            toast.error("Failed to update cell.");
        } finally {
            setSavingCellKey(null);
        }
    };

    const currentLimitLabel = ROW_LIMIT_OPTIONS.find((o) => o.value === rowLimit)?.label ?? rowLimit;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] w-full bg-background relative z-0">
                {/* Precision Blueprint Grid Backdrop */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none opacity-20" />

                <div className="relative flex flex-col items-center gap-6">
                    {/* Outer spin ring */}
                    <div className="absolute -inset-4 border-t-2 border-r-2 border-blue-600/20 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute -inset-8 border-b-2 border-l-2 border-blue-600/10 rounded-full animate-[spin_4s_linear_infinite_reverse]" />

                    <div className="relative">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" strokeWidth={1.5} />
                        <div className="absolute inset-0 h-12 w-12 bg-blue-600/20 rounded-full animate-ping" />
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/40 animate-pulse">
                            Synchronizing
                        </span>
                        <h2 className="text-sm font-bold tracking-tight text-foreground/80">
                            Initializing Data Stream...
                        </h2>
                    </div>
                </div>

                {/* Bottom Status Indicator */}
                <div className="absolute bottom-12 flex flex-col items-center gap-2">
                    <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="text-[9px] font-mono text-muted-foreground/40 italic">
                        PyAnalypt v1.0.4.sys // Init_Sequence
                    </span>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <main className="min-h-screen pb-20 px-6 md:px-10 bg-background">
                <div className="max-w-7xl mx-auto space-y-8 pt-8 w-full overflow-hidden">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-4 min-w-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full shrink-0"
                                        onClick={() => router.push("/datasets")}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Back to datasets</TooltipContent>
                            </Tooltip>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl md:text-xl font-black tracking-tight leading-none">
                                        {dataset?.file_name ?? "Dataset Preview"}
                                    </h1>
                                    {dataset?.file_format && (
                                        <Badge variant="secondary" className="uppercase text-[10px] font-semibold tracking-wider">
                                            {dataset.file_format}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Previewing {previewData.length.toLocaleString()} rows &mdash; double-click any cell to edit
                                </p>
                            </div>
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 w-fit">
                                    <PencilLine className="h-3.5 w-3.5" />
                                    <span>Double-click a cell to edit</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Press Enter to save, Escape to cancel</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* ── Toolbar ── */}
                    <Card className="shadow-sm">
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full sm:max-w-xs md:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search rows…"
                                    className="pl-9 h-9 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Stats + Row limit */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 sm:justify-end w-full sm:w-auto">
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                                    <Rows3 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{previewData.length.toLocaleString()}</span>
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">rows</span>
                                </div>

                                <Separator orientation="vertical" className="hidden sm:block h-5" />

                                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                                    <Columns3 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{columns.length}</span>
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">cols</span>
                                </div>

                                <Separator orientation="vertical" className="h-5" />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs sm:text-sm font-medium min-w-24 sm:min-w-27.5 justify-between">
                                            <span>{currentLimitLabel}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36">
                                        {ROW_LIMIT_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onSelect={() => setRowLimit(opt.value)}
                                                className="text-sm justify-between"
                                            >
                                                {opt.label}
                                                {rowLimit === opt.value && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">✓</Badge>
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Table ── */}
                    <Card className="shadow-sm overflow-hidden border-border/60 w-full max-w-full">
                        <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold">Data Preview</CardTitle>
                            </div>
                            <div className="text-[11px] font-medium text-muted-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1 rounded-full border border-border/50 shadow-sm shrink-0">
                                Showing <span className="text-foreground font-bold">{visibleRows.length.toLocaleString()}</span> of{" "}
                                <span className="text-foreground font-bold">{filteredData.length.toLocaleString()}</span>{" "}
                                {searchTerm ? "matching" : "total"} rows
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 relative w-full overflow-hidden">
                            <ScrollArea className="w-full">
                                <div className="w-full relative">
                                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-accent">
                                        <table className="w-full text-left border-collapse text-sm table-auto min-w-full">
                                            <thead>
                                                <tr className="bg-muted/50 border-b">
                                                    <th className="px-4 py-3 text-[10px] font-semibold tracking-widest text-muted-foreground w-12 text-center">#</th>
                                                    {columns.map((col) => {
                                                        const isSorted = sortConfig?.key === col;

                                                        let sortIcon = (
                                                            <div className="h-3 w-3 opacity-0 group-hover/h:opacity-40 transition-opacity">
                                                                <ArrowUp className="h-3 w-3" />
                                                            </div>
                                                        );

                                                        if (isSorted) {
                                                            sortIcon = sortConfig.direction === "asc" ? (
                                                                <ArrowUp className="h-3 w-3 text-primary" />
                                                            ) : (
                                                                <ArrowDown className="h-3 w-3 text-primary" />
                                                            );
                                                        }

                                                        return (
                                                            <th
                                                                key={col}
                                                                onClick={() => handleSort(col)}
                                                                className="px-4 py-3 text-[10px] font-semibold tracking-widest text-muted-foreground whitespace-nowrap cursor-pointer hover:bg-muted/40 transition-colors group/h"
                                                            >
                                                                <div className="flex items-center gap-1.5">
                                                                    {col}
                                                                    {sortIcon}
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <AnimatePresence mode="popLayout">
                                                    {visibleRows.map(({ payload, position }: DataTableRow, rowIdx) => {
                                                        const rowKey = `row-${position}-${id}`;

                                                        return (
                                                            <motion.tr
                                                                key={rowKey}
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: rowIdx * 0.008, duration: 0.15 }}
                                                                className="border-b border-border/50 hover:bg-muted/40 transition-colors group"
                                                            >
                                                                <td className="px-4 py-2.5 text-[11px] text-muted-foreground/60 text-center font-mono tabular-nums select-none">
                                                                    {position + 1}
                                                                </td>
                                                                {columns.map((col) => {
                                                                    const cellKey = `${position}-${col}`;
                                                                    const isEditing = editingCell?.sourceIndex === position && editingCell.column === col;
                                                                    const isSaving = savingCellKey === cellKey;
                                                                    const cellValue = payload[col];

                                                                    return (
                                                                        <td
                                                                            key={cellKey}
                                                                            className="px-4 py-2.5 font-mono text-xs text-foreground/80 group-hover:text-foreground transition-colors max-w-60 truncate"
                                                                            onDoubleClick={() => startEditCell(position, col, cellValue)}
                                                                            title={isEditing ? undefined : safeStringify(cellValue)}
                                                                        >
                                                                            {isEditing ? (
                                                                                <Input
                                                                                    autoFocus
                                                                                    value={editingValue}
                                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === "Enter") { e.preventDefault(); commitEditCell(); }
                                                                                        if (e.key === "Escape") { e.preventDefault(); cancelEditCell(); }
                                                                                    }}
                                                                                    onBlur={commitEditCell}
                                                                                    disabled={isSaving}
                                                                                    className="h-7 text-xs font-mono py-0 px-2"
                                                                                />
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1.5">
                                                                                    <span className="truncate">{safeStringify(cellValue)}</span>
                                                                                    {isSaving && <Loader2 className="h-3 w-3 animate-spin shrink-0 text-muted-foreground" />}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <ScrollBar orientation="horizontal" className="bg-muted/30" />
                            </ScrollArea>

                            {filteredData.length === 0 && (
                                <div className="py-20 flex flex-col items-center gap-3 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">No results found</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {searchTerm ? `No rows match "${searchTerm}"` : "This dataset appears to be empty."}
                                        </p>
                                    </div>
                                    {searchTerm && (
                                        <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="px-6 py-3 border-t bg-muted/30 flex items-center justify-end gap-4">
                            {rowLimit !== "max" && filteredData.length > Number(rowLimit) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 px-4"
                                    onClick={() => setRowLimit("max")}
                                >
                                    Load all {filteredData.length.toLocaleString()} rows
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                </div>
            </main>
        </TooltipProvider>
    );
}

