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
            className={cn(
                "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
                FORMAT_COLORS[key] ?? "bg-muted text-muted-foreground border-border"
            )}
        >
            {key.toUpperCase()}
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
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-md overflow-hidden">
                <div className="p-4 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-sm" />
                    ))}
                </div>
            </Card>
        );
    }

    // ── Empty state (no datasets at all) ──────────────────────────────────────

    if (datasets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/30 rounded-md bg-background/40 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Database className="h-5 w-5 text-blue-500/60" />
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-1">No datasets yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">
                    Import your first file to start managing and analysing your data.
                </p>
                <Button
                    onClick={onImport}
                    className="rounded-sm h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shadow-blue-500/20 transition-all"
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Import dataset
                </Button>
            </div>
        );
    }

    // ── Table ─────────────────────────────────────────────────────────────────

    return (
        <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="border-b border-border/10">
                        <tr>
                            <th className="px-4 py-2 w-10 text-center text-[11px] font-medium text-muted-foreground/60">#</th>
                            <th className="px-4 py-2 text-[11px] font-medium text-muted-foreground/60">File name</th>
                            <th className="px-4 py-2 text-[11px] font-medium text-muted-foreground/60">Format</th>
                            <th className="px-4 py-2 text-right text-[11px] font-medium text-muted-foreground/60">Size</th>
                            <th className="px-4 py-2 text-[11px] font-medium text-muted-foreground/60 hidden md:table-cell">Uploaded</th>
                            <th className="px-4 py-2 text-right text-[11px] font-medium text-muted-foreground/60">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        <AnimatePresence mode="popLayout">
                            {filteredDatasets.length > 0 ? (
                                filteredDatasets.map((dataset, idx) => (
                                    <motion.tr
                                        key={dataset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="hover:bg-secondary/30 transition-colors group"
                                    >
                                        <td className="px-4 py-3 text-center text-[11px] text-muted-foreground/40 font-medium font-mono">
                                            {idx + 1}
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

                                        <td className="px-4 py-3 text-right text-xs tabular-nums font-medium text-muted-foreground">
                                            {formatFileSize(dataset.file_size)}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(dataset.uploaded_date).toLocaleDateString()}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-0.5">

                                                {/* Preview */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => router.push(`/datasets/${dataset.id}/preview`)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                        Preview
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Diagnose */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => onDiagnose(dataset.id)}
                                                            disabled={issueLoading === dataset.id}
                                                        >
                                                            {issueLoading === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <Bug className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                        Diagnose issues
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Problem framing */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => onAIAnalysis(dataset)}
                                                            disabled={aiAnalysisLoading === dataset.id}
                                                        >
                                                            {aiAnalysisLoading === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <BrainCircuit className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                        Problem framing
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* Clean */}
                                                <HoverCard openDelay={300} closeDelay={100}>
                                                    <HoverCardTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => router.push(`/clean?dataset=${dataset.id}`)}
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="top" className="w-auto px-2.5 py-1 text-xs">
                                                        Clean dataset
                                                    </HoverCardContent>
                                                </HoverCard>

                                                {/* More actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            disabled={exportingDatasetId === dataset.id}
                                                        >
                                                            {exportingDatasetId === dataset.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <MoreVertical className="h-3.5 w-3.5" />
                                                            }
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-md">
                                                        <DropdownMenuItem onClick={() => onRename(dataset)}>
                                                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Download className="mr-2 h-3.5 w-3.5" /> Export
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="rounded-md">
                                                                <DropdownMenuItem onClick={() => onExport(dataset, "csv")}>CSV</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => onExport(dataset, "xlsx")}>XLSX</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => onExport(dataset, "json")}>JSON</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => onExport(dataset, "parquet")}>Parquet</DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
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
                                        <div className="py-12 flex flex-col items-center gap-2 text-center">
                                            <div className="h-8 w-8 rounded-md bg-muted/60 border border-border/20 flex items-center justify-center">
                                                <Search className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No matching datasets</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Try adjusting your search or format filter.
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
