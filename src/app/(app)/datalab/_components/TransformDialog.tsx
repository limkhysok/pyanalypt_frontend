"use client";

import React from "react";
import {
    Loader2, SlidersHorizontal, CalendarClock, Tags,
    ChevronRight, ChevronLeft, Search, X, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type {
    DataLabInspectColumn, ScaleMethod, DatetimeFeature, EncodeStrategy,
} from "@/services/api";
import { toast } from "sonner";

type Step = "scale" | "datetime" | "encode";

const DATETIME_FEATURES: { value: DatetimeFeature; label: string; desc: string }[] = [
    { value: "year",    label: "Year",    desc: "e.g. 2024"      },
    { value: "month",   label: "Month",   desc: "1–12"            },
    { value: "day",     label: "Day",     desc: "1–31"            },
    { value: "weekday", label: "Weekday", desc: "0=Mon, 6=Sun"   },
    { value: "hour",    label: "Hour",    desc: "0–23"            },
    { value: "minute",  label: "Minute",  desc: "0–59"            },
];

export function TransformDialog({
    open, onOpenChange = () => {}, asPanel, datasetId, columns, onRefetchAll,
}: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onRefetchAll: () => void;
}>) {
    const [step, setStep] = React.useState<Step>("scale");
    const [loading, setLoading] = React.useState(false);

    // ── Scale step ──
    const [scaleSelected, setScaleSelected] = React.useState<string[]>([]);
    const [scaleMethod, setScaleMethod] = React.useState<ScaleMethod>("minmax");
    const [scaleSearch, setScaleSearch] = React.useState("");

    // ── Datetime step ──
    const [dtCol, setDtCol] = React.useState("");
    const [dtFeatures, setDtFeatures] = React.useState<DatetimeFeature[]>(["year", "month", "day"]);

    // ── Encode step ──
    const [encodeSelected, setEncodeSelected] = React.useState<string[]>([]);
    const [encodeStrategy, setEncodeStrategy] = React.useState<EncodeStrategy>("label");
    const [encodeSearch, setEncodeSearch] = React.useState("");

    React.useEffect(() => {
        if (open) {
            setStep("scale");
            setScaleSelected([]);
            setScaleMethod("minmax");
            setScaleSearch("");
            setDtCol("");
            setDtFeatures(["year", "month", "day"]);
            setEncodeSelected([]);
            setEncodeStrategy("label");
            setEncodeSearch("");
        }
    }, [open]);

    const numericCols = columns.filter(
        (c) => c.dtype.includes("int") || c.dtype.includes("float")
    );
    const categoricalCols = columns.filter(
        (c) => c.dtype === "object" || c.dtype.includes("string") || c.dtype === "category"
    );

    const filteredScaleCols = numericCols.filter((c) =>
        c.column.toLowerCase().includes(scaleSearch.toLowerCase())
    );
    const filteredEncodeCols = categoricalCols.filter((c) =>
        c.column.toLowerCase().includes(encodeSearch.toLowerCase())
    );

    function toggleScale(col: string) {
        setScaleSelected((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]);
    }
    function toggleEncode(col: string) {
        setEncodeSelected((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]);
    }
    function toggleDtFeature(f: DatetimeFeature) {
        setDtFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
    }

    async function handleScale() {
        if (scaleSelected.length === 0) { setStep("datetime"); return; }
        setLoading(true);
        try {
            const res = await datalabApi.scaleColumns(datasetId, {
                columns: scaleSelected, method: scaleMethod,
            });
            if (res.detail) {
                toast.info(res.detail);
            } else {
                const msg = res.scaled_columns.length > 0
                    ? `Scaled ${res.scaled_columns.length} column(s) with ${scaleMethod}.`
                    : "No columns were scaled.";
                toast.success(msg);
                if (res.skipped_columns.length > 0) {
                    toast.warning(`Skipped: ${res.skipped_columns.map((s) => s.column).join(", ")}`);
                }
                onRefetchAll();
            }
            setScaleSelected([]);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to scale columns.");
            return;
        } finally {
            setLoading(false);
        }
        setStep("datetime");
    }

    async function handleDatetime() {
        if (!dtCol || dtFeatures.length === 0) { setStep("encode"); return; }
        setLoading(true);
        try {
            const res = await datalabApi.extractDatetime(datasetId, {
                column: dtCol, features: dtFeatures,
            });
            toast.success(`Added ${res.added_columns.length} column(s): ${res.added_columns.join(", ")}`);
            onRefetchAll();
            setDtCol(""); setDtFeatures(["year", "month", "day"]);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to extract datetime features.");
            return;
        } finally {
            setLoading(false);
        }
        setStep("encode");
    }

    async function handleEncode() {
        if (encodeSelected.length === 0) { onOpenChange(false); return; }
        setLoading(true);
        try {
            const res = await datalabApi.encodeColumns(datasetId, {
                columns: encodeSelected, strategy: encodeStrategy,
            });
            toast.success(`Encoded ${res.result.length} column(s) using ${encodeStrategy}.`);
            onRefetchAll();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to encode columns.");
        } finally {
            setLoading(false);
        }
    }

    const inner = (
        <div className="flex h-135">
                    {/* Sidebar */}
                    <div className="w-48 bg-muted/30 border-r border-border/60 p-4 flex flex-col gap-1">
                        <div className="mb-4">
                            <h3 className="text-[13px] font-bold tracking-wider text-muted-foreground">Steps</h3>
                        </div>
                        <StepBtn label="Scale Columns"    active={step === "scale"}    icon={<SlidersHorizontal className="h-3.5 w-3.5" />} onClick={() => setStep("scale")} />
                        <StepBtn label="Extract Datetime" active={step === "datetime"} icon={<CalendarClock className="h-3.5 w-3.5" />}    onClick={() => setStep("datetime")} />
                        <StepBtn label="Encode Columns"   active={step === "encode"}   icon={<Tags className="h-3.5 w-3.5" />}              onClick={() => setStep("encode")} />
                        <div className="mt-auto pt-4 border-t border-border/40">
                            <p className="text-[13px] text-muted-foreground leading-tight italic">
                                Tip: Extract datetime parts first so you can then scale or encode the new columns if needed.
                            </p>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="flex-1 flex flex-col bg-background">
                        <div className="p-6 pb-4 flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-sm font-bold leading-none tracking-tight">
                                {step === "scale"    && "Step 1 — Scale Columns"}
                                {step === "datetime" && "Step 2 — Extract Datetime Features"}
                                {step === "encode"   && "Step 3 — Encode Categorical Columns"}
                            </h2>
                            <p className="text-sm text-muted-foreground text-[13px]">
                                {step === "scale"    && "Normalize numeric columns to a common range. Irreversible — duplicate the dataset first if unsure."}
                                {step === "datetime" && "Extract year, month, day, etc. from a date column into separate numeric columns."}
                                {step === "encode"   && "Convert categorical text columns to numbers using label or one-hot encoding."}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                            {step === "scale" && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 p-3 border border-amber-500/30 bg-amber-500/5 text-amber-700">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <p className="text-[13px]">Irreversible — scale values cannot be recovered after applying.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Method</Label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={() => setScaleMethod("minmax")}
                                                className={cn("p-3 border text-left rounded-none transition-all", scaleMethod === "minmax" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30")}
                                            >
                                                <p className="text-sm font-bold">Min-Max</p>
                                                <p className="text-[13px] text-muted-foreground mt-0.5">Scales values to [0, 1]</p>
                                            </button>
                                            <button
                                                onClick={() => setScaleMethod("zscore")}
                                                className={cn("p-3 border text-left rounded-none transition-all", scaleMethod === "zscore" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30")}
                                            >
                                                <p className="text-sm font-bold">Z-Score</p>
                                                <p className="text-[13px] text-muted-foreground mt-0.5">Mean=0, Std=1 (standardize)</p>
                                            </button>
                                        </div>
                                    </div>
                                    <ColPicker
                                        label="Numeric columns to scale"
                                        cols={filteredScaleCols}
                                        selected={scaleSelected}
                                        onToggle={toggleScale}
                                        search={scaleSearch}
                                        onSearch={setScaleSearch}
                                        onClear={() => setScaleSelected([])}
                                        emptyText="No numeric columns found."
                                        dtype
                                    />
                                </div>
                            )}

                            {step === "datetime" && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Source column</Label>
                                        <Select value={dtCol} onValueChange={setDtCol}>
                                            <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                                <SelectValue placeholder="Select a date/time column…" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                {columns.map((c) => (
                                                    <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                                        {c.column} <span className="text-muted-foreground ml-1">({c.dtype})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[13px] text-muted-foreground italic">
                                            If the column is not datetime type, the engine will parse it automatically.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Features to extract</Label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {DATETIME_FEATURES.map((f) => {
                                                const sel = dtFeatures.includes(f.value);
                                                return (
                                                    <button
                                                        key={f.value}
                                                        onClick={() => toggleDtFeature(f.value)}
                                                        className={cn(
                                                            "p-2.5 border text-left rounded-none transition-all",
                                                            sel ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <p className="text-sm font-bold">{f.label}</p>
                                                        <p className="text-[13px] text-muted-foreground">{f.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {dtCol && dtFeatures.length > 0 && (
                                        <div className="p-3 bg-muted/20 border border-dashed border-border/60">
                                            <p className="text-[13px] text-muted-foreground">New columns that will be added:</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {dtFeatures.map((f) => (
                                                    <Badge key={f} variant="secondary" className="rounded-none font-mono text-[13px]">
                                                        {dtCol}_{f}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === "encode" && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Strategy</Label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                onClick={() => setEncodeStrategy("label")}
                                                className={cn("p-3 border text-left rounded-none transition-all", encodeStrategy === "label" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30")}
                                            >
                                                <p className="text-sm font-bold">Label Encoding</p>
                                                <p className="text-[13px] text-muted-foreground mt-0.5">Replaces each category with an integer in-place.</p>
                                            </button>
                                            <button
                                                onClick={() => setEncodeStrategy("onehot")}
                                                className={cn("p-3 border text-left rounded-none transition-all", encodeStrategy === "onehot" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30")}
                                            >
                                                <p className="text-sm font-bold">One-Hot Encoding</p>
                                                <p className="text-[13px] text-muted-foreground mt-0.5">Creates one binary column per unique value.</p>
                                            </button>
                                        </div>
                                        {encodeStrategy === "onehot" && (
                                            <div className="flex items-center gap-2 p-2 border border-amber-500/30 bg-amber-500/5 text-amber-700">
                                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                                <p className="text-[13px]">High-cardinality columns will create many new columns. Use with care.</p>
                                            </div>
                                        )}
                                    </div>
                                    <ColPicker
                                        label="Categorical columns to encode"
                                        cols={filteredEncodeCols}
                                        selected={encodeSelected}
                                        onToggle={toggleEncode}
                                        search={encodeSearch}
                                        onSearch={setEncodeSearch}
                                        onClear={() => setEncodeSelected([])}
                                        emptyText="No categorical (object) columns found."
                                        dtype
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {step !== "scale" && (
                                    <Button variant="outline" size="sm" className="h-8 text-sm rounded-none gap-1.5"
                                        onClick={() => { if (step === "encode") setStep("datetime"); else setStep("scale"); }}
                                        disabled={loading}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" /> Back
                                    </Button>
                                )}
                                {step !== "encode" && (
                                    <Button variant="ghost" size="sm" className="h-8 text-sm rounded-none"
                                        onClick={() => { if (step === "scale") setStep("datetime"); else setStep("encode"); }}
                                        disabled={loading}
                                    >
                                        Skip
                                    </Button>
                                )}
                            </div>
                            <Button size="sm" className="h-8 text-sm rounded-none gap-1.5 min-w-36"
                                onClick={() => {
                                    if (step === "scale") handleScale();
                                    else if (step === "datetime") handleDatetime();
                                    else handleEncode();
                                }}
                                disabled={
                                    loading
                                    || (step === "datetime" && dtFeatures.length === 0)
                                }
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {step === "scale"    && (scaleSelected.length > 0 ? "Scale & Continue" : "Skip to Datetime")}
                                {step === "datetime" && (dtCol ? "Extract & Continue" : "Skip to Encode")}
                                {step === "encode"   && (encodeSelected.length > 0 ? "Encode & Finish" : "Finish")}
                                {!loading && step !== "encode" && <ChevronRight className="h-3.5 w-3.5" />}
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

function ColPicker({
    label, cols, selected, onToggle, search, onSearch, onClear, emptyText, dtype,
}: Readonly<{
    label: string;
    cols: DataLabInspectColumn[];
    selected: string[];
    onToggle: (col: string) => void;
    search: string;
    onSearch: (s: string) => void;
    onClear: () => void;
    emptyText: string;
    dtype?: boolean;
}>) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{label}</Label>
                <span className="text-[13px] text-muted-foreground italic">
                    {selected.length > 0 ? `${selected.length} selected` : "None selected"}
                </span>
            </div>
            {cols.length === 0 ? (
                <p className="text-[13px] text-muted-foreground italic">{emptyText}</p>
            ) : (
                <div className="border border-border/40 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <input value={search} onChange={(e) => onSearch(e.target.value)}
                            placeholder="Search columns…"
                            className="bg-transparent border-none outline-none text-[13px] font-mono flex-1"
                        />
                        {search && <button onClick={() => onSearch("")}><X className="h-3 w-3 text-muted-foreground" /></button>}
                    </div>
                    <ScrollArea className="h-36">
                        <div className="p-1 space-y-0.5">
                            {cols.map((col) => {
                                const sel = selected.includes(col.column);
                                return (
                                    <button key={col.column} onClick={() => onToggle(col.column)}
                                        className={cn("flex items-center gap-2 px-2 py-1.5 w-full text-left transition-colors", sel ? "bg-primary/10" : "hover:bg-muted/50")}
                                    >
                                        <div className={cn("h-3 w-3 border flex items-center justify-center shrink-0", sel ? "border-primary bg-primary" : "border-border")}>
                                            {sel && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                                        </div>
                                        <span className={cn("text-[13px] font-mono flex-1 truncate", sel && "text-primary font-bold")}>{col.column}</span>
                                        {dtype && <span className="text-[13px] text-muted-foreground font-mono">{col.dtype}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                    {selected.length > 0 && (
                        <div className="px-3 py-1 border-t border-border/40 bg-muted/5 flex justify-end">
                            <button onClick={onClear} className="text-[13px] text-muted-foreground hover:text-foreground">Clear</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StepBtn({ label, active, icon, onClick }: Readonly<{ label: string; active: boolean; icon: React.ReactNode; onClick: () => void }>) {
    return (
        <button onClick={onClick}
            className={cn("flex items-center gap-2 px-3 py-2 text-left transition-colors", active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
        >
            <span className={cn("shrink-0 p-1 border transition-colors", active ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border/60 bg-background/50")}>
                {icon}
            </span>
            <span className="text-[13px] leading-tight flex-1">{label}</span>
            {active && <ChevronRight className="h-3 w-3 opacity-50" />}
        </button>
    );
}
