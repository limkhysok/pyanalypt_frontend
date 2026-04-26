"use client";

import React from "react";
import { Pencil, Loader2, Search, X, SlidersHorizontal, ChevronDown, Rows3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabPreview } from "@/services/api";
import { toast } from "sonner";
import { DatasetMetaStrip } from "./DatasetMetaStrip";
import { displayCell } from "../_lib";

function PreviewCell({ col, raw, isEditing, hasError, errorMsg, onStartEdit, onCommit, onCancel, cellSubmittingRef }: Readonly<{
    col: string;
    raw: unknown;
    isEditing: boolean;
    hasError: boolean;
    errorMsg?: string;
    onStartEdit: () => void;
    onCommit: (value: string) => void;
    onCancel: () => void;
    cellSubmittingRef: React.RefObject<boolean>;
}>) {
    const val = displayCell(raw);
    const isNull = raw === null || raw === undefined;

    let textClass = "text-foreground/80";
    if (hasError) textClass = "text-destructive";
    else if (isNull) textClass = "text-muted-foreground/30 italic";

    return (
        <td
            className={cn(
                "px-4 py-2 text-xs font-mono whitespace-nowrap max-w-48",
                !isEditing && "cursor-text",
                hasError && "bg-destructive/5",
                isNull && !hasError && "bg-red-600/5",
            )}
            onClick={() => { if (!isEditing) onStartEdit(); }}
        >
            {isEditing ? (
                <input
                    autoFocus
                    defaultValue={isNull ? "" : val}
                    className="bg-background border border-primary px-2 py-0.5 text-xs font-mono text-foreground outline-none w-full min-w-20 rounded-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            cellSubmittingRef.current = true;
                            onCommit(e.currentTarget.value);
                        }
                        if (e.key === "Escape") {
                            cellSubmittingRef.current = true;
                            onCancel();
                        }
                    }}
                    onBlur={(e) => {
                        if (cellSubmittingRef.current) {
                            cellSubmittingRef.current = false;
                            return;
                        }
                        onCommit(e.target.value);
                    }}
                />
            ) : (
                <span
                    className={cn("block truncate", textClass)}
                    title={hasError ? errorMsg : (val || "—")}
                >
                    {isNull ? "—" : val}
                </span>
            )}
        </td>
    );
}

const LIMIT_OPTIONS = [
    { label: "100", value: 100 },
    { label: "200", value: 200 },
    { label: "500", value: 500 },
    { label: "All", value: 0 },
] as const;

