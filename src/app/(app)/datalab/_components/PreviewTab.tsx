"use client";

import React from "react";
import {
    Search, X, SlidersHorizontal,
    ChevronDown, Rows3, Copy, Check,
} from "lucide-react";
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
import type { DataLabPreview, DataLabInspect, DataLabInspectColumn } from "@/services/api";
import { toast } from "sonner";
import { DatasetMetaStrip } from "./DatasetMetaStrip";
import { displayCell } from "../_lib";
import { CellEditor } from "./CellEditor";
import { CellDisplay } from "./CellDisplay";
import { HeaderContent } from "./HeaderContent";

function PreviewCell({
    col, raw, isEditing, hasError, errorMsg,
    isRowSelected, isColSelected,
    onStartEdit, onCommit, onCancel, onClearSelection,
    onMoveRight, onMoveDown,
    cellSubmittingRef,
}: Readonly<{
    col: string;
    raw: unknown;
    isEditing: boolean;
    hasError: boolean;
    errorMsg?: string;
    isRowSelected: boolean;
    isColSelected: boolean;
    onStartEdit: () => void;
    onCommit: (value: string) => void;
    onCancel: () => void;
    onClearSelection: () => void;
    onMoveRight: () => void;
    onMoveDown: () => void;
    cellSubmittingRef: React.RefObject<boolean>;
}>) {
    const val = displayCell(raw);
    const isNull = raw === null || raw === undefined;
    const isSelected = isRowSelected || isColSelected;
    const isCross = isRowSelected && isColSelected;

    let textStyle = "text-foreground/80";
    let bgClass = "";

    if (hasError) {
        textStyle = "text-destructive";
        bgClass = "bg-destructive/5";
    } else if (isNull && !isSelected) {
        textStyle = "text-muted-foreground/30 italic";
        bgClass = "bg-red-600/5";
    } else if (isCross) {
        bgClass = "bg-primary/20";
    } else if (isSelected) {
        bgClass = "bg-primary/10";
    }

    return (
        <td
            className={cn(
                "px-4 py-2 text-sm font-mono whitespace-nowrap max-w-48 transition-colors",
                !isEditing && "cursor-text",
                bgClass
            )}
            onClick={isEditing ? undefined : () => { onClearSelection(); onStartEdit(); }}
        >
            {isEditing ? (
                <CellEditor
                    initialValue={isNull ? "" : val}
                    onCommit={onCommit}
                    onCancel={onCancel}
                    onMoveRight={onMoveRight}
                    onMoveDown={onMoveDown}
                    cellSubmittingRef={cellSubmittingRef}
                />
            ) : (
                <CellDisplay
                    val={val}
                    isNull={isNull}
                    hasError={hasError}
                    errorMsg={errorMsg}
                    textStyle={textStyle}
                />
            )}
        </td>
    );
}



function toExcelCol(n: number): string {
    let s = "";
    while (n > 0) {
        n--;
        s = String.fromCodePoint(65 + (n % 26)) + s;
        n = Math.floor(n / 26);
    }
    return s;
}

const LIMIT_OPTIONS = [
    { label: "100", value: 100 },
    { label: "200", value: 200 },
    { label: "500", value: 500 },
    { label: "1,000", value: 1000 },
    { label: "10,000 (max)", value: 10000 },
] as const;

