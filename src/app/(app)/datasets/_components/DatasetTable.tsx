"use client";

import {
    Database,
    Search,
    Download,
    MoreVertical,
    Edit2,
    Loader2,
    Plus,
    Copy,
    Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dataset, DatasetExportFormat } from "@/types/dataset";
import { formatFileSize } from "../_lib";

// ─────────────────────────────────────────────
// FormatBadge
// ─────────────────────────────────────────────

function FormatBadge({ format }: Readonly<{ format: string }>) {
    return (
        <span
            className="inline-flex items-center rounded-none border border-border px-2 py-1 text-[10px] font-bold tracking-wide bg-muted text-muted-foreground"
        >
            {format}
        </span>
    );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface DatasetTableProps {
    datasets: Dataset[];
    filteredDatasets: Dataset[];
    isLoading: boolean;
    exportingDatasetId: number | null;
    onFormatSelect: (format: DatasetExportFormat) => void;
    onRename: (dataset: Dataset) => void;
    onExport: (dataset: Dataset, format?: DatasetExportFormat) => void;
    onDuplicate: (dataset: Dataset, format?: DatasetExportFormat) => void;
    onDelete: (dataset: Dataset) => void;
}


// ─────────────────────────────────────────────
// DatasetTable
// ─────────────────────────────────────────────

export function DatasetTable({
    datasets,
    filteredDatasets,
    isLoading,
    exportingDatasetId,
    onFormatSelect,
    onRename,
    onExport,
    onDuplicate,
    onDelete,
}: Readonly<DatasetTableProps>) {


    const FORMATS: DatasetExportFormat[] = ["csv", "json", "xlsx", "parquet"];

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <Card className="bg-background border border-border rounded-none shadow-none overflow-hidden">
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-none" />
                    ))}
                </div>
            </Card>
        );
    }

    // ── Empty state (no datasets at all) ──────────────────────────────────────

    if (datasets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-border rounded-none bg-background shadow-none px-4">
                <div className="w-16 h-16 rounded-none border border-border flex items-center justify-center mb-6 bg-muted/50">
                    <Database className="h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-muted-foreground/80">No datasets found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-8 font-medium">
                    Your workspace is currently empty. Import a dataset to get started.
                </p>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="rounded-none h-12 px-8 bg-foreground hover:bg-foreground/90 text-background font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                        >
                            <Plus className="mr-2.5 h-4 w-4" /> Import your first dataset
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="rounded-none border-border shadow-none min-w-45 p-1.5">
                        <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/40 border-b border-border/50 mb-1.5 text-center">
                            Select format
                        </div>
                        {FORMATS.map((fmt) => (
                            <DropdownMenuItem
                                key={fmt}
                                className="rounded-none text-sm font-semibold h-10 cursor-pointer focus:bg-primary focus:text-primary-foreground"
                                onClick={() => onFormatSelect(fmt)}
                            >
                                {fmt}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // ── Table ─────────────────────────────────────────────────────────────────

    return (
        <Card className="bg-background border border-border rounded-none shadow-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="border-b border-border bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 w-14 text-center text-xs font-semibold text-muted-foreground">#</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">File name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">Format</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">Size</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground hidden md:table-cell text-right">Date added</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <AnimatePresence mode="popLayout">
                            {filteredDatasets.length > 0 ? (
                                filteredDatasets.map((dataset, idx) => (
                                    <motion.tr
                                        key={dataset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="hover:bg-muted/30 even:bg-muted/5 transition-colors group cursor-default"
                                    >
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-[10px] text-muted-foreground/30 font-bold font-mono">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                                <div className="w-1 h-3.5 bg-foreground/5 group-hover:bg-foreground/20 transition-colors" />
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="font-bold text-foreground text-[13px] tracking-tight truncate max-w-sm block">
                                                {dataset.file_name}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <FormatBadge format={dataset.file_format} />
                                        </td>

                                        <td className="px-6 py-5 text-right text-[11px] tabular-nums font-bold font-mono text-muted-foreground/60">
                                            {formatFileSize(dataset.file_size)}
                                        </td>

                                        <td className="px-6 py-5 text-xs text-muted-foreground hidden md:table-cell font-bold text-right font-mono">
                                            {new Date(dataset.uploaded_date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            })}
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted focus:bg-muted transition-all"
                                                            disabled={exportingDatasetId === dataset.id}
                                                        >
                                                            {exportingDatasetId === dataset.id
                                                                ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                : <MoreVertical className="h-5 w-5" />
                                                            }
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-50 p-1.5">
                                                        <DropdownMenuItem className="rounded-none text-sm font-semibold h-11 cursor-pointer" onClick={() => onRename(dataset)}>
                                                            <Edit2 className="mr-3 h-4 w-4" /> Rename file
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger className="rounded-none text-sm font-semibold h-11 cursor-pointer">
                                                                <Copy className="mr-3 h-4 w-4" /> Duplicate dataset
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-none border-border shadow-none p-1.5 min-w-40">
                                                                <DropdownMenuItem className="rounded-none text-sm font-semibold h-10 cursor-pointer" onClick={() => onDuplicate(dataset)}>Quick clone</DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-border/40" />
                                                                {FORMATS.map((fmt) => (
                                                                    <DropdownMenuItem key={fmt} className="rounded-none text-sm font-semibold h-10 cursor-pointer" onClick={() => onDuplicate(dataset, fmt)}>
                                                                        as {fmt}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger className="rounded-none text-sm font-semibold h-11 cursor-pointer">
                                                                <Download className="mr-3 h-4 w-4" /> Export as...
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-none border-border shadow-none p-1.5 min-w-40">
                                                                {FORMATS.map((fmt) => (
                                                                    <DropdownMenuItem key={fmt} className="rounded-none text-sm font-semibold h-10 cursor-pointer" onClick={() => onExport(dataset, fmt)}>
                                                                        {fmt}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSeparator className="bg-border/40" />

                                                        <DropdownMenuItem
                                                            className="rounded-none text-sm font-semibold h-11 text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
                                                            onClick={() => onDelete(dataset)}
                                                        >
                                                            <Trash2 className="mr-3 h-4 w-4" /> Delete dataset
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                /* Filtered empty state */
                                <tr>
                                    <td colSpan={6}>
                                        <div className="py-24 flex flex-col items-center gap-6 text-center">
                                            <div className="h-12 w-12 rounded-none bg-muted border border-border/20 flex items-center justify-center">
                                                <Search className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-muted-foreground">No matching files found</p>
                                                <p className="text-sm text-muted-foreground/60 italic">
                                                    Try resetting your filters to see more results.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
