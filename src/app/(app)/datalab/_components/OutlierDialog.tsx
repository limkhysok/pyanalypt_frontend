"use client";

import React from "react";
import {
    Loader2,
    Search,
    Activity,
    Scissors,
    Pencil,
    SlidersHorizontal,
    TrendingUp,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    RotateCcw,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type {
    DataLabInspectColumn,
    DetectOutliersResponse,
    OutlierColumnStats,
    ImputeOutliersStrategy,
    TransformFunction,
} from "@/services/api";
import { toast } from "sonner";

type Step = "detect" | "trim" | "impute" | "cap" | "transform";
type Method = "iqr" | "zscore";

function isNumericDtype(dtype: string) {
    return /^(int|float|uint)\d*$/i.test(dtype);
}

function apiErr(err: unknown) {
    return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
}

export function OutlierDialog({
    open,
    onOpenChange,
    datasetId,
    columns,
    onRefetchAll,
}: Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    datasetId: number;
    columns: DataLabInspectColumn[];
    onRefetchAll: () => void;
}>) {
    const numericCols = React.useMemo(
        () => columns.filter((c) => isNumericDtype(c.dtype)),
        [columns]
    );

    const [step, setStep] = React.useState<Step>("detect");
    const [loading, setLoading] = React.useState(false);

    // ── Detect ──
    const [detectCols, setDetectCols] = React.useState<string[]>([]);
    const [detectMethod, setDetectMethod] = React.useState<Method>("iqr");
    const [detectThreshold, setDetectThreshold] = React.useState("1.5");
    const [detectSearch, setDetectSearch] = React.useState("");
    const [detectResults, setDetectResults] = React.useState<DetectOutliersResponse | null>(null);

    // ── Trim ──
    const [trimCols, setTrimCols] = React.useState<string[]>([]);
    const [trimMethod, setTrimMethod] = React.useState<Method>("iqr");
    const [trimThreshold, setTrimThreshold] = React.useState("1.5");
    const [trimSearch, setTrimSearch] = React.useState("");
    const [trimResult, setTrimResult] = React.useState<{ rows_before: number; rows_after: number; rows_dropped: number } | null>(null);

    // ── Impute ──
    const [imputeCols, setImputeCols] = React.useState<string[]>([]);
    const [imputeMethod, setImputeMethod] = React.useState<Method>("iqr");
    const [imputeThreshold, setImputeThreshold] = React.useState("1.5");
    const [imputeStrategy, setImputeStrategy] = React.useState<ImputeOutliersStrategy>("median");
    const [imputeSearch, setImputeSearch] = React.useState("");
    const [imputeResult, setImputeResult] = React.useState<{ cells_imputed: number } | null>(null);

    // ── Cap ──
    const [capCols, setCapCols] = React.useState<string[]>([]);
    const [lowerPct, setLowerPct] = React.useState(5);
    const [upperPct, setUpperPct] = React.useState(95);
    const [capSearch, setCapSearch] = React.useState("");
    const [capResult, setCapResult] = React.useState<{ cells_capped: number } | null>(null);

    // ── Transform ──
    const [transformCols, setTransformCols] = React.useState<string[]>([]);
    const [transformFn, setTransformFn] = React.useState<TransformFunction>("log");
    const [transformSearch, setTransformSearch] = React.useState("");
    const [transformResult, setTransformResult] = React.useState<{
        transformed_columns: string[];
        skipped_columns: { column: string; reason: string }[];
    } | null>(null);

    React.useEffect(() => {
        if (open) {
            setStep("detect");
            setDetectResults(null);
            setTrimResult(null);
            setImputeResult(null);
            setCapResult(null);
            setTransformResult(null);
        }
    }, [open]);

    function toggleCol(col: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
        setter((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
    }

    // ── Handlers ──
    async function handleDetect() {
        if (detectCols.length === 0) { toast.error("Select at least one column."); return; }
        const threshold = parseFloat(detectThreshold);
        if (isNaN(threshold) || threshold <= 0) { toast.error("Threshold must be a positive number."); return; }
        setLoading(true);
        try {
            const res = await datalabApi.detectOutliers(datasetId, {
                columns: detectCols.join(","),
                method: detectMethod,
                threshold,
            });
            setDetectResults(res);
        } catch (err) {
            toast.error(apiErr(err) ?? "Failed to detect outliers.");
        } finally {
            setLoading(false);
        }
    }

    async function handleTrim() {
        if (trimCols.length === 0) { toast.error("Select at least one column."); return; }
        const threshold = parseFloat(trimThreshold);
        if (isNaN(threshold) || threshold <= 0) { toast.error("Threshold must be a positive number."); return; }
        setLoading(true);
        try {
            const res = await datalabApi.trimOutliers(datasetId, { columns: trimCols, method: trimMethod, threshold });
            if (res.rows_dropped === 0) {
                toast.info(res.detail ?? "No outlier rows found.");
            } else {
                toast.success(`Dropped ${res.rows_dropped} rows (${res.rows_before.toLocaleString()} → ${res.rows_after.toLocaleString()}).`);
                setTrimResult({ rows_before: res.rows_before, rows_after: res.rows_after, rows_dropped: res.rows_dropped });
                onRefetchAll();
            }
        } catch (err) {
            toast.error(apiErr(err) ?? "Failed to trim outliers.");
        } finally {
            setLoading(false);
        }
    }

    async function handleImpute() {
        if (imputeCols.length === 0) { toast.error("Select at least one column."); return; }
        const threshold = parseFloat(imputeThreshold);
        if (isNaN(threshold) || threshold <= 0) { toast.error("Threshold must be a positive number."); return; }
        setLoading(true);
        try {
            const res = await datalabApi.imputeOutliers(datasetId, {
                columns: imputeCols,
                method: imputeMethod,
                threshold,
                strategy: imputeStrategy,
            });
            if (res.cells_imputed === 0) {
                toast.info(res.detail ?? "No outlier values found.");
            } else {
                toast.success(`Imputed ${res.cells_imputed} outlier values.`);
                setImputeResult({ cells_imputed: res.cells_imputed });
                onRefetchAll();
            }
        } catch (err) {
            toast.error(apiErr(err) ?? "Failed to impute outliers.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCap() {
        if (capCols.length === 0) { toast.error("Select at least one column."); return; }
        if (lowerPct >= upperPct) { toast.error("Lower percentile must be less than upper percentile."); return; }
        setLoading(true);
        try {
            const res = await datalabApi.capOutliers(datasetId, {
                columns: capCols,
                lower_pct: lowerPct,
                upper_pct: upperPct,
            });
            if (res.cells_capped === 0) {
                toast.info(res.detail ?? "No values were capped.");
            } else {
                toast.success(`Capped ${res.cells_capped} values to [${lowerPct}th, ${upperPct}th] percentiles.`);
                setCapResult({ cells_capped: res.cells_capped });
                onRefetchAll();
            }
        } catch (err) {
            toast.error(apiErr(err) ?? "Failed to cap outliers.");
        } finally {
            setLoading(false);
        }
    }

    async function handleTransform() {
        if (transformCols.length === 0) { toast.error("Select at least one column."); return; }
        setLoading(true);
        try {
            const res = await datalabApi.transformColumn(datasetId, { columns: transformCols, function: transformFn });
            if (res.skipped_columns.length > 0) {
                toast.warning(`Skipped ${res.skipped_columns.length} column(s): constraint not met.`, {
                    description: res.skipped_columns.map((s) => `${s.column}: ${s.reason}`).join("; "),
                });
            }
            if (res.transformed_columns.length > 0) {
                toast.success(`Transformed ${res.transformed_columns.length} column(s).`);
                onRefetchAll();
            } else {
                toast.info("No columns were transformed.");
            }
            setTransformResult({ transformed_columns: res.transformed_columns, skipped_columns: res.skipped_columns });
        } catch (err) {
            toast.error(apiErr(err) ?? "Failed to transform columns.");
        } finally {
            setLoading(false);
        }
    }

    const fDetect = numericCols.filter((c) => c.column.toLowerCase().includes(detectSearch.toLowerCase()));
    const fTrim = numericCols.filter((c) => c.column.toLowerCase().includes(trimSearch.toLowerCase()));
    const fImpute = numericCols.filter((c) => c.column.toLowerCase().includes(imputeSearch.toLowerCase()));
    const fCap = numericCols.filter((c) => c.column.toLowerCase().includes(capSearch.toLowerCase()));
    const fTransform = numericCols.filter((c) => c.column.toLowerCase().includes(transformSearch.toLowerCase()));

    const STEP_META: Record<Step, { title: string; desc: string }> = {
        detect: { title: "Detect Outliers", desc: "Audit numeric columns for outliers. No data is changed." },
        trim: { title: "Trim — Delete Outlier Rows", desc: "Remove rows where any selected column contains an outlier. Irreversible — run Detect first to preview." },
        impute: { title: "Impute — Replace Outlier Values", desc: "Replace outlier values in-place with a statistical aggregate. Rows are kept." },
        cap: { title: "Cap — Winsorize to Percentile Bounds", desc: "Clamp extreme values to percentile fences. No rows are deleted." },
        transform: { title: "Transform — Apply Log / Sqrt / Cbrt", desc: "Reduce skew with a mathematical transformation. Affects all values, not just outliers." },
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-3xl p-0 gap-0 overflow-hidden border-border/60">
                <div className="flex h-[550px]">
                    {/* ── Sidebar ── */}
                    <div className="w-48 bg-muted/30 border-r border-border/60 p-4 flex flex-col gap-1 shrink-0">
                        <div className="mb-4">
                            <h3 className="text-[13px] font-bold tracking-wider text-muted-foreground">Outlier Tools</h3>
                        </div>
                        <StepButton id="detect" label="Detect" icon={<Activity className="h-3.5 w-3.5" />} active={step === "detect"} done={!!detectResults} onClick={() => setStep("detect")} />
                        <StepButton id="trim" label="Trim Rows" icon={<Scissors className="h-3.5 w-3.5" />} active={step === "trim"} done={!!trimResult} onClick={() => setStep("trim")} />
                        <StepButton id="impute" label="Impute" icon={<Pencil className="h-3.5 w-3.5" />} active={step === "impute"} done={!!imputeResult} onClick={() => setStep("impute")} />
                        <StepButton id="cap" label="Cap (Winsorize)" icon={<SlidersHorizontal className="h-3.5 w-3.5" />} active={step === "cap"} done={!!capResult} onClick={() => setStep("cap")} />
                        <StepButton id="transform" label="Transform" icon={<TrendingUp className="h-3.5 w-3.5" />} active={step === "transform"} done={!!transformResult} onClick={() => setStep("transform")} />
                        <div className="mt-auto pt-4 border-t border-border/40">
                            <p className="text-[13px] text-muted-foreground leading-tight italic">
                                Detect first — then apply a treatment to each flagged column.
                            </p>
                        </div>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="flex-1 flex flex-col bg-background min-w-0">
                        <DialogHeader className="p-6 pb-4 shrink-0">
                            <DialogTitle className="text-sm font-bold">{STEP_META[step].title}</DialogTitle>
                            <DialogDescription className="text-[13px]">{STEP_META[step].desc}</DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 pb-4">
                            {numericCols.length === 0 ? (
                                <div className="flex items-start gap-2 p-3 border border-amber-500/30 bg-amber-500/5 text-amber-700">
                                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <p className="text-[13px]">No numeric columns found. Outlier operations require numeric columns.</p>
                                </div>
                            ) : (
                                <>
                                    {step === "detect" && (
                                        <DetectStep
                                            numericCols={fDetect}
                                            selectedCols={detectCols}
                                            onToggle={(c) => toggleCol(c, setDetectCols)}
                                            search={detectSearch}
                                            onSearchChange={setDetectSearch}
                                            method={detectMethod}
                                            onMethodChange={setDetectMethod}
                                            threshold={detectThreshold}
                                            onThresholdChange={setDetectThreshold}
                                            results={detectResults}
                                            onClearResults={() => setDetectResults(null)}
                                        />
                                    )}
                                    {step === "trim" && (
                                        <TrimStep
                                            numericCols={fTrim}
                                            selectedCols={trimCols}
                                            onToggle={(c) => toggleCol(c, setTrimCols)}
                                            search={trimSearch}
                                            onSearchChange={setTrimSearch}
                                            method={trimMethod}
                                            onMethodChange={setTrimMethod}
                                            threshold={trimThreshold}
                                            onThresholdChange={setTrimThreshold}
                                            result={trimResult}
                                        />
                                    )}
                                    {step === "impute" && (
                                        <ImputeStep
                                            numericCols={fImpute}
                                            selectedCols={imputeCols}
                                            onToggle={(c) => toggleCol(c, setImputeCols)}
                                            search={imputeSearch}
                                            onSearchChange={setImputeSearch}
                                            method={imputeMethod}
                                            onMethodChange={setImputeMethod}
                                            threshold={imputeThreshold}
                                            onThresholdChange={setImputeThreshold}
                                            strategy={imputeStrategy}
                                            onStrategyChange={setImputeStrategy}
                                            result={imputeResult}
                                        />
                                    )}
                                    {step === "cap" && (
                                        <CapStep
                                            numericCols={fCap}
                                            selectedCols={capCols}
                                            onToggle={(c) => toggleCol(c, setCapCols)}
                                            search={capSearch}
                                            onSearchChange={setCapSearch}
                                            lowerPct={lowerPct}
                                            upperPct={upperPct}
                                            onLowerPctChange={setLowerPct}
                                            onUpperPctChange={setUpperPct}
                                            result={capResult}
                                        />
                                    )}
                                    {step === "transform" && (
                                        <TransformStep
                                            numericCols={fTransform}
                                            selectedCols={transformCols}
                                            onToggle={(c) => toggleCol(c, setTransformCols)}
                                            search={transformSearch}
                                            onSearchChange={setTransformSearch}
                                            transformFn={transformFn}
                                            onTransformFnChange={setTransformFn}
                                            result={transformResult}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {/* ── Footer ── */}
                        <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-end shrink-0">
                            {step === "detect" ? (
                                <Button
                                    size="sm"
                                    className="h-8 text-sm rounded-none gap-1.5 min-w-36"
                                    onClick={handleDetect}
                                    disabled={loading || numericCols.length === 0}
                                >
                                    {loading
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Activity className="h-3.5 w-3.5" />
                                    }
                                    {detectResults ? "Re-run Detection" : "Run Detection"}
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="h-8 text-sm rounded-none gap-1.5 min-w-40"
                                    onClick={() => {
                                        if (step === "trim") handleTrim();
                                        else if (step === "impute") handleImpute();
                                        else if (step === "cap") handleCap();
                                        else if (step === "transform") handleTransform();
                                    }}
                                    disabled={loading || numericCols.length === 0}
                                >
                                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    {step === "trim" && "Trim Outlier Rows"}
                                    {step === "impute" && "Impute Outlier Values"}
                                    {step === "cap" && "Cap to Percentiles"}
                                    {step === "transform" && "Apply Transform"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Detect Step ─────────────────────────────────────────────────────────────

function DetectStep({
    numericCols, selectedCols, onToggle, search, onSearchChange,
    method, onMethodChange, threshold, onThresholdChange,
    results, onClearResults,
}: Readonly<{
    numericCols: DataLabInspectColumn[];
    selectedCols: string[];
    onToggle: (c: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    method: Method;
    onMethodChange: (m: Method) => void;
    threshold: string;
    onThresholdChange: (t: string) => void;
    results: DetectOutliersResponse | null;
    onClearResults: () => void;
}>) {
    if (results) {
        const colNames = Object.keys(results.columns);
        const withOutliers = colNames.filter((c) => results.columns[c].outlier_count > 0);
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge
                            className={cn(
                                "rounded-none text-[13px] h-5",
                                withOutliers.length > 0
                                    ? "bg-amber-500/10 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20"
                                    : "bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20"
                            )}
                        >
                            {withOutliers.length === 0
                                ? `All ${colNames.length} columns clean`
                                : `${withOutliers.length} of ${colNames.length} columns have outliers`}
                        </Badge>
                        <span className="text-[13px] text-muted-foreground font-mono">
                            {results.method.toUpperCase()} · threshold {results.threshold}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[13px] rounded-none gap-1" onClick={onClearResults}>
                        <RotateCcw className="h-3 w-3" /> Reconfigure
                    </Button>
                </div>
                <div className="space-y-3">
                    {colNames.map((col) => (
                        <OutlierCard key={col} column={col} stats={results.columns[col]} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <MethodThreshold
                method={method}
                onMethodChange={onMethodChange}
                threshold={threshold}
                onThresholdChange={onThresholdChange}
            />
            <NumericColumnPicker
                cols={numericCols}
                selected={selectedCols}
                onToggle={onToggle}
                search={search}
                onSearchChange={onSearchChange}
                label="Columns to analyze"
            />
        </div>
    );
}

// ── Outlier Card (per-column result) ─────────────────────────────────────────

function OutlierCard({ column, stats }: Readonly<{ column: string; stats: OutlierColumnStats }>) {
    const hasOutliers = stats.outlier_count > 0;
    return (
        <div className={cn(
            "border p-3 space-y-2",
            hasOutliers ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-muted/5"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {hasOutliers
                        ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        : <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    }
                    <span className="text-sm font-semibold font-mono">{column}</span>
                </div>
                <div className="flex items-center gap-3">
                    {hasOutliers ? (
                        <>
                            <span className="text-[13px] font-mono font-bold text-amber-600">{stats.outlier_count} outliers</span>
                            <span className="text-[13px] text-muted-foreground font-mono">({stats.outlier_pct.toFixed(2)}%)</span>
                        </>
                    ) : (
                        <span className="text-[13px] text-green-600 font-mono">Clean</span>
                    )}
                </div>
            </div>
            {hasOutliers && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[13px] text-muted-foreground font-mono">
                        <span>Fence: [{stats.lower_bound.toFixed(3)}, {stats.upper_bound.toFixed(3)}]</span>
                        <span>Range: [{stats.min}, {stats.max}]</span>
                        <span>Mean: {stats.mean.toFixed(3)}</span>
                        <span>Median: {stats.median.toFixed(3)}</span>
                    </div>
                    {stats.sample_outliers.length > 0 && (
                        <div className="border border-amber-500/20 overflow-hidden">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-amber-500/10 border-b border-amber-500/20">
                                        <th className="px-2 py-1 text-left font-semibold text-amber-700">row</th>
                                        <th className="px-2 py-1 text-right font-semibold text-amber-700">{column}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.sample_outliers.slice(0, 3).map((row, i) => (
                                        <tr key={i} className="border-b border-amber-500/10 last:border-0">
                                            <td className="px-2 py-0.5 text-muted-foreground font-mono">{String(row.row_index)}</td>
                                            <td className="px-2 py-0.5 text-right font-mono font-bold text-amber-600">{String(row[column] ?? "")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Trim Step ────────────────────────────────────────────────────────────────

function TrimStep({
    numericCols, selectedCols, onToggle, search, onSearchChange,
    method, onMethodChange, threshold, onThresholdChange, result,
}: Readonly<{
    numericCols: DataLabInspectColumn[];
    selectedCols: string[];
    onToggle: (c: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    method: Method;
    onMethodChange: (m: Method) => void;
    threshold: string;
    onThresholdChange: (t: string) => void;
    result: { rows_before: number; rows_after: number; rows_dropped: number } | null;
}>) {
    return (
        <div className="space-y-5">
            {result ? (
                <ResultBanner>
                    <span className="font-mono font-bold">{result.rows_dropped.toLocaleString()}</span> rows dropped
                    — {result.rows_before.toLocaleString()} → {result.rows_after.toLocaleString()} rows remaining
                </ResultBanner>
            ) : (
                <div className="flex items-start gap-2 p-3 border border-amber-500/30 bg-amber-500/5 text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <p className="text-[13px]">Rows containing outlier values in any selected column will be permanently deleted. This cannot be undone.</p>
                </div>
            )}
            <MethodThreshold
                method={method}
                onMethodChange={onMethodChange}
                threshold={threshold}
                onThresholdChange={onThresholdChange}
            />
            <NumericColumnPicker
                cols={numericCols}
                selected={selectedCols}
                onToggle={onToggle}
                search={search}
                onSearchChange={onSearchChange}
            />
        </div>
    );
}

// ── Impute Step ──────────────────────────────────────────────────────────────

const IMPUTE_STRATEGIES: { value: ImputeOutliersStrategy; label: string; note: string }[] = [
    { value: "median", label: "Median", note: "Default — robust to extreme values" },
    { value: "mean", label: "Mean", note: "Symmetric distributions only" },
    { value: "mode", label: "Mode", note: "Discrete or count columns" },
];

function ImputeStep({
    numericCols, selectedCols, onToggle, search, onSearchChange,
    method, onMethodChange, threshold, onThresholdChange,
    strategy, onStrategyChange, result,
}: Readonly<{
    numericCols: DataLabInspectColumn[];
    selectedCols: string[];
    onToggle: (c: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    method: Method;
    onMethodChange: (m: Method) => void;
    threshold: string;
    onThresholdChange: (t: string) => void;
    strategy: ImputeOutliersStrategy;
    onStrategyChange: (s: ImputeOutliersStrategy) => void;
    result: { cells_imputed: number } | null;
}>) {
    return (
        <div className="space-y-5">
            {result && (
                <ResultBanner>
                    <span className="font-mono font-bold">{result.cells_imputed.toLocaleString()}</span> outlier values imputed
                </ResultBanner>
            )}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Replacement Strategy</Label>
                <div className="grid grid-cols-3 gap-2">
                    {IMPUTE_STRATEGIES.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => onStrategyChange(s.value)}
                            className={cn(
                                "p-3 border text-left transition-all rounded-none",
                                strategy === s.value
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border hover:bg-muted/30"
                            )}
                        >
                            <p className="text-sm font-bold tracking-tight">{s.label}</p>
                            <p className="text-[13px] text-muted-foreground mt-1 leading-tight">{s.note}</p>
                        </button>
                    ))}
                </div>
            </div>
            <MethodThreshold
                method={method}
                onMethodChange={onMethodChange}
                threshold={threshold}
                onThresholdChange={onThresholdChange}
            />
            <NumericColumnPicker
                cols={numericCols}
                selected={selectedCols}
                onToggle={onToggle}
                search={search}
                onSearchChange={onSearchChange}
            />
        </div>
    );
}

// ── Cap Step ─────────────────────────────────────────────────────────────────

function CapStep({
    numericCols, selectedCols, onToggle, search, onSearchChange,
    lowerPct, upperPct, onLowerPctChange, onUpperPctChange, result,
}: Readonly<{
    numericCols: DataLabInspectColumn[];
    selectedCols: string[];
    onToggle: (c: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    lowerPct: number;
    upperPct: number;
    onLowerPctChange: (n: number) => void;
    onUpperPctChange: (n: number) => void;
    result: { cells_capped: number } | null;
}>) {
    return (
        <div className="space-y-5">
            {result && (
                <ResultBanner>
                    <span className="font-mono font-bold">{result.cells_capped.toLocaleString()}</span> values capped
                </ResultBanner>
            )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold">Lower Percentile</Label>
                        <span className="text-sm font-mono font-bold text-primary">{lowerPct}th</span>
                    </div>
                    <Input
                        type="range"
                        min="0"
                        max={String(upperPct - 1)}
                        value={lowerPct}
                        onChange={(e) => onLowerPctChange(parseInt(e.target.value))}
                        className="h-4 accent-primary cursor-pointer border-none p-0"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold">Upper Percentile</Label>
                        <span className="text-sm font-mono font-bold text-primary">{upperPct}th</span>
                    </div>
                    <Input
                        type="range"
                        min={String(lowerPct + 1)}
                        max="100"
                        value={upperPct}
                        onChange={(e) => onUpperPctChange(parseInt(e.target.value))}
                        className="h-4 accent-primary cursor-pointer border-none p-0"
                    />
                </div>
                <p className="text-[13px] text-muted-foreground italic">
                    Values below the {lowerPct}th percentile and above the {upperPct}th percentile will be clamped to those bounds.
                </p>
            </div>
            <NumericColumnPicker
                cols={numericCols}
                selected={selectedCols}
                onToggle={onToggle}
                search={search}
                onSearchChange={onSearchChange}
            />
        </div>
    );
}

// ── Transform Step ───────────────────────────────────────────────────────────

const TRANSFORMS: { value: TransformFunction; label: string; constraint: string; use: string }[] = [
    { value: "log", label: "log(x)", constraint: "All values > 0", use: "Right-skewed (sales, income)" },
    { value: "sqrt", label: "√x", constraint: "All values ≥ 0", use: "Moderate skew, count data" },
    { value: "cbrt", label: "∛x", constraint: "No restriction", use: "When log/sqrt won't apply" },
];

function TransformStep({
    numericCols, selectedCols, onToggle, search, onSearchChange,
    transformFn, onTransformFnChange, result,
}: Readonly<{
    numericCols: DataLabInspectColumn[];
    selectedCols: string[];
    onToggle: (c: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    transformFn: TransformFunction;
    onTransformFnChange: (f: TransformFunction) => void;
    result: { transformed_columns: string[]; skipped_columns: { column: string; reason: string }[] } | null;
}>) {
    return (
        <div className="space-y-5">
            {result && (
                <div className="space-y-2">
                    {result.transformed_columns.length > 0 && (
                        <ResultBanner>
                            {result.transformed_columns.length} column(s) transformed: {result.transformed_columns.join(", ")}
                        </ResultBanner>
                    )}
                    {result.skipped_columns.length > 0 && (
                        <div className="border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
                            <p className="text-[13px] font-semibold text-amber-700">Skipped — constraint not met:</p>
                            {result.skipped_columns.map((s) => (
                                <p key={s.column} className="text-[13px] text-muted-foreground font-mono">
                                    <span className="font-bold text-foreground">{s.column}</span>: {s.reason}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Function</Label>
                <div className="grid grid-cols-3 gap-2">
                    {TRANSFORMS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => onTransformFnChange(t.value)}
                            className={cn(
                                "p-3 border text-left transition-all rounded-none",
                                transformFn === t.value
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border hover:bg-muted/30"
                            )}
                        >
                            <p className="text-sm font-bold font-mono tracking-tight">{t.label}</p>
                            <p className="text-[11px] text-amber-600 mt-1 font-semibold">{t.constraint}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.use}</p>
                        </button>
                    ))}
                </div>
            </div>
            <NumericColumnPicker
                cols={numericCols}
                selected={selectedCols}
                onToggle={onToggle}
                search={search}
                onSearchChange={onSearchChange}
            />
        </div>
    );
}

// ── Shared: Method + Threshold row ───────────────────────────────────────────

function MethodThreshold({
    method, onMethodChange, threshold, onThresholdChange,
}: Readonly<{
    method: Method;
    onMethodChange: (m: Method) => void;
    threshold: string;
    onThresholdChange: (t: string) => void;
}>) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Detection Method</Label>
                <div className="flex gap-1 p-1 bg-muted/50 border border-border/40">
                    <Button
                        variant={method === "iqr" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-[13px] rounded-none flex-1"
                        onClick={() => onMethodChange("iqr")}
                    >
                        IQR
                    </Button>
                    <Button
                        variant={method === "zscore" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-[13px] rounded-none flex-1"
                        onClick={() => onMethodChange("zscore")}
                    >
                        Z-score
                    </Button>
                </div>
                <p className="text-[13px] text-muted-foreground italic">
                    {method === "iqr"
                        ? "Fence multiplier — 1.5 standard, 3.0 for extreme outliers"
                        : "Std deviations from mean — 2 or 3 standard"}
                </p>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Threshold</Label>
                <Input
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => onThresholdChange(e.target.value)}
                    className="h-9 text-sm rounded-none font-mono"
                />
                <p className="text-[13px] text-muted-foreground italic">Lower = more sensitive</p>
            </div>
        </div>
    );
}

// ── Shared: Numeric Column Picker ────────────────────────────────────────────

function NumericColumnPicker({
    cols, selected, onToggle, search, onSearchChange,
    label = "Columns",
}: Readonly<{
    cols: DataLabInspectColumn[];
    selected: string[];
    onToggle: (col: string) => void;
    search: string;
    onSearchChange: (s: string) => void;
    label?: string;
}>) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{label}</Label>
                <span className="text-[13px] text-muted-foreground italic">
                    {selected.length > 0 ? `${selected.length} selected` : "Select columns"}
                </span>
            </div>
            <div className="border border-border/40 bg-background overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/20">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Filter numeric columns…"
                        className="bg-transparent border-none outline-none text-[13px] font-mono flex-1"
                    />
                </div>
                <ScrollArea className="h-40">
                    <div className="p-1 grid grid-cols-1 gap-0.5">
                        {cols.length === 0 && (
                            <p className="text-[13px] text-muted-foreground text-center py-8">No columns match.</p>
                        )}
                        {cols.map((col) => {
                            const isSel = selected.includes(col.column);
                            return (
                                <button
                                    key={col.column}
                                    onClick={() => onToggle(col.column)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1 text-left transition-colors group",
                                        isSel ? "bg-primary/10" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-3 w-3 border flex items-center justify-center transition-colors shrink-0",
                                        isSel ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
                                    )}>
                                        {isSel && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                                    </div>
                                    <span className={cn(
                                        "text-[13px] font-mono truncate flex-1",
                                        isSel ? "text-primary font-bold" : "text-foreground"
                                    )}>
                                        {col.column}
                                    </span>
                                    <span className="text-[13px] font-mono text-muted-foreground/60 bg-muted/30 px-1 border border-border/30 shrink-0">
                                        {col.dtype}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

// ── Shared: Sidebar Step Button ──────────────────────────────────────────────

function StepButton({ id, label, icon, active, done, onClick }: Readonly<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    done: boolean;
    onClick: () => void;
}>) {
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
                active
                    ? "border-primary-foreground/30 bg-primary-foreground/10"
                    : "border-border/60 bg-background/50"
            )}>
                {icon}
            </span>
            <span className="text-[13px] leading-tight flex-1">{label}</span>
            {active && <ChevronRight className="h-3 w-3 opacity-50" />}
            {!active && done && <CheckCircle2 className="h-3 w-3 text-green-500 opacity-70" />}
        </button>
    );
}

// ── Shared: Result Banner ────────────────────────────────────────────────────

function ResultBanner({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex items-center gap-2 p-3 border border-green-600/30 bg-green-600/5 text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <p className="text-[13px]">{children}</p>
        </div>
    );
}

