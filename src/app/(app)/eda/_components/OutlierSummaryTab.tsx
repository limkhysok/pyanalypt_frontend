"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import type { OutlierSummaryResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: OutlierSummaryResponse;
    onUpdate: (data: OutlierSummaryResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

export function OutlierSummaryTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const [method, setMethod] = useState<"iqr" | "zscore">(data.method as "iqr" | "zscore" ?? "iqr");
    const [threshold, setThreshold] = useState(data.threshold ?? 1.5);

    function run(m: "iqr" | "zscore", t: number) {
        setLoading(true);
        edaApi.outlierSummary(datasetId, { method: m, threshold: t })
            .then(onUpdate)
            .catch((err: unknown) => {
                const status = (err as { response?: { status?: number } })?.response?.status;
                toast.error(status === 500 ? "Analysis failed. Try again or contact support." : "Failed to load outlier summary.");
            })
            .finally(() => setLoading(false));
    }

    const perCol = Object.entries(data.per_column ?? {}).sort((a, b) => b[1].outlier_pct - a[1].outlier_pct);
    const IQR_THRESHOLDS = ["1.5", "2.0", "3.0"];
    const Z_THRESHOLDS = ["2.0", "2.5", "3.0", "3.5"];
    const thresholdOptions = method === "iqr" ? IQR_THRESHOLDS : Z_THRESHOLDS;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Method</span>
                <Select value={method} onValueChange={(v) => { setMethod(v as "iqr" | "zscore"); setThreshold(v === "iqr" ? 1.5 : 3); }}>
                    <SelectTrigger className="h-8 w-36 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="iqr">IQR</SelectItem>
                        <SelectItem value="zscore">Z-score</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm font-medium">Threshold</span>
                <Select value={String(threshold)} onValueChange={(v) => setThreshold(Number(v))}>
                    <SelectTrigger className="h-8 w-20 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {thresholdOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => run(method, threshold)} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    Run
                </Button>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total rows", value: (data.total_rows ?? 0).toLocaleString() },
                    { label: "Columns checked", value: data.numeric_columns_checked ?? 0 },
                    { label: "Columns with outliers", value: data.columns_with_outliers ?? 0 },
                    { label: "Total outlier cells", value: (data.total_outlier_cells ?? 0).toLocaleString() },
                ].map(({ label, value }) => (
                    <div key={label} className="border bg-card p-3">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-xl font-bold font-mono mt-0.5">{value}</div>
                    </div>
                ))}
            </div>

            {/* Per-column table */}
            <div className="border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Column</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Outliers</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">%</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Lower bound</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Upper bound</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Mean</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Std</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perCol.map(([col, stats]) => (
                            <tr key={col} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-3 py-2 font-mono text-xs font-medium">{col}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs">
                                    {stats.outlier_count > 0
                                        ? <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">{stats.outlier_count.toLocaleString()}</Badge>
                                        : <span className="text-muted-foreground">0</span>
                                    }
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{stats.outlier_pct.toFixed(2)}%</td>
                                <td className="px-3 py-2 text-right font-mono text-xs">{stats.lower_bound.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs">{stats.upper_bound.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{stats.mean.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{stats.std.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground border bg-muted/5 p-3">
                <span>This is a read-only scan. To treat outliers (remove, cap, or replace), go to</span>
                <Link href={`/datalab?dataset=${datasetId}&tab=inspect`} className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
                    DataLab <ExternalLink className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
