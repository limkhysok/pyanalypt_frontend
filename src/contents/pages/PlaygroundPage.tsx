"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Upload, FileJson, BarChart3, PieChart, LineChart, Play, Database, FileText, ArrowRight } from "lucide-react";
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

export function PlaygroundPage() {
    const [csvData, setCsvData] = useState(DEFAULT_CSV);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [error, setError] = useState<string | null>(null);

    // --- Parser Engine ---
    const parsedData = useMemo(() => {
        try {
            const rows = csvData.trim().split("\n");
            const headers = rows[0].split(",").map(h => h.trim());
            const body = rows.slice(1).map(row => row.split(",").map(cell => cell.trim()));

            // Identify numeric columns
            const categories = body.map(row => row[0]); // First column as Category
            const series: any[] = [];

            for (let i = 1; i < headers.length; i++) {
                const values = body.map(row => parseFloat(row[i]));
                series.push({
                    name: headers[i],
                    data: values
                });
            }

            setError(null);
            return { categories, series };
        } catch (e) {
            setError("Invalid CSV format. Please ensure comma-separated values.");
            return null;
        }
    }, [csvData]);

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
        <main className="min-h-screen bg-background text-foreground pt-24 pb-16 px-6 md:px-12 selection:bg-primary/20 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-[0.3em] uppercase">
                        <Zap size={14} className="fill-primary" /> Data Sandbox
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight italic">Interactive Playground</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Upload or paste your CSV datasets to see instant, high-performance ECharts visualizations.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Input Panel */}
                    <div className="xl:col-span-4 space-y-6">
                        <Card className="bg-card/40 backdrop-blur-xl border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> CSV Input
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <textarea
                                    className="w-full h-64 bg-secondary/20 rounded-xl p-4 text-xs font-mono outline-none border border-border focus:border-primary/50 transition-colors resize-none"
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    placeholder="Paste CSV here..."
                                />
                                {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Visualization</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'bar', icon: BarChart3 },
                                            { id: 'line', icon: LineChart },
                                            { id: 'pie', icon: PieChart }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setChartType(t.id as any)}
                                                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${chartType === t.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background border-border hover:border-primary/50 text-muted-foreground'}`}
                                            >
                                                <t.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full bg-foreground text-background font-bold tracking-tight rounded-xl hover:opacity-90">
                                    <Database size={16} className="mr-2" /> Sync Dataset
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Panel */}
                    <div className="xl:col-span-8 space-y-6">
                        <Card className="h-full min-h-[500px] bg-card/60 backdrop-blur-3xl border-2 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col">
                            <CardHeader className="border-b border-border flex flex-row items-center justify-between p-8">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black italic tracking-tight">Active Rendering</CardTitle>
                                    <p className="text-xs text-muted-foreground">ECharts Canvas v6.0 • Low Latency</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Sync</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-8 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                                <div className="w-full h-[400px]">
                                    <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
