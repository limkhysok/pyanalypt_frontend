"use client";

import React from "react";
import { Loader2, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DropDuplicatesMode } from "@/services/api";
import { toast } from "sonner";

interface Column {
    column: string;
    is_unique: boolean;
}

const MODES: { value: DropDuplicatesMode; label: string; description: string }[] = [
    { value: "all_first", label: "Remove duplicates — keep first", description: "Keep the first occurrence of each duplicate row." },
    { value: "all_last", label: "Remove duplicates — keep last", description: "Keep the last occurrence of each duplicate row." },
    { value: "subset_keep", label: "Remove duplicates by column — keep first/last", description: "Check for duplicates within selected columns only." },
    { value: "drop_all", label: "Drop all copies of any duplicate", description: "Remove every copy of any duplicated row — no survivors." },
];

export function DropDuplicatesDialog({ open, onOpenChange, datasetId, columns, onSuccess }: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    datasetId: number;
    columns: Column[];
    onSuccess: () => void;
}>) {
    const [mode, setMode] = React.useState<DropDuplicatesMode>("all_first");
    const [subset, setSubset] = React.useState<string[]>([]);
    const [keep, setKeep] = React.useState<"first" | "last">("first");
    const [loading, setLoading] = React.useState(false);

    const showColumnPicker = mode === "subset_keep" || mode === "drop_all";
    const showKeepSelector = mode === "subset_keep";
    const submitDisabled = loading || (mode === "subset_keep" && subset.length === 0);

    function toggleColumn(col: string) {
        setSubset((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    }

    function handleClose() {
        if (loading) return;
        setMode("all_first");
        setSubset([]);
        setKeep("first");
        onOpenChange(false);
    }

    async function handleConfirm() {
        setLoading(true);
        try {
            const body: Parameters<typeof datalabApi.dropDuplicates>[1] = { mode };
            if ((mode === "subset_keep" || mode === "drop_all") && subset.length > 0) {
                body.subset = subset;
            }
            if (mode === "subset_keep") {
                body.keep = keep;
            }

            const result = await datalabApi.dropDuplicates(datasetId, body);

            if (result.rows_dropped === 0) {
                toast.info(result.detail ?? "No duplicate rows found.");
                handleClose();
            } else {
                toast.success(
                    `Removed ${result.rows_dropped} duplicate rows (${result.rows_before} → ${result.rows_after}).`
                );
                onSuccess();
                handleClose();
            }
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            toast.error(detail ?? "Failed to drop duplicates.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="rounded-none max-w-md gap-4">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold">Drop Duplicates</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure which duplicate rows to remove from this dataset.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-2 px-3 py-2.5 border border-amber-500/30 bg-amber-500/5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-[11px] font-medium leading-relaxed text-amber-700 dark:text-amber-400">
                        This will permanently remove duplicate rows from your dataset file on disk. This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Mode selector */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold">Strategy</p>
                        <div className="border border-border/50 divide-y divide-border/50">
                            {MODES.map((m) => {
                                const selected = mode === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => {
                                            setMode(m.value);
                                            setSubset([]);
                                        }}
                                        className={cn(
                                            "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                                            selected
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted/60 text-foreground"
                                        )}
                                    >
                                        <span className={cn(
                                            "mt-0.5 h-3.5 w-3.5 rounded-none border shrink-0 flex items-center justify-center",
                                            selected ? "border-primary-foreground/50" : "border-border"
                                        )}>
                                            {selected && <span className="block h-1.5 w-1.5 bg-primary-foreground" />}
                                        </span>
                                        <span className="space-y-0.5">
                                            <span className="block text-xs font-medium">{m.label}</span>
                                            <span className={cn(
                                                "block text-[11px]",
                                                selected ? "text-primary-foreground/70" : "text-muted-foreground"
                                            )}>
                                                {m.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column picker */}
                    {showColumnPicker && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold">
                                Columns{" "}
                                <span className="text-muted-foreground font-normal">
                                    {mode === "subset_keep" ? "— required" : "— optional, leave empty to check all"}
                                </span>
                            </p>
                            <ScrollArea className="h-40 border border-border/50">
                                <div className="p-1">
                                    {columns.map((col) => {
                                        const selected = subset.includes(col.column);
                                        return (
                                            <button
                                                key={col.column}
                                                type="button"
                                                onClick={() => toggleColumn(col.column)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-mono text-left transition-colors",
                                                    selected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-muted/60 text-foreground"
                                                )}
                                            >
                                                <span className={cn(
                                                    "h-3.5 w-3.5 border shrink-0 flex items-center justify-center",
                                                    selected ? "border-primary-foreground/50" : "border-border"
                                                )}>
                                                    {selected && <span className="block h-1.5 w-1.5 bg-primary-foreground" />}
                                                </span>
                                                <span className="flex-1 truncate">{col.column}</span>
                                                {col.is_unique && (
                                                    <KeyRound className={cn(
                                                        "h-3 w-3 shrink-0",
                                                        selected ? "text-primary-foreground/70" : "text-amber-500"
                                                    )} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                            {subset.length > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                    {subset.length} column{subset.length === 1 ? "" : "s"} selected
                                </p>
                            )}
                        </div>
                    )}

                    {/* Keep selector */}
                    {showKeepSelector && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold">Keep</p>
                            <Select value={keep} onValueChange={(v) => setKeep(v as "first" | "last")}>
                                <SelectTrigger className="rounded-none h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    <SelectItem value="first" className="text-xs rounded-none">first — keep first occurrence</SelectItem>
                                    <SelectItem value="last" className="text-xs rounded-none">last — keep last occurrence</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" className="rounded-none text-xs h-8" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-none text-xs h-8 gap-1.5" onClick={handleConfirm} disabled={submitDisabled}>
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        Drop Duplicates
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