export function PreviewTab({ data, datasetId, onRefetchAll, onLimitChange }: Readonly<{
    data: DataLabPreview;
    datasetId: number;
    onRefetchAll: () => void;
    onLimitChange: (limit: number) => void;
}>) {
    const [columns, setColumns] = React.useState(data.columns);
    const [rows, setRows] = React.useState(data.rows);
    const [editingHeader, setEditingHeader] = React.useState<string | null>(null);
    const [renamingHeader, setRenamingHeader] = React.useState<string | null>(null);
    const [editingCell, setEditingCell] = React.useState<{ rowIndex: number; col: string } | null>(null);
    const [cellError, setCellError] = React.useState<{ rowIndex: number; col: string; msg: string } | null>(null);
    const [search, setSearch] = React.useState("");
    const [hiddenCols, setHiddenCols] = React.useState<Set<string>>(new Set());
    const [colPickerOpen, setColPickerOpen] = React.useState(false);
    const headerSubmittingRef = React.useRef(false);
    const cellSubmittingRef = React.useRef(false);

    React.useEffect(() => {
        setColumns(data.columns);
        setRows(data.rows);
        setEditingHeader(null);
        setEditingCell(null);
        setCellError(null);
        setSearch("");
        setHiddenCols(new Set());
        setColPickerOpen(false);
    }, [data]);

    const visibleColumns = React.useMemo(
        () => columns.filter((c) => !hiddenCols.has(c)),
        [columns, hiddenCols]
    );

    const filteredRows = React.useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.toLowerCase();
        return rows.filter((row) =>
            visibleColumns.some((col) => {
                const v = row[col];
                if (v === null || v === undefined) return false;
                return displayCell(v).toLowerCase().includes(q);
            })
        );
    }, [rows, search, visibleColumns]);

    function toggleCol(col: string) {
        setHiddenCols((prev) => {
            const next = new Set(prev);
            if (next.has(col)) next.delete(col); else next.add(col);
            return next;
        });
    }

    async function submitRename(oldName: string, newName: string) {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) return;
        setRenamingHeader(oldName);
        try {
            const res = await datalabApi.renameColumn(datasetId, { old_name: oldName, new_name: trimmed });
            setColumns(res.columns);
            toast.success(`Column renamed to '${res.new_name}'.`);
            onRefetchAll();
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            toast.error(detail ?? "Failed to rename column.");
        } finally {
            setRenamingHeader(null);
        }
    }

    async function submitCellEdit(rowIndex: number, col: string, rawInput: string) {
        const original = rows[rowIndex]?.[col];
        const displayedOriginal = original === null || original === undefined ? "" : displayCell(original);
        if (rawInput === displayedOriginal) return;

        const value: unknown = rawInput === "" ? null : rawInput;
        const snapshot = rows;
        const absoluteRowIndex = rowIndex;

        setCellError(null);
        setRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, [col]: value } : r));

        try {
            const res = await datalabApi.updateCell(datasetId, { row_index: absoluteRowIndex, column: col, value });
            setRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, [col]: res.value } : r));
            onRefetchAll();
        } catch (err: unknown) {
            setRows(snapshot);
            const status = (err as { response?: { status?: number } })?.response?.status;
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to update cell.";
            if (status === 400 && (detail.includes("dtype") || detail.includes("assign") || detail.includes("Cannot"))) {
                setCellError({ rowIndex, col, msg: detail });
                setTimeout(() => setCellError(null), 5000);
            } else {
                toast.error(detail);
                onRefetchAll();
            }
        }
    }

    return (
        <div className="space-y-3">
            <DatasetMetaStrip data={data} />

            <Card className="shadow-sm overflow-hidden rounded-none">

                {/* ── Controls bar ── */}
                <div className="border-b px-4 py-2 flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search rows…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40 font-mono text-foreground"
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
                    <div className="w-px h-4 bg-border/50 mx-1 shrink-0" />
                    <button
                        type="button"
                        onClick={() => setColPickerOpen((v) => !v)}
                        className={cn(
                            "flex items-center gap-1.5 text-[11px] font-medium transition-colors px-2 py-1 border",
                            colPickerOpen
                                ? "border-primary/50 text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                        Columns
                        {hiddenCols.size > 0 && (
                            <span className="bg-primary text-primary-foreground text-[11px] font-bold px-1 py-px leading-none">
                                {hiddenCols.size}
                            </span>
                        )}
                    </button>
                    <div className="w-px h-4 bg-border/50 mx-1 shrink-0" />
                    {/* Limit dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[11px] font-medium transition-colors px-2 py-1 border border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            >
                                <Rows3 className="h-3 w-3" />
                                {data.limit === 0 ? "All" : data.limit} rows
                                <ChevronDown className="h-3 w-3 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 rounded-none">
                            <DropdownMenuRadioGroup
                                value={String(data.limit)}
                                onValueChange={(v) => onLimitChange(Number(v))}
                            >
                                {LIMIT_OPTIONS.map((opt) => (
                                    <DropdownMenuRadioItem
                                        key={opt.value}
                                        value={String(opt.value)}
                                        className="text-xs rounded-none cursor-pointer"
                                    >
                                        {opt.label === "All" ? "All rows" : `${opt.label} rows`}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ── Column picker panel ── */}
                {colPickerOpen && (
                    <div className="border-b px-4 py-3 space-y-2 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground">
                                {visibleColumns.length} of {columns.length} columns visible
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setHiddenCols(new Set())}
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Show all
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHiddenCols(new Set(columns))}
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Hide all
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                            {columns.map((col) => {
                                const hidden = hiddenCols.has(col);
                                return (
                                    <button
                                        key={col}
                                        type="button"
                                        onClick={() => toggleCol(col)}
                                        className={cn(
                                            "px-2 py-0.5 text-[11px] font-mono border transition-colors",
                                            hidden
                                                ? "border-border/40 text-muted-foreground/40 bg-transparent"
                                                : "border-primary/40 text-primary bg-primary/5"
                                        )}
                                    >
                                        {col}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Table ── */}
                <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground w-12 text-center select-none">#</th>
                                {visibleColumns.map((col) => (
                                    <th key={col} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap group/th min-w-28">
                                        {editingHeader === col ? (
                                            <input
                                                autoFocus
                                                defaultValue={col}
                                                className="bg-background border border-primary px-2 py-0.5 text-xs font-semibold text-foreground outline-none w-full min-w-24 rounded-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        headerSubmittingRef.current = true;
                                                        const val = e.currentTarget.value;
                                                        setEditingHeader(null);
                                                        submitRename(col, val);
                                                    }
                                                    if (e.key === "Escape") {
                                                        headerSubmittingRef.current = true;
                                                        setEditingHeader(null);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (headerSubmittingRef.current) {
                                                        headerSubmittingRef.current = false;
                                                        return;
                                                    }
                                                    const val = e.target.value;
                                                    setEditingHeader(null);
                                                    submitRename(col, val);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                {renamingHeader === col && (
                                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50 shrink-0" />
                                                )}
                                                <span>{col}</span>
                                                <button
                                                    className="opacity-0 group-hover/th:opacity-50 hover:opacity-100! transition-opacity ml-auto shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingHeader(col);
                                                    }}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-xs text-muted-foreground italic">
                                        {search.trim() ? `No rows match "${search}"` : "No rows available."}
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, rowIndex) => (
                                    <tr
                                        key={`${rowIndex}_${displayCell(row[columns[0]])}`}
                                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground/50 text-center font-mono select-none tabular-nums">
                                            {rowIndex + 1}
                                        </td>
                                        {visibleColumns.map((col) => {
                                            const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.col === col;
                                            const hasError = cellError?.rowIndex === rowIndex && cellError?.col === col;
                                            return (
                                                <PreviewCell
                                                    key={col}
                                                    col={col}
                                                    raw={row[col]}
                                                    isEditing={isEditing}
                                                    hasError={hasError}
                                                    errorMsg={cellError?.msg}
                                                    onStartEdit={() => { setCellError(null); setEditingCell({ rowIndex, col }); }}
                                                    onCommit={(v) => { setEditingCell(null); submitCellEdit(rowIndex, col, v); }}
                                                    onCancel={() => setEditingCell(null)}
                                                    cellSubmittingRef={cellSubmittingRef}
                                                />
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* ── Row count strip ── */}
                <div className="border-t px-4 py-1.5 flex items-center gap-3 bg-muted/10">
                    <span className="text-[11px] text-muted-foreground font-mono">
                        {search.trim()
                            ? `${filteredRows.length} matching of ${rows.length} loaded rows`
                            : data.limit === 0 || data.rows.length >= data.total_rows
                                ? `${data.total_rows.toLocaleString()} rows`
                                : `Showing ${data.rows.length.toLocaleString()} of ${data.total_rows.toLocaleString()} rows`
                        }
                    </span>
                    {hiddenCols.size > 0 && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                            · {visibleColumns.length} of {columns.length} columns visible
                        </span>
                    )}
                </div>

            </Card>
        </div>
    );
}
