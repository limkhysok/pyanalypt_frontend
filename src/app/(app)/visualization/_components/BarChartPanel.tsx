"use client";

import { useState, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { RefreshCw, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart, { type EChartInstance } from "@/components/ui/EChart";
import { vizApi, type VizBarResponse } from "@/services/viz.service";
import { toast } from "sonner";
import { SaveToReportModal } from "@/components/reports/SaveToReportModal";

const AGG_OPTIONS = ["sum", "mean", "count", "min", "max"];
const LIMIT_OPTIONS = [10, 20, 50, 100];

interface Props {
    datasetId: number;
    numericColumns: string[];
    categoricalColumns: string[];
}

function buildOption(data: VizBarResponse, isDark: boolean) {
    const labelColor = isDark ? "#71717a" : "#a1a1aa";
    const tooltipBg = isDark ? "#09090b" : "#ffffff";
    const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
    const tooltipText = isDark ? "#f4f4f5" : "#18181b";
    const splitLine = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const axisLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return {
        backgroundColor: "transparent",
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"],
        tooltip: { trigger: "axis", backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText, fontSize: 11 } },
        legend: data.series.length > 1 ? { textStyle: { color: labelColor, fontSize: 11 }, top: 4 } : undefined,
        grid: { top: data.series.length > 1 ? 44 : 16, right: 20, bottom: 64, left: 60 },
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
            barMaxWidth: 48,
            itemStyle: { borderRadius: [2, 2, 0, 0] },
            emphasis: { itemStyle: { opacity: 0.85 } },
        })),
    };
}

export function BarChartPanel({ datasetId, numericColumns, categoricalColumns }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [xCol, setXCol] = useState(categoricalColumns[0] ?? "");
    const [yCol, setYCol] = useState(numericColumns[0] ?? "");
    const [agg, setAgg] = useState("sum");
    const [groupBy, setGroupBy] = useState("__none__");
    const [limit, setLimit] = useState(20);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VizBarResponse | null>(null);
    const [saveOpen, setSaveOpen] = useState(false);
    const chartRef = useRef<EChartInstance>(null);

    const option = useMemo(() => result ? buildOption(result, isDark) : null, [result, isDark]);

    function getChartImage() {
        return chartRef.current?.getEchartsInstance()?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" }) ?? null;
    }

    const chartParams = { x_col: xCol, y_col: yCol, agg, group_by: groupBy === "__none__" ? undefined : groupBy, limit };

    function run() {
        if (!xCol || !yCol) { toast.error("Select both X and Y columns."); return; }
        setLoading(true);
        vizApi.bar(datasetId, {
            x_col: xCol,
            y_col: yCol,
            agg,
            group_by: groupBy === "__none__" ? undefined : groupBy,
            limit,
        })
            .then(setResult)
            .catch(() => toast.error("Failed to load bar chart."))
            .finally(() => setLoading(false));
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium">X axis</span>
                <Select value={xCol} onValueChange={setXCol}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue placeholder="Categorical col" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {categoricalColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Y axis</span>
                <Select value={yCol} onValueChange={setYCol}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue placeholder="Numeric col" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Agg</span>
                <Select value={agg} onValueChange={setAgg}>
                    <SelectTrigger className="h-8 w-28 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {AGG_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Group by</span>
                <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="__none__">None</SelectItem>
                        {categoricalColumns.filter(c => c !== xCol).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Top</span>
                <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
                    <SelectTrigger className="h-8 w-20 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {LIMIT_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={run} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Run
                </Button>

                {result && (
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none ml-auto" onClick={() => setSaveOpen(true)}>
                        <BookmarkPlus className="h-3 w-3" /> Save to Report
                    </Button>
                )}
            </div>

            {option
                ? <div className="border border-slate-200 bg-card"><EChart ref={chartRef} option={option} style={{ height: "420px" }} /></div>
                : <div className="border border-slate-200 bg-muted/5 h-80 flex items-center justify-center text-xs text-muted-foreground">Configure options above and click Run</div>
            }

            <SaveToReportModal
                open={saveOpen}
                onOpenChange={setSaveOpen}
                chartType="bar"
                chartParams={chartParams}
                getChartImage={getChartImage}
            />
        </div>
    );
}
