"use client";

import React, { useState, Suspense } from "react";
import {
    Info, Search, ChevronRight, BarChart2,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useSearchParams, useRouter } from "next/navigation";
import EChart from "@/components/ui/EChart";
import { VISUALIZATIONS_CATALOG } from "@/lib/visualizations-data";
import sampleData from "@/lib/sample_visuals_data.json";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Mock ECharts Engine ---
const getExampleChartOption = (type: string) => {
    const data = (sampleData as any)[type];
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    const base = {
        backgroundColor: 'transparent',
        grid: { top: 40, right: 30, bottom: 40, left: 50, containLabel: true },
        textStyle: { fontFamily: 'inherit', color: '#94a3b8' },
        tooltip: {
            show: true,
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            textStyle: { color: '#fff' },
            padding: 10,
            borderRadius: 8
        },
    };

    if (!data) {
        return {
            ...base,
            xAxis: { type: 'category', data: ['No Data'] },
            yAxis: { type: 'value' },
            series: [{ type: 'line', data: [0] }]
        };
    }

    switch (type) {
        case 'bar':
            return {
                ...base,
                xAxis: { type: 'category', data: data.categories, axisLine: { lineStyle: { color: '#333' } } },
                yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } } },
                series: [{ data: data.values, type: 'bar', itemStyle: { borderRadius: [8, 8, 0, 0], color: colors[0] } }]
            };
        case 'line':
            return {
                ...base,
                xAxis: { type: 'category', data: data.categories, axisLine: { lineStyle: { color: '#333' } } },
                yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } } },
                series: [{ data: data.values, type: 'line', smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: colors[0] } }]
            };
        case 'stacked_bar':
            return {
                ...base,
                xAxis: { type: 'category', data: data.categories },
                yAxis: { type: 'value' },
                series: data.series.map((s: any, i: number) => ({
                    ...s,
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: colors[i % colors.length] }
                }))
            };
        case 'pie':
            return {
                ...base,
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
                    data: data.data
                }]
            };
        case 'bubble':
            return {
                ...base,
                xAxis: { splitLine: { lineStyle: { type: 'dashed', color: '#222' } } },
                yAxis: { splitLine: { lineStyle: { type: 'dashed', color: '#222' } } },
                series: [{
                    data: data.data,
                    type: 'scatter',
                    symbolSize: (val: any) => val[2] / 2,
                    itemStyle: { color: colors[2], opacity: 0.6 }
                }]
            };
        case 'radar':
            return {
                ...base,
                radar: {
                    indicator: data.indicators.map((name: string) => ({ name, max: 100 })),
                    splitArea: { show: false },
                    axisLine: { lineStyle: { color: '#333' } },
                    splitLine: { lineStyle: { color: '#333' } }
                },
                series: [{ name: 'Ability', type: 'radar', data: [{ value: data.values, name: 'Specimen', areaStyle: { color: colors[1], opacity: 0.3 } }], itemStyle: { color: colors[1] } }]
            };
        case 'sankey':
        case 'alluvial':
            return {
                ...base,
                series: [{
                    type: 'sankey',
                    layout: 'none',
                    emphasis: { focus: 'adjacency' },
                    data: data.data,
                    links: data.links,
                    lineStyle: { color: 'gradient', curveness: 0.5 }
                }]
            };
        case 'multi_bar':
            return {
                ...base,
                xAxis: { type: 'category', data: data.categories },
                yAxis: { type: 'value' },
                series: data.series.map((s: any, i: number) => ({ ...s, type: 'bar', itemStyle: { color: colors[i % colors.length] } }))
            };
        case 'treemap':
            return {
                ...base,
                series: [{ type: 'treemap', data: data.data, label: { show: true, formatter: '{b}' } }]
            };
        case 'stream':
        case 'streamgraph':
            return {
                ...base,
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
                xAxis: { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value' },
                series: data.data.map((d: any, i: number) => ({
                    name: `Layer ${i + 1}`,
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: { width: 0 },
                    showSymbol: false,
                    areaStyle: { opacity: 0.8, color: colors[i % colors.length] },
                    emphasis: { focus: 'series' },
                    data: d
                }))
            };
        case 'arc':
            return {
                ...base,
                xAxis: { show: false, min: -100, max: 700 },
                yAxis: { show: false, min: -100, max: 100 },
                series: [{
                    type: 'graph',
                    layout: 'none',
                    coordinateSystem: 'cartesian2d',
                    data: data.nodes.map((n: any) => ({ ...n, value: [n.id * 100, 0], symbolSize: 20, itemStyle: { color: colors[0] } })),
                    links: data.links.map((l: any) => ({ ...l, lineStyle: { curveness: 0.6, color: colors[1], width: 3, opacity: 0.7 } })),
                    edgeSymbol: ['none', 'arrow']
                }]
            };
        case 'slope':
        case 'slope_chart':
            return {
                ...base,
                xAxis: { type: 'category', data: ['Start', 'End'], boundaryGap: ['20%', '20%'] },
                yAxis: { type: 'value', show: false },
                series: data.data.map((d: any, i: number) => ({
                    name: d.name,
                    type: 'line',
                    data: [d.start, d.end],
                    label: { show: true, position: i % 2 === 0 ? 'top' : 'bottom' },
                    lineStyle: { width: 4, color: colors[i % colors.length] }
                }))
            };
        case 'sunburst':
            return {
                ...base,
                series: [{
                    type: 'sunburst',
                    data: [data],
                    radius: [0, '90%'],
                    label: { rotate: 'radial' }
                }]
            };
        case 'parallel':
        case 'parallel_coordinates':
            return {
                ...base,
                parallelAxis: [
                    { dim: 0, name: 'Price' },
                    { dim: 1, name: 'Net' },
                    { dim: 2, name: 'Amount' },
                    { dim: 3, name: 'Score', type: 'category', data: ['Excellent', 'Good', 'Average'] }
                ],
                parallel: { left: '10%', right: '15%', bottom: '10%', top: '15%' },
                series: { type: 'parallel', lineStyle: { width: 2, color: colors[0] }, data: data.data }
            };
        case 'box':
        case 'box_plot':
            return {
                ...base,
                xAxis: { type: 'category', data: ['Exp 1', 'Exp 2'] },
                yAxis: { type: 'value' },
                series: [{
                    name: 'boxplot',
                    type: 'boxplot',
                    data: data.data,
                    itemStyle: { borderColor: colors[0], color: colors[0], opacity: 0.5 }
                }]
            };
        case 'bump':
            return {
                ...base,
                xAxis: { type: 'category', data: data.years },
                yAxis: { type: 'value', inverse: true, min: 1 },
                series: data.brands.map((b: any, i: number) => ({
                    name: b.name,
                    type: 'line',
                    data: b.ranks,
                    smooth: true,
                    lineStyle: { width: 4 },
                    symbolSize: 10,
                    itemStyle: { color: colors[i % colors.length] }
                }))
            };
        case 'calendar':
            return {
                ...base,
                visualMap: { min: 0, max: 100, type: 'continuous', orient: 'horizontal', left: 'center', bottom: '5%', textStyle: { color: '#fff' } },
                calendar: { top: 80, left: 30, right: 30, cellSize: ['auto', 20], range: '2023', itemStyle: { borderWidth: 0.5 }, yearLabel: { show: false } },
                series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: data.data }]
            };
        case 'chord':
            return {
                ...base,
                series: [{
                    type: 'graph',
                    layout: 'circular',
                    data: [
                        { name: 'A', value: 10 }, { name: 'B', value: 20 },
                        { name: 'C', value: 30 }, { name: 'D', value: 40 }
                    ],
                    links: [
                        { source: 'A', target: 'B', value: 5 },
                        { source: 'B', target: 'C', value: 10 },
                        { source: 'C', target: 'D', value: 15 },
                        { source: 'D', target: 'A', value: 20 }
                    ],
                    lineStyle: { opacity: 0.3, curveness: 0.3, color: 'source' }
                }]
            };
        case 'circle_packing':
            return {
                ...base,
                series: [{
                    type: 'treemap',
                    data: [data],
                    leafDepth: 1,
                    itemStyle: { borderRadius: 10 },
                    label: { show: true }
                }]
            };
        case 'circular_dendrogram':
        case 'linear_dendrogram':
            return {
                ...base,
                series: [{
                    type: 'tree',
                    data: [data],
                    top: '18%',
                    bottom: '14%',
                    layout: type.includes('circular') ? 'radial' : 'orthogonal',
                    symbol: 'emptyCircle',
                    symbolSize: 7,
                    initialTreeDepth: 3,
                    label: { position: 'left', verticalAlign: 'middle', align: 'right' },
                    leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
                    emphasis: { focus: 'descendant' },
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750
                }]
            };
        case 'beeswarm':
            return {
                ...base,
                xAxis: { type: 'value', show: false },
                yAxis: { type: 'category', show: false },
                series: [{
                    type: 'scatter',
                    data: data.data,
                    symbolSize: 12,
                    itemStyle: { color: colors[2], opacity: 0.8, shadowBlur: 10, shadowColor: colors[2] }
                }]
            };
        case 'hexbin':
            return {
                ...base,
                xAxis: { type: 'value', show: false, min: 0, max: 12 },
                yAxis: { type: 'value', show: false, min: 0, max: 12 },
                series: [{
                    type: 'custom',
                    renderItem: (params: any, api: any) => {
                        const center = api.coord([api.value(0), api.value(1)]);
                        return {
                            type: 'polygon',
                            shape: {
                                points: [0, 60, 120, 180, 240, 300].map(angle => {
                                    const rad = (angle * Math.PI) / 180;
                                    return [center[0] + Math.cos(rad) * 20, center[1] + Math.sin(rad) * 20];
                                })
                            },
                            style: { fill: api.visual('color') }
                        };
                    },
                    data: data.data.map((d: any) => ({ value: d, itemStyle: { color: colors[0], opacity: 0.6 } }))
                }]
            };
        case 'violin':
            return {
                ...base,
                xAxis: { type: 'category', data: ['Class A', 'Class B'], axisLine: { lineStyle: { color: '#333' } } },
                yAxis: { type: 'value', min: 0, max: 10, splitLine: { lineStyle: { color: '#222' } } },
                series: data.data.map((d: any, i: number) => ({
                    type: 'custom',
                    renderItem: (params: any, api: any) => {
                        const x = api.coord([api.value(0), 0])[0];
                        const points = d.map((v: number, idx: number) => {
                            const y = api.coord([0, v])[1];
                            const offset = Math.sin((idx / (d.length - 1)) * Math.PI) * 40;
                            return [x + offset, y];
                        });
                        const pointsRev = [...points].reverse().map(p => [x * 2 - p[0], p[1]]);
                        return {
                            type: 'polygon',
                            shape: { points: [...points, ...pointsRev] },
                            style: { fill: api.visual('color') }
                        };
                    },
                    data: [[i, 5]],
                    itemStyle: { color: colors[i % colors.length], opacity: 0.5 }
                }))
            };
        case 'voronoi':
            return {
                ...base,
                xAxis: { type: 'value', show: false, min: 0, max: 500 },
                yAxis: { type: 'value', show: false, min: 0, max: 400 },
                series: [{
                    type: 'custom',
                    renderItem: (params: any, api: any) => {
                        const center = api.coord([api.value(0), api.value(1)]);
                        return {
                            type: 'polygon',
                            shape: {
                                points: [0, 72, 144, 216, 288, 360].map(a => {
                                    const r = (a * Math.PI) / 180;
                                    return [center[0] + Math.cos(r) * 45, center[1] + Math.sin(r) * 45];
                                })
                            },
                            style: { fill: api.visual('color') }
                        };
                    },
                    data: data.points.map((p: any) => ({ value: p, itemStyle: { color: colors[Math.floor(Math.random() * colors.length)], opacity: 0.5 } }))
                }]
            };
        case 'voronoi_treemap':
            return {
                ...base,
                series: [{
                    type: 'treemap',
                    data: data.data.map((d: any, i: number) => ({
                        name: d.name,
                        value: d.weight,
                        itemStyle: { color: colors[i % colors.length], borderRadius: 25 }
                    })),
                    label: { show: true, fontSize: 14, fontWeight: 'bold' },
                    breadcrumb: { show: false }
                }]
            };
        case 'contour':
            return {
                ...base,
                visualMap: { show: false, min: 0, max: 12, inRange: { color: ['#222', colors[0], colors[1]] } },
                xAxis: { type: 'category', data: ['0', '1', '2', '3'] },
                yAxis: { type: 'category', data: ['0', '1', '2', '3'] },
                series: [{
                    type: 'heatmap',
                    data: data.data,
                    itemStyle: { opacity: 0.5 }
                }]
            };
        case 'convex_hull':
            return {
                ...base,
                xAxis: { min: 0, max: 60 },
                yAxis: { min: 0, max: 60 },
                series: [
                    {
                        type: 'scatter',
                        data: data.points,
                        itemStyle: { color: colors[2], opacity: 1 },
                        symbolSize: 8
                    },
                    {
                        type: 'custom',
                        renderItem: (params: any, api: any) => {
                            const pts = data.points.map((p: any) => api.coord(p));
                            return {
                                type: 'polygon',
                                shape: { points: pts },
                                style: { fill: colors[2], stroke: colors[2], opacity: 0.2, lineWidth: 2 }
                            };
                        },
                        data: [[0, 0]]
                    }
                ]
            };
        case 'gantt':
            return {
                ...base,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params: any) => {
                        const p = params[0];
                        return `${p.name}<br/>Start: ${new Date(p.value[1]).toLocaleDateString()}<br/>End: ${new Date(p.value[2]).toLocaleDateString()}`;
                    }
                },
                grid: { ...base.grid, left: 100 },
                xAxis: { type: 'time', axisLine: { lineStyle: { color: '#333' } }, splitLine: { lineStyle: { color: '#222' } } },
                yAxis: { type: 'category', data: data.tasks.map((t: any) => t.name), axisLine: { lineStyle: { color: '#333' } }, splitLine: { show: false } },
                series: [{
                    type: 'custom',
                    renderItem: (params: any, api: any) => {
                        const categoryIndex = api.value(0);
                        const start = api.coord([api.value(1), categoryIndex]);
                        const end = api.coord([api.value(2), categoryIndex]);
                        const height = api.size([0, 1])[1] * 0.6;
                        return {
                            type: 'rect',
                            shape: {
                                x: start[0],
                                y: start[1] - height / 2,
                                width: Math.max(end[0] - start[0], 2),
                                height: height,
                                r: 5
                            },
                            style: { fill: api.visual('color') }
                        };
                    },
                    encode: { x: [1, 2], y: 0 },
                    data: data.tasks.map((t: any, i: number) => ({
                        name: t.name,
                        value: [i, new Date(t.start).getTime(), new Date(t.end).getTime()],
                        itemStyle: { color: colors[i % colors.length] }
                    }))
                }]
            };
        case 'horizon':
            return {
                ...base,
                xAxis: { type: 'category', data: data.data.map((_: any, i: number) => i) },
                yAxis: { type: 'value', show: false },
                series: [{
                    type: 'line',
                    data: data.data,
                    areaStyle: { opacity: 0.5 },
                    smooth: true,
                    lineStyle: { width: 0 },
                    itemStyle: { color: colors[1] }
                }]
            };
        case 'matrix':
            return {
                ...base,
                visualMap: {
                    min: 0,
                    max: 10,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '5%',
                    textStyle: { color: '#fff' }
                },
                xAxis: { type: 'category', data: ['X1', 'X2'] },
                yAxis: { type: 'category', data: ['Y1', 'Y2'] },
                series: [{
                    type: 'heatmap',
                    data: data.data,
                    label: { show: true },
                    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                }]
            };
        default:
            // Fallback for types not explicitly mapped but having some structure
            if (data.categories && data.values) {
                return {
                    ...base,
                    xAxis: { type: 'category', data: data.categories },
                    yAxis: { type: 'value' },
                    series: [{ data: data.values, type: 'line' }]
                };
            }
            return {
                ...base,
                xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar'], axisLine: { lineStyle: { color: '#333' } } },
                yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } } },
                series: [{ data: [150, 230, 224], type: 'line', smooth: true }]
            };
    }
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};



function VisualsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialChart = searchParams?.get('chart') || VISUALIZATIONS_CATALOG[0].id;
    const [activeChartId, setActiveChartId] = useState(initialChart);
    const [searchTerm, setSearchTerm] = useState("");
    const activeChart = VISUALIZATIONS_CATALOG.find(c => c.id === activeChartId) || VISUALIZATIONS_CATALOG[0];
    const filteredCatalog = VISUALIZATIONS_CATALOG.filter(c =>
        c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen pt-28 pb-16 px-6 relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-[-10%] left-1/4 w-150 h-150 bg-blue-500/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-1/4 w-150 h-150 bg-indigo-500/8 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6 max-w-3xl mx-auto pb-10 border-b border-border/10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                        <BarChart2 size={13} className="text-blue-500" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Chart Library
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                        50+ Chart Types,<br />
                        <span className="text-blue-600 dark:text-blue-400">All Powered by Your Data.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                        Browse our full visualization library. Every chart renders live from your data — no design tools, no code required.
                    </p>

                    {/* Search */}
                    <div className="relative group w-full max-w-lg mx-auto pt-2">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
                        <Input
                            placeholder="Search charts..."
                            className="pl-12 h-12 bg-background/60 border-border/20 rounded-2xl text-sm font-bold shadow-sm focus:border-blue-500/50 transition-all backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search chart types"
                        />
                        {searchTerm && (
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground opacity-50" aria-live="polite">
                                {filteredCatalog.length} found
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 items-start">

                    {/* Chart list */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-3 relative order-2 lg:order-1 max-h-[75vh] overflow-y-auto pr-1"
                        role="listbox"
                        aria-label="Chart types"
                    >
                        <div className="absolute left-9 top-8 bottom-8 w-px bg-linear-to-b from-blue-500/20 via-border/20 to-indigo-500/20 -z-10 hidden md:block" aria-hidden="true" />

                        {filteredCatalog.length === 0 && (
                            <output className="block py-12 text-center text-muted-foreground text-sm font-bold">
                                No charts matching &ldquo;{searchTerm}&rdquo;
                            </output>
                        )}

                        {filteredCatalog.map((chart) => {
                            const isActive = activeChartId === chart.id;
                            const ChartIcon = chart.icon;
                            return (
                                <motion.div
                                    key={chart.id}
                                    variants={itemVariants}
                                    onMouseEnter={() => setActiveChartId(chart.id)}
                                    onClick={() => router.push(`/visuals?chart=${chart.id}`, { scroll: false })}
                                    className="relative group cursor-pointer"
                                    role="option"
                                    aria-selected={isActive}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && router.push(`/visuals?chart=${chart.id}`, { scroll: false })}
                                >
                                    <div className={cn(
                                        "relative p-5 overflow-hidden rounded-4xl border backdrop-blur-xl transition-all duration-300",
                                        isActive
                                            ? "bg-background/80 border-blue-500/30 shadow-lg scale-[1.01]"
                                            : "bg-background/30 border-border/20 hover:bg-background/50 hover:border-border/40"
                                    )}>
                                        <div className="relative z-10 flex gap-4 items-center">
                                            <div className={cn(
                                                "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
                                                isActive ? "bg-blue-500/15 text-blue-500 border border-blue-500/30" : "bg-secondary/60 text-muted-foreground"
                                            )}>
                                                <ChartIcon className="w-5 h-5" aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={cn(
                                                    "text-base font-black tracking-tight truncate transition-colors",
                                                    isActive ? "text-foreground" : "text-foreground/70"
                                                )}>
                                                    {chart.label}
                                                </h3>
                                                <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest truncate">
                                                    {chart.scenarios[0]}
                                                </p>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-4 h-4 text-blue-500 transition-all duration-300 shrink-0",
                                                isActive ? "opacity-100" : "opacity-0 -translate-x-1 group-hover:opacity-30"
                                            )} aria-hidden="true" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Preview panel */}
                    <div className="lg:sticky lg:top-24 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="border-border/20 rounded-[2.5rem] overflow-hidden bg-background/60 backdrop-blur-2xl shadow-2xl">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeChart.id}
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="p-8 space-y-6"
                                    >
                                        {/* Chart header */}
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                                    <activeChart.icon className="h-6 w-6 text-blue-500" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black tracking-tight">{activeChart.label}</h2>
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                                                        Live Preview
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {activeChart.scenarios.slice(0, 2).map(sc => (
                                                    <Badge key={sc} variant="secondary" className="text-[8px] font-black uppercase px-3 py-1 rounded-full border border-border/20 bg-secondary/50">
                                                        {sc}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chart canvas */}
                                        <div className="rounded-4xl bg-zinc-900/50 border border-white/5 px-4 py-4 relative overflow-hidden" style={{ height: '360px' }}>
                                            <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-blue-500/8 to-transparent pointer-events-none" />
                                            <EChart
                                                option={getExampleChartOption(activeChart.id)}
                                                style={{ height: '100%', width: '100%' }}
                                                theme="dark"
                                                key={activeChart.id}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/10">
                                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                                {activeChart.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function VisualsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading charts…</p>
                </div>
            </div>
        }>
            <VisualsPageContent />
        </Suspense>
    );
}
