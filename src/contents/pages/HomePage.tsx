"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { HeroSection, FeatureSection } from "@/contents/pages/LandingSections";
import { Sparkles, Activity, Database, Server, Zap, ArrowRight } from "lucide-react";

import { LogoTicker } from "@/components/ui/logo-ticker";
import { CTASection } from "@/components/layout/CTASection";

// Direct imports for the logic being moved in
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";

import { FileText, MoreHorizontal, Download, Globe, Clock, Layout, BarChart2 } from "lucide-react";



import { Search, History, TrendingUp, Compass } from "lucide-react";

function AnalysisFeatures() {
    const analysisTypes = [
        {
            title: "Descriptive",
            question: "What happened?",
            desc: "Analyze snapshots of historical data to understand trends and surface-level performance metrics.",
            icon: History,
            color: "from-blue-500/20 to-cyan-500/20"
        },
        {
            title: "Diagnostic",
            question: "Why it happened?",
            desc: "Dig deeper into data relationships to uncover the root causes of specific anomalies or successes.",
            icon: Search,
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Predictive",
            question: "What will happen?",
            desc: "Use machine learning models to forecast future trends based on patterns found in current data.",
            icon: TrendingUp,
            color: "from-orange-500/20 to-red-500/20"
        },
        {
            title: "Prescriptive",
            question: "What to do?",
            desc: "Get actionable advice on the best course of action to optimize outcomes and mitigate risks.",
            icon: Compass,
            color: "from-emerald-500/20 to-teal-500/20"
        }
    ];

    return (
        <div className="py-12 space-y-10">
            <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight px-4">Core Analysis Capabilities</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg px-4">
                    Discover how PyAnalypt handles every stage of the data lifecycle, from understanding the past to optimizing the future.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {analysisTypes.map((type, i) => (
                    <TiltCard key={i} className="border-0 group" classNameContent="p-8 h-full flex flex-col items-start gap-6 bg-background/40 backdrop-blur-sm rounded-lg">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${type.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                            <type.icon className="w-8 h-8 text-foreground" />
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{type.title}</h3>
                                <p className="text-primary font-bold text-xs tracking-[0.2em] uppercase">{type.question}</p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {type.desc}
                            </p>
                        </div>
                    </TiltCard>
                ))}
            </div>
        </div>
    );
}

function VisualizationPanel() {
    // 1. Line Chart: Growth
    const lineOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', backgroundColor: '#18181b', borderColor: '#3f3f46', textStyle: { color: '#f4f4f5' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{ type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#71717a', fontSize: 10 } }],
        yAxis: [{ type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#71717a', fontSize: 10 } }],
        series: [{ name: 'Growth', type: 'line', smooth: true, lineStyle: { width: 2, color: '#20BEFF' }, showSymbol: false, areaStyle: { opacity: 0.1, color: '#20BEFF' }, data: [420, 932, 901, 1234, 1290, 1530, 2120] }]
    };

    // 2. Scatter Plot: Correlation
    const scatterData = Array.from({ length: 40 }, () => [Math.random() * 100, Math.random() * 100]);
    const scatterOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', backgroundColor: '#18181b', borderColor: '#3f3f46', textStyle: { color: '#f4f4f5' } },
        xAxis: { splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#71717a', fontSize: 10 } },
        yAxis: { splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#71717a', fontSize: 10 } },
        series: [{ symbolSize: 10, data: scatterData, type: 'scatter', itemStyle: { color: '#20BEFF', opacity: 0.6 } }]
    };

    // 3. Bubble Chart: Multivariate
    const bubbleData = [
        [10.0, 8.04, 10, 'A'], [8.07, 6.95, 20, 'B'], [13.0, 7.58, 30, 'C'], [9.05, 8.81, 15, 'D'], [11.0, 8.33, 25, 'E'], [14.0, 7.66, 40, 'F'], [12.5, 6.82, 35, 'G']
    ];
    const bubbleOption = {
        backgroundColor: 'transparent',
        xAxis: { axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#71717a', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
        yAxis: { axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#71717a', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
        series: [{
            data: bubbleData, type: 'scatter', symbolSize: (data: any) => data[2],
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(32, 190, 255, 0.3)', color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{ offset: 0, color: 'rgb(129, 227, 255)' }, { offset: 1, color: 'rgb(32, 190, 255)' }]) }
        }]
    };

    const charts = [
        { title: "Retention Analysis", type: "Line Chart", option: lineOption, icon: TrendingUp, desc: "Monitors user lifecycle and engagement over time.", insight: "High recurring traffic detected in Q2." },
        { title: "Price-Demand Correlation", type: "Scatter Plot", option: scatterOption, icon: Search, desc: "Identifies statistical relationships between variables.", insight: "Positive correlation between price and demand." },
        { title: "Market Segment Density", type: "Bubble Chart", option: bubbleOption, icon: Database, desc: "Visualizes multivariate data for market clusters.", insight: "Segment G shows highest revenue density." },
    ];

    return (
        <div className="space-y-6 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {charts.map((chart, i) => (
                    <TiltCard key={i} className="border-0 group" classNameContent="p-0 bg-background/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5 flex flex-col">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-bold text-foreground tracking-tight">{chart.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">{chart.type}</span>
                                </div>
                            </div>
                            <chart.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="relative">
                                <ReactECharts option={chart.option} style={{ height: '220px', width: '100%' }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-2 px-1 pb-4">
                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    "{chart.desc}"
                                </p>
                                <div className="bg-secondary/20 p-2.5 rounded-md border border-white/5 group-hover:border-primary/20 transition-all">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Key Insight</p>
                                    <p className="text-[11px] text-foreground/80 leading-snug">{chart.insight}</p>
                                </div>
                            </div>
                        </CardContent>
                    </TiltCard>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Button variant="outline" className="gap-2 rounded-full px-8 hover:bg-secondary/80 transition-colors" asChild>
                    <a href="/templates">
                        Explore More Benchmarks <ArrowRight size={16} />
                    </a>
                </Button>
            </div>
        </div>
    );
}


// --- Main HomePage Component ---

export function HomePage() {
    const scrollToVisuals = () => {
        const element = document.getElementById('visuals-section');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/10">

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[20%] left-[20%] w-[800px] h-[800px] bg-foreground/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/40 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">

                {/* 1. Hero Section */}
                <HeroSection onStart={scrollToVisuals} />

                {/* 2. Technologies Ticker */}
                <LogoTicker />

                {/* 3. Sample Visualizations (Scroll Reveal) */}
                <div id="visuals-section" className="max-w-[1400px] mx-auto px-6 py-16 space-y-8">
                    <div className="text-center mb-8 space-y-3">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Stunning Visualizations</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            PyAnalypt uses Apache ECharts to render high-performance, interactive charts that help you make sense of your data instantly.
                        </p>
                    </div>

                    <ScrollReveal>
                        <div className="space-y-6">
                            <VisualizationPanel />
                        </div>
                    </ScrollReveal>
                </div>

                {/* 4. Features Section - Global Analytics Types */}
                <div className="max-w-[1400px] mx-auto px-6">
                    <ScrollReveal>
                        <AnalysisFeatures />
                    </ScrollReveal>
                </div>

                {/* 5. Features Grid - Platform Capabilities */}
                <div className="max-w-[1400px] mx-auto px-6 pb-16">
                    <FeatureSection />
                </div>

                {/* 5. Final CTA */}
                <CTASection onAction={scrollToVisuals} />

            </div>
        </main>
    );
}
