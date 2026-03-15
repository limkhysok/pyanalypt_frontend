"use client";

import React, { useState, useEffect } from "react";
import { 
    Activity, Eye, ArrowRight, Zap, Info, Search, Filter, 
    BarChart3, Library, ChevronRight, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import ReactECharts from "echarts-for-react";
import { VISUALIZATIONS_CATALOG, SCENARIOS, ChartArchitecture } from "@/lib/visualizations-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Mock ECharts Engine (Shared with ProjectDetailPage logic) ---
const getExampleChartOption = (type: string) => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const base = {
        backgroundColor: 'transparent',
        grid: { top: 40, right: 20, bottom: 40, left: 40, containLabel: true },
        textStyle: { fontFamily: 'inherit', color: '#94a3b8' },
        tooltip: { show: true, trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', textStyle: { color: '#fff' } },
    };

    switch(type) {
        case 'alluvial':
            return {
                ...base,
                series: [{
                    type: 'sankey',
                    layout: 'none',
                    emphasis: { focus: 'adjacency' },
                    data: [{ name: 'A' }, { name: 'B' }, { name: 'C1' }, { name: 'C2' }],
                    links: [
                        { source: 'A', target: 'C1', value: 5 },
                        { source: 'A', target: 'C2', value: 3 },
                        { source: 'B', target: 'C1', value: 8 }
                    ],
                    lineStyle: { color: 'gradient', curveness: 0.5 }
                }]
            };
        case 'arc':
            return {
                ...base,
                series: [{
                    type: 'graph',
                    layout: 'none',
                    circular: { rotateLabel: true },
                    data: [0, 1, 2, 3, 4].map(i => ({ id: i, name: i, value: i * 10, x: i * 100, y: 0 })),
                    links: [{ source: 0, target: 2 }, { source: 1, target: 3 }, { source: 0, target: 4 }],
                    lineStyle: { curveness: 0.8, color: colors[0], width: 2 }
                }]
            };
        default:
            return {
                ...base,
                xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], axisLine: { lineStyle: { color: '#333' } } },
                yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } } },
                series: [{
                    data: [150, 230, 224, 218, 135],
                    type: 'line',
                    smooth: true,
                    areaStyle: { opacity: 0.2 },
                    itemStyle: { color: '#3b82f6' }
                }]
            };
    }
};

export function VisualizationsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const chartId = searchParams?.get('chart');
    const [searchTerm, setSearchTerm] = useState("");
    
    // Active chart state
    const activeChart = VISUALIZATIONS_CATALOG.find(c => c.id === chartId) || null;

    const filteredCatalog = VISUALIZATIONS_CATALOG.filter(c => 
        c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background pt-24 pb-12 px-6 md:px-12 flex flex-col gap-12 max-w-[1600px] mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-border/40 pb-12">
                <div className="space-y-4 max-w-2xl text-left">
                    <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 bg-primary/10 text-primary tracking-widest text-[10px] font-black uppercase">
                        Global Architecture Registry
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                        Visual Discovery <span className="text-primary">Lab</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                        Explore 30+ cutting-edge chart architectures. Select an evolution from the sidebar or browse the catalog below to inspect visual specimens.
                    </p>
                </div>
                
                {!activeChart && (
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search catalog..." 
                            className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl focus:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                {activeChart && (
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/templates')}
                        className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-border/40 hover:bg-muted/40"
                    >
                        Close Specimen
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {activeChart ? (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                        {/* Detail View */}
                        <div className="lg:col-span-12">
                            <Card className="border-border/40 shadow-3xl rounded-[3.5rem] overflow-hidden bg-background/5 backdrop-blur-3xl p-12 space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="p-8 bg-primary/20 rounded-[2.5rem] shadow-2xl">
                                                <activeChart.icon className="h-12 w-12 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-6xl font-black tracking-tighter uppercase">{activeChart.label}</h2>
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {activeChart.scenarios.map(sc => (
                                                        <Badge key={sc} variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary/60 px-4 py-1.5 rounded-full">SCENARIO: {sc}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Info className="h-4 w-4 text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Architectural Description</span>
                                            </div>
                                            <p className="text-2xl text-muted-foreground/80 font-medium leading-relaxed border-l-4 border-primary/20 pl-8">
                                                {activeChart.desc}
                                            </p>
                                        </div>
                                        <div className="pt-12 border-t border-border/10 flex gap-4">
                                            <Button size="lg" className="h-16 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all duration-500" onClick={() => router.push('/project')}>
                                                Use in Project <ArrowRight className="ml-3 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 ml-2">
                                            <Eye className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Visual Specimen</span>
                                        </div>
                                        <div className="rounded-[4rem] bg-muted/10 border border-border/20 p-12 h-[600px] flex items-center justify-center relative overflow-hidden group shadow-inner">
                                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/5 to-transparent" />
                                            <ReactECharts
                                                option={getExampleChartOption(activeChart.id)}
                                                style={{ height: '100%', width: '100%' }}
                                                theme="dark"
                                                key={activeChart.id}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {filteredCatalog.map((chart, i) => (
                            <motion.div
                                key={chart.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => router.push(`/templates?chart=${chart.id}`)}
                                className="group cursor-pointer"
                            >
                                <Card className="h-full border-border/30 bg-muted/5 backdrop-blur-sm rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                                    <div className="p-8 h-full flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                                <chart.icon size={24} />
                                            </div>
                                            <Sparkles className="h-4 w-4 text-primary/20 group-hover:text-primary transition-colors duration-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">{chart.label}</h3>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[8px] font-bold border-muted-foreground/20 text-muted-foreground uppercase">{chart.scenarios[0]}</Badge>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground/70 font-medium line-clamp-2 leading-relaxed">
                                            {chart.desc}
                                        </p>
                                        <div className="mt-auto pt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                                            Inspect Architecture <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
