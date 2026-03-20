"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Zap, BarChart3, PieChart, LineChart, FileText, Download } from "lucide-react";
import EChart from "@/components/ui/EChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


// --- Default Sample Data ---
const DEFAULT_CSV = `Month,Revenue,Users\nJan,1200,450\nFeb,2100,890\nMar,1800,1200\nApr,2400,1500\nMay,2900,1800\nJun,3500,2200`;

const MAX_CHARS = 10000; // Protection Limit

export default function Playground() {
    const [csvData, setCsvData] = useState(DEFAULT_CSV);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [error, setError] = useState<string | null>(null);
    const echartsRef = useRef<any>(null);

    // --- Parser Engine ---
    const parsedData = useMemo(() => {
        if (csvData.length > MAX_CHARS) {
            setError(`Input exceeds ${MAX_CHARS} characters. Please reduce dataset size to prevent overhead.`);
            return null;
        }
        try {
            const rows = csvData.trim().split("\n");
            if (rows.length < 2) return null;

            const headers = rows[0].split(",").map(h => h.trim());
            const body = rows.slice(1).map(row => row.split(",").map(cell => cell.trim()));

            // Identify numeric columns
            const categories = body.map(row => row[0]); // First column as Category
            const series: any[] = [];

            for (let i = 1; i < headers.length; i++) {
                const values = body.map(row => {
                    const val = Number.parseFloat(row[i]);
                    return Number.isNaN(val) ? 0 : val;
                });
                series.push({
                    name: headers[i],
                    data: values
                });
            }

            setError(null);
            return { categories, series };
        } catch (err) {
            console.error("CSV Parse error:", err);
            setError("Invalid CSV format. Ensure comma-separated values (Category, Value1, Value2...)");
            return null;
        }
    }, [csvData]);

    const handleExport = (type: 'png' | 'svg') => {
        if (!echartsRef.current) return;
        const instance = echartsRef.current.getEchartsInstance();
        const url = instance.getDataURL({
            type: type,
            pixelRatio: 2,
            backgroundColor: '#09090b' // Match card background
        });
        const link = document.createElement('a');
        link.href = url;
        link.download = `pyanalypt-export-${Date.now()}.${type}`;
        link.click();
    };

    const option = useMemo(() => {
        if (!parsedData) return {};

        const { categories, series } = parsedData;

        return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', backgroundColor: '#18181b', borderColor: '#3f3f46', textStyle: { color: '#f4f4f5' } },
            legend: { show: true, textStyle: { color: '#71717a' }, top: 0 },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
                axisLabel: { color: '#71717a' }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { color: '#71717a' }
            },
            series: series.map((s, i) => {
                const colors = ['#20beff', '#818cf8', '#10b981'];
                const itemColor = colors[i % colors.length];

                return {
                    name: s.name,
                    type: chartType,
                    data: s.data,
                    smooth: true,
                    itemStyle: {
                        color: itemColor,
                        borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
                    },
                    ...(chartType === 'line' ? { areaStyle: { opacity: 0.1 } } : {})
                };
            })
        };
    }, [parsedData, chartType]);

    return (
        <main className="min-h-screen bg-background text-foreground pt-28 pb-16 px-6 selection:bg-primary/20 overflow-x-hidden relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-[-10%] w-150 h-150 bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto space-y-10">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-6 max-w-2xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                        <Zap size={13} className="text-blue-500" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Data Sandbox
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                        Try It Live.<br />
                        <span className="text-blue-600 dark:text-blue-400 italic">No signup required.</span>
                    </h1>

                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                        Paste any CSV data, pick a chart type, and see it rendered instantly — all inside your browser. Zero data leaves your device.
                    </p>
                </motion.div>

                {/* ── Panels ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6"
                >
                    {/* Input Panel */}
                    <Card className="bg-background/60 backdrop-blur-2xl border border-border/20 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="p-6 space-y-6">
                            <CardHeader className="p-0 pb-5 border-b border-border/10">
                                <CardTitle className="text-sm font-black flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText size={15} className="text-blue-500" aria-hidden="true" />
                                        <span>CSV Input</span>
                                    </div>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black ${
                                        csvData.length > MAX_CHARS * 0.8
                                            ? 'text-red-500 border-red-500/30 bg-red-500/10'
                                            : 'text-muted-foreground border-border/20 bg-secondary/50'
                                    }`}>
                                        {csvData.length} / {MAX_CHARS}
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0 space-y-5">
                                <textarea
                                    aria-label="CSV data input"
                                    className="w-full h-48 bg-secondary/20 rounded-2xl p-4 text-xs font-mono outline-none border border-border/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    placeholder="Paste CSV here…&#10;e.g. Month,Revenue,Users&#10;Jan,1200,450"
                                />

                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chart Type</p>
                                    <fieldset className="grid grid-cols-3 gap-3">
                                        <legend className="sr-only">Select chart type</legend>
                                        {[
                                            { id: 'bar',  icon: BarChart3,  label: 'Bar'  },
                                            { id: 'line', icon: LineChart,  label: 'Line' },
                                            { id: 'pie',  icon: PieChart,   label: 'Pie'  },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setChartType(t.id as "bar" | "line" | "pie")}
                                                aria-pressed={chartType === t.id}
                                                className={`p-4 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-300 ${
                                                    chartType === t.id
                                                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-500 shadow-sm'
                                                        : 'bg-background/50 border-border/20 hover:border-blue-500/30 text-muted-foreground hover:bg-secondary/40'
                                                }`}
                                            >
                                                <t.icon size={20} aria-hidden="true" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </fieldset>
                                </div>

                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/10">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        <span className="font-black text-foreground/60">Privacy note:</span> Raw text only — no file uploads. All processing happens in your browser.
                                    </p>
                                </div>
                            </CardContent>
                        </div>
                    </Card>

                    {/* Preview Panel */}
                    <Card className="bg-background/60 backdrop-blur-2xl border border-border/20 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col min-h-140">
                        <CardHeader className="border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 gap-4 shrink-0">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2.5">
                                    {"Live Render"}
                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
                                </CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    ECharts · Client-Side Only
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl text-[10px] font-black border-border/30 hover:bg-secondary/50 transition-all h-9 px-5 uppercase tracking-widest"
                                    onClick={() => handleExport('svg')}
                                    aria-label="Export chart as SVG"
                                >
                                    <Download size={13} className="mr-1.5" aria-hidden="true" /> SVG
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-xl text-[10px] font-black bg-blue-600 hover:bg-blue-700 text-white transition-all h-9 px-5 uppercase tracking-widest shadow-sm shadow-blue-500/20"
                                    onClick={() => handleExport('png')}
                                    aria-label="Export chart as PNG"
                                >
                                    <Download size={13} className="mr-1.5" aria-hidden="true" /> PNG
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-6 flex items-center justify-center">
                            <div className="w-full" style={{ height: '440px' }}>
                                <EChart
                                    ref={echartsRef}
                                    option={option}
                                    style={{ height: '100%', width: '100%' }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}
