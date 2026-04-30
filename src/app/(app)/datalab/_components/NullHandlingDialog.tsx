"use client";

import React from "react";
import {
    Loader2,
    Search,
    X,
    Eraser,
    Trash2,
    PaintBucket,
    ChevronRight,
    ChevronLeft,
    Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabInspectColumn, FillNullsStrategy, ArithmeticFormula } from "@/services/api";
import { toast } from "sonner";

type Step = "replace" | "derive" | "drop" | "fill";

const STRATEGIES: { value: FillNullsStrategy; label: string; notes: string }[] = [
    { value: "median", label: "Median",            notes: "Middle value — good default for numbers" },
    { value: "mean",   label: "Average (mean)",    notes: "Sum divided by count — sensitive to extremes" },
    { value: "mode",   label: "Most common value", notes: "Works on any column type" },
    { value: "constant", label: "Custom value",    notes: "You type the value to use" },
    { value: "ffill",  label: "Copy from above",   notes: "Uses the value from the previous row" },
    { value: "bfill",  label: "Copy from below",   notes: "Uses the value from the next row" },
];

export function NullHandlingDialog({
    open,
    onOpenChange = () => {},
    asPanel,
    datasetId,
    columns,
    onRefetchInspect,
    onRefetchAll,
}: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onRefetchInspect: () => void;
    onRefetchAll: () => void;
}>) {
    const [step, setStep] = React.useState<Step>("replace");
    const [loading, setLoading] = React.useState(false);

    // ── Shared State: Column Selection ──
    const [selectedCols, setSelectedCols] = React.useState<string[]>([]);
    const [colSearch, setColSearch] = React.useState("");

    // ── Step 1: Replace Values State ──
    const [replaceKeys, setReplaceKeys] = React.useState<string[]>(["N/A", "-", "?", "none"]);
    const [newKey, setNewKey] = React.useState("");
    const [replaceValue, setReplaceValue] = React.useState("");

    // ── Step 2: Derive Values State ──
    const [deriveTarget, setDeriveTarget] = React.useState("");
    const [deriveFormula, setDeriveFormula] = React.useState<ArithmeticFormula>("add");
    const [deriveOpA, setDeriveOpA] = React.useState("");
    const [deriveOpB, setDeriveOpB] = React.useState("");

    // ── Step 3: Drop Nulls State ──
    const [dropAxis, setDropAxis] = React.useState<"rows" | "columns">("rows");
    const [dropHow, setDropHow] = React.useState<"any" | "all">("any");
    const [threshPct, setThreshPct] = React.useState(70);

    // ── Step 4: Fill Nulls State ──
    const [fillStrategy, setFillStrategy] = React.useState<FillNullsStrategy>("median");
    const [fillValue, setFillValue] = React.useState("");

    // Reset when dialog opens
    React.useEffect(() => {
        if (open) {
            setStep("replace");
            setSelectedCols([]);
            setColSearch("");
        }
    }, [open]);

    const filteredCols = columns.filter((c) =>
        c.column.toLowerCase().includes(colSearch.toLowerCase())
    );

    function toggleColumn(col: string) {
        setSelectedCols((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    }

    function addReplaceKey() {
        if (newKey && !replaceKeys.includes(newKey)) {
            setReplaceKeys([...replaceKeys, newKey]);
            setNewKey("");
        }
    }

    function removeReplaceKey(key: string) {
        setReplaceKeys(replaceKeys.filter((k) => k !== key));
    }

    async function handleReplace() {
        setLoading(true);
        try {
            const replacements: Record<string, string | null> = {};
            replaceKeys.forEach((k) => {
                replacements[k] = replaceValue === "" ? null : replaceValue;
            });

            const res = await datalabApi.replaceValues(datasetId, {
                replacements,
                columns: selectedCols.length > 0 ? selectedCols : undefined,
            });

            if (res.cells_replaced === 0) {
                toast.info("No matching values found.");
            } else {
                toast.success(`Replaced ${res.cells_replaced} values.`);
                onRefetchInspect();
            }
            setStep("drop");
            setSelectedCols([]); // Reset selection for next step
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to replace values.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDerive() {
        if (!deriveTarget || !deriveOpA || !deriveOpB) {
            toast.error("Please select target and both operand columns.");
            return;
        }
        setLoading(true);
        try {
            const res = await datalabApi.fillDerived(datasetId, {
                target: deriveTarget,
                formula: deriveFormula,
                operand_a: deriveOpA,
                operand_b: deriveOpB,
            });

            if (res.cells_filled === 0) {
                toast.info("No null values found to fill with this formula.");
            } else {
                toast.success(`Filled ${res.cells_filled} null values in '${res.target}'.`);
                onRefetchInspect();
            }
            setStep("drop");
            setSelectedCols([]);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to derive values.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDrop() {
        setLoading(true);
        try {
            const body = dropAxis === "rows" 
                ? { axis: "rows" as const, how: dropHow, subset: selectedCols.length > 0 ? selectedCols : undefined }
                : { axis: "columns" as const, thresh_pct: threshPct };

            const res = await datalabApi.dropNulls(datasetId, body);

            if (dropAxis === "rows") {
                const r = res as { rows_dropped: number };
                if (r.rows_dropped === 0) {
                    toast.info("No rows matched for dropping.");
                } else {
                    toast.success(`Dropped ${r.rows_dropped} rows.`);
                    onRefetchAll();
                }
            } else {
                const c = res as { columns_dropped?: string[] };
                const dropped = c.columns_dropped ?? [];
                if (dropped.length === 0) {
                    toast.info("No columns matched for dropping.");
                } else {
                    toast.success(`Dropped ${dropped.length} columns: ${dropped.join(", ")}`);
                    onRefetchAll();
                }
            }
            setStep("fill");
            setSelectedCols([]); // Reset selection for next step
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to drop nulls.");
        } finally {
            setLoading(false);
        }
    }

    async function handleFill() {
        setLoading(true);
        try {
            const res = await datalabApi.fillNulls(datasetId, {
                strategy: fillStrategy,
                value: fillStrategy === "constant" ? fillValue : undefined,
                columns: selectedCols.length > 0 ? selectedCols : undefined,
            });

            if (res.cells_filled === 0) {
                toast.info("No null values found to fill.");
            } else {
                toast.success(`Filled ${res.cells_filled} null values.`);
                if (res.skipped_columns.length > 0) {
                    toast.warning(`Skipped ${res.skipped_columns.length} columns (incompatible dtype).`, {
                        description: res.skipped_columns.join(", ")
                    });
                }
                onRefetchInspect();
            }
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to fill nulls.");
        } finally {
            setLoading(false);
        }
    }

    const columnsToDropPreview = dropAxis === "columns" 
        ? columns.filter(c => c.null_pct > threshPct).map(c => c.column)
        : [];

    const inner = (
        <div className="flex h-137.5">
                    {/* ── Sidebar Stepper ── */}
                    <div className="w-48 bg-muted/30 border-r border-border/60 p-4 flex flex-col gap-1">
                        <div className="mb-4">
                            <h3 className="text-[13px] font-bold tracking-wider text-muted-foreground">Steps</h3>
                        </div>
                        <StepButton
                            label="Fix Bad Values"
                            active={step === "replace"}
                            icon={<Eraser className="h-3.5 w-3.5" />}
                            onClick={() => setStep("replace")}
                        />
                        <StepButton
                            label="Fill from Formula"
                            active={step === "derive"}
                            icon={<Calculator className="h-3.5 w-3.5" />}
                            onClick={() => setStep("derive")}
                        />
                        <StepButton
                            label="Remove Empty"
                            active={step === "drop"}
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setStep("drop")}
                        />
                        <StepButton
                            label="Fill Gaps"
                            active={step === "fill"}
                            icon={<PaintBucket className="h-3.5 w-3.5" />}
                            onClick={() => setStep("fill")}
                        />

                        <div className="mt-auto pt-4 border-t border-border/40">
                            <p className="text-[13px] text-muted-foreground leading-tight italic">
                                Tip: Fix bad strings first, then remove heavily empty rows, then fill what's left.
                            </p>
                        </div>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="flex-1 flex flex-col bg-background">
                        <div className="p-6 pb-4 flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-sm font-bold leading-none tracking-tight flex items-center gap-2">
                                {step === "replace" && "Step 1 — Fix Bad Values"}
                                {step === "derive" && "Step 2 — Fill from Formula"}
                                {step === "drop" && "Step 3 — Remove Empty Data"}
                                {step === "fill" && "Step 4 — Fill Empty Cells"}
                            </h2>
                            <p className="text-sm text-muted-foreground text-[13px]">
                                {step === "replace" && "Replace placeholder text like 'N/A', '-', or '?' with a real empty value."}
                                {step === "derive" && "Calculate missing values from other columns — e.g. Total = Qty × Price."}
                                {step === "drop" && "Delete rows or columns that are too empty to be useful."}
                                {step === "fill" && "Replace empty cells with a calculated or fixed value."}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {step === "replace" && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">Text to replace</Label>
                                        <div className="flex flex-wrap gap-1.5 p-2 border bg-muted/10 min-h-10">
                                            {replaceKeys.map((k) => (
                                                <Badge key={k} variant="secondary" className="rounded-none text-[13px] py-0 h-5 gap-1 pr-1 font-mono">
                                                    {k}
                                                    <button onClick={() => removeReplaceKey(k)} className="hover:text-destructive transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <input 
                                                value={newKey}
                                                onChange={(e) => setNewKey(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addReplaceKey()}
                                                placeholder="Add value..."
                                                className="bg-transparent border-none outline-none text-[13px] font-mono flex-1 min-w-20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">Replace with</Label>
                                        <div className="flex items-center gap-3">
                                            <Input 
                                                value={replaceValue}
                                                onChange={(e) => setReplaceValue(e.target.value)}
                                                placeholder="null (NaN)"
                                                className="h-8 text-sm rounded-none font-mono"
                                            />
                                            {replaceValue === "" && (
                                                <span className="text-[13px] text-muted-foreground italic shrink-0">Leave blank → empty cell</span>
                                            )}
                                        </div>
                                    </div>

                                    <ColumnPicker 
                                        columns={filteredCols} 
                                        selected={selectedCols} 
                                        onToggle={toggleColumn} 
                                        search={colSearch} 
                                        onSearchChange={setColSearch} 
                                    />
                                </div>
                            )}

                            {step === "derive" && (
                                <DeriveStep 
                                    columns={columns}
                                    deriveTarget={deriveTarget}
                                    setDeriveTarget={setDeriveTarget}
                                    deriveOpA={deriveOpA}
                                    setDeriveOpA={setDeriveOpA}
                                    deriveOpB={deriveOpB}
                                    setDeriveOpB={setDeriveOpB}
                                    deriveFormula={deriveFormula}
                                    setDeriveFormula={setDeriveFormula}
                                />
                            )}

                            {step === "drop" && (
                                <DropStep
                                    dropAxis={dropAxis}
                                    setDropAxis={setDropAxis}
                                    dropHow={dropHow}
                                    setDropHow={setDropHow}
                                    threshPct={threshPct}
                                    setThreshPct={setThreshPct}
                                    filteredCols={filteredCols}
                                    selectedCols={selectedCols}
                                    toggleColumn={toggleColumn}
                                    colSearch={colSearch}
                                    setColSearch={setColSearch}
                                    columnsToDropPreview={columnsToDropPreview}
                                />
                            )}

                            {step === "fill" && (
                                <FillStep 
                                    fillStrategy={fillStrategy}
                                    setFillStrategy={setFillStrategy}
                                    fillValue={fillValue}
                                    setFillValue={setFillValue}
                                    filteredCols={filteredCols}
                                    selectedCols={selectedCols}
                                    toggleColumn={toggleColumn}
                                    colSearch={colSearch}
                                    setColSearch={setColSearch}
                                />
                            )}
                        </div>

                        <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {step !== "replace" && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-sm rounded-none gap-1.5"
                                        onClick={() => {
                                            if (step === "fill") setStep("drop");
                                            else if (step === "drop") setStep("derive");
                                            else if (step === "derive") setStep("replace");
                                        }}
                                        disabled={loading}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        Back
                                    </Button>
                                )}
                                {step !== "fill" && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 text-sm rounded-none"
                                        onClick={() => {
                                            if (step === "replace") setStep("derive");
                                            else if (step === "derive") setStep("drop");
                                            else if (step === "drop") setStep("fill");
                                        }}
                                        disabled={loading}
                                    >
                                        Skip
                                    </Button>
                                )}
                            </div>

                            <Button 
                                size="sm" 
                                className="h-8 text-sm rounded-none gap-1.5 min-w-32"
                                onClick={() => {
                                    if (step === "replace") handleReplace();
                                    if (step === "derive") handleDerive();
                                    if (step === "drop") handleDrop();
                                    if (step === "fill") handleFill();
                                }}
                                disabled={loading
                                    || (step === "fill" && fillStrategy === "constant" && !fillValue)
                                    || (step === "derive" && deriveTarget !== "" && !columns.some(c => c.column === deriveTarget && (c.dtype.includes("int") || c.dtype.includes("float"))))
                                }
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {step === "replace" && "Apply & Continue"}
                                {step === "derive" && "Apply & Continue"}
                                {step === "drop" && "Remove & Continue"}
                                {step === "fill" && "Fill & Finish"}
                                {!loading && <ChevronRight className="h-3.5 w-3.5" />}
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
function DeriveStep({ 
    columns, deriveTarget, setDeriveTarget, deriveOpA, setDeriveOpA, deriveOpB, setDeriveOpB, deriveFormula, setDeriveFormula 
}: Readonly<{
    columns: DataLabInspectColumn[],
    deriveTarget: string,
    setDeriveTarget: (s: string) => void,
    deriveOpA: string,
    setDeriveOpA: (s: string) => void,
    deriveOpB: string,
    setDeriveOpB: (s: string) => void,
    deriveFormula: ArithmeticFormula,
    setDeriveFormula: (f: ArithmeticFormula) => void
}>) {
    let symbol = "";
    switch (deriveFormula) {
        case "add": symbol = "+"; break;
        case "subtract": symbol = "−"; break;
        case "multiply": symbol = "×"; break;
        case "divide": symbol = "÷"; break;
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Column to fill</Label>
                    <Select value={deriveTarget} onValueChange={setDeriveTarget}>
                        <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                            <SelectValue placeholder="Select target column..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            {columns.filter(c => c.dtype.includes("int") || c.dtype.includes("float")).map(c => (
                                <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                    {c.column} {c.null_count > 0 && `(${c.null_count} nulls)`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-3">
                        <Label className="text-sm font-semibold">Column A</Label>
                        <Select value={deriveOpA} onValueChange={setDeriveOpA}>
                            <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                <SelectValue placeholder="Select column..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                {columns.filter(c => c.dtype.includes("int") || c.dtype.includes("float")).map(c => (
                                    <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                        {c.column}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-24 space-y-3">
                        <Label className="text-sm font-semibold text-center">Operation</Label>
                        <Select value={deriveFormula} onValueChange={(v) => setDeriveFormula(v as ArithmeticFormula)}>
                            <SelectTrigger className="h-9 rounded-none font-mono text-center text-[13px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none min-w-15">
                                <SelectItem value="add" className="rounded-none font-bold text-center">+</SelectItem>
                                <SelectItem value="subtract" className="rounded-none font-bold text-center">−</SelectItem>
                                <SelectItem value="multiply" className="rounded-none font-bold text-center">×</SelectItem>
                                <SelectItem value="divide" className="rounded-none font-bold text-center">÷</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-3">
                        <Label className="text-sm font-semibold">Column B</Label>
                        <Select value={deriveOpB} onValueChange={setDeriveOpB}>
                            <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                <SelectValue placeholder="Select column..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                {columns.filter(c => c.dtype.includes("int") || c.dtype.includes("float")).map(c => (
                                    <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                        {c.column}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-4 bg-muted/20 border border-dashed border-border/60">
                    <p className="text-[13px] text-muted-foreground leading-relaxed italic">
                        Empty cells in <span className="font-bold text-foreground font-mono">{deriveTarget || "column to fill"}</span> will be set to:
                        <br />
                        <span className="font-bold text-primary font-mono ml-2">
                            {deriveOpA || "Column A"} {symbol} {deriveOpB || "Column B"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

function DropStep({
    dropAxis, setDropAxis, dropHow, setDropHow, threshPct, setThreshPct, filteredCols, selectedCols, toggleColumn, colSearch, setColSearch, columnsToDropPreview
}: Readonly<{
    dropAxis: "rows" | "columns",
    setDropAxis: (s: "rows" | "columns") => void,
    dropHow: "any" | "all",
    setDropHow: (s: "any" | "all") => void,
    threshPct: number,
    setThreshPct: (n: number) => void,
    filteredCols: DataLabInspectColumn[],
    selectedCols: string[],
    toggleColumn: (s: string) => void,
    colSearch: string,
    setColSearch: (s: string) => void,
    columnsToDropPreview: string[]
}>) {
    return (
        <div className="space-y-6">
            <div className="flex gap-1 p-1 bg-muted/50 border border-border/40 w-fit">
                <Button 
                    variant={dropAxis === "rows" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 text-[13px] rounded-none px-4"
                    onClick={() => setDropAxis("rows")}
                >
                    Drop Rows
                </Button>
                <Button 
                    variant={dropAxis === "columns" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 text-[13px] rounded-none px-4"
                    onClick={() => setDropAxis("columns")}
                >
                    Drop Columns
                </Button>
            </div>

            {dropAxis === "rows" ? (
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Remove a row when...</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setDropHow("any")}
                                className={cn(
                                    "p-3 border text-left transition-all rounded-none",
                                    dropHow === "any" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30"
                                )}
                            >
                                <p className="text-sm font-bold tracking-tight">Any column is empty</p>
                                <p className="text-[13px] text-muted-foreground mt-1">Remove the row if at least one of the selected columns is empty.</p>
                            </button>
                            <button
                                onClick={() => setDropHow("all")}
                                className={cn(
                                    "p-3 border text-left transition-all rounded-none",
                                    dropHow === "all" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30"
                                )}
                            >
                                <p className="text-sm font-bold tracking-tight">All columns are empty</p>
                                <p className="text-[13px] text-muted-foreground mt-1">Remove the row only if every selected column is empty.</p>
                            </button>
                        </div>
                    </div>

                    <ColumnPicker 
                        label="Check only these columns (optional)"
                        columns={filteredCols} 
                        selected={selectedCols} 
                        onToggle={toggleColumn} 
                        search={colSearch} 
                        onSearchChange={setColSearch} 
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold">How empty is too empty?</Label>
                            <span className="text-sm font-mono font-bold text-primary">{threshPct}%</span>
                        </div>
                        <Input
                            type="range"
                            min="0"
                            max="100"
                            value={threshPct}
                            onChange={(e) => setThreshPct(Number.parseInt(e.target.value))}
                            className="h-4 accent-primary cursor-pointer border-none p-0"
                        />
                        <p className="text-[13px] text-muted-foreground italic">
                            Remove any column where more than {threshPct}% of its values are empty.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Columns that will be removed</Label>
                        <div className="border border-border/40 p-3 min-h-20 bg-muted/10">
                            {columnsToDropPreview.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {columnsToDropPreview.map(c => (
                                        <Badge key={c} variant="destructive" className="rounded-none text-[13px] py-0 h-5 font-mono bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
                                            {c}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[13px] text-muted-foreground text-center py-4 italic">No columns match the current threshold.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FillStep({
    fillStrategy, setFillStrategy, fillValue, setFillValue, filteredCols, selectedCols, toggleColumn, colSearch, setColSearch
}: Readonly<{
    fillStrategy: FillNullsStrategy,
    setFillStrategy: (s: FillNullsStrategy) => void,
    fillValue: string,
    setFillValue: (s: string) => void,
    filteredCols: DataLabInspectColumn[],
    selectedCols: string[],
    toggleColumn: (s: string) => void,
    colSearch: string,
    setColSearch: (s: string) => void
}>) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Strategy</Label>
                <div className="grid grid-cols-2 gap-2">
                    {STRATEGIES.map((s) => (
                        <button 
                            key={s.value}
                            onClick={() => setFillStrategy(s.value)}
                            className={cn(
                                "p-3 border text-left transition-all rounded-none",
                                fillStrategy === s.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/30"
                            )}
                        >
                            <p className="text-sm font-bold tracking-tight">{s.label}</p>
                            <p className="text-[13px] text-muted-foreground mt-1 leading-tight">{s.notes}</p>
                        </button>
                    ))}
                </div>
            </div>

            {fillStrategy === "constant" && (
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Constant Value</Label>
                    <Input 
                        value={fillValue}
                        onChange={(e) => setFillValue(e.target.value)}
                        placeholder="e.g. Unknown, 0, false"
                        className="h-8 text-sm rounded-none font-mono"
                    />
                </div>
            )}

            <ColumnPicker 
                columns={filteredCols} 
                selected={selectedCols} 
                onToggle={toggleColumn} 
                search={colSearch} 
                onSearchChange={setColSearch} 
            />
        </div>
    );
}

function StepButton({ label, active, icon, onClick }: Readonly<{ label: string, active: boolean, icon: React.ReactNode, onClick: () => void }>) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-2 text-left transition-colors group",
                active 
                    ? "bg-primary text-primary-foreground font-semibold" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            <span className={cn(
                "shrink-0 p-1 border transition-colors",
                active ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border/60 bg-background/50"
            )}>
                {icon}
            </span>
            <span className="text-[13px] leading-tight flex-1">{label}</span>
            {active && <ChevronRight className="h-3 w-3 opacity-50" />}
        </button>
    );
}

function ColumnPicker({ 
    columns, 
    selected, 
    onToggle, 
    search, 
    onSearchChange,
    label = "Apply to these columns (optional)"
}: Readonly<{ 
    columns: DataLabInspectColumn[], 
    selected: string[], 
    onToggle: (col: string) => void, 
    search: string, 
    onSearchChange: (s: string) => void,
    label?: string
}>) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{label}</Label>
                <span className="text-[13px] text-muted-foreground italic">
                    {selected.length > 0 ? `${selected.length} selected` : "All columns targeted"}
                </span>
            </div>
            
            <div className="border border-border/40 bg-background overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <input 
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search columns..."
                        className="bg-transparent border-none outline-none text-[13px] font-mono flex-1"
                    />
                </div>
                <ScrollArea className="h-36">
                    <div className="p-1 grid grid-cols-1 gap-0.5">
                        {columns.length === 0 && (
                            <p className="text-[13px] text-muted-foreground text-center py-8">No columns found.</p>
                        )}
                        {columns.map((col) => {
                            const isSelected = selected.includes(col.column);
                            return (
                                <button
                                    key={col.column}
                                    onClick={() => onToggle(col.column)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1 text-left group transition-colors",
                                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-3 w-3 border flex items-center justify-center transition-colors shrink-0",
                                        isSelected ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
                                    )}>
                                        {isSelected && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                                    </div>
                                    <span className={cn(
                                        "text-[13px] font-mono truncate flex-1",
                                        isSelected ? "text-primary font-bold" : "text-foreground"
                                    )}>
                                        {col.column}
                                    </span>
                                    {col.null_count > 0 && (
                                        <span className="text-[13px] text-red-500 font-mono bg-red-500/5 px-1 border border-red-500/10">
                                            {col.null_count} nulls
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
                {selected.length > 0 && (
                    <div className="px-3 py-1.5 border-t border-border/40 bg-muted/5 flex justify-end">
                        <button 
                            onClick={() => {}} // This should be a clear all, need to pass it
                            className="text-[13px] text-muted-foreground hover:text-foreground font-bold"
                        >
                            {/* Clear All - will implement if needed */}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