export function PreviewTab({ data, datasetId, inspect, onRefetchAll, onLimitChange }: Readonly<{
    data: DataLabPreview;
    datasetId: number;
    inspect?: DataLabInspect;
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
    const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
    const [selectedCols, setSelectedCols] = React.useState<Set<string>>(new Set());
    const [anchorRow, setAnchorRow] = React.useState<number | null>(null);
    const [anchorColIdx, setAnchorColIdx] = React.useState<number | null>(null);
    const [copied, setCopied] = React.useState(false);

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
        setSelectedRows(new Set());
        setSelectedCols(new Set());
        setAnchorRow(null);
        setAnchorColIdx(null);
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

    const inspectMap = React.useMemo<Record<string, DataLabInspectColumn>>(() => {
        if (!inspect) return {};
        return Object.fromEntries(inspect.info.columns.map((c) => [c.column, c]));
    }, [inspect]);

    // Clear row-index-based selection when search changes (indices shift)
    React.useEffect(() => {
        setSelectedRows(new Set());
        setSelectedCols(new Set());
        setAnchorRow(null);
        setAnchorColIdx(null);
    }, [search]);

    function toggleCol(col: string) {
        setHiddenCols((prev) => {
            const next = new Set(prev);
            if (next.has(col)) next.delete(col); else next.add(col);
            return next;
        });
    }

    function handleRowClick(rowIndex: number, e: React.MouseEvent) {
        setSelectedCols(new Set());
        setAnchorColIdx(null);
        if (e.shiftKey && anchorRow !== null) {
            const lo = Math.min(anchorRow, rowIndex);
            const hi = Math.max(anchorRow, rowIndex);
            setSelectedRows(new Set(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)));
        } else {
            const isSoleSelected = selectedRows.has(rowIndex) && selectedRows.size === 1;
            setSelectedRows(isSoleSelected ? new Set() : new Set([rowIndex]));
            setAnchorRow(isSoleSelected ? null : rowIndex);
        }
    }

    function handleColClick(col: string, colIdx: number, e: React.MouseEvent) {
        setSelectedRows(new Set());
        setAnchorRow(null);
        if (e.shiftKey && anchorColIdx !== null) {
            const lo = Math.min(anchorColIdx, colIdx);
            const hi = Math.max(anchorColIdx, colIdx);
            setSelectedCols(new Set(visibleColumns.slice(lo, hi + 1)));
        } else {
            const isSoleSelected = selectedCols.has(col) && selectedCols.size === 1;
            setSelectedCols(isSoleSelected ? new Set() : new Set([col]));
            setAnchorColIdx(isSoleSelected ? null : colIdx);
        }
    }

    function clearSelection() {
        setSelectedRows(new Set());
        setSelectedCols(new Set());
        setAnchorRow(null);
        setAnchorColIdx(null);
    }

    async function copyToClipboard() {
        let text = "";
        if (selectedRows.size > 0) {
            const header = visibleColumns.join("\t");
            const lines = [...selectedRows]
                .sort((a, b) => a - b)
                .map((ri) => visibleColumns.map((c) => displayCell(filteredRows[ri]?.[c])).join("\t"));
            text = [header, ...lines].join("\n");
        } else if (selectedCols.size > 0) {
            const cols = visibleColumns.filter((c) => selectedCols.has(c));
            const header = cols.join("\t");
            const lines = filteredRows.map((row) => cols.map((c) => displayCell(row[c])).join("\t"));
            text = [header, ...lines].join("\n");
        }
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy to clipboard.");
        }
    }

    function moveEditingCell(direction: "right" | "down") {
        if (!editingCell) return;
        const { rowIndex, col } = editingCell;
        const colIdx = visibleColumns.indexOf(col);
        let nextRow = rowIndex;
        let nextColIdx = colIdx;

        if (direction === "right") {
            if (colIdx < visibleColumns.length - 1) {
                nextColIdx = colIdx + 1;
            } else if (rowIndex < filteredRows.length - 1) {
                nextColIdx = 0;
                nextRow = rowIndex + 1;
            } else return;
        } else if (rowIndex < filteredRows.length - 1) {
            nextRow = rowIndex + 1;
        } else return;
        setEditingCell({ rowIndex: nextRow, col: visibleColumns[nextColIdx] });
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

        setCellError(null);
        setRows((prev) => prev.map((r, i) => i === rowIndex ? { ...r, [col]: value } : r));

        try {
            const res = await datalabApi.updateCell(datasetId, { row_index: rowIndex, column: col, value });
            setRows((prev) => prev.map((r, i) => i === rowIndex ? { ...r, [col]: res.value } : r));
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

    const hasSelection = selectedRows.size > 0 || selectedCols.size > 0;

    let rowCountLabel = "";
    if (search.trim()) {
        rowCountLabel = `${filteredRows.length} matching of ${rows.length} loaded rows`;
    } else if (data.truncated) {
        rowCountLabel = `Showing ${data.rows.length.toLocaleString()} of ${data.total_rows.toLocaleString()} rows`;
    } else {
        rowCountLabel = `${data.total_rows.toLocaleString()} rows`;
    }

    let selectionLabel = "";
    if (selectedRows.size > 0) {
        selectionLabel = `${selectedRows.size} row${selectedRows.size > 1 ? "s" : ""} selected`;
    } else {
        selectionLabel = `${selectedCols.size} column${selectedCols.size > 1 ? "s" : ""} selected`;
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
                    <div className="w-px h-4 bg-border/50 mx-1 shrink-0" />
                    <button
                        type="button"
                        onClick={() => setColPickerOpen((v) => !v)}
                        className={cn(
                            "flex items-center gap-1.5 text-[13px] font-medium transition-colors px-2 py-1 border",
                            colPickerOpen
                                ? "border-primary/50 text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                        Columns
                        {hiddenCols.size > 0 && (
                            <span className="bg-primary text-primary-foreground text-[13px] font-bold px-1 py-px">
                                {hiddenCols.size}
                            </span>
                        )}
                    </button>
                    <div className="w-px h-4 bg-border/50 mx-1 shrink-0" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[13px] font-medium transition-colors px-2 py-1 border border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            >
                                <Rows3 className="h-3 w-3" />
                                {data.limit.toLocaleString()} rows
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
                                        className="text-sm rounded-none cursor-pointer"
                                    >
                                        {opt.value === 10000 ? opt.label : `${opt.label} rows`}
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
                            <span className="text-[13px] font-semibold text-muted-foreground">
                                {visibleColumns.length} of {columns.length} columns visible
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setHiddenCols(new Set())}
                                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Show all
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHiddenCols(new Set(columns))}
                                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
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
                                            "px-2 py-0.5 text-[13px] font-mono border transition-colors",
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

                {/* ── Selection action bar ── */}
                {hasSelection && (
                    <div className="border-b px-4 py-1.5 flex items-center gap-3 bg-primary/5">
                        <span className="text-[13px] font-mono text-primary">
                            {selectionLabel}
                        </span>
                        <span className="text-muted-foreground/40 text-[13px]">·</span>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 text-[13px] font-medium text-primary hover:text-primary/70 transition-colors"
                        >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied ? "Copied!" : "Copy as TSV"}
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* ── Table ── */}
                <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            {/* Excel letter row */}
                            <tr className="border-b border-border/40">
                                <th className="bg-muted px-4 py-1 w-12 select-none" />
                                {visibleColumns.map((col, i) => (
                                    <th
                                        key={col}
                                        onClick={(e) => handleColClick(col, i, e)}
                                        className={cn(
                                            "px-4 py-1 text-[13px] font-semibold text-center select-none tracking-wider whitespace-nowrap cursor-pointer transition-colors",
                                            selectedCols.has(col)
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        {toExcelCol(i + 1)}
                                    </th>
                                ))}
                            </tr>
                            {/* Column name row */}
                            <tr className="border-b">
                                <th className="bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground w-12 text-center select-none">#</th>
                                {visibleColumns.map((col) => {
                                    const colInfo = inspectMap[col];
                                    const isColSel = selectedCols.has(col);
                                    return (
                                        <th
                                            key={col}
                                            className={cn(
                                                "bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap group/th min-w-28 transition-colors",
                                                isColSel && "bg-primary/10 border-b-2 border-primary"
                                            )}
                                        >
                                            <HeaderContent
                                                col={col}
                                                colInfo={colInfo}
                                                isEditing={editingHeader === col}
                                                isRenaming={renamingHeader === col}
                                                onStartEdit={() => setEditingHeader(col)}
                                                onSubmitRename={(val) => {
                                                    setEditingHeader(null);
                                                    submitRename(col, val);
                                                }}
                                                onCancelEdit={() => setEditingHeader(null)}
                                            />
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-sm text-muted-foreground italic">
                                        {search.trim() ? `No rows match "${search}"` : "No rows available."}
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, rowIndex) => {
                                    const isRowSel = selectedRows.has(rowIndex);
                                    return (
                                        <tr
                                            key={`${rowIndex}_${displayCell(row[columns[0]])}`}
                                            className={cn(
                                                "border-b border-border/50 transition-colors",
                                                isRowSel ? "bg-primary/10" : "hover:bg-muted/20"
                                            )}
                                        >
                                            <td
                                                onClick={(e) => handleRowClick(rowIndex, e)}
                                                className={cn(
                                                    "px-4 py-2.5 text-[13px] text-center font-mono select-none tabular-nums cursor-pointer transition-colors",
                                                    isRowSel
                                                        ? "bg-primary/25 text-primary font-semibold"
                                                        : "text-muted-foreground/50 hover:bg-muted/40"
                                                )}
                                            >
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
                                                        isRowSelected={isRowSel}
                                                        isColSelected={selectedCols.has(col)}
                                                        onClearSelection={clearSelection}
                                                        onStartEdit={() => { setCellError(null); setEditingCell({ rowIndex, col }); }}
                                                        onCommit={(v) => { setEditingCell(null); submitCellEdit(rowIndex, col, v); }}
                                                        onCancel={() => setEditingCell(null)}
                                                        onMoveRight={() => moveEditingCell("right")}
                                                        onMoveDown={() => moveEditingCell("down")}
                                                        cellSubmittingRef={cellSubmittingRef}
                                                    />
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* ── Row count strip ── */}
                <div className="border-t px-4 py-1.5 flex items-center gap-3 bg-muted/10">
                    <span className="text-[13px] text-muted-foreground font-mono">
                        {rowCountLabel}
                    </span>
                    {hiddenCols.size > 0 && (
                        <span className="text-[13px] text-muted-foreground font-mono">
                            · {visibleColumns.length} of {columns.length} columns visible
                        </span>
                    )}
                </div>

            </Card>
        </div>
    );
}
