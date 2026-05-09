"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { BarChart3, PieChart, LineChart, FileText, Shield, Lock, Copy, Check, Sun, Moon, Table, LayoutGrid, Plus, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const EChart = dynamic(() => import("@/components/ui/EChart"), { ssr: false });
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EChartInstance } from "@/components/ui/EChart";
import * as echarts from "echarts";

// --- Default Sample Data ---
const DEFAULT_CSV = `Month,Revenue,Users\nJan,1200,450\nFeb,2100,890\nMar,1800,1200\nApr,2400,1500\nMay,2900,1800\nJun,3500,2200`;

const MAX_CHARS = 10000;

const TEMPLATES = [
    { name: "Sales Growth", data: "Month,Revenue,Users\nJan,1200,450\nFeb,2100,890\nMar,1800,1200\nApr,2400,1500\nMay,2900,1800\nJun,3500,2200" },
    { name: "Web Traffic", data: "Source,Daily,Weekly\nDirect,450,3200\nSearch,1200,8400\nSocial,800,5600\nReferral,300,2100" },
    { name: "Crypto Pulse", data: "Token,Price,Vol_24h\nBTC,64200,45\nETH,3450,28\nSOL,145,12\nDOT,8,5" },
];

export default function Playground() {
    const [mounted, setMounted] = useState(false);
    const [csvData, setCsvData] = useState(DEFAULT_CSV);
    const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
    const [viewMode, setViewMode] = useState<"raw" | "table">("raw");
    const [isDragging, setIsDragging] = useState(false);
    const [exportTheme, setExportTheme] = useState<"light" | "dark">("dark");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const echartsRef = useRef<EChartInstance | null>(null);

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
            const headers = rows[0].split(",").map((h: string) => h.trim());
            const body = rows.slice(1).map((row: string) => row.split(",").map((cell: string) => cell.trim()));
            const categories = body.map((row: string[]) => row[0]);
            const series: { name: string; data: number[] }[] = [];
            for (let i = 1; i < headers.length; i++) {
                series.push({
                    name: headers[i],
                    data: body.map((row: string[]) => {
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
        if (!instance) return;
        const url = instance.getDataURL({ 
            type: type, 
            pixelRatio: 2, 
            backgroundColor: exportTheme === 'dark' ? '#09090b' : '#ffffff' 
        });
        const link = document.createElement('a');
        link.href = url;
        link.download = `pyanalypt-playground-${Date.now()}.${type}`;
        link.click();
    };

    const handleCopyToClipboard = async () => {
        if (!echartsRef.current) return;
        const instance = echartsRef.current.getEchartsInstance();
        if (!instance) return;
        const dataUrl = instance.getDataURL({ 
            type: 'png', 
            pixelRatio: 2, 
            backgroundColor: exportTheme === 'dark' ? '#09090b' : '#ffffff' 
        });
        
        try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard Error:", err);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
            const text = await file.text();
            setCsvData(text);
        }
    };

    const bestFit = useMemo(() => {
        if (!parsedData) return "bar";
        if (parsedData.categories.length > 6) return "bar";
        if (parsedData.categories.length <= 6 && parsedData.series.length === 1) return "pie";
        return "line";
    }, [parsedData]);

    const option = useMemo<echarts.EChartsOption>(() => {
        if (!parsedData) return {};
        const { categories, series } = parsedData;

        const isPie = chartType === 'pie';

        return {
            animationDuration: 1000,
            animationEasing: 'cubicOut' as const,
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
                type: 'category' as const,
                data: categories,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#71717a', fontSize: 9 }
            },
            yAxis: isPie ? { show: false } : {
                type: 'value' as const,
                splitLine: { lineStyle: { color: 'rgba(59,130,246,0.05)' } },
                axisLabel: { color: '#71717a', fontSize: 9 }
            },
            series: isPie
                ? [{
                    name: series[0]?.name || 'Data',
                    type: 'pie' as const,
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#09090b',
                        borderWidth: 2
                    },
                    label: { show: false, position: 'center' as const },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' as const, color: '#ffffff' }
                    },
                    labelLine: { show: false },
                    data: categories.map((cat: string, idx: number) => ({
                        value: series[0]?.data[idx] || 0,
                        name: cat
                    })),
                    color: ['#3b82f6', '#60a5fa', '#a1a1aa', '#3f3f46', '#93c5fd']
                }]
                : series.map((s: { name: string; data: number[] }, i: number) => {
                    const colors = ['#3b82f6', '#a1a1aa', '#60a5fa'];
                    const itemColor = colors[i % colors.length];
                    return {
                        name: s.name,
                        type: chartType,
                        data: s.data,
                        smooth: true,
                        itemStyle: { color: itemColor, borderRadius: (chartType === 'bar' ? [3, 3, 0, 0] : 0) as number | number[] },
                        ...(chartType === 'line' ? {
                            lineStyle: { width: 2 },
                            areaStyle: {
                                color: {
                                    type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
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
        <main 
            className="min-h-screen bg-background relative selection:bg-blue-500/20 overflow-x-hidden pt-26 pb-16"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <AnimatePresence>
                {isDragging && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-blue-600/20 backdrop-blur-md flex items-center justify-center p-12 pointer-events-none"
                    >
                        <div className="w-full h-full border-4 border-dashed border-blue-500 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center animate-bounce">
                                <Plus size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">Drop CSV here to analyze.</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                            <div className="p-0 space-y-6 text-left flex-1 flex flex-col overflow-hidden">
                                <div className="h-full flex-1 flex flex-col relative group">
                                    <div className="absolute top-4 right-4 flex bg-background/50 backdrop-blur-md border border-border rounded-lg overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setViewMode('raw')}
                                            className={cn("p-2 transition-colors", viewMode === 'raw' ? "bg-blue-600 text-white" : "hover:bg-muted")}
                                        >
                                            <FileText size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('table')}
                                            className={cn("p-2 transition-colors", viewMode === 'table' ? "bg-blue-600 text-white" : "hover:bg-muted")}
                                        >
                                            <Table size={14} />
                                        </button>
                                    </div>

                                    {viewMode === 'raw' ? (
                                        <textarea
                                            className="w-full h-full flex-1 bg-transparent p-5 text-[11px] font-mono outline-none transition-all resize-none shadow-inner leading-relaxed"
                                            value={csvData}
                                            onChange={(e) => setCsvData(e.target.value)}
                                            spellCheck={false}
                                            placeholder="Paste CSV data here..."
                                        />
                                    ) : (
                                        <div className="flex-1 overflow-auto p-5 space-y-2">
                                            {csvData.split('\n').map((row, i) => {
                                                const rowKey = `row-${i}-${row.length}`;
                                                return (
                                                    <div key={rowKey} className="flex gap-2">
                                                        {row.split(',').map((cell, j) => (
                                                            <input 
                                                                key={`cell-${rowKey}-${j}`}
                                                                className="flex-1 min-w-[80px] bg-muted/20 border border-border/40 rounded px-2 py-1 text-[10px] focus:bg-background focus:border-blue-500/40 outline-none transition-all"
                                                                value={cell}
                                                                onChange={(e) => {
                                                                    const newRows = csvData.split('\n');
                                                                    const cells = newRows[i].split(',');
                                                                    cells[j] = e.target.value;
                                                                    newRows[i] = cells.join(',');
                                                                    setCsvData(newRows.join('\n'));
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                        <p className="text-red-500 text-[9px] font-black capitalize tracking-widest">{error}</p>
                                    </div>
                                )}

                                <div className="p-5 pt-0 space-y-3">
                                    <h3 className="text-[9px] font-black capitalize tracking-widest text-muted-foreground opacity-50">Engine Mode</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'bar', icon: BarChart3, label: 'BAR' },
                                            { id: 'line', icon: LineChart, label: 'LINE' },
                                            { id: 'pie', icon: PieChart, label: 'PIE' },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setChartType(t.id as "bar" | "line" | "pie")}
                                                className={cn(
                                                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                                                    chartType === t.id
                                                        ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md scale-[1.02]"
                                                        : "bg-muted/30 border-border/60 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                {bestFit === t.id && (
                                                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[6px] font-black text-white shadow-sm animate-pulse">
                                                       BEST FIT
                                                    </div>
                                                )}
                                                <t.icon size={16} />
                                                <span className="text-[8px] font-black tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Local Thread Reassurance */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowPrivacy(!showPrivacy)}
                                className="mt-4 px-5 py-3 rounded-xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm flex items-center justify-center gap-2 group hover:border-blue-500/30 transition-all w-full"
                            >
                                <Shield size={12} className="text-emerald-500 animate-pulse" />
                                <p className="text-[9px] text-muted-foreground font-medium leading-relaxed opacity-60 text-center">
                                    Local thread processing — zero data leakage.
                                </p>
                            </button>

                            <AnimatePresence>
                                {showPrivacy && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 right-0 mb-4 z-[60] bg-background border border-border/60 rounded-2xl p-4 shadow-2xl"
                                    >
                                        <button 
                                            onClick={() => setShowPrivacy(false)}
                                            className="absolute top-3 right-3 text-muted-foreground/40 hover:text-foreground transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Lock size={14} className="text-emerald-500" />
                                                <h4 className="text-xs font-black uppercase tracking-widest">Privacy Guard</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                                Everything happens in your browser. 0 bytes are transmitted to any external server. Your data stays yours.
                                            </p>
                                            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                                <span className="text-[8px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">Encrypted Local Storage</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                <div className="flex bg-muted/40 border border-border/40 rounded-lg p-0.5">
                                    <button 
                                        onClick={() => setExportTheme('light')}
                                        className={cn("p-1.5 rounded-md transition-all", exportTheme === 'light' ? "bg-white text-blue-600 shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
                                    >
                                        <Sun size={12} />
                                    </button>
                                    <button 
                                        onClick={() => setExportTheme('dark')}
                                        className={cn("p-1.5 rounded-md transition-all", exportTheme === 'dark' ? "bg-zinc-900 text-blue-400 shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
                                    >
                                        <Moon size={12} />
                                    </button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-[9px] font-black tracking-widest border-border/40 hover:bg-muted hover:border-blue-500/30 dark:hover:border-blue-400/30 capitalize px-4 transition-colors"
                                    onClick={() => handleExport('svg')}
                                >
                                    SVG
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-[9px] font-black tracking-widest border-border/40 hover:bg-muted hover:border-blue-500/30 dark:hover:border-blue-400/30 capitalize px-4 transition-colors gap-2"
                                    onClick={handleCopyToClipboard}
                                >
                                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                    {copied ? "COPIED" : "COPY"}
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

                        <div className="p-6 md:p-10 space-y-8 flex-1 flex flex-col relative overflow-hidden">
                            {csvData.trim() ? (
                                <>
                                    <div className="flex items-end justify-between border-b border-border/10 pb-4 shrink-0">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black tracking-tight text-foreground/90">Growth Telemetry</h3>
                                            <p className="text-[9px] font-bold text-muted-foreground/50 capitalize tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                                                {" "}Client Instance Active
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

                                    <motion.div 
                                        key={chartType + csvData.length}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full relative flex-1 min-h-[300px]"
                                    >
                                        <EChart
                                            ref={echartsRef}
                                            option={option}
                                            style={{ height: '300px', width: '100%' }}
                                        />
                                        <div className="absolute inset-0 pointer-events-none border border-dashed border-blue-500/10 dark:border-blue-400/10 rounded-xl" />
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center space-y-12"
                                >
                                    <div className="space-y-4 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto">
                                            <Sparkles size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black tracking-tighter">Ready for Intelligence.</h3>
                                            <p className="text-sm text-muted-foreground font-medium opacity-60">Paste your CSV or choose a high-performance template below.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                                        {TEMPLATES.map((t) => (
                                            <button 
                                                key={t.name}
                                                onClick={() => setCsvData(t.data)}
                                                className="group p-6 rounded-2xl bg-muted/20 border border-border/40 hover:border-blue-500/40 hover:bg-blue-50/10 transition-all text-left space-y-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center group-hover:text-blue-500 transition-colors">
                                                    <LayoutGrid size={16} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-black uppercase tracking-widest">{t.name}</h4>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed opacity-60">Optimized structure for {t.name.toLowerCase()} analysis.</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-dashed border-border/60 bg-muted/10 opacity-40">
                                        <ImageIcon size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Supports .csv, .txt, and Drag & Drop</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
