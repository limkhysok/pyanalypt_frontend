"use client";

import {
    Database,
    Search,
    FileText,
    Download,
    Calendar,
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
import { formatFileSize } from "./_lib";

// ─────────────────────────────────────────────
// FormatBadge
// ─────────────────────────────────────────────

function FormatBadge({ format }: Readonly<{ format: string }>) {
    const key = format.toLowerCase();
    return (
        <span
            className="inline-flex items-center rounded-none border border-border px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground"
        >
            {key}
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
    
    const FORMATS: DatasetExportFormat[] = ["csv", "json", "xlsx", "parquet", "sql"];

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <Card className="bg-background border border-border/40 rounded-none shadow-none overflow-hidden">
                <div className="p-4 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-none" />
                    ))}
                </div>
            </Card>
        );
    }

    // ── Empty state (no datasets at all) ──────────────────────────────────────

    if (datasets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-border/20 rounded-none bg-background shadow-none">
                <div className="w-14 h-14 rounded-none border border-border/40 flex items-center justify-center mb-6 bg-muted">
                    <Database className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="text-sm font-semibold mb-2">No datasets detected</h3>
                <p className="text-xs text-muted-foreground max-w-xs mb-8">
                    Initialize your workspace by importing a data artifact.
                </p>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="rounded-none h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-none transition-all border border-primary/10"
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Import artifact
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="rounded-none border-border shadow-none min-w-[140px]">
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/50 mb-1 text-center">
                            Select source format
                        </div>
                        {FORMATS.map((fmt) => (
                            <DropdownMenuItem
                                key={fmt}
                                className="rounded-none text-sm font-medium cursor-pointer"
                                onClick={() => onFormatSelect(fmt)}
                            >
                                {fmt.toLowerCase()}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // ── Table ─────────────────────────────────────────────────────────────────

    return (
        <Card className="bg-background border border-border/40 rounded-none shadow-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="border-b border-border/40 bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 w-10 text-center text-[11px] font-medium text-muted-foreground">#</th>
                            <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground">File name</th>
                            <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground">Format</th>
                            <th className="px-4 py-3 text-right text-[11px] font-medium text-muted-foreground">Size</th>
                            <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground hidden md:table-cell">Uploaded</th>
                            <th className="px-4 py-3 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        <AnimatePresence mode="popLayout">
                            {filteredDatasets.length > 0 ? (
                                filteredDatasets.map((dataset, idx) => (
                                    <motion.tr
                                        key={dataset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="hover:bg-muted/50 transition-colors group"
                                    >
                                        <td className="px-4 py-3 text-center text-[11px] text-muted-foreground/40 font-medium font-mono">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                                <span className="font-medium text-foreground/80 text-sm truncate max-w-56">
                                                    {dataset.file_name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <FormatBadge format={dataset.file_format} />
                                        </td>

                                        <td className="px-4 py-3 text-right text-[11px] tabular-nums font-medium font-mono text-muted-foreground">
                                            {formatFileSize(dataset.file_size)}
                                        </td>

                                        <td className="px-4 py-3 text-[11px] text-muted-foreground hidden md:table-cell font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-muted-foreground/50" />
                                                {new Date(dataset.uploaded_date).toLocaleDateString()}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            disabled={exportingDatasetId === dataset.id}
                                                        >
                                                            {exportingDatasetId === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <MoreVertical className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-none border-border shadow-none">
                                                        <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onRename(dataset)}>
                                                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Rename
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger className="rounded-none text-sm font-medium">
                                                                <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-none border-border shadow-none">
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onDuplicate(dataset)}>quick clone</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {FORMATS.map((fmt) => (
                                                                    <DropdownMenuItem key={fmt} className="rounded-none text-sm font-medium" onClick={() => onDuplicate(dataset, fmt)}>
                                                                        into {fmt}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger className="rounded-none text-sm font-medium">
                                                                <Download className="mr-2 h-3.5 w-3.5" /> Export
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-none border-border shadow-none">
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "csv")}>csv</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "xlsx")}>xlsx</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "json")}>json</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "parquet")}>parquet</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "sql")}>sql</DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem 
                                                            className="rounded-none text-sm font-medium text-destructive focus:text-destructive" 
                                                            onClick={() => onDelete(dataset)}
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
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
                                        <div className="py-16 flex flex-col items-center gap-4 text-center">
                                            <div className="h-10 w-10 rounded-none bg-muted border border-border/20 flex items-center justify-center">
                                                <Search className="h-4 w-4 text-muted-foreground/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">No matching artifacts</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Reset filters to see more.
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
