"use client";

import React from "react";
import {
    Loader2, Trash2, PlusCircle, WrapText, ChevronRight, ChevronLeft,
    Search, X, AlertTriangle,
} from "lucide-react";
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
import type { DataLabInspectColumn, ArithmeticFormula } from "@/services/api";
import { toast } from "sonner";

type Step = "drop" | "add" | "normalize";

export function ColumnToolsDialog({
    open, onOpenChange = () => {}, asPanel, datasetId, columns, onRefetchAll,
}: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onRefetchAll: () => void;
}>) {
    const [step, setStep] = React.useState<Step>("drop");
    const [loading, setLoading] = React.useState(false);

    // ── Drop step ──
    const [dropSelected, setDropSelected] = React.useState<string[]>([]);
    const [dropSearch, setDropSearch] = React.useState("");

    // ── Add step ──
    const [newName, setNewName] = React.useState("");
    const [formula, setFormula] = React.useState<ArithmeticFormula>("multiply");
    const [operandA, setOperandA] = React.useState("");
    const [operandB, setOperandB] = React.useState("");
    const [decimalPlaces, setDecimalPlaces] = React.useState<string>("2");

    React.useEffect(() => {
        if (open) {
            setStep("drop");
            setDropSelected([]);
            setDropSearch("");
            setNewName("");
            setFormula("multiply");
            setOperandA("");
            setOperandB("");
        }
    }, [open]);

    const numericCols = columns.filter(
        (c) => c.dtype.toLowerCase().includes("int") || c.dtype.toLowerCase().includes("float")
    );

    const filteredCols = columns.filter((c) =>
        c.column.toLowerCase().includes(dropSearch.toLowerCase())
    );

    function toggleDrop(col: string) {
        setDropSelected((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    }

    async function handleDrop() {
        if (dropSelected.length === 0) { setStep("add"); return; }
        setLoading(true);
        try {
            const res = await datalabApi.dropColumns(datasetId, { columns: dropSelected });
            toast.success(`Dropped ${res.columns_dropped.length} column(s): ${res.columns_dropped.join(", ")}`);
            onRefetchAll();
            setDropSelected([]);
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to drop columns.");
            return;
        } finally {
            setLoading(false);
        }
        setStep("add");
    }

    async function handleAdd() {
        if (!newName || !operandA || !operandB) {
            toast.error("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const dp = Number.parseInt(decimalPlaces);
            const res = await datalabApi.addColumn(datasetId, {
                new_name: newName, formula, operand_a: operandA, operand_b: operandB,
                decimal_places: Number.isNaN(dp) ? undefined : dp,
            });
            toast.success(`Added column "${res.new_column}". Dataset now has ${res.total_columns} columns.`);
            onRefetchAll();
            setNewName(""); setOperandA(""); setOperandB(""); setDecimalPlaces("2");
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to add column.");
            return;
        } finally {
            setLoading(false);
        }
        setStep("normalize");
    }

    async function handleNormalize() {
        setLoading(true);
        try {
            const res = await datalabApi.normalizeColumnNames(datasetId);
            if (res.detail) {
                toast.info(res.detail);
            } else {
                const count = Object.keys(res.renamed ?? {}).length;
                toast.success(`Normalized ${count} column name(s).`);
                onRefetchAll();
            }
            onOpenChange(false);
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to normalize column names.");
        } finally {
            setLoading(false);
        }
    }

    const formulaSymbol: Record<ArithmeticFormula, string> = {
        add: "+", subtract: "−", multiply: "×", divide: "÷",
    };

    const inner = (
        <div className="flex h-130">
                    {/* Sidebar */}
                    <div className="w-48 bg-muted/30 border-r border-border/60 p-4 flex flex-col gap-1">
                        <div className="mb-4">
                            <h3 className="text-[13px] font-bold tracking-wider text-muted-foreground">Steps</h3>
                        </div>
                        <StepBtn label="Drop Columns" active={step === "drop"} icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setStep("drop")} />
                        <StepBtn label="Add Column" active={step === "add"} icon={<PlusCircle className="h-3.5 w-3.5" />} onClick={() => setStep("add")} />
                        <StepBtn label="Normalize Names" active={step === "normalize"} icon={<WrapText className="h-3.5 w-3.5" />} onClick={() => setStep("normalize")} />
                        <div className="mt-auto pt-4 border-t border-border/40">
                            <p className="text-[13px] text-muted-foreground leading-tight italic">
                                Tip: Drop unused columns first, then add derived ones, then normalize all names to snake_case.
                            </p>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="flex-1 flex flex-col bg-background">
                        <div className="p-6 pb-4 flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="text-sm font-bold leading-none tracking-tight flex items-center gap-2">
                                {step === "drop" && "Step 1 — Drop Columns"}
                                {step === "add" && "Step 2 — Add Derived Column"}
                                {step === "normalize" && "Step 3 — Normalize Column Names"}
                            </h2>
                            <p className="text-sm text-muted-foreground text-[13px]">
                                {step === "drop" && "Permanently remove columns you no longer need. This cannot be undone."}
                                {step === "add" && "Create a new column by applying an arithmetic formula to two existing numeric columns."}
                                {step === "normalize" && "Rename all columns to lowercase snake_case — spaces and special characters become underscores."}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                            {step === "drop" && (
                                <>
                                    <div className="flex items-center gap-2 p-3 border border-amber-500/30 bg-amber-500/5 text-amber-700">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <p className="text-[13px]">Irreversible — dropped columns cannot be recovered.</p>
                                    </div>
                                    <div className="border border-border/40 overflow-hidden">
                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                                            <Search className="h-3 w-3 text-muted-foreground" />
                                            <input
                                                value={dropSearch}
                                                onChange={(e) => setDropSearch(e.target.value)}
                                                placeholder="Search columns…"
                                                className="bg-transparent border-none outline-none text-[13px] font-mono flex-1"
                                            />
                                            {dropSearch && (
                                                <button onClick={() => setDropSearch("")}>
                                                    <X className="h-3 w-3 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                        <ScrollArea className="h-52">
                                            <div className="p-1 grid grid-cols-1 gap-0.5">
                                                {filteredCols.map((col) => {
                                                    const sel = dropSelected.includes(col.column);
                                                    return (
                                                        <button
                                                            key={col.column}
                                                            onClick={() => toggleDrop(col.column)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-2 py-1.5 text-left transition-colors",
                                                                sel ? "bg-red-500/10" : "hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "h-3 w-3 border flex items-center justify-center shrink-0 transition-colors",
                                                                sel ? "border-red-500 bg-red-500" : "border-border"
                                                            )}>
                                                                {sel && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                                                            </div>
                                                            <span className={cn("text-[13px] font-mono flex-1 truncate", sel && "text-red-600 font-bold")}>{col.column}</span>
                                                            <span className="text-[13px] text-muted-foreground font-mono">{col.dtype}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                        {dropSelected.length > 0 && (
                                            <div className="px-3 py-1.5 border-t border-border/40 bg-red-500/5 flex items-center justify-between">
                                                <span className="text-[13px] text-red-600 font-semibold">{dropSelected.length} column(s) will be dropped</span>
                                                <button onClick={() => setDropSelected([])} className="text-[13px] text-muted-foreground hover:text-foreground">Clear</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === "add" && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">New column name</Label>
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="e.g. total_price"
                                            className="h-8 text-sm rounded-none font-mono"
                                        />
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-sm font-semibold">Column A</Label>
                                            <Select value={operandA} onValueChange={setOperandA}>
                                                <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                                    <SelectValue placeholder="Select…" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    {numericCols.map((c) => (
                                                        <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">{c.column}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-sm font-semibold text-center block">Op</Label>
                                            <Select value={formula} onValueChange={(v) => setFormula(v as ArithmeticFormula)}>
                                                <SelectTrigger className="h-9 rounded-none font-mono text-center text-[13px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none min-w-14">
                                                    <SelectItem value="add" className="rounded-none font-bold text-center">+</SelectItem>
                                                    <SelectItem value="subtract" className="rounded-none font-bold text-center">−</SelectItem>
                                                    <SelectItem value="multiply" className="rounded-none font-bold text-center">×</SelectItem>
                                                    <SelectItem value="divide" className="rounded-none font-bold text-center">÷</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-sm font-semibold">Column B</Label>
                                            <Select value={operandB} onValueChange={setOperandB}>
                                                <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                                    <SelectValue placeholder="Select…" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none">
                                                    {numericCols.map((c) => (
                                                        <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">{c.column}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/20 border border-dashed border-border/60">
                                        <p className="text-[13px] text-muted-foreground italic">
                                            New column{" "}
                                            <span className="font-bold text-foreground font-mono">{newName || "…"}</span>
                                            {" = "}
                                            <span className="font-mono text-primary">
                                                {operandA || "A"} {formulaSymbol[formula]} {operandB || "B"}
                                            </span>
                                        </p>
                                        {formula === "divide" && (
                                            <p className="text-[13px] text-muted-foreground mt-1">Rows where {operandB || "B"} = 0 will produce null.</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label className="text-sm font-semibold shrink-0">Round to</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={decimalPlaces}
                                            onChange={(e) => setDecimalPlaces(e.target.value)}
                                            className="h-8 w-20 rounded-none font-mono text-sm"
                                        />
                                        <span className="text-[13px] text-muted-foreground">decimal places</span>
                                    </div>
                                </div>
                            )}

                            {step === "normalize" && (
                                <div className="space-y-4">
                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        Column names like <span className="font-mono font-bold text-foreground">"First Name"</span> and{" "}
                                        <span className="font-mono font-bold text-foreground">"Date-Of-Birth"</span> will become{" "}
                                        <span className="font-mono font-bold text-primary">first_name</span> and{" "}
                                        <span className="font-mono font-bold text-primary">date_of_birth</span>.
                                    </p>
                                    <div className="border border-border/40 overflow-hidden">
                                        <div className="px-3 py-2 bg-muted/30 border-b border-border/40">
                                            <p className="text-[13px] font-semibold text-muted-foreground">Current columns</p>
                                        </div>
                                        <ScrollArea className="h-48">
                                            <div className="p-2 space-y-0.5">
                                                {columns.map((c) => (
                                                    <div key={c.column} className="flex items-center gap-2 px-2 py-1">
                                                        <span className="text-[13px] font-mono text-foreground">{c.column}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {step !== "drop" && (
                                    <Button variant="outline" size="sm" className="h-8 text-sm rounded-none gap-1.5"
                                        onClick={() => { if (step === "normalize") setStep("add"); else setStep("drop"); }}
                                        disabled={loading}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" /> Back
                                    </Button>
                                )}
                                {step !== "normalize" && (
                                    <Button variant="ghost" size="sm" className="h-8 text-sm rounded-none"
                                        onClick={() => { if (step === "drop") setStep("add"); else setStep("normalize"); }}
                                        disabled={loading}
                                    >
                                        Skip
                                    </Button>
                                )}
                            </div>
                            <Button size="sm" className="h-8 text-sm rounded-none gap-1.5 min-w-36"
                                onClick={() => {
                                    if (step === "drop") handleDrop();
                                    else if (step === "add") handleAdd();
                                    else handleNormalize();
                                }}
                                disabled={loading || (step === "add" && (!newName || !operandA || !operandB))}
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {step === "drop" && (dropSelected.length > 0 ? "Drop & Continue" : "Skip to Add")}
                                {step === "add" && "Add & Continue"}
                                {step === "normalize" && "Normalize & Finish"}
                                {!loading && step !== "normalize" && <ChevronRight className="h-3.5 w-3.5" />}
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
