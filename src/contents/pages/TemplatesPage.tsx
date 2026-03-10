"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
    BarChart3, BarChart, BarChart2, LineChart, PieChart, ScatterChart, AreaChart,
    Activity, CandlestickChart, Radar, TrendingUp, Grid3X3, Box,
    Layers, Share2, Zap, Target, Map as MapIcon, Calendar, Table, Filter,
    Layout, Network, Workflow, TrendingDown, Search, Database, Clock, Globe,
    MousePointer2, Percent, ArrowRight, Flame, Compass, Cpu, Briefcase,
    Glasses, HeartPulse, Gauge, Trello, MoreHorizontal, Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from "echarts-for-react";

// --- Global Config Helper for Export ---
const getChartConfig = (type: string, data: number[]) => {
    const colors = {
        primary: '#20beff',
        success: '#10b981',
        error: '#ef4444',
        purple: '#818cf8',
    };

    const common = {
        grid: { top: '15%', bottom: '15%', left: '10%', right: '10%', containLabel: false },
        xAxis: { show: false, type: 'category' },
        yAxis: { show: false, type: 'value', min: 0, max: 100 },
        animationDuration: 800,
        animationEasing: 'cubicOut' as const,
        backgroundColor: 'transparent',
    };

    switch (type) {
        case "Stacked Bar Chart":
            return {
                ...common,
                series: [
                    { type: 'bar', stack: 'total', data: data.map(v => v * 0.6), itemStyle: { color: colors.primary } },
                    { type: 'bar', stack: 'total', data: data.map(v => v * 0.4), itemStyle: { color: colors.purple } }
                ]
            };
        case "Grouped Bar Chart":
            return {
                ...common,
                series: [
                    { type: 'bar', data: data.map(v => v * 0.8), itemStyle: { color: colors.primary } },
                    { type: 'bar', data: data.map(v => v * 0.5), itemStyle: { color: colors.purple } }
                ]
            };
        case "Candlestick Chart":
            return {
                ...common,
                series: [{
                    type: 'candlestick',
                    data: data.map((v) => [v, v + (Math.random() * 10 - 5), v - 8, v + 8]),
                    itemStyle: { color: colors.success, color0: colors.error, borderColor: colors.success, borderColor0: colors.error }
                }]
            };
        case "Stacked Area Chart":
            return {
                ...common,
                series: [
                    { type: 'line', stack: 'total', areaStyle: { opacity: 0.5 }, data: data, smooth: true, showSymbol: false, itemStyle: { color: colors.primary } },
                    { type: 'line', stack: 'total', areaStyle: { opacity: 0.5 }, data: data.map(v => v * 0.5), smooth: true, showSymbol: false, itemStyle: { color: colors.purple } }
                ]
            };
        case "Line Chart":
            return {
                ...common,
                series: [{ type: 'line', data, smooth: true, showSymbol: false, lineStyle: { width: 3, color: colors.primary } }]
            };
        case "Scatter Plot":
            return {
                ...common,
                series: [{ type: 'scatter', data: data.map((v, i) => [i, v, Math.random() * 20]), symbolSize: (val: any) => val[2], itemStyle: { color: colors.primary, opacity: 0.6 } }]
            };
        case "Heatmap Matrix":
            return {
                ...common,
                xAxis: { show: false, type: 'category', data: [1, 2, 3, 4] },
                yAxis: { show: false, type: 'category', data: [1, 2, 3, 4] },
                series: [{
                    type: 'heatmap',
                    data: [0, 1, 2, 3].flatMap(x => [0, 1, 2, 3].map(y => [x, y, Math.floor(Math.random() * 100)])),
                    label: { show: false },
                    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                }],
                visualMap: { show: false, min: 0, max: 100, inRange: { color: ['rgba(32,190,255,0.1)', colors.primary] } }
            };
        case "Histogram":
            return {
                ...common,
                series: [{ type: 'bar', data: data, barCategoryGap: '0%', itemStyle: { color: colors.purple, opacity: 0.8 } }]
            };
        case "Box & Whisker":
            return {
                ...common,
                series: [{
                    type: 'boxplot',
                    data: [[20, 35, 50, 65, 85], [30, 45, 55, 70, 90], [15, 30, 45, 60, 80]],
                    itemStyle: { color: colors.primary, borderColor: colors.primary, borderWidth: 2 }
                }]
            };
        case "Treemap":
            return {
                ...common,
                series: [{
                    type: 'treemap',
                    data: [{ name: 'A', value: 40, children: [{ name: 'A1', value: 20 }, { name: 'A2', value: 20 }] }, { name: 'B', value: 30 }],
                    breadcrumb: { show: false },
                    itemStyle: { gapWidth: 2 }
                }]
            };
        case "Donut Chart":
            return {
                ...common,
                series: [{ type: 'pie', radius: ['40%', '70%'], data: data.slice(0, 5).map((v, i) => ({ value: v, name: i.toString() })), label: { show: false }, itemStyle: { borderRadius: 5 } }]
            };
        case "Radar Chart":
            return {
                ...common,
                radar: { indicator: [1, 2, 3, 4, 5].map(i => ({ name: '', max: 100 })), splitArea: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
                series: [{ type: 'radar', data: [{ value: data.slice(0, 5) }], itemStyle: { color: colors.primary }, areaStyle: { opacity: 0.3 } }]
            };
        case "Funnel Chart":
            return {
                ...common,
                series: [{ type: 'funnel', data: [80, 60, 40, 20].map(v => ({ value: v })), label: { show: false }, itemStyle: { opacity: 0.8 } }]
            };
        case "Waterfall Chart":
            return {
                ...common,
                series: [
                    {
                        type: 'bar',
                        stack: 'all',
                        itemStyle: { color: 'transparent', borderColor: 'transparent' },
                        emphasis: { itemStyle: { color: 'transparent', borderColor: 'transparent' } },
                        data: [0, data[0], data[0] + data[1], data[0] + data[1] + data[2], data[0] + data[1] + data[2] - data[3]]
                    },
                    {
                        type: 'bar',
                        stack: 'all',
                        data: [data[0], data[1], data[2], -data[3], -(data[0] + data[1] + data[2] - data[3])].map(v => ({
                            value: Math.abs(v),
                            itemStyle: { color: v >= 0 ? colors.success : colors.primary }
                        }))
                    }
                ]
            };
        case "Gauge Chart":
            return {
                ...common,
                series: [{ type: 'gauge', progress: { show: true }, detail: { show: false }, data: [{ value: data[data.length - 1] }], axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } }]
            };
        case "Sankey Diagram":
            return {
                ...common,
                series: [{
                    type: 'sankey',
                    left: '10%',
                    right: '10%',
                    top: '15%',
                    bottom: '15%',
                    data: [{ name: 'a' }, { name: 'b' }, { name: 'a1' }, { name: 'a2' }],
                    links: [{ source: 'a', target: 'a1', value: 5 }, { source: 'a', target: 'a2', value: 3 }, { source: 'b', target: 'a1', value: 8 }],
                    lineStyle: { color: 'source', curveness: 0.5 },
                    label: { show: false }
                }]
            };
        default:
            return {
                ...common,
                series: [{ type: 'line', data, smooth: true, itemStyle: { color: colors.primary } }]
            };
    }
};

