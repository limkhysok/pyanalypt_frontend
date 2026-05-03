"use client";

import React from "react";
import { Loader2, Filter, CaseSensitive, ChevronRight, ChevronLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabInspectColumn, FilterOperator, CleanStringOperation } from "@/services/api";
import { toast } from "sonner";

type Step = "filter" | "string";

const OPERATORS: { value: FilterOperator; label: string; needsValue: boolean }[] = [
    { value: "eq",           label: "equals",         needsValue: true  },
    { value: "ne",           label: "not equals",     needsValue: true  },
    { value: "gt",           label: "greater than",   needsValue: true  },
    { value: "gte",          label: "≥ greater or eq",needsValue: true  },
    { value: "lt",           label: "less than",      needsValue: true  },
    { value: "lte",          label: "≤ less or eq",   needsValue: true  },
    { value: "contains",     label: "contains",       needsValue: true  },
    { value: "not_contains", label: "not contains",   needsValue: true  },
    { value: "isnull",       label: "is empty",       needsValue: false },
    { value: "notnull",      label: "is not empty",   needsValue: false },
];

const STRING_OPS: { value: CleanStringOperation; label: string; desc: string }[] = [
    { value: "strip", label: "Strip whitespace", desc: "Remove leading and trailing spaces" },
    { value: "lower", label: "Lowercase",        desc: "Convert all text to lowercase"     },
    { value: "upper", label: "Uppercase",        desc: "Convert all text to UPPERCASE"     },
    { value: "title", label: "Title Case",       desc: "Capitalize the first letter of each word" },
];

