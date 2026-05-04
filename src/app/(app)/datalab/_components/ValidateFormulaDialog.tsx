"use client";

import React from "react";
import {
    Loader2,
    Calculator,
    CheckCircle2,
    AlertCircle,
    Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabInspectColumn, ArithmeticFormula, ValidateFormulaResponse, FixFormulaRequest } from "@/services/api";
import { toast } from "sonner";

export function ValidateFormulaDialog({
    open,
    onOpenChange = () => {},
    asPanel,
    datasetId,
    columns,
    onSuccess,
}: Readonly<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    asPanel?: boolean;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onSuccess?: () => void;
}>) {
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<ValidateFormulaResponse | null>(null);

    // Form state
    const [resCol, setResCol] = React.useState("");
    const [formula, setFormula] = React.useState<ArithmeticFormula>("multiply");
    const [opA, setOpA] = React.useState("");
    const [opB, setOpB] = React.useState("");
    const [tolerance, setTolerance] = React.useState("0.01");

    // Fix state
    const [fixTarget, setFixTarget] = React.useState("");
    const [fixLoading, setFixLoading] = React.useState(false);

    React.useEffect(() => {
        if (result) setFixTarget(result.result_column);
    }, [result]);

    async function handleValidate() {
        if (!resCol || !opA || !opB) {
            toast.error("Please select all columns.");
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await datalabApi.validateFormula(datasetId, {
                result_column: resCol,
                formula,
                operand_a: opA,
                operand_b: opB,
                tolerance: Number.parseFloat(tolerance) || 0.01,
            });
            setResult(res);
            if (res.error_rows === 0) {
                toast.success("Audit passed! No inconsistencies found.");
            } else {
                toast.warning(`Audit found ${res.error_rows} inconsistent rows.`);
            }
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to validate formula.");
        } finally {
            setLoading(false);
        }
    }

    async function handleFix() {
        if (!fixTarget || !result) return;
        setFixLoading(true);
        try {
            const params = buildFixParams(result, fixTarget);
            const fixRes = await datalabApi.fixFormula(datasetId, {
                ...params,
                tolerance: Number.parseFloat(tolerance) || 0.01,
            });

            if (fixRes.cells_fixed === 0) {
                toast.info(fixRes.detail ?? "No inconsistent rows found to fix.");
            } else {
                toast.success(`Fixed ${fixRes.cells_fixed} cells in ${fixRes.target}.`);
                onSuccess?.();
            }

            // Re-run validate to confirm
            const recheck = await datalabApi.validateFormula(datasetId, {
                result_column: resCol,
                formula,
                operand_a: opA,
                operand_b: opB,
                tolerance: Number.parseFloat(tolerance) || 0.01,
            });
            setResult(recheck);
            if (recheck.error_rows === 0) {
                toast.success("Re-audit passed. All inconsistencies resolved.");
            } else {
                toast.warning(`${recheck.error_rows} rows still inconsistent after fix.`);
            }
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to fix formula.");
        } finally {
            setFixLoading(false);
        }
    }

    const numericCols = columns.filter(c => c.dtype.includes("int") || c.dtype.includes("float"));

    const inner = (
        <>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b bg-muted/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Calculator className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none tracking-tight">Audit Formula Consistency</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Verify and repair inconsistencies between calculated values and result columns.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={cn("flex flex-col", asPanel ? "" : "h-150")}>
                    <div className="p-6 space-y-6 border-b bg-muted/5">
                        <div className="space-y-4">
                            <Label className="text-[12px] font-black capitalize tracking-[0.15em] text-muted-foreground/80">Formula Configuration</Label>
                            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-[11px] font-medium text-muted-foreground ml-1">Result Column</Label>
                                    <Select value={resCol} onValueChange={setResCol}>
                                        <SelectTrigger className="h-10 rounded-none font-mono text-[13px] bg-background">
                                            <SelectValue placeholder="Select target..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            {columns.map(c => (
                                                <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                                    {c.column}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="h-10 items-center justify-center text-xl font-light text-muted-foreground/40 px-1 hidden md:flex">
                                    =
                                </div>

                                <div className="flex-2 flex gap-2">
                                    <div className="flex-1 space-y-1.5">
                                        <Label className="text-[11px] font-medium text-muted-foreground ml-1">Operand A</Label>
                                        <Select value={opA} onValueChange={setOpA}>
                                            <SelectTrigger className="h-10 rounded-none font-mono text-[13px] bg-background">
                                                <SelectValue placeholder="Col A" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                {numericCols.map(c => (
                                                    <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                                        {c.column}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-16 space-y-1.5">
                                        <Label className="text-[11px] font-medium text-muted-foreground text-center block">Op</Label>
                                        <Select value={formula} onValueChange={(v) => setFormula(v as ArithmeticFormula)}>
                                            <SelectTrigger className="h-10 rounded-none font-mono text-center text-[13px] bg-background">
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

                                    <div className="flex-1 space-y-1.5">
                                        <Label className="text-[11px] font-medium text-muted-foreground ml-1">Operand B</Label>
                                        <Select value={opB} onValueChange={setOpB}>
                                            <SelectTrigger className="h-10 rounded-none font-mono text-[13px] bg-background">
                                                <SelectValue placeholder="Col B" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                {numericCols.map(c => (
                                                    <SelectItem key={c.column} value={c.column} className="font-mono rounded-none text-[13px]">
                                                        {c.column}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-semibold text-muted-foreground">Tolerance:</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={tolerance}
                                        onChange={(e) => setTolerance(e.target.value)}
                                        placeholder="0.01"
                                        className="h-9 w-24 rounded-none font-mono text-sm bg-background border-muted-foreground/20 focus:border-primary transition-colors"
                                    />
                                    <span className="text-[12px] text-muted-foreground italic hidden lg:inline">Allowed variance (e.g. 0.01 for rounding)</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleValidate}
                                disabled={loading || !resCol || !opA || !opB}
                                className="h-10 rounded-none px-8 font-bold tracking-tight shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Run Consistency Audit
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-background overflow-hidden flex flex-col">
                        {!result && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                                    <Calculator className="h-10 w-10 opacity-20" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-foreground">Awaiting Configuration</p>
                                    <p className="text-sm opacity-60 mt-1 max-w-75">
                                        Define the arithmetic relationship between columns to start the verification process.
                                    </p>
                                </div>
                                <div className="text-xs font-mono bg-muted/50 px-3 py-1.5 border border-border/40 rounded">
                                    Expected: <span className="text-primary">{resCol || 'Result'}</span> = {opA || 'A'}
                                    <FormulaSymbol formula={formula} />
                                    {opB || 'B'}
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex items-center justify-center bg-muted/5">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 animate-ping" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground tracking-widest capitalize">Analyzing Data</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 font-mono">Comparing millions of cell pairs...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <ScrollArea className="flex-1 h-100">
                                <div className="p-6 space-y-8">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <StatCard label="Total Rows" value={result.total_rows.toLocaleString()} />
                                        <StatCard label="Analyzed" value={result.checked_rows.toLocaleString()} note="Excluding NULLs" />
                                        <StatCard
                                            label="Mismatches"
                                            value={result.error_rows.toLocaleString()}
                                            color={result.error_rows > 0 ? "text-destructive" : "text-emerald-500"}
                                            highlight={result.error_rows > 0}
                                        />
                                        <StatCard
                                            label="Error Rate"
                                            value={`${result.error_pct.toFixed(2)}%`}
                                            color={result.error_pct > 0 ? "text-destructive" : "text-emerald-500"}
                                            highlight={result.error_pct > 0}
                                        />
                                    </div>

                                    {/* Status Indicator */}
                                    <div className={cn(
                                        "p-5 border-l-4 flex items-start gap-4 transition-all duration-500 animate-in fade-in slide-in-from-left-4",
                                        result.error_rows === 0
                                            ? "bg-emerald-500/5 border-emerald-500 text-emerald-900 dark:text-emerald-300"
                                            : "bg-destructive/5 border-destructive text-destructive"
                                    )}>
                                        {result.error_rows === 0 ? (
                                            <CheckCircle2 className="h-6 w-6 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 mt-0.5" />
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-sm font-black capitalize tracking-tight">
                                                {result.error_rows === 0 ? "Data Integrity Confirmed" : "Formula Inconsistencies Detected"}
                                            </p>
                                            <p className="text-sm opacity-90 leading-relaxed">
                                                {result.error_rows === 0
                                                    ? "Every row in the dataset strictly adheres to the defined mathematical relationship within the specified tolerance."
                                                    : `We identified ${result.error_rows} rows where the values do not mathematically align with the specified formula and tolerance.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sample Errors Table */}
                                    {result.sample_errors.length > 0 && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[12px] font-black capitalize tracking-widest text-muted-foreground/80">Inconsistency Examples</Label>
                                                <span className="text-[11px] text-muted-foreground font-medium italic">Showing up to 10 most extreme cases</span>
                                            </div>
                                            <div className="border border-border/60 overflow-hidden shadow-sm">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-[13px] border-collapse min-w-150">
                                                        <thead>
                                                            <tr className="bg-muted/50 border-b">
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider opacity-60">Row</th>
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider opacity-60">{result.operand_a}</th>
                                                                <th className="px-2 py-2.5 font-bold font-mono text-[11px] text-center opacity-40"></th>
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider opacity-60">{result.operand_b}</th>
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider text-primary bg-primary/5">Calculated</th>
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider text-destructive bg-destructive/5">{result.result_column}</th>
                                                                <th className="px-4 py-2.5 font-bold font-mono text-[11px] capitalize tracking-wider text-right">Δ Diff</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/40">
                                                            {result.sample_errors.map((err) => (
                                                                <tr key={err.row_index} className="hover:bg-muted/30 transition-colors group">
                                                                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{err.row_index}</td>
                                                                    <td className="px-4 py-2.5 font-mono">{(err[result.operand_a] as number)?.toLocaleString()}</td>
                                                                    <td className="px-2 py-2.5 text-center text-muted-foreground/30">
                                                                        <FormulaSymbol formula={formula} />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 font-mono">{(err[result.operand_b] as number)?.toLocaleString()}</td>
                                                                    <td className="px-4 py-2.5 font-mono font-bold text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors">{err.calculated.toFixed(2)}</td>
                                                                    <td className="px-4 py-2.5 font-mono font-bold text-destructive bg-destructive/5 group-hover:bg-destructive/10 transition-colors">{(err[result.result_column] as number)?.toLocaleString()}</td>
                                                                    <td className="px-4 py-2.5 font-mono text-right text-destructive font-bold">{err.diff.toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fix Section — only shown when errors exist */}
                                    {result.error_rows > 0 && (
                                        <div className="border border-amber-500/20 bg-amber-500/5 p-6 space-y-5 rounded-none relative overflow-hidden animate-in zoom-in-95 duration-500">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                                <Wrench className="h-24 w-24" />
                                            </div>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                    <Wrench className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <span className="text-base font-black capitalize tracking-tight text-amber-700 dark:text-amber-400">Remediation Suite</span>
                                            </div>

                                            <div className="space-y-3 relative z-10">
                                                <Label className="text-[12px] font-black capitalize tracking-widest text-muted-foreground/80">
                                                    Identify target column for repair
                                                </Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {[result.result_column, result.operand_a, result.operand_b].map(col => (
                                                        <button
                                                            key={col}
                                                            type="button"
                                                            onClick={() => setFixTarget(col)}
                                                            className={cn(
                                                                "px-4 py-2.5 border font-mono text-[13px] transition-all relative overflow-hidden",
                                                                fixTarget === col
                                                                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-black shadow-inner"
                                                                    : "border-border/60 hover:border-amber-400/60 text-muted-foreground bg-background"
                                                            )}
                                                        >
                                                            {col}
                                                            {fixTarget === col && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[12px] text-muted-foreground leading-relaxed max-w-125">
                                                    Values in <span className="font-bold text-foreground">{fixTarget}</span> will be overwritten by calculating the inverse formula using the other two columns as reference data.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2 relative z-10">
                                                <Button
                                                    onClick={handleFix}
                                                    disabled={fixLoading || !fixTarget}
                                                    className="h-10 rounded-none px-6 font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                                                >
                                                    {fixLoading
                                                        ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        : <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    }
                                                    Repair {result.error_rows.toLocaleString()} Rows
                                                </Button>
                                                {fixLoading && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-amber-600 animate-pulse font-black capitalize tracking-[0.2em]">
                                                            Executing Fix...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                {!asPanel && (
                    <div className="p-4 border-t bg-muted/20 flex justify-end">
                        <Button variant="ghost" size="sm" className="h-9 rounded-none px-6 font-bold text-muted-foreground hover:text-foreground transition-colors" onClick={() => onOpenChange(false)}>
                            Close Auditor
                        </Button>
                    </div>
                )}
        </>
    );

    if (asPanel) {
        return (
            <div className="border border-border/60">
                {inner}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-3xl p-0 gap-0 overflow-hidden border-border/60">
                {inner}
            </DialogContent>
        </Dialog>
    );
}

function StatCard({ label, value, note, color, highlight }: Readonly<{ label: string, value: string | number, note?: string, color?: string, highlight?: boolean }>) {
    return (
        <div className={cn(
            "p-4 border border-border/40 bg-background flex flex-col gap-1.5 transition-all relative overflow-hidden",
            highlight && "ring-1 ring-inset ring-destructive/10"
        )}>
            <span className="text-[10px] font-black capitalize tracking-[0.2em] text-muted-foreground/70">{label}</span>
            <span className={cn("text-2xl font-black font-mono tracking-tighter", color)}>{value}</span>
            {note && <span className="text-[10px] text-muted-foreground italic leading-none opacity-60">{note}</span>}
            {highlight && <div className="absolute top-0 right-0 w-8 h-8 bg-destructive/5 rounded-bl-full pointer-events-none" />}
        </div>
    );
}


function FormulaSymbol({ formula }: Readonly<{ formula: ArithmeticFormula }>) {
    switch (formula) {
        case "add": return " + ";
        case "subtract": return " - ";
        case "multiply": return " * ";
        case "divide": return " / ";
        default: return " ";
    }
}

function buildFixParams(
    validateResult: ValidateFormulaResponse,
    badColumn: string
): Omit<FixFormulaRequest, "tolerance"> {
    const { result_column, formula, operand_a, operand_b } = validateResult;

    if (badColumn === result_column) {
        return { target: result_column, formula, operand_a, operand_b };
    }

    if (badColumn === operand_a) {
        // result = A OP B  →  A = ?
        const inverse: Record<ArithmeticFormula, ArithmeticFormula> = {
            divide: "multiply",   // result = A/B  → A = result*B
            multiply: "divide",   // result = A*B  → A = result/B
            add: "subtract",      // result = A+B  → A = result−B
            subtract: "add",      // result = A−B  → A = result+B
        };
        return { target: operand_a, formula: inverse[formula], operand_a: result_column, operand_b };
    }

    if (badColumn !== operand_b) {
        return { target: result_column, formula, operand_a, operand_b };
    }

    // badColumn === operand_b: result = A OP B  →  B = ?
    if (formula === "divide") {
        // result = A/B  → B = A/result
        return { target: operand_b, formula: "divide", operand_a, operand_b: result_column };
    }
    if (formula === "multiply") {
        // result = A*B  → B = result/A
        return { target: operand_b, formula: "divide", operand_a: result_column, operand_b: operand_a };
    }
    if (formula === "add") {
        // result = A+B  → B = result−A
        return { target: operand_b, formula: "subtract", operand_a: result_column, operand_b: operand_a };
    }
    // subtract: result = A−B  → B = A−result
    return { target: operand_b, formula: "subtract", operand_a, operand_b: result_column };
}
