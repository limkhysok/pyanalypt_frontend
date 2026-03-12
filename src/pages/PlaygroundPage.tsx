"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Upload, FileJson, BarChart3, PieChart, LineChart, Play, Database, FileText, ArrowRight, Download } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Default Sample Data ---
const DEFAULT_CSV = `Month,Revenue,Users
Jan,1200,450
Feb,2100,890
Mar,1800,1200
Apr,2400,1500
May,2900,1800
Jun,3500,2200`;

const MAX_CHARS = 10000; // Protection Limit

export function PlaygroundPage() {
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
                    const val = parseFloat(row[i]);
                    return isNaN(val) ? 0 : val;
                });
                series.push({
                    name: headers[i],
                    data: values
                });
            }

            setError(null);
            return { categories, series };
        } catch (e) {
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
            series: series.map((s, i) => ({
                name: s.name,
                type: chartType,
                data: s.data,
                smooth: true,
                itemStyle: {
                    color: i === 0 ? '#20beff' : i === 1 ? '#818cf8' : '#10b981',
                    borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
                },
                ...(chartType === 'line' ? { areaStyle: { opacity: 0.1 } } : {})
            }))
        };
    }, [parsedData, chartType]);

    return (
        <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground pt-24 pb-12 px-6 md:px-12 selection:bg-primary/20 overflow-x-hidden relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                {/* Modern subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-[1500px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-fit p-1 rounded-full border border-border/50 bg-background/50 backdrop-blur-md shadow-sm"
                    >
                        <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] px-3 py-1 uppercase text-muted-foreground">
                            <Zap size={14} className="fill-primary text-primary animate-pulse" /> Data Sandbox
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]"
                    >
                        Interactive Playground
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="text-muted-foreground/80 text-base font-medium max-w-2xl leading-relaxed"
                    >
                        Open-access visualization tool. Paste your raw datasets to generate high-performance ECharts within client-side safety limits. No data leaves your browser.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                    className="grid grid-cols-1 xl:grid-cols-12 gap-8"
                >


                    {/* Input Panel */}
                    <div className="xl:col-span-4 space-y-6">
                        <Card className="bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-3 overflow-hidden transition-all duration-700 hover:border-primary/50 hover:ambient-glow-mono group">
                            <div className="bg-secondary/10 rounded-[2.5rem] border border-white/5 h-full p-6 transition-all duration-700 group-hover:bg-secondary/20">
                                <CardHeader className="p-0 pb-6 border-b border-border/40 mb-6">
                                    <CardTitle className="text-sm font-bold flex items-center justify-between font-mono">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-primary" /> CSV Raw Data
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded bg-background/50 border border-border/40 ${csvData.length > (MAX_CHARS * 0.8) ? 'text-red-500' : 'text-muted-foreground'}`}>
                                            {csvData.length} / {MAX_CHARS}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-6">
                                    <textarea
                                        className="w-full h-44 bg-background/60 rounded-[1.5rem] p-5 text-xs font-mono outline-none border border-border/50 focus:border-primary/70 focus:ring-4 ring-primary/10 transition-all resize-none shadow-inner"
                                        value={csvData}
                                        onChange={(e) => setCsvData(e.target.value)}
                                        placeholder="Paste CSV here... (e.g. Month, Value1, Value2)"
                                    />
                                    {error && (
                                        <div className="p-4 rounded-[1.5rem] bg-red-500/10 border border-red-500/20">
                                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">Architectural View</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'bar', icon: BarChart3 },
                                                { id: 'line', icon: LineChart },
                                                { id: 'pie', icon: PieChart }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setChartType(t.id as any)}
                                                    className={`p-4 rounded-[1.5rem] border flex items-center justify-center transition-all duration-500 ${chartType === t.id
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-[0_4px_20px_-5px_rgba(32,190,255,0.4)]'
                                                        : 'bg-background/50 border-border/40 hover:border-primary/50 text-muted-foreground hover:bg-secondary/40'
                                                        }`}
                                                >
                                                    <t.icon size={20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-[1.5rem] bg-secondary/20 border border-border/40 mt-4">
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            * No files allowed. Raw text processing only to maintain zero server-side overhead and maximum privacy.
                                        </p>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </div>

                    {/* Preview Panel */}
                    <div className="xl:col-span-8 space-y-6">
                        <Card className="h-full min-h-[500px] bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-3 overflow-hidden flex flex-col transition-all duration-700 hover:border-primary/50 hover:ambient-glow-blue group">
                            <div className="flex-1 bg-secondary/10 rounded-[2.5rem] border border-white/5 flex flex-col transition-all duration-700 group-hover:bg-secondary/20 relative overflow-hidden">

                                {/* Inner glow overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <CardHeader className="border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between p-8 relative z-10 gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                            Active Rendering <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        </CardTitle>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ECharts Canvas v6.0 • Client-Side Only</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full text-[10px] font-bold border-border/40 hover:bg-secondary/50 transition-all h-10 px-6 uppercase tracking-widest bg-background/50"
                                            onClick={() => handleExport('svg')}
                                        >
                                            <Download size={14} className="mr-2" /> SVG
                                        </Button>
                                        <Button
                                            className="rounded-full text-[10px] font-bold bg-foreground text-background hover:bg-primary transition-all duration-300 h-10 px-6 uppercase tracking-widest hover:ambient-glow-mono shadow-sm"
                                            onClick={() => handleExport('png')}
                                        >
                                            <Download size={14} className="mr-2" /> PNG
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-8 flex items-center justify-center relative z-10 min-h-[400px]">
                                    <div className="w-full h-full max-h-[500px] transition-transform duration-700 ease-out group-hover:scale-[1.02]">
                                        <ReactECharts
                                            ref={echartsRef}
                                            option={option}
                                            style={{ height: '100%', width: '100%' }}
                                        />
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
