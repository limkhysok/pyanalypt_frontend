"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Download, RefreshCw } from "lucide-react";
import { downloadCsv } from "@/lib/download-csv";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart from "@/components/ui/EChart";
import type { CorrelationResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: CorrelationResponse;
    onUpdate: (data: CorrelationResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

type Method = "pearson" | "spearman" | "kendall";

export function CorrelationTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [method, setMethod] = useState<Method>((data.method as Method) ?? "pearson");

    // Keep selector in sync when parent re-fetches with a different method
    useEffect(() => {
        if (data.method) setMethod(data.method as Method);
    }, [data.method]);

    function run(m: Method) {
        setMethod(m);
        setLoading(true);
        edaApi.correlation(datasetId, { method: m })
            .then(onUpdate)
            .catch(() => toast.error("Failed to load correlation matrix."))
            .finally(() => setLoading(false));
    }

    const option = useMemo(() => {
        const cols = data.columns ?? [];
        const values: [number, number, number][] = [];
        (data.matrix ?? []).forEach((row, ri) => {
            cols.forEach((col, ci) => {
                values.push([ci, ri, Number((row.values?.[col] ?? 0).toFixed(3))]);
            });
        });

        const labelColor = isDark ? "#71717a" : "#a1a1aa";
        const tooltipBg = isDark ? "#09090b" : "#ffffff";
        const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
        const tooltipText = isDark ? "#f4f4f5" : "#18181b";

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: tooltipText, fontSize: 12 },
                formatter: (p: { data: [number, number, number] }) => {
                    const [ci, ri, v] = p.data;
                    return `${cols[ri]} × ${cols[ci]}<br/><b>${v}</b>`;
                },
            },
            grid: { top: 20, right: 20, bottom: 60, left: 80 },
            xAxis: {
                type: "category",
                data: cols,
                splitArea: { show: true },
                axisLabel: { color: labelColor, fontSize: 11, rotate: 30 },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            yAxis: {
                type: "category",
                data: cols,
                splitArea: { show: true },
                axisLabel: { color: labelColor, fontSize: 11 },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            visualMap: {
                min: -1,
                max: 1,
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: 0,
                inRange: {
                    color: ["#3b82f6", "#f4f4f5", "#ef4444"],
                },
                textStyle: { color: labelColor, fontSize: 10 },
            },
            series: [{
                type: "heatmap",
                data: values,
                label: {
                    show: cols.length <= 12,
                    formatter: (p: { data: [number, number, number] }) => String(p.data[2]),
                    fontSize: 10,
                    color: isDark ? "#e4e4e7" : "#18181b",
                },
                emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" } },
            }],
        };
    }, [data, isDark]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-gray-600">Method</span>
                </div>
                <Select value={method} onValueChange={(v) => run(v as Method)}>
                    <SelectTrigger className="h-8 w-36 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="pearson">Pearson</SelectItem>
                        <SelectItem value="spearman">Spearman</SelectItem>
                        <SelectItem value="kendall">Kendall</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => run(method)} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => {
                    const cols = data.columns ?? [];
                    downloadCsv(`correlation_${method}.csv`, ["column", ...cols],
                        (data.matrix ?? []).map((row) => [row.column, ...cols.map((c) => row.values?.[c] ?? null)]));
                }}>
                    <Download className="h-3 w-3" />
                    Export CSV
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">{(data.columns ?? []).length} numeric columns</span>
            </div>

            {(data.columns ?? []).length < 2 ? (
                <div className="border bg-muted/5 flex items-center justify-center h-64 text-sm text-muted-foreground">
                    Need at least 2 numeric columns to compute a correlation matrix.
                </div>
            ) : (
                <div className="border border-slate-200 bg-card">
                    <EChart option={option} style={{ height: `${Math.max(320, (data.columns ?? []).length * 32 + 80)}px` }} />
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Values range from −1 (perfect negative) to +1 (perfect positive). 0 means no linear relationship.
            </p>
        </div>
    );
}
