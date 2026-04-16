"use client";

import { useRouter } from "next/navigation";
import {
    Database,
    Search,
    FileText,
    Download,
    Eye,
    Bug,
    Sparkles,
    Calendar,
    Trash2,
    MoreVertical,
    Edit2,
    BrainCircuit,
    Loader2,
    Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { cn } from "@/lib/utils";
import { FORMAT_COLORS, formatFileSize } from "./_lib";

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
    issueLoading: number | null;
    aiAnalysisLoading: number | null;
    exportingDatasetId: number | null;
    onImport: () => void;
    onRename: (dataset: Dataset) => void;
    onDelete: (dataset: Dataset) => void;
    onExport: (dataset: Dataset, format?: DatasetExportFormat) => void;
    onDiagnose: (id: number) => void;
    onAIAnalysis: (dataset: { id: number; file_name: string }) => void;
}

// ─────────────────────────────────────────────
// DatasetTable
// ─────────────────────────────────────────────

export function DatasetTable({
    datasets,
    filteredDatasets,
    isLoading,
    issueLoading,
    aiAnalysisLoading,
    exportingDatasetId,
    onImport,
    onRename,
    onDelete,
    onExport,
    onDiagnose,
    onAIAnalysis,
}: Readonly<DatasetTableProps>) {
    const router = useRouter();

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
                <Button
                    onClick={onImport}
                    className="rounded-none h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-none transition-all border border-primary/10"
                >
                    <Plus className="mr-2 h-3.5 w-3.5" /> Import artifact
                </Button>
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

                                                {/* Preview */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            onClick={() => router.push(`/datasets/${dataset.id}/preview`)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="rounded-none w-auto px-2.5 py-1 text-xs font-medium bg-background border-border shadow-none">
                                                        Preview
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Diagnose */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            onClick={() => onDiagnose(dataset.id)}
                                                            disabled={issueLoading === dataset.id}
                                                        >
                                                            {issueLoading === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <Bug className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="rounded-none w-auto px-2.5 py-1 text-xs font-medium bg-background border-border shadow-none">
                                                        Diagnose
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Problem framing */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            onClick={() => onAIAnalysis(dataset)}
                                                            disabled={aiAnalysisLoading === dataset.id}
                                                        >
                                                            {aiAnalysisLoading === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <BrainCircuit className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="rounded-none w-auto px-2.5 py-1 text-xs font-medium bg-background border-border shadow-none">
                                                        Analysis
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Clean */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            onClick={() => router.push(`/clean?dataset=${dataset.id}`)}
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="rounded-none w-auto px-2.5 py-1 text-xs font-medium bg-background border-border shadow-none">
                                                        Clean
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* More actions */}
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
                                                                <Download className="mr-2 h-3.5 w-3.5" /> Export
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-none border-border shadow-none">
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "csv")}>csv</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "xlsx")}>xlsx</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "json")}>json</DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-none text-sm font-medium" onClick={() => onExport(dataset, "parquet")}>parquet</DropdownMenuItem>
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
