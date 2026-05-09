"use client";

import React from "react";
import { Loader2, AlertTriangle, KeyRound, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
    { value: "all_first",   label: "Keep first match",         description: "If a row appears more than once, keep the first one and remove the rest." },
    { value: "all_last",    label: "Keep last match",          description: "If a row appears more than once, keep the last one and remove the rest." },
    { value: "subset_keep", label: "Match by specific columns", description: "Two rows count as duplicates only when the selected columns match." },
    { value: "drop_all",    label: "Remove all copies",        description: "If any row is repeated, delete every copy — nothing is kept." },
];

export function DropDuplicatesDialog({ open, onOpenChange = () => {}, asPanel, datasetId, columns, onSuccess }: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
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
            toast.error(detail ?? "Could not remove duplicates. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const inner = (
        <>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold leading-none tracking-tight">Remove Duplicate Rows</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Choose how to handle rows that appear more than once.
                    </p>
                </div>

                <div className="flex items-start gap-2 px-3 py-2.5 border border-amber-500/30 bg-amber-500/5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-[13px] font-medium leading-relaxed text-amber-700 dark:text-amber-400">
                        Removed rows cannot be recovered. Make sure you have a backup if needed.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <p className="text-sm font-semibold">What should happen to duplicates?</p>
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
                                            <span className="block text-sm font-semibold">{m.label}</span>
                                            <span className={cn(
                                                "block text-[13px]",
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

                    {showColumnPicker && (
                        <div className="space-y-1.5">
                            <p className="text-sm font-semibold">
                                Which columns to check{" "}
                                <span className="text-muted-foreground font-normal">
                                    {mode === "subset_keep" ? "(required)" : "(optional — leave empty to check all)"}
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
                                                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm font-mono text-left transition-colors",
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
                                <p className="text-[13px] text-muted-foreground">
                                    {subset.length} column{subset.length === 1 ? "" : "s"} selected
                                </p>
                            )}
                        </div>
                    )}

                    {showKeepSelector && (
                        <div className="space-y-1.5">
                            <p className="text-sm font-semibold">Which copy to keep?</p>
                            <Select value={keep} onValueChange={(v) => setKeep(v as "first" | "last")}>
                                <SelectTrigger className="rounded-none h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    <SelectItem value="first" className="text-sm rounded-none">First — keep the earliest row</SelectItem>
                                    <SelectItem value="last" className="text-sm rounded-none">Last — keep the most recent row</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                    <Button variant="ghost" size="sm" className="rounded-none text-sm h-8" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-none text-sm h-8 gap-1.5" onClick={handleConfirm} disabled={submitDisabled}>
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        Remove Duplicates
                    </Button>
                </div>
        </>
    );

    if (asPanel) {
        return (
            <div className="border border-border/60 p-5 bg-background h-full">
                {inner}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="rounded-none max-w-md gap-4">
                {inner}
            </DialogContent>
        </Dialog>
    );
}
