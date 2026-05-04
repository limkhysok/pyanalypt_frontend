"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { BarChart3, PieChart, LineChart, FileText } from "lucide-react";
import dynamic from "next/dynamic";
const EChart = dynamic(() => import("@/components/ui/EChart"), { ssr: false });
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Default Sample Data ---
const DEFAULT_CSV = `Month,Revenue,Users\nJan,1200,450\nFeb,2100,890\nMar,1800,1200\nApr,2400,1500\nMay,2900,1800\nJun,3500,2200`;

const MAX_CHARS = 10000;

export default function Playground() {
    const [mounted, setMounted] = useState(false);
    const [csvData, setCsvData] = useState(DEFAULT_CSV);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [error, setError] = useState<string | null>(null);
    const echartsRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const parsedData = useMemo(() => {
        if (csvData.length > MAX_CHARS) {
            setError(`Input exceeds ${MAX_CHARS} characters.`);
            return null;
        }
        try {
            const rows = csvData.trim().split("\n");
            if (rows.length < 2) return null;
            const headers = rows[0].split(",").map(h => h.trim());
            const body = rows.slice(1).map(row => row.split(",").map(cell => cell.trim()));
            const categories = body.map(row => row[0]);
            const series: any[] = [];
            for (let i = 1; i < headers.length; i++) {
                series.push({
                    name: headers[i],
                    data: body.map(row => {
                        const val = Number.parseFloat(row[i]);
                        return Number.isNaN(val) ? 0 : val;
                    })
                });
            }
            setError(null);
            return { categories, series };
        } catch (err) {
            console.error("CSV Engine Parse Error:", err);
            setError("Invalid CSV format.");
            return null;
        }
    }, [csvData]);

    const handleExport = (type: 'png' | 'svg') => {
        if (!echartsRef.current) return;
        const instance = echartsRef.current.getEchartsInstance();
        const url = instance.getDataURL({ type: type, pixelRatio: 2, backgroundColor: 'transparent' });
        const link = document.createElement('a');
        link.href = url;
        link.download = `pyanalypt-playground-${Date.now()}.${type}`;
        link.click();
    };

    const option = useMemo(() => {
        if (!parsedData) return {};
        const { categories, series } = parsedData;

        const isPie = chartType === 'pie';

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: isPie ? 'item' : 'axis',
                backgroundColor: '#09090b',
                borderColor: 'rgba(59,130,246,0.2)',
                textStyle: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
                borderRadius: 6
            },
            legend: {
                show: true,
                textStyle: { color: '#71717a', fontSize: 9, fontWeight: 'bold' },
                top: 0
            },
            grid: isPie ? undefined : { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: isPie ? { show: false } : {
                type: 'category',
                data: categories,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#71717a', fontSize: 9 }
            },
            yAxis: isPie ? { show: false } : {
                type: 'value',
                splitLine: { lineStyle: { color: 'rgba(59,130,246,0.05)' } },
                axisLabel: { color: '#71717a', fontSize: 9 }
            },
            series: isPie
                ? [{
                    name: series[0]?.name || 'Data',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#09090b',
                        borderWidth: 2
                    },
                    label: { show: false, position: 'center' },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#ffffff' }
                    },
                    labelLine: { show: false },
                    data: categories.map((cat, idx) => ({
                        value: series[0]?.data[idx] || 0,
                        name: cat
                    })),
                    color: ['#3b82f6', '#60a5fa', '#a1a1aa', '#3f3f46', '#93c5fd']
                }]
                : series.map((s, i) => {
                    const colors = ['#3b82f6', '#a1a1aa', '#60a5fa'];
                    const itemColor = colors[i % colors.length];
                    return {
                        name: s.name,
                        type: chartType,
                        data: s.data,
                        smooth: true,
                        itemStyle: { color: itemColor, borderRadius: chartType === 'bar' ? [3, 3, 0, 0] : 0 },
                        ...(chartType === 'line' ? {
                            lineStyle: { width: 2 },
                            areaStyle: {
                                color: {
                                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                    colorStops: [{ offset: 0, color: itemColor + '30' }, { offset: 1, color: itemColor + '00' }]
                                }
                            }
                        } : {})
                    };
                })
        };
    }, [parsedData, chartType]);

    if (!mounted) return <div className="min-h-screen bg-background" />;

    return (
        <main className="min-h-screen bg-background relative selection:bg-blue-500/20 overflow-x-hidden pt-26 pb-16">

            {/* Blueprint Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

            {/* Blue Ambient Glow */}
            <div className="fixed top-1/4 left-1/4 w-75 h-75 bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-1/4 right-1/4 w-87.5 h-87.5 bg-foreground opacity-[0.02] blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="container relative z-10 mx-auto px-6 max-w-6xl py-12 md:py-16">

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-6">

                    {/* Left: Input Console */}
                    <div className="flex flex-col h-full">
                        <div className="group relative flex-1 rounded-2xl md:rounded-3xl bg-background border border-border shadow-[0_15px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 flex flex-col">
                            {/* Panel Header */}
                            <div className="h-10 border-b border-border/50 bg-muted/30 flex items-center justify-between px-5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-blue-500/60 dark:text-blue-400/60" />
                                    <span className="text-[9px] font-black capitalize tracking-widest text-muted-foreground/60">telemetry.csv</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-muted-foreground/40 capitalize">{csvData.length} B</span>
                                </div>
                            </div>

                            <div className="p-5 space-y-6 text-left flex-1 flex flex-col">
                                <div className="space-y-3 flex-1 flex flex-col">
                                    <textarea
                                        className="w-full flex-1 bg-muted/10 rounded-xl p-4 text-[11px] font-mono outline-none border border-border/40 focus:border-blue-500/40 dark:focus:border-blue-400/40 focus:bg-background transition-all resize-none shadow-inner"
                                        value={csvData}
                                        onChange={(e) => setCsvData(e.target.value)}
                                        spellCheck={false}
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                        <p className="text-red-500 text-[9px] font-black capitalize tracking-widest">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h3 className="text-[9px] font-black capitalize tracking-widest text-muted-foreground opacity-50">Engine Mode</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'bar', icon: BarChart3, label: 'BAR' },
                                            { id: 'line', icon: LineChart, label: 'LINE' },
                                            { id: 'pie', icon: PieChart, label: 'PIE' },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setChartType(t.id as any)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                                    chartType === t.id
                                                        ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md scale-[1.02]"
                                                        : "bg-muted/30 border-border/60 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <t.icon size={16} />
                                                <span className="text-[8px] font-black tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Note */}
                        <div className="mt-4 px-5 py-3 rounded-xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
                            <p className="text-[9px] text-muted-foreground font-medium leading-relaxed opacity-60 text-center">
                                Local thread processing — zero data leakage.
                            </p>
                        </div>
                    </div>

                    {/* Right: Renderer Viewbox */}
                    <div className="group relative rounded-2xl md:rounded-3xl bg-background border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 flex flex-col h-full">
                        {/* Renderer Controls */}
                        <div className="h-12 border-b border-border/50 bg-muted/20 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-border/40 group-hover:bg-red-500/40 transition-colors" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-border/40 group-hover:bg-amber-500/40 transition-colors" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-border/40 group-hover:bg-blue-500/60 transition-colors" />
                                </div>
                                <span className="text-[10px] font-black capitalize tracking-tight text-muted-foreground opacity-40">Live Renderer v1.02</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-[9px] font-black tracking-widest border-border/40 hover:bg-muted hover:border-blue-500/30 dark:hover:border-blue-400/30 capitalize px-4 transition-colors"
                                    onClick={() => handleExport('svg')}
                                >
                                    SVG
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 rounded-lg text-[9px] font-black tracking-widest bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 transition-all capitalize px-4"
                                    onClick={() => handleExport('png')}
                                >
                                    PNG SNAPSHOT
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 space-y-8 flex-1 flex flex-col">
                            <div className="flex items-end justify-between border-b border-border/10 pb-4 shrink-0">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black tracking-tight text-foreground/90">Growth Telemetry</h3>
                                    <p className="text-[9px] font-bold text-muted-foreground/50 capitalize tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                                        Client Instance Active
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-6">
                                    <div className="flex items-center gap-2 group/legend cursor-help">
                                        <div className="w-2 h-2 rounded-full border-2 border-border/60 group-hover:border-blue-400 transition-all" />
                                        <span className="text-[9px] font-black text-muted-foreground/60 group-hover:text-foreground">Projected</span>
                                    </div>
                                    <div className="flex items-center gap-2 group/legend cursor-help">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 capitalize tracking-widest">Actual</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full relative flex-1 min-h-[300px]">
                                <EChart
                                    ref={echartsRef}
                                    option={option}
                                    style={{ height: '300px', width: '100%' }}
                                />
                                <div className="absolute inset-0 pointer-events-none border border-dashed border-blue-500/10 dark:border-blue-400/10 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
