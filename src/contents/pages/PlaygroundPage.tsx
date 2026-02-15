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
        <main className="min-h-screen bg-background text-foreground pt-20 pb-8 px-6 md:px-12 selection:bg-primary/20 overflow-x-hidden">
            <div className="max-w-[1500px] mx-auto space-y-6">

                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.3em] uppercase">
                        <Zap size={12} className="fill-primary" /> Data Sandbox
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight italic">Interactive Playground</h1>
                            <p className="text-muted-foreground text-sm max-w-xl">
                                Open-access visualization tool. Paste your raw datasets to generate high-performance ECharts within client-side safety limits.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Input Panel */}
                    <div className="xl:col-span-4 space-y-6">
                        <Card className="bg-card/40 backdrop-blur-xl border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden transition-all hover:border-primary/20">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-sm font-bold flex items-center justify-between font-mono">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-primary" /> CSV Raw Data
                                    </div>
                                    <span className={`text-[10px] ${csvData.length > (MAX_CHARS * 0.8) ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {csvData.length}/{MAX_CHARS}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <textarea
                                    className="w-full h-44 bg-secondary/10 rounded-xl p-4 text-xs font-mono outline-none border border-border focus:border-primary/50 transition-colors resize-none"
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    placeholder="Paste CSV here... (e.g. Month, Value1, Value2)"
                                />
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Architectural View</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'bar', icon: BarChart3 },
                                            { id: 'line', icon: LineChart },
                                            { id: 'pie', icon: PieChart }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setChartType(t.id as any)}
                                                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${chartType === t.id
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                        : 'bg-muted/50 border-input hover:border-primary/50 text-muted-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                <t.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-secondary/5 border border-border/50">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                        * No files allowed. Raw text processing only to maintain zero server-side overhead and maximum privacy.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Panel */}
                    <div className="xl:col-span-8 space-y-6">
                        <Card className="h-full min-h-[450px] bg-card/60 backdrop-blur-3xl border-2 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col transition-all hover:border-primary/20">
                            <CardHeader className="border-b border-border flex flex-row items-center justify-between p-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-black italic tracking-tight">Active Rendering</CardTitle>
                                    <p className="text-[10px] text-muted-foreground">ECharts Canvas v6.0 • Client-Side Only</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full text-[10px] font-bold border-border hover:bg-primary hover:text-white transition-all h-8 px-4 uppercase tracking-widest"
                                        onClick={() => handleExport('svg')}
                                    >
                                        <Download size={12} className="mr-1.5" /> SVG
                                    </Button>
                                    <Button
                                        className="rounded-full text-[10px] font-bold bg-foreground text-background hover:opacity-90 h-8 px-4 uppercase tracking-widest"
                                        onClick={() => handleExport('png')}
                                    >
                                        <Download size={12} className="mr-1.5" /> PNG
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                                <div className="w-full h-[350px]">
                                    <ReactECharts
                                        ref={echartsRef}
                                        option={option}
                                        style={{ height: '100%', width: '100%' }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
