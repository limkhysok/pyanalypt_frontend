"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Download, RefreshCw } from "lucide-react";
import { downloadCsv } from "@/lib/download-csv";
import { Button } from "@/components/ui/button";
import EChart from "@/components/ui/EChart";
import type { AssociationResponse } from "@/services/api";
import { edaApi } from "@/services/api";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: AssociationResponse;
    onUpdate: (data: AssociationResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

export function AssociationTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    function refresh() {
        setLoading(true);
        edaApi.association(datasetId)
            .then(onUpdate)
            .catch(() => toast.error("Failed to load association matrix."))
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
            grid: { top: 20, right: 20, bottom: 60, left: 100 },
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
                min: 0,
                max: 1,
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: 0,
                inRange: {
                    color: ["#f4f4f5", "#60a5fa", "#1e3a8a"], // Neutral to light blue to deep blue
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
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={refresh} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => {
                    const cols = data.columns ?? [];
                    downloadCsv(`association_cramers_v.csv`, ["column", ...cols],
                        (data.matrix ?? []).map((row) => [row.column, ...cols.map((c) => row.values?.[c] ?? null)]));
                }}>
                    <Download className="h-3 w-3" />
                    Export CSV
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">{(data.columns ?? []).length} categorical columns</span>
            </div>

            {(data.columns ?? []).length < 2 ? (
                <div className="border bg-muted/5 flex flex-col items-center justify-center h-64 text-sm text-muted-foreground text-center px-6 gap-2">
                    <p>Need at least 2 categorical columns to compute an association matrix.</p>
                    <p className="opacity-60 text-xs">Association uses Cram&apos;s V to find relationships between non-numeric features.</p>
                </div>
            ) : (
                <div className="border border-slate-200 bg-card overflow-x-auto">
                    <EChart option={option} style={{ height: `${Math.max(320, (data.columns ?? []).length * 40 + 100)}px`, minWidth: "500px" }} />
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Cram&apos;s V measures association between nominal variables. 
                Values range from 0 (no association) to 1 (perfect association).
            </p>
        </div>
    );
}
