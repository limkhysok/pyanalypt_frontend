"use client";

import { useState, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { RefreshCw, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart, { type EChartInstance } from "@/components/ui/EChart";
import { vizApi, type VizScatterResponse } from "@/services/viz.service";
import { toast } from "sonner";
import { SaveToReportModal } from "@/components/reports/SaveToReportModal";

const SAMPLE_OPTIONS = [100, 500, 1000, 2000, 5000];

interface Props {
    datasetId: number;
    numericColumns: string[];
    categoricalColumns: string[];
}

function buildOption(data: VizScatterResponse, isDark: boolean) {
    const labelColor = isDark ? "#71717a" : "#a1a1aa";
    const tooltipBg = isDark ? "#09090b" : "#ffffff";
    const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
    const tooltipText = isDark ? "#f4f4f5" : "#18181b";
    const splitLine = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

    return {
        backgroundColor: "transparent",
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"],
        tooltip: {
            trigger: "item",
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            textStyle: { color: tooltipText, fontSize: 11 },
            formatter: (p: { seriesName: string; value: [number, number] }) =>
                `${p.seriesName}<br/>${data.xAxis.name}: <b>${p.value[0]}</b><br/>${data.yAxis.name}: <b>${p.value[1]}</b>`,
        },
        legend: data.series.length > 1 ? { textStyle: { color: labelColor, fontSize: 11 }, top: 4 } : undefined,
        grid: { top: data.series.length > 1 ? 44 : 16, right: 20, bottom: 60, left: 60 },
        xAxis: {
            ...data.xAxis,
            axisLabel: { color: labelColor, fontSize: 10 },
            splitLine: { lineStyle: { color: splitLine } },
        },
        yAxis: {
            ...data.yAxis,
            axisLabel: { color: labelColor, fontSize: 10 },
            splitLine: { lineStyle: { color: splitLine } },
        },
        series: data.series.map(s => ({
            ...s,
            symbolSize: 5,
            opacity: 0.7,
            emphasis: { focus: "series", itemStyle: { opacity: 1 } },
        })),
    };
}

function pearsonColor(r: number): string {
    const abs = Math.abs(r);
    if (abs >= 0.7) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (abs >= 0.4) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-muted/50 text-muted-foreground border-border";
}

export function ScatterChartPanel({ datasetId, numericColumns, categoricalColumns }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [colX, setColX] = useState(numericColumns[0] ?? "");
    const [colY, setColY] = useState(numericColumns[1] ?? numericColumns[0] ?? "");
    const [colorBy, setColorBy] = useState("__none__");
    const [sample, setSample] = useState(500);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VizScatterResponse | null>(null);
    const [saveOpen, setSaveOpen] = useState(false);
    const chartRef = useRef<EChartInstance>(null);

    const option = useMemo(() => result ? buildOption(result, isDark) : null, [result, isDark]);

    function getChartImage() {
        return chartRef.current?.getEchartsInstance()?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" }) ?? null;
    }

    const chartParams = { col_x: colX, col_y: colY, color_by: colorBy === "__none__" ? undefined : colorBy, sample };

    function run() {
        if (!colX || !colY) { toast.error("Select both X and Y columns."); return; }
        setLoading(true);
        vizApi.scatter(datasetId, {
            col_x: colX,
            col_y: colY,
            color_by: colorBy === "__none__" ? undefined : colorBy,
            sample,
        })
            .then(setResult)
            .catch(() => toast.error("Failed to load scatter chart."))
            .finally(() => setLoading(false));
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium">X</span>
                <Select value={colX} onValueChange={setColX}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue placeholder="Numeric col" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Y</span>
                <Select value={colY} onValueChange={setColY}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue placeholder="Numeric col" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Color by</span>
                <Select value={colorBy} onValueChange={setColorBy}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="__none__">None</SelectItem>
                        {categoricalColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Sample</span>
                <Select value={String(sample)} onValueChange={v => setSample(Number(v))}>
                    <SelectTrigger className="h-8 w-24 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {SAMPLE_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n.toLocaleString()}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={run} disabled={loading}>
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Run
                </Button>

                {result?.pearson_r != null && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${pearsonColor(result.pearson_r)}`}>
                        r = {result.pearson_r.toFixed(4)}
                    </Badge>
                )}

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
                chartType="scatter"
                chartParams={chartParams}
                getChartImage={getChartImage}
            />
        </div>
    );
}
