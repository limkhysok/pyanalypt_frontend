"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart from "@/components/ui/EChart";
import type { DistributionResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    data: DistributionResponse;
    onUpdate: (data: DistributionResponse) => void;
    loading: boolean;
    setLoading: (v: boolean) => void;
}

function skewLabel(s: number): { label: string; color: string } {
    const abs = Math.abs(s);
    if (abs < 0.5) return { label: "symmetric", color: "bg-green-500/10 text-green-600 border-green-500/20" };
    if (abs < 1) return { label: s > 0 ? "slight right skew" : "slight left skew", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    return { label: s > 0 ? "right skewed" : "left skewed", color: "bg-red-500/10 text-red-500 border-red-500/20" };
}

function kurtLabel(k: number): { label: string; color: string } {
    if (k > 3) return { label: "heavy tails", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    if (k < 3) return { label: "thin tails", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    return { label: "normal tails", color: "bg-muted/50 text-muted-foreground border-border" };
}

function HistogramCard({ col, stats, isDark }: Readonly<{ col: string; stats: DistributionResponse[string]; isDark: boolean }>) {
    const skew = skewLabel(stats.skewness ?? 0);
    const kurt = kurtLabel(stats.kurtosis ?? 0);

    const option = useMemo(() => {
        const labelColor = isDark ? "#71717a" : "#a1a1aa";
        const tooltipBg = isDark ? "#09090b" : "#ffffff";
        const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
        const tooltipText = isDark ? "#f4f4f5" : "#18181b";

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: tooltipText, fontSize: 11 },
                formatter: (params: Array<{ name: string; value: number }>) =>
                    `${params[0].name}<br/><b>${params[0].value} rows</b>`,
            },
            grid: { top: 10, right: 10, bottom: 40, left: 50 },
            xAxis: {
                type: "category",
                data: (stats.bins ?? []).map((b) => b.range_start.toLocaleString()),
                axisLabel: { color: labelColor, fontSize: 9, rotate: 30 },
                axisLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" } },
                axisTick: { show: false },
            },
            yAxis: {
                type: "value",
                axisLabel: { color: labelColor, fontSize: 10 },
                splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            },
            series: [{
                type: "bar",
                data: (stats.bins ?? []).map((b) => b.count),
                barMaxWidth: 40,
                itemStyle: { color: "#3b82f6", borderRadius: [2, 2, 0, 0] },
                emphasis: { itemStyle: { color: "#60a5fa" } },
            }],
        };
    }, [stats, isDark]);

    return (
        <div className="border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm font-mono">{col}</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${skew.color}`}>skew: {(stats.skewness ?? 0).toFixed(2)} — {skew.label}</Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${kurt.color}`}>kurt: {(stats.kurtosis ?? 0).toFixed(2)} — {kurt.label}</Badge>
                </div>
            </div>

            <EChart option={option} style={{ height: "180px" }} />

            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                {[
                    ["count", (stats.count ?? 0).toLocaleString()],
                    ["mean", (stats.mean ?? 0).toFixed(2)],
                    ["std", (stats.std ?? 0).toFixed(2)],
                    ["min", (stats.min ?? 0).toFixed(2)],
                    ["max", (stats.max ?? 0).toFixed(2)],
                ].map(([label, value]) => (
                    <div key={label} className="border bg-muted/5 p-1.5">
                        <div className="text-muted-foreground">{label}</div>
                        <div className="font-mono font-semibold">{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DistributionTab({ datasetId, data, onUpdate, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const cols = Object.keys(data);
    const [bins, setBins] = useState(20);
    const ALL = "__all__";
    const [activeCol, setActiveCol] = useState<string>(ALL);

    function run(b: number, col?: string) {
        setLoading(true);
        edaApi.distribution(datasetId, { bins: b, columns: col ? [col] : undefined })
            .then(onUpdate)
            .catch(() => toast.error("Failed to load distribution."))
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
                <span className="text-sm font-medium">Bins</span>
                <Select value={String(bins)} onValueChange={(v) => setBins(Number(v))}>
                    <SelectTrigger className="h-8 w-24 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {[10, 20, 30, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={() => run(bins, activeCol === ALL ? undefined : activeCol)} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                    Run
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">{cols.length} numeric columns</span>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {displayCols.map((col) => (
                    <HistogramCard key={col} col={col} stats={data[col]} isDark={isDark} />
                ))}
            </div>
        </div>
    );
}
