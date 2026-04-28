"use client";

import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart from "@/components/ui/EChart";
import type { ValueCountsResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: ValueCountsResponse;
    onUpdate: (data: ValueCountsResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

function ValueCountsCard({ col, stats, isDark }: Readonly<{ col: string; stats: ValueCountsResponse[string]; isDark: boolean }>) {
    const option = useMemo(() => {
        const tooltipBg = isDark ? "#09090b" : "#ffffff";
        const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
        const tooltipText = isDark ? "#f4f4f5" : "#18181b";
        const labelColor = isDark ? "#71717a" : "#a1a1aa";

        const items = [...(stats.top_values ?? [])].reverse();
        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: tooltipText, fontSize: 11 },
                formatter: (params: Array<{ name: string; value: number }>) =>
                    `${params[0].name}<br/><b>${params[0].value.toLocaleString()}</b> rows`,
            },
            grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
            xAxis: {
                type: "value",
                axisLabel: { color: labelColor, fontSize: 10 },
                splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            },
            yAxis: {
                type: "category",
                data: items.map((v) => v.value === null ? "(null)" : String(v.value)),
                axisLabel: { color: isDark ? "#a1a1aa" : "#52525b", fontSize: 11, width: 120, overflow: "truncate" },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            series: [{
                type: "bar",
                data: items.map((v) => v.count),
                barMaxWidth: 28,
                itemStyle: { color: "#8b5cf6", borderRadius: [0, 2, 2, 0] },
                emphasis: { itemStyle: { color: "#a78bfa" } },
                label: {
                    show: true,
                    position: "right",
                    formatter: (p: { dataIndex: number }) => `${items[p.dataIndex].pct.toFixed(1)}%`,
                    color: labelColor,
                    fontSize: 10,
                },
            }],
        };
    }, [stats, isDark]);

    const chartHeight = Math.max(160, (stats.top_values ?? []).length * 28 + 24);

    return (
        <div className="border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm font-mono">{col}</span>
                <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{(stats.unique_count ?? 0).toLocaleString()} unique</Badge>
                    {(stats.null_count ?? 0) > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {stats.null_count.toLocaleString()} null
                        </Badge>
                    )}
                </div>
            </div>
            <EChart option={option} style={{ height: `${chartHeight}px` }} />
        </div>
    );
}

export function ValueCountsTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const cols = Object.keys(data);
    const ALL = "__all__";
    const [activeCol, setActiveCol] = useState<string>(ALL);
    const [topN, setTopN] = useState(20);

    function run(col?: string, n?: number) {
        setLoading(true);
        edaApi.valueCounts(datasetId, { columns: col ? [col] : undefined, top_n: n ?? topN })
            .then(onUpdate)
            .catch(() => toast.error("Failed to load value counts."))
            .finally(() => setLoading(false));
    }

    const displayCols = activeCol === ALL ? cols : [activeCol];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Column</span>
                <Select value={activeCol} onValueChange={setActiveCol}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value={ALL}>All columns</SelectItem>
                        {cols.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span className="text-sm font-medium">Top N</span>
                <Select value={String(topN)} onValueChange={(v) => setTopN(Number(v))}>
                    <SelectTrigger className="h-8 w-20 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {[10, 20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => run(activeCol === ALL ? undefined : activeCol, topN)} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    Run
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">{cols.length} columns</span>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {displayCols.map((col) => (
                    <ValueCountsCard key={col} col={col} stats={data[col]} isDark={isDark} />
                ))}
            </div>
        </div>
    );
}
