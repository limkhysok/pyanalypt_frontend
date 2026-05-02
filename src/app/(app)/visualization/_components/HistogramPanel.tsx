"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { RefreshCw, ChevronDown, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EChart, { type EChartInstance } from "@/components/ui/EChart";
import { vizApi, type VizHistogramColumn, type VizHistogramStats } from "@/services/viz.service";
import { toast } from "sonner";
import { SaveToReportModal } from "@/components/reports/SaveToReportModal";

const BIN_OPTIONS = [10, 20, 30, 50, 100];

interface Props {
    datasetId: number;
    numericColumns: string[];
}

function skewLabel(s: number): { label: string; color: string } {
    const abs = Math.abs(s);
    if (abs < 0.5) return { label: "symmetric", color: "bg-green-500/10 text-green-600 border-green-500/20" };
    if (abs < 1) return { label: s > 0 ? "slight right skew" : "slight left skew", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    return { label: s > 0 ? "right skewed" : "left skewed", color: "bg-red-500/10 text-red-500 border-red-500/20" };
}

function buildOption(col: string, data: VizHistogramColumn, isDark: boolean) {
    const labelColor = isDark ? "#71717a" : "#a1a1aa";
    const tooltipBg = isDark ? "#09090b" : "#ffffff";
    const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
    const tooltipText = isDark ? "#f4f4f5" : "#18181b";
    const splitLine = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const axisLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

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
        grid: { top: 10, right: 10, bottom: 44, left: 50 },
        xAxis: {
            ...data.xAxis,
            axisLabel: { color: labelColor, fontSize: 9, rotate: 30 },
            axisLine: { lineStyle: { color: axisLine } },
            axisTick: { show: false },
        },
        yAxis: {
            ...data.yAxis,
            axisLabel: { color: labelColor, fontSize: 10 },
            splitLine: { lineStyle: { color: splitLine } },
        },
        series: data.series.map(s => ({
            ...s,
            name: col,
            barMaxWidth: 40,
            itemStyle: { color: "#3b82f6", borderRadius: [2, 2, 0, 0] },
            emphasis: { itemStyle: { color: "#60a5fa" } },
        })),
    };
}

function StatsRow({ stats }: Readonly<{ stats: VizHistogramStats }>) {
    const skew = skewLabel(stats.skewness);
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${skew.color}`}>
                skew: {stats.skewness.toFixed(2)} — {skew.label}
            </Badge>
            {[
                ["count", stats.count.toLocaleString()],
                ["mean", stats.mean.toFixed(2)],
                ["std", stats.std.toFixed(2)],
                ["min", stats.min.toFixed(2)],
                ["max", stats.max.toFixed(2)],
            ].map(([label, value]) => (
                <span key={label} className="text-[10px] text-muted-foreground font-mono">
                    {label}: <span className="text-foreground font-semibold">{value}</span>
                </span>
            ))}
        </div>
    );
}

// Individual histogram card with its own EChart ref and Save to Report button
interface HistogramCardProps {
    col: string;
    data: VizHistogramColumn;
    bins: number;
    isDark: boolean;
}

function HistogramCard({ col, data, bins, isDark }: Readonly<HistogramCardProps>) {
    const option = buildOption(col, data, isDark);
    const chartRef = useRef<EChartInstance>(null);
    const [saveOpen, setSaveOpen] = useState(false);

    function getChartImage() {
        return chartRef.current?.getEchartsInstance()?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" }) ?? null;
    }

    return (
        <div className="border border-slate-200 bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs font-mono">{col}</span>
                <Button variant="ghost" size="sm" className="h-7 gap-1 rounded-none text-[11px] text-muted-foreground hover:text-foreground px-2" onClick={() => setSaveOpen(true)}>
                    <BookmarkPlus className="h-3 w-3" /> Save
                </Button>
            </div>
            <EChart ref={chartRef} option={option} style={{ height: "180px" }} />
            <StatsRow stats={data.stats} />

            <SaveToReportModal
                open={saveOpen}
                onOpenChange={setSaveOpen}
                chartType="histogram"
                chartParams={{ columns: [col], bins }}
                getChartImage={getChartImage}
            />
        </div>
    );
}

export function HistogramPanel({ datasetId, numericColumns }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [selectedCols, setSelectedCols] = useState<string[]>(numericColumns.slice(0, 3));
    const [bins, setBins] = useState(20);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Record<string, VizHistogramColumn> | null>(null);

    let colLabel: string;
    if (selectedCols.length === 0) colLabel = "Select columns";
    else if (selectedCols.length === numericColumns.length) colLabel = "All columns";
    else colLabel = `${selectedCols.length} column${selectedCols.length === 1 ? "" : "s"}`;

    function toggleCol(col: string) {
        setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    }

    function run() {
        if (selectedCols.length === 0) { toast.error("Select at least one column."); return; }
        setLoading(true);
        vizApi.histogram(datasetId, { columns: selectedCols, bins })
            .then(setResult)
            .catch(() => toast.error("Failed to load histograms."))
            .finally(() => setLoading(false));
    }

    const entries = result ? Object.entries(result) : [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium">Columns</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-48 justify-between rounded-none text-xs font-normal">
                            <span className="truncate">{colLabel}</span>
                            <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 rounded-none max-h-64 overflow-y-auto">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Numeric columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {numericColumns.map(c => (
                            <DropdownMenuCheckboxItem key={c} checked={selectedCols.includes(c)} onCheckedChange={() => toggleCol(c)} className="text-xs">
                                {c}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-xs font-medium">Bins</span>
                <Select value={String(bins)} onValueChange={v => setBins(Number(v))}>
                    <SelectTrigger className="h-8 w-24 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {BIN_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={run} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Run
                </Button>

                <span className="ml-auto text-xs text-muted-foreground">{selectedCols.length} {selectedCols.length === 1 ? "column" : "columns"} selected</span>
            </div>

            {entries.length > 0
                ? (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {entries.map(([col, data]) => (
                            <HistogramCard key={col} col={col} data={data} bins={bins} isDark={isDark} />
                        ))}
                    </div>
                )
                : <div className="border border-slate-200 bg-muted/5 h-80 flex items-center justify-center text-xs text-muted-foreground">Configure options above and click Run</div>
            }
        </div>
    );
}
