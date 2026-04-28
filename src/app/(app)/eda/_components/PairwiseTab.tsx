"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EChart from "@/components/ui/EChart";
import type { PairwiseResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    numericColumns: string[];
    loading: boolean;
    setLoading: (v: boolean) => void;
}

function pearsonColor(r: number): string {
    const abs = Math.abs(r);
    if (abs >= 0.7) return r > 0 ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20";
    if (abs >= 0.4) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-muted/50 text-muted-foreground border-border";
}

function pearsonLabel(r: number): string {
    const abs = Math.abs(r);
    const dir = r >= 0 ? "positive" : "negative";
    if (abs >= 0.7) return `strong ${dir}`;
    if (abs >= 0.4) return `moderate ${dir}`;
    if (abs >= 0.2) return `weak ${dir}`;
    return "no correlation";
}

export function PairwiseTab({ datasetId, numericColumns, loading, setLoading }: Readonly<Props>) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [colX, setColX] = useState(numericColumns[0] ?? "");
    const [colY, setColY] = useState(numericColumns[1] ?? "");
    const [sample, setSample] = useState(500);
    const [result, setResult] = useState<PairwiseResponse | null>(null);

    function run() {
        if (!colX || !colY) return;
        if (colX === colY) { toast.error("Pick two different columns."); return; }
        setLoading(true);
        edaApi.pairwise(datasetId, { col_x: colX, col_y: colY, sample })
            .then(setResult)
            .catch(() => toast.error("Failed to load scatter data."))
            .finally(() => setLoading(false));
    }

    const option = useMemo(() => {
        if (!result) return {};
        const tooltipBg = isDark ? "#09090b" : "#ffffff";
        const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
        const tooltipText = isDark ? "#f4f4f5" : "#18181b";
        const labelColor = isDark ? "#71717a" : "#a1a1aa";

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: tooltipText, fontSize: 11 },
                formatter: (p: { value: [number, number] }) => `${result.col_x}: <b>${p.value[0]}</b><br/>${result.col_y}: <b>${p.value[1]}</b>`,
            },
            grid: { top: 16, right: 20, bottom: 48, left: 60 },
            xAxis: {
                type: "value",
                name: result.col_x,
                nameLocation: "middle",
                nameGap: 28,
                nameTextStyle: { color: labelColor, fontSize: 11 },
                axisLabel: { color: labelColor, fontSize: 10 },
                splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            },
            yAxis: {
                type: "value",
                name: result.col_y,
                nameLocation: "middle",
                nameGap: 44,
                nameTextStyle: { color: labelColor, fontSize: 11 },
                axisLabel: { color: labelColor, fontSize: 10 },
                splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            },
            series: [{
                type: "scatter",
                data: result.points.map((p) => [p.x, p.y]),
                symbolSize: 5,
                itemStyle: { color: "#3b82f6", opacity: 0.6 },
                emphasis: { itemStyle: { color: "#60a5fa", opacity: 1 } },
            }],
        };
    }, [result, isDark]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">X axis</span>
                <Select value={colX} onValueChange={setColX}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-sm">
                        <SelectValue placeholder="Column X" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {numericColumns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span className="text-sm font-medium">Y axis</span>
                <Select value={colY} onValueChange={setColY}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-sm">
                        <SelectValue placeholder="Column Y" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {numericColumns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span className="text-sm font-medium">Max points</span>
                <Select value={String(sample)} onValueChange={(v) => setSample(Number(v))}>
                    <SelectTrigger className="h-8 w-24 rounded-none text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {[200, 500, 1000, 2000, 5000].map((n) => <SelectItem key={n} value={String(n)}>{n.toLocaleString()}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={run} disabled={loading || !colX || !colY}>
                    <Search className="h-3 w-3" />
                    Plot
                </Button>
            </div>

            {!result && (
                <div className="border bg-muted/5 h-80 flex items-center justify-center text-sm text-muted-foreground">
                    Select X and Y columns and click Plot.
                </div>
            )}

            {result && (
                <>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs gap-1 ${pearsonColor(result.pearson_r)}`}>
                            Pearson r = {result.pearson_r.toFixed(4)} — {pearsonLabel(result.pearson_r)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {result.sampled < result.total_valid_rows
                                ? `Showing ${result.sampled.toLocaleString()} of ${result.total_valid_rows.toLocaleString()} valid rows (random sample, seed=42)`
                                : `${result.total_valid_rows.toLocaleString()} valid rows`}
                        </span>
                    </div>
                    <div className="border bg-card">
                        <EChart option={option} style={{ height: "420px" }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pearson r is computed on the full dataset, not just the displayed sample.
                    </p>
                </>
            )}
        </div>
    );
}
