"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";
import { downloadCsv } from "@/lib/download-csv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EChart from "@/components/ui/EChart";
import type { MissingHeatmapResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: MissingHeatmapResponse;
    onUpdate: (data: MissingHeatmapResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

export function MissingHeatmapTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    function refresh() {
        setLoading(true);
        edaApi.missingHeatmap(datasetId)
            .then(onUpdate)
            .catch((err: unknown) => {
                const status = (err as { response?: { status?: number } })?.response?.status;
                toast.error(status === 500 ? "Analysis failed. Try again or contact support." : "Failed to load missing value data.");
            })
            .finally(() => setLoading(false));
    }

    const colEntries = Object.entries(data.per_column ?? {})
        .sort((a, b) => b[1].null_pct - a[1].null_pct);

    const option = useMemo(() => {
        const labelColor = isDark ? "#71717a" : "#a1a1aa";
        const tooltipBg = isDark ? "#09090b" : "#ffffff";
        const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
        const tooltipText = isDark ? "#f4f4f5" : "#18181b";

        const reversed = [...colEntries].reverse();
        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: tooltipText, fontSize: 11 },
                formatter: (params: Array<{ name: string; value: number; data: number }>) => {
                    const entry = colEntries.find(([c]) => c === params[0].name);
                    const pct = entry ? entry[1].null_pct.toFixed(2) : "0";
                    return `${params[0].name}<br/><b>${params[0].value.toLocaleString()}</b> nulls (${pct}%)`;
                },
            },
            grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
            xAxis: {
                type: "value",
                axisLabel: { color: labelColor, fontSize: 10 },
                splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            },
            yAxis: {
                type: "category",
                data: reversed.map(([c]) => c),
                axisLabel: { color: isDark ? "#a1a1aa" : "#52525b", fontSize: 11 },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            series: [{
                type: "bar",
                data: reversed.map(([, s]) => s.null_count),
                barMaxWidth: 28,
                itemStyle: {
                    borderRadius: [0, 2, 2, 0],
                    color: (p: { dataIndex: number }) => {
                        const pct = reversed[p.dataIndex][1].null_pct;
                        if (pct >= 20) return "#ef4444";
                        if (pct >= 5) return "#f59e0b";
                        return "#22c55e";
                    },
                },
                label: {
                    show: true,
                    position: "right",
                    formatter: (p: { dataIndex: number }) => `${reversed[p.dataIndex][1].null_pct.toFixed(1)}%`,
                    color: labelColor,
                    fontSize: 10,
                },
            }],
        };
    }, [colEntries, isDark]);

    const chartHeight = Math.max(160, colEntries.length * 30 + 24);
    const coPairs = Object.entries(data.co_null_pairs ?? {});
    const isSampled = data.total_rows === 50_000;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {[
                        { label: "Total rows", value: (data.total_rows ?? 0).toLocaleString() },
                        { label: "Total columns", value: data.total_columns ?? 0 },
                        { label: "Columns with nulls", value: data.columns_with_nulls ?? 0 },
                        { label: "Clean columns", value: (data.total_columns ?? 0) - (data.columns_with_nulls ?? 0) },
                    ].map(({ label, value }) => (
                        <div key={label} className="border border-border bg-muted/50 p-3">
                            <div className="text-xs text-muted-foreground">{label}</div>
                            <div className="text-xl font-bold font-mono mt-0.5 text-foreground">{value}</div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 self-end">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => {
                        downloadCsv("missing_heatmap.csv", ["column", "null_count", "null_pct"],
                            colEntries.map(([col, s]) => [col, s.null_count, s.null_pct]));
                    }}>
                        <Download className="h-3 w-3" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={refresh} disabled={loading}>
                        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {isSampled && (
                <div className="border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
                    Analysis based on a 50,000-row sample.
                </div>
            )}

            {(data.columns_with_nulls ?? 0) === 0 ? (
                <div className="border bg-muted/5 flex items-center justify-center h-32 text-sm text-muted-foreground gap-2">
                    No missing values found — the dataset is complete.
                </div>
            ) : (
                <div className="border border-border bg-card">
                    <EChart option={option} style={{ height: `${chartHeight}px` }} />
                </div>
            )}

            {/* Worst rows */}
            {(data.worst_rows ?? []).length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Rows with the most missing values</p>
                    <div className="border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Row index</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Missing columns</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.worst_rows ?? []).map((r) => (
                                    <tr key={r.row_index} className="border-b border-border last:border-0 hover:bg-muted/50 even:bg-muted/20 transition-colors">
                                        <td className="px-3 py-1.5 font-mono text-xs">{r.row_index}</td>
                                        <td className="px-3 py-1.5 text-right">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                {r.null_count}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Datasets with more than 50,000 rows are automatically sampled before analysis.
            </p>

            {/* Co-null pairs */}
            {coPairs.length > 0 && (
                <div className="border bg-amber-500/5 border-amber-500/20 p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Co-missing column pairs
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {coPairs.map(([pair, r]) => (
                            <Badge key={pair} variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20 gap-1">
                                {pair}
                                <span className="font-mono font-bold">r={r.toFixed(2)}</span>
                            </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        When one of these columns is empty, the other tends to be empty too (co-null correlation ≥ 0.5).
                    </p>
                </div>
            )}
        </div>
    );
}
