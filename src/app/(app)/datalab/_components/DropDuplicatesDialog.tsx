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
import { toast } from "sonner";

interface Column {
    column: string;
    is_unique: boolean;
}

type KeepValue = "first" | "last" | "none";

export function DropDuplicatesDialog({ open, onOpenChange, datasetId, columns, onSuccess }: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    datasetId: number;
    columns: Column[];
    onSuccess: () => void;
}>) {
    const [subset, setSubset] = React.useState<string[]>([]);
    const [keep, setKeep] = React.useState<KeepValue>("first");
    const [loading, setLoading] = React.useState(false);

    function toggleColumn(col: string) {
        setSubset((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    }

    function handleClose() {
        if (loading) return;
        setSubset([]);
        setKeep("first");
        onOpenChange(false);
    }

    async function handleConfirm() {
        setLoading(true);
        try {
            const body: { subset?: string[]; keep?: "first" | "last" | false } = {};
            if (subset.length > 0) body.subset = subset;
            if (keep === "last") body.keep = "last";
            if (keep === "none") body.keep = false;

            const result = await datalabApi.dropDuplicates(datasetId, body);

            if (result.rows_dropped === 0) {
                toast.info("No duplicate rows found.");
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
                    {/* Subset */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold">
                            Subset{" "}
                            <span className="text-muted-foreground font-normal">— leave empty to check all columns</span>
                        </p>
                        <ScrollArea className="h-44 border border-border/50">
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

                    {/* Keep */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold">Keep</p>
                        <Select value={keep} onValueChange={(v) => setKeep(v as KeepValue)}>
                            <SelectTrigger className="rounded-none h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                <SelectItem value="first" className="text-xs">first — keep first occurrence (default)</SelectItem>
                                <SelectItem value="last" className="text-xs">last — keep last occurrence</SelectItem>
                                <SelectItem value="none" className="text-xs">false — drop all copies</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" className="rounded-none text-xs h-8" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-none text-xs h-8 gap-1.5" onClick={handleConfirm} disabled={loading}>
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        Drop Duplicates
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
