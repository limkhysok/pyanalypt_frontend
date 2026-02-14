"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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

function StatsPanel() {
    const stats = [
        { label: "Total Rows", value: "24,593", icon: Database, color: "text-zinc-100" },
        { label: "Features", value: "18", icon: Server, color: "text-zinc-300" },
        { label: "Processing Time", value: "0.4s", icon: Zap, color: "text-white" },
        { label: "Health Score", value: "98%", icon: Activity, color: "text-zinc-200" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 animate-in slide-in-from-bottom duration-700 px-4">
            {stats.map((stat, i) => (
                <TiltCard key={i} className="border-0" classNameContent="p-6 flex items-center justify-between h-full bg-background/40 backdrop-blur-sm rounded-lg">
                    <div>
                        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{stat.label}</p>
                        <h4 className="text-2xl font-black mt-1 text-foreground">{stat.value}</h4>
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary/50 ${stat.color} border border-white/5 shadow-md group-hover:scale-110 transition-transform`}>
                        <stat.icon size={20} className="text-foreground" />
                    </div>
                </TiltCard>
            ))}
        </div>
    );
}

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
        <div className="py-24 space-y-16">
            <div className="text-center space-y-4">
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
    const lineOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { lineStyle: { color: 'var(--muted-foreground)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        }],
        yAxis: [{
            type: 'value',
            splitLine: { lineStyle: { color: 'var(--border)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        }],
        series: [
            {
                name: 'Sales', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#e4e4e7' }, { offset: 1, color: 'rgba(228, 228, 231, 0.01)' }]) },
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: 'Traffic', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false,
                areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#71717a' }, { offset: 1, color: 'rgba(113, 113, 122, 0.01)' }]) },
                data: [220, 182, 191, 234, 290, 330, 310]
            }
        ]
    };

    const barOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        xAxis: {
            type: 'category',
            data: ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'],
            axisLine: { lineStyle: { color: 'var(--muted-foreground)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'var(--border)' } },
            axisLabel: { color: 'var(--muted-foreground)' }
        },
        series: [{
            data: [120, 200, 150, 80, 70], type: 'bar',
            itemStyle: { borderRadius: [5, 5, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fafafa' }, { offset: 1, color: '#52525b' }]) },
            showBackground: true,
            backgroundStyle: { color: 'rgba(255, 255, 255, 0.05)', borderRadius: [5, 5, 0, 0] }
        }]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500 px-4">
            <TiltCard className="border-0" classNameContent="p-0 bg-background/40 backdrop-blur-sm rounded-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={lineOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </TiltCard>

            <TiltCard className="border-0" classNameContent="p-0 bg-background/40 backdrop-blur-sm rounded-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={barOption} style={{ height: '300px', width: '100%' }} />
                </CardContent>
            </TiltCard>

            <div className="lg:col-span-2 flex justify-center mt-4">
                <Button variant="outline" className="gap-2 rounded-full px-8 hover:bg-secondary/80 transition-colors" asChild>
                    <a href="/templates">
                        View All Templates <ArrowRight size={16} />
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
                <div id="visuals-section" className="max-w-[1400px] mx-auto px-6 py-24 space-y-12">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Stunning Visualizations</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            PyAnalypt uses Apache ECharts to render high-performance, interactive charts that help you make sense of your data instantly.
                        </p>
                    </div>

                    <ScrollReveal>
                        <div className="space-y-8">
                            <StatsPanel />
                            <VisualizationPanel />
                        </div>
                    </ScrollReveal>
                </div>

                {/* 3. Features Section - Global Analytics Types */}
                <div className="max-w-[1400px] mx-auto px-6">
                    <ScrollReveal>
                        <AnalysisFeatures />
                    </ScrollReveal>
                </div>

                {/* 4. Features Grid - Platform Capabilities */}
                <div className="max-w-[1400px] mx-auto px-6 pb-24">
                    <FeatureSection />
                </div>

                {/* 5. Final CTA */}
                <CTASection onAction={scrollToVisuals} />

            </div>
        </main>
    );
}
