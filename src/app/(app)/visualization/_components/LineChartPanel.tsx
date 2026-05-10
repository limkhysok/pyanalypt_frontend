"use client";

import { useState, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { RefreshCw, ChevronDown, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EChart, { type EChartInstance } from "@/components/ui/EChart";
import * as echarts from "echarts";
import { vizApi, type VizLineResponse } from "@/services/viz.service";
import { toast } from "sonner";
import { SaveToReportModal } from "@/components/reports/SaveToReportModal";

interface Props {
    datasetId: number;
    numericColumns: string[];
    allColumns: string[];
}

function buildOption(data: VizLineResponse, isDark: boolean): echarts.EChartsOption {
    const labelColor = isDark ? "#71717a" : "#a1a1aa";
    const tooltipBg = isDark ? "#09090b" : "#ffffff";
    const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
    const tooltipText = isDark ? "#f4f4f5" : "#18181b";
    const splitLine = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const axisLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return {
        backgroundColor: "transparent",
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"],
        tooltip: { trigger: "axis" as const, backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText, fontSize: 11 } },
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
            smooth: true,
            symbol: "none",
        })),
    };
}

export function LineChartPanel({ datasetId, numericColumns, allColumns }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [xCol, setXCol] = useState(() => allColumns[0] ?? "");
    const [yCols, setYCols] = useState<string[]>(() => numericColumns.slice(0, 1));
    const [sort, setSort] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VizLineResponse | null>(null);
    const [saveOpen, setSaveOpen] = useState(false);
    const chartRef = useRef<EChartInstance>(null);

    const option = useMemo(() => result ? buildOption(result, isDark) : null, [result, isDark]);


    function getChartImage() {
        return chartRef.current?.getEchartsInstance()?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" }) ?? null;
    }

    const chartParams = { x_col: xCol, y_cols: yCols, sort };

    function toggleYCol(col: string) {
        setYCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    }

    function run() {
        if (!xCol) { toast.error("Select an X column."); return; }
        if (yCols.length === 0) { toast.error("Select at least one Y column."); return; }
        setLoading(true);
        vizApi.line(datasetId, { x_col: xCol, y_cols: yCols, sort })
            .then(setResult)
            .catch(() => toast.error("Failed to load line chart."))
            .finally(() => setLoading(false));
    }

    let yLabel: string;
    if (yCols.length === 0) yLabel = "Select columns";
    else if (yCols.length === 1) yLabel = yCols[0];
    else yLabel = `${yCols.length} columns`;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium">X axis</span>
                <Select value={xCol} onValueChange={setXCol}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-xs"><SelectValue placeholder="Any column" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        {allColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <span className="text-xs font-medium">Y axis</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-48 justify-between rounded-none text-xs font-normal">
                            <span className="truncate">{yLabel}</span>
                            <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 rounded-none">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Numeric columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {numericColumns.map(c => (
                            <DropdownMenuCheckboxItem key={c} checked={yCols.includes(c)} onCheckedChange={() => toggleYCol(c)} className="text-xs">
                                {c}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-xs font-medium">Sort X</span>
                <Select value={sort ? "asc" : "none"} onValueChange={v => setSort(v === "asc")}>
                    <SelectTrigger className="h-8 w-28 rounded-none text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="none">Original</SelectItem>
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
                ? <div className="border border-slate-200 bg-card p-[10px]"><EChart ref={chartRef} option={option} style={{ height: "420px" }} /></div>
                : <div className="border border-slate-200 bg-muted/5 h-80 flex items-center justify-center text-xs text-muted-foreground">Configure options above and click Run</div>
            }

            <SaveToReportModal
                open={saveOpen}
                onOpenChange={setSaveOpen}
                chartType="line"
                chartParams={chartParams}
                getChartImage={getChartImage}
                datasetId={datasetId}
            />
        </div>
    );
}