export function CleanFilterDialog({
    open, onOpenChange = () => {}, asPanel, datasetId, columns, onRefetchAll,
}: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onRefetchAll: () => void;
}>) {
    const [step, setStep] = React.useState<Step>("filter");
    const [loading, setLoading] = React.useState(false);

    // ── Filter step ──
    const [filterCol, setFilterCol] = React.useState("");
    const [filterOp, setFilterOp] = React.useState<FilterOperator>("eq");
    const [filterVal, setFilterVal] = React.useState("");

    // ── String step ──
    const [strSelected, setStrSelected] = React.useState<string[]>([]);
    const [strSearch, setStrSearch] = React.useState("");
    const [strOp, setStrOp] = React.useState<CleanStringOperation>("strip");

    React.useEffect(() => {
        if (open) {
            setStep("filter");
            setFilterCol("");
            setFilterOp("eq");
            setFilterVal("");
            setStrSelected([]);
            setStrSearch("");
            setStrOp("strip");
        }
    }, [open]);

    const stringCols = columns.filter((c) => c.dtype === "object" || c.dtype.includes("string"));
    const filteredStrCols = stringCols.filter((c) =>
        c.column.toLowerCase().includes(strSearch.toLowerCase())
    );

    const selectedOperator = OPERATORS.find((o) => o.value === filterOp);
    const needsValue = selectedOperator?.needsValue ?? true;

    function toggleStrCol(col: string) {
        setStrSelected((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    }

    async function handleFilter() {
        if (!filterCol) { setStep("string"); return; }
        setLoading(true);
        try {
            const res = await datalabApi.filterRows(datasetId, {
                column: filterCol,
                operator: filterOp,
                value: needsValue ? filterVal : undefined,
            });
            if (res.rows_removed === 0) {
                toast.info(res.detail ?? "No rows were removed.");
            } else {
                toast.success(`Removed ${res.rows_removed} rows (${res.rows_before} → ${res.rows_after}).`);
                onRefetchAll();
            }
            setFilterCol(""); setFilterVal("");
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to filter rows.");
            return;
        } finally {
            setLoading(false);
        }
        setStep("string");
    }

    async function handleCleanString() {
        if (strSelected.length === 0 && stringCols.length === 0) {
            onOpenChange(false);
            return;
        }
        setLoading(true);
        try {
            const res = await datalabApi.cleanString(datasetId, {
                columns: strSelected.length > 0 ? strSelected : stringCols.map((c) => c.column),
                operation: strOp,
            });
            if (res.cells_changed === 0) {
                toast.info(res.detail ?? "No values were changed.");
            } else {
                toast.success(`${strOp}: changed ${res.cells_changed} cell(s) across ${res.columns.length} column(s).`);
                onRefetchAll();
            }
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to clean string columns.");
        } finally {
            setLoading(false);
        }
    }

    const inner = (
        <div className="flex h-125">
            {/* Sidebar */}
            <div className="w-48 bg-muted/30 border-r border-border/60 p-4 flex flex-col gap-1">
                <div className="mb-4">
                    <h3 className="text-[13px] font-bold tracking-wider text-muted-foreground">Steps</h3>
                </div>
                <StepBtn label="Filter Rows" active={step === "filter"} icon={<Filter className="h-3.5 w-3.5" />} onClick={() => setStep("filter")} />
                <StepBtn label="Clean Text" active={step === "string"} icon={<CaseSensitive className="h-3.5 w-3.5" />} onClick={() => setStep("string")} />
                <div className="mt-auto pt-4 border-t border-border/40">
                    <p className="text-[13px] text-muted-foreground leading-tight italic">
                        Tip: Filter out unwanted rows first, then normalize string casing and whitespace.
                    </p>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col bg-background">
                <div className="p-6 pb-4 flex flex-col space-y-1.5 text-center sm:text-left">
                    <h2 className="text-lg font-semibold leading-none tracking-tight text-sm font-bold">
                        {step === "filter" && "Step 1 — Filter Rows"}
                        {step === "string" && "Step 2 — Clean Text Columns"}
                    </h2>
                    <p className="text-sm text-muted-foreground text-[13px]">
                        {step === "filter" && "Keep only rows that match a condition. Removed rows cannot be recovered."}
                        {step === "string" && "Strip whitespace or change casing for text (object) columns."}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                    {step === "filter" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Column</Label>
                                <Select value={filterCol} onValueChange={setFilterCol}>
                                    <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                        <SelectValue placeholder="Select column…" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {columns.map((c) => (
                                            <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                                {c.column} <span className="text-muted-foreground ml-1">({c.dtype})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Operator — keep rows where column…</Label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {OPERATORS.map((op) => (
                                        <button
                                            key={op.value}
                                            onClick={() => setFilterOp(op.value)}
                                            className={cn(
                                                "px-3 py-2 border text-left text-[13px] font-mono transition-all rounded-none",
                                                filterOp === op.value
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary text-foreground font-semibold"
                                                    : "border-border hover:bg-muted/30 text-muted-foreground"
                                            )}
                                        >
                                            {op.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {needsValue && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Value</Label>
                                    <Input
                                        value={filterVal}
                                        onChange={(e) => setFilterVal(e.target.value)}
                                        placeholder="e.g. active, 100, 2024-01-01"
                                        className="h-8 text-sm rounded-none font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {step === "string" && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Operation</Label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {STRING_OPS.map((op) => (
                                        <button
                                            key={op.value}
                                            onClick={() => setStrOp(op.value)}
                                            className={cn(
                                                "p-3 border text-left transition-all rounded-none",
                                                strOp === op.value
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border hover:bg-muted/30"
                                            )}
                                        >
                                            <p className="text-sm font-bold">{op.label}</p>
                                            <p className="text-[13px] text-muted-foreground mt-0.5">{op.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">Text columns to apply to</Label>
                                    <span className="text-[13px] text-muted-foreground italic">
                                        {strSelected.length > 0 ? `${strSelected.length} selected` : "All text columns"}
                                    </span>
                                </div>
                                {stringCols.length === 0 ? (
                                    <p className="text-[13px] text-muted-foreground italic">No text (object) columns found in dataset.</p>
                                ) : (
                                    <div className="border border-border/40 overflow-hidden">
                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                                            <Search className="h-3 w-3 text-muted-foreground" />
                                            <input
                                                value={strSearch}
                                                onChange={(e) => setStrSearch(e.target.value)}
                                                placeholder="Search columns…"
                                                className="bg-transparent border-none outline-none text-[13px] font-mono flex-1"
                                            />
                                            {strSearch && <button onClick={() => setStrSearch("")}><X className="h-3 w-3 text-muted-foreground" /></button>}
                                        </div>
                                        <ScrollArea className="h-36">
                                            <div className="p-1 space-y-0.5">
                                                {filteredStrCols.map((col) => {
                                                    const sel = strSelected.includes(col.column);
                                                    return (
                                                        <button key={col.column} onClick={() => toggleStrCol(col.column)}
                                                            className={cn("flex items-center gap-2 px-2 py-1.5 w-full text-left transition-colors", sel ? "bg-primary/10" : "hover:bg-muted/50")}
                                                        >
                                                            <div className={cn("h-3 w-3 border flex items-center justify-center shrink-0", sel ? "border-primary bg-primary" : "border-border")}>
                                                                {sel && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                                                            </div>
                                                            <span className={cn("text-[13px] font-mono flex-1 truncate", sel && "text-primary font-bold")}>{col.column}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {step === "string" && (
                            <Button variant="outline" size="sm" className="h-8 text-sm rounded-none gap-1.5"
                                onClick={() => setStep("filter")} disabled={loading}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Back
                            </Button>
                        )}
                        {step === "filter" && (
                            <Button variant="ghost" size="sm" className="h-8 text-sm rounded-none"
                                onClick={() => setStep("string")} disabled={loading}
                            >
                                Skip
                            </Button>
                        )}
                    </div>
                    <Button size="sm" className="h-8 text-sm rounded-none gap-1.5 min-w-36"
                        onClick={() => { if (step === "filter") handleFilter(); else handleCleanString(); }}
                        disabled={loading || (step === "filter" && needsValue && !filterVal && !!filterCol)}
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {step === "filter" && (filterCol ? "Apply & Continue" : "Skip to Clean")}
                        {step === "string" && "Apply & Finish"}
                        {!loading && step === "filter" && <ChevronRight className="h-3.5 w-3.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (asPanel) {
        return (
            <div className="border border-border/60 bg-background h-full w-full overflow-hidden">
                {inner}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-2xl p-0 gap-0 overflow-hidden border-border/60">
                {inner}
            </DialogContent>
        </Dialog>
    );
}

function StepBtn({ label, active, icon, onClick }: Readonly<{ label: string; active: boolean; icon: React.ReactNode; onClick: () => void }>) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-2 text-left transition-colors",
                active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            <span className={cn("shrink-0 p-1 border transition-colors", active ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border/60 bg-background/50")}>
                {icon}
            </span>
            <span className="text-[13px] leading-tight flex-1">{label}</span>
            {active && <ChevronRight className="h-3 w-3 opacity-50" />}
        </button>
    );
}