// --- Realistic ECharts Discovery Component ---
const RealisticChart = ({ type, isHovered }: { type: string, isHovered: boolean }) => {
    const [data, setData] = useState(() => Array.from({ length: 14 }, () => 40 + Math.random() * 20));

    useEffect(() => {
        if (isHovered) {
            const interval = setInterval(() => {
                setData(prev => {
                    const last = prev[prev.length - 1];
                    const change = (Math.random() - 0.45) * 15;
                    const nextValue = Math.max(10, Math.min(90, last + change));
                    return [...prev.slice(1), nextValue];
                });
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isHovered]);

    const option = useMemo(() => getChartConfig(type, data), [type, data]);

    return (
        <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
        />
    );
};

// --- Template Data ---
const templates = [
    { name: "Stacked Bar Chart", category: "Comparison", desc: "Compare parts of a whole across different categories over time with layered volumetric depth." },
    { name: "Grouped Bar Chart", category: "Comparison", desc: "Directly compare multiple data series side-by-side with balanced analytical scaling." },
    { name: "Candlestick Chart", category: "Financial", desc: "Technical analysis of price movements over time with live market volatility simulation." },
    { name: "Stacked Area Chart", category: "Time Series", desc: "Track series that stack to show a total volume with layered depth and temporal flow." },
    { name: "Line Chart", category: "Time Series", desc: "Visualize trends and fluctuations over continuous intervals with smooth analytical paths." },
    { name: "Scatter Plot", category: "Correlation", desc: "Identify relationships and distribution patterns between variables with 3D depth markers." },
    { name: "Heatmap Matrix", category: "Correlation", desc: "Visualize data intensity across two dimensions using elevated 3D intensity tiles." },
    { name: "Histogram", category: "Statistical", desc: "Show frequency distribution of a continuous variable with volumetric density analysis." },
    { name: "Box & Whisker", category: "Statistical", desc: "Show quartiles, median, and outliers in a single volumetric view for distribution analysis." },
    { name: "Treemap", category: "Hierarchy", desc: "Display hierarchical data as nested volumetric rectangles with real-time proportional scaling." },
    { name: "Donut Chart", category: "Composition", desc: "A variation of the pie chart with a hollow core for detailed composition information." },
    { name: "Radar Chart", category: "Performance", desc: "Compare multiple quantitative variables on a spider-web metric plane for multivariate analysis." },
    { name: "Funnel Chart", category: "Conversion", desc: "Track stages in a process and identify conversion drop-offs in a perspective-balanced view." },
    { name: "Waterfall Chart", category: "Financial", desc: "Visualize cumulative effects of positive and negative values for profit and loss analysis." },
    { name: "Gauge Chart", category: "KPI", desc: "Display single metrics within predefined goal ranges with real-time indicator pulsing." },
    { name: "Sankey Diagram", category: "Flow", desc: "Visualize flows and their quantities between multiple stages in a weighted relational space." },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
};

export function VisualizationsPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground pt-32 pb-24 px-6 md:px-12 selection:bg-primary/20 overflow-x-hidden relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                {/* Modern subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-[1400px] mx-auto space-y-16">

                <div className="flex flex-col md:items-center text-center justify-center gap-6 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mx-auto w-fit p-1 rounded-full border border-border/50 bg-background/50 backdrop-blur-md shadow-sm"
                    >
                        <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] px-3 py-1.5 uppercase text-muted-foreground">
                            <Zap size={14} className="fill-primary text-primary animate-pulse" /> Visual Library
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="text-5xl md:text-[4rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1] pb-2"
                    >
                        Analytical Visualizations
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="text-muted-foreground/80 text-lg md:text-xl font-medium leading-relaxed"
                    >
                        Choose from our suite of high-performance, dynamic charts to unlock deep insights and reveal the hidden patterns within your datasets.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {templates.map((template, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="h-[400px]"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Nested Island Glass Structure */}
                            <div className="group relative w-full h-[400px] bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/30 transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 hover:bg-background/60">

                                {/* Inner Floating Island for the Chart */}
                                <div className="absolute top-3 left-3 right-3 h-[250px] bg-secondary/10 rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-700 group-hover:bg-secondary/30 group-hover:shadow-[inset_0_0_30px_rgba(32,190,255,0.05)]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    {/* Centered Chart with gentle scale on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-700 ease-out group-hover:scale-105">
                                        <div className="w-full h-full max-h-[200px]">
                                            <RealisticChart type={template.name} isHovered={hoveredIndex === i} />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Content Deck */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 flex flex-col justify-end pointer-events-none">
                                    <div className="flex flex-col transition-transform duration-700 ease-out group-hover:-translate-y-2">

                                        {/* Persistent Title */}
                                        <h3 className="text-xl font-black text-foreground tracking-tighter leading-tight transition-colors duration-700 group-hover:text-primary">
                                            {template.name}
                                        </h3>

                                        {/* Revealable Description using Grid trick for smooth height transition */}
                                        <div className="grid transition-all duration-700 grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100">
                                            <div className="overflow-hidden">
                                                <p className="mt-2 text-muted-foreground text-[12px] leading-relaxed font-medium line-clamp-2">
                                                    {template.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Border Ring */}
                                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary/20 rounded-[3rem] transition-colors duration-700" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </main>
    );
}
