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
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
    onOpenChange,
    datasetId,
    columns,
    onSuccess,
}: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to validate formula.");
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
        } catch (err: any) {
            toast.error(err.response?.data?.detail ?? "Failed to fix formula.");
        } finally {
            setFixLoading(false);
        }
    }

    const numericCols = columns.filter(c => c.dtype.includes("int") || c.dtype.includes("float"));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-3xl p-0 gap-0 overflow-hidden border-border/60">
                <DialogHeader className="p-6 border-b bg-muted/10">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        <DialogTitle className="text-sm font-bold">Data Quality Audit: Formula Consistency</DialogTitle>
                    </div>
                    <DialogDescription className="text-[13px]">
                        Verify if a column's values are mathematically consistent with others — then fix any rows that don't add up.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col h-[580px]">
                    <div className="p-6 space-y-6 border-b">
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Result Column</Label>
                                <Select value={resCol} onValueChange={setResCol}>
                                    <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                        <SelectValue placeholder="Select..." />
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

                            <div className="flex items-center justify-center h-9 text-lg font-bold text-muted-foreground">
                                =
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Operand A</Label>
                                    <Select value={opA} onValueChange={setOpA}>
                                        <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                            <SelectValue placeholder="Select..." />
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

                                <div className="w-20 space-y-2">
                                    <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground text-center block">Op</Label>
                                    <Select value={formula} onValueChange={(v) => setFormula(v as ArithmeticFormula)}>
                                        <SelectTrigger className="h-9 rounded-none font-mono text-center text-[13px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none min-w-[60px]">
                                            <SelectItem value="add" className="rounded-none font-bold text-center">+</SelectItem>
                                            <SelectItem value="subtract" className="rounded-none font-bold text-center">−</SelectItem>
                                            <SelectItem value="multiply" className="rounded-none font-bold text-center">×</SelectItem>
                                            <SelectItem value="divide" className="rounded-none font-bold text-center">÷</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Operand B</Label>
                                    <Select value={opB} onValueChange={setOpB}>
                                        <SelectTrigger className="h-9 rounded-none font-mono text-[13px]">
                                            <SelectValue placeholder="Select..." />
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

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-semibold">Tolerance:</Label>
                                <Input
                                    value={tolerance}
                                    onChange={(e) => setTolerance(e.target.value)}
                                    placeholder="0.01"
                                    className="h-8 w-20 rounded-none font-mono text-sm"
                                />
                                <span className="text-[12px] text-muted-foreground italic">Max allowed difference (e.g. 0.01 for cents)</span>
                            </div>

                            <Button
                                onClick={handleValidate}
                                disabled={loading || !resCol || !opA || !opB}
                                className="h-9 rounded-none px-6 font-bold tracking-tight"
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
                                Run Audit
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-muted/5 overflow-hidden flex flex-col">
                        {!result && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                                <Calculator className="h-10 w-10 opacity-10 mb-4" />
                                <p className="text-sm font-medium">Select columns and run audit to check consistency.</p>
                                <p className="text-[13px] mt-1 opacity-60">
                                    This will compare {resCol || 'target'} against {opA || 'op_A'}
                                    <FormulaSymbol formula={formula} />
                                    {opB || 'op_B'}.
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                    <p className="text-sm text-muted-foreground animate-pulse font-mono uppercase tracking-widest">Auditing Dataset...</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <StatCard label="Total Rows" value={result.total_rows} />
                                        <StatCard label="Checked" value={result.checked_rows} note="Non-null only" />
                                        <StatCard
                                            label="Errors"
                                            value={result.error_rows}
                                            color={result.error_rows > 0 ? "text-red-500" : "text-green-500"}
                                        />
                                        <StatCard
                                            label="Error %"
                                            value={`${result.error_pct.toFixed(2)}%`}
                                            color={result.error_pct > 0 ? "text-red-500" : "text-green-500"}
                                        />
                                    </div>

                                    {/* Status Indicator */}
                                    <div className={cn(
                                        "p-4 border flex items-center gap-3",
                                        result.error_rows === 0
                                            ? "bg-green-500/5 border-green-500/20 text-green-700"
                                            : "bg-red-500/5 border-red-500/20 text-red-700"
                                    )}>
                                        {result.error_rows === 0 ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5" />
                                        )}
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-tight">
                                                {result.error_rows === 0 ? "Consistency Check Passed" : "Inconsistencies Detected"}
                                            </p>
                                            <p className="text-[13px] opacity-80">
                                                {result.error_rows === 0
                                                    ? "Every checked row matches the formula within tolerance."
                                                    : `Found ${result.error_rows} rows where math does not add up.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sample Errors Table */}
                                    {result.sample_errors.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sample Error Rows</Label>
                                            <div className="border border-border/60 overflow-hidden">
                                                <table className="w-full text-left text-[13px] border-collapse">
                                                    <thead>
                                                        <tr className="bg-muted border-b">
                                                            <th className="px-3 py-2 font-semibold font-mono">Row</th>
                                                            <th className="px-3 py-2 font-semibold font-mono">{result.operand_a}</th>
                                                            <th className="px-3 py-2 font-semibold font-mono text-center">Op</th>
                                                            <th className="px-3 py-2 font-semibold font-mono">{result.operand_b}</th>
                                                            <th className="px-3 py-2 font-semibold font-mono text-primary bg-primary/5">Calc</th>
                                                            <th className="px-3 py-2 font-semibold font-mono text-red-600 bg-red-500/5">{result.result_column}</th>
                                                            <th className="px-3 py-2 font-semibold font-mono text-right">Diff</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {result.sample_errors.map((err) => (
                                                            <tr key={err.row_index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                                <td className="px-3 py-2 font-mono text-muted-foreground">{err.row_index}</td>
                                                                <td className="px-3 py-2 font-mono">{(err[result.operand_a] as number)?.toLocaleString()}</td>
                                                                <td className="px-3 py-2 text-center text-muted-foreground opacity-50">
                                                                    <FormulaSymbol formula={formula} />
                                                                </td>
                                                                <td className="px-3 py-2 font-mono">{(err[result.operand_b] as number)?.toLocaleString()}</td>
                                                                <td className="px-3 py-2 font-mono font-bold text-primary bg-primary/5">{err.calculated.toFixed(2)}</td>
                                                                <td className="px-3 py-2 font-mono font-bold text-red-600 bg-red-500/5">{(err[result.result_column] as number)?.toLocaleString()}</td>
                                                                <td className="px-3 py-2 font-mono text-right text-red-500 font-bold">{err.diff.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-[12px] text-muted-foreground italic">Showing up to 10 sample errors.</p>
                                        </div>
                                    )}

                                    {/* Fix Section — only shown when errors exist */}
                                    {result.error_rows > 0 && (
                                        <div className="border border-amber-500/30 bg-amber-500/5 p-4 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-bold uppercase tracking-tight text-amber-700 dark:text-amber-400">Fix Inconsistencies</span>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Which column has the wrong values?
                                                </Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {[result.result_column, result.operand_a, result.operand_b].map(col => (
                                                        <button
                                                            key={col}
                                                            type="button"
                                                            onClick={() => setFixTarget(col)}
                                                            className={cn(
                                                                "px-3 py-1.5 border font-mono text-[13px] transition-colors",
                                                                fixTarget === col
                                                                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                                                                    : "border-border/60 hover:border-amber-400/60 text-muted-foreground"
                                                            )}
                                                        >
                                                            {col}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[12px] text-muted-foreground italic">
                                                    The selected column's bad values will be overwritten. The other two are treated as the source of truth.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    onClick={handleFix}
                                                    disabled={fixLoading || !fixTarget}
                                                    size="sm"
                                                    className="h-8 rounded-none px-4 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    {fixLoading
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                                        : <Wrench className="h-3.5 w-3.5 mr-2" />
                                                    }
                                                    Fix {result.error_rows} rows
                                                </Button>
                                                {fixLoading && (
                                                    <span className="text-[12px] text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
                                                        Applying fix...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-background flex justify-end">
                    <Button variant="outline" size="sm" className="h-8 rounded-none px-4" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatCard({ label, value, note, color }: Readonly<{ label: string, value: string | number, note?: string, color?: string }>) {
    return (
        <div className="p-3 border border-border/40 bg-background flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className={cn("text-lg font-black font-mono tracking-tighter", color)}>{value}</span>
            {note && <span className="text-[10px] text-muted-foreground italic leading-none">{note}</span>}
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
