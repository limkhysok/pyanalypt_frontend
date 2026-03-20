"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BarChart2, Search,
  TrendingUp, Database, ArrowRight, Sparkles,
  Globe, Target, Wand2, Brain,
  MessageSquareText, RefreshCcw
} from "lucide-react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";

// UI Components
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LogoTicker } from "@/components/ui/logo-ticker";
import { CTASection } from "@/components/layout/CTASection";
import { GithubIcon } from "@/components/ui/Icons";
import EChart from "@/components/ui/EChart";

// --- REDESIGNED Hero Section ---
interface HeroSectionProps {
  onStart: () => void;
}

function HeroSection({ onStart }: Readonly<HeroSectionProps>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[70vh]" />;

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden border-b border-border/10">
      {/* 1. Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Text Content - Left Side */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Next-Gen Data Engine
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
              Turn Raw Data <br />
              Into <span className="text-blue-600 dark:text-blue-400 italic">Actionable</span> <br />
              Intelligence.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed pt-2">
              PyAnalypt is the bridge between complex data science and intuitive business decisions. No configuration, just insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button
              onClick={onStart}
              className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2 w-full sm:w-auto"
            >
              Get Started Free <ArrowRight size={18} />
            </Button>

            <Link href="https://github.com/soklimkhy/pyanalypt" target="_blank" className="w-full sm:w-auto">
              <Button variant="ghost" className="h-14 px-8 rounded-xl border border-border/60 hover:bg-muted font-bold text-base transition-all flex items-center gap-2 w-full sm:w-auto">
                <GithubIcon size={18} /> Repository
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Visual Content - Right Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-6 relative group"
        >
          <div className="relative z-10 p-4 rounded-[2rem] border border-border/40 bg-background/50 backdrop-blur-3xl shadow-2xl overflow-hidden hover:ambient-glow-blue transition-all duration-700">
             <div className="aspect-[4/3] rounded-[1.5rem] bg-zinc-900/5 dark:bg-zinc-900/40 border border-border/10 flex flex-col p-4 space-y-4">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b border-border/10 pb-4">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/30" />
                   </div>
                   <div className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">
                      Dashboard Active
                   </div>
                </div>
                {/* Mock Content */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                   <div className="bg-blue-500/10 rounded-xl border border-blue-500/5 p-3 flex flex-col justify-end gap-2 group/card">
                      <div className="h-1.5 w-12 bg-blue-500/30 rounded-full" />
                      <div className="h-3 w-20 bg-blue-500/60 rounded-full" />
                   </div>
                   <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/5 p-3 flex flex-col justify-end gap-2">
                      <div className="h-1.5 w-12 bg-emerald-500/30 rounded-full" />
                      <div className="h-3 w-20 bg-emerald-500/60 rounded-full" />
                   </div>
                   <div className="col-span-2 bg-zinc-500/5 rounded-xl border border-border/10 p-3 flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                         <div className="w-6 h-6 rounded-lg bg-blue-500/20" />
                         <div className="h-2 w-24 bg-foreground/20 rounded-full" />
                      </div>
                      <div className="h-1.5 w-8 bg-foreground/10 rounded-full" />
                   </div>
                </div>
             </div>
          </div>
          {/* Decorative Floaters */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-6 p-4 rounded-3xl bg-background border border-border/40 shadow-xl z-20 hidden md:block"
          >
            <TrendingUp size={24} className="text-blue-500" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 p-4 rounded-3xl bg-background border border-border/40 shadow-xl z-20 hidden md:block"
          >
            <Database size={24} className="text-emerald-500" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
function ProductStory() {
  return (
    <div className="py-24 container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <ScrollReveal>
          <div className="space-y-6">
             <div className="w-12 h-1 bg-blue-600 rounded-full" />
             <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Why we built <br/> <span className="text-blue-600">PyAnalypt?</span>
             </h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
                Most data tools are either too complex for business users or too limited for power analysts. We built PyAnalypt to close that gap. By combining the power of a Python-driven backend with a sleek, real-time UI, we allow teams to move from <strong>raw data ingestion</strong> to <strong>boardroom-ready visuals</strong> in minutes.
             </p>
             <div className="pt-4 grid grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border/10">
                   <p className="text-4xl font-black text-blue-600 mb-1">01.</p>
                   <p className="font-bold text-sm uppercase tracking-widest opacity-70">No Setup</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border/10">
                   <p className="text-4xl font-black text-emerald-600 mb-1">02.</p>
                   <p className="font-bold text-sm uppercase tracking-widest opacity-70">AI Native</p>
                </div>
             </div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal>
          <div className="relative">
             <div className="aspect-square rounded-[3rem] bg-blue-600/5 border border-blue-500/10 flex items-center justify-center p-8">
                <Brain size={120} className="text-blue-500/20 absolute bottom-10 right-10" />
                <div className="space-y-8 relative z-10 w-full">
                   {[
                      { l: "Raw CSV/API", p: 30, c: "blue" },
                      { l: "Pattern Analysis", p: 65, c: "indigo" },
                      { l: "Final Visualization", p: 100, c: "emerald" }
                   ].map(bar => (
                      <div key={bar.l} className="space-y-2">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                            <span>{bar.l}</span>
                            <span>{bar.p}%</span>
                         </div>
                         <div className="h-4 bg-background/50 rounded-full overflow-hidden border border-border/10">
                            <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${bar.p}%` }}
                               transition={{ duration: 1.5, ease: "easeOut" }}
                               className={`h-full bg-${bar.c}-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

// --- Features Section Components ---
function PlatformFeatures() {
  const features = [
    { title: "Instant Visualization", desc: "Drag & drop CSVs to see immediate charts and graphs with zero latency.", icon: BarChart2 },
    { title: "AI-Driven Insights", desc: "Our engine automatically detects patterns, outliers, and anomalies in seconds.", icon: Sparkles },
    { title: "Export & Share", desc: "Download high-res reports or share dynamic interactive links with your team.", icon: Globe }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-4">
      {features.map((feature) => (
        <TiltCard key={feature.title} className="group border-0" classNameContent="p-10 rounded-3xl border border-border/10 dark:border-zinc-800 bg-background/50 backdrop-blur-xl hover:ambient-glow-blue transition-all h-full flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-secondary/30 mb-6 group-hover:scale-110 transition-transform duration-300">
            <feature.icon className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
        </TiltCard>
      ))}
    </div>
  );
}

function AnalysisFeatures() {
  const workflow = [
    { title: "Define Objective", question: "Step 1", desc: "Identify the problem and business goals for targeted analysis.", icon: Target, isOptional: false },
    { title: "Data Collection", question: "Step 2", desc: "Gather raw data from APIs, databases, and local files.", icon: Database, isOptional: false },
    { title: "Cleaning & Prep", question: "Step 3", desc: "Process and normalize data to ensure high-quality inputs.", icon: Wand2, isOptional: false },
    { title: "EDA", question: "Step 4", desc: "Uncover initial patterns and anomalies via statistical summaries.", icon: Search, isOptional: false },
    { title: "Modeling", question: "Step 5", desc: "Apply ML models or statistical methods for deeper insights.", icon: Brain, isOptional: "Optional" },
    { title: "Visualization", question: "Step 6", desc: "Communicate results via high-performance interactives.", icon: BarChart2, isOptional: false },
    { title: "Interpretation", question: "Step 7", desc: "Translate patterns into actionable business recommendations.", icon: MessageSquareText, isOptional: false },
    { title: "Feedback", question: "Step 8", desc: "Refine objectives based on results for continuous growth.", icon: RefreshCcw, isOptional: "Critical" }
  ];

  return (
    <div className="py-24 space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter px-4">Core Capabilities</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xl px-6">
          The complete Data Analyst Lifecycle, engineered for speed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        {workflow.map((step, idx) => (
          <div key={step.title} className="relative group">
            {/* Connection Arrow (XL screens) */}
            {idx % 4 !== 3 && idx < 7 && (
              <div className="hidden xl:flex absolute top-1/2 -right-6 -translate-y-1/2 z-20 items-center justify-center">
                 <ArrowRight className="text-blue-500/30 group-hover:text-blue-500/60 transition-colors w-5 h-5 translate-x-1" />
              </div>
            )}
            
            <TiltCard className="border-0 h-full" classNameContent="p-8 h-full flex flex-col items-start gap-6 bg-background/50 backdrop-blur-xl rounded-3xl border border-border/10 group-hover:ambient-glow-mono transition-all">
              <div className="flex justify-between items-start w-full">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  <step.icon size={28} />
                </div>
                {step.isOptional && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${step.isOptional === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {step.isOptional}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-blue-500 font-black text-[10px] tracking-[0.2em] uppercase opacity-70">{step.question}</p>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-blue-600 transition-colors leading-none">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm pt-2">
                  {step.desc}
                </p>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Visualization Panel ---
function VisualizationPanel() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const textColor = isDark ? '#a1a1aa' : '#52525b';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const axisLineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipBg = isDark ? '#09090b' : '#ffffff';
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7';
  const tooltipText = isDark ? '#f4f4f5' : '#18181b';

  const lineOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } }],
    yAxis: [{ type: 'value', splitLine: { lineStyle: { color: gridColor } }, axisLabel: { color: textColor, fontSize: 10 } }],
    series: [{ name: 'Growth', type: 'line', smooth: true, lineStyle: { width: 3, color: '#3b82f6' }, showSymbol: false, areaStyle: { opacity: 0.1, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: 'transparent' }]) }, data: [420, 932, 901, 1234, 1290, 1530, 2120] }]
  }), [isDark, tooltipBg, tooltipBorder, tooltipText, axisLineColor, textColor, gridColor]);

  const scatterData = useMemo(() => Array.from({ length: 40 }, () => [Math.random() * 100, Math.random() * 100]), []);
  const scatterOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText } },
    xAxis: { splitLine: { lineStyle: { color: gridColor } }, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
    yAxis: { splitLine: { lineStyle: { color: gridColor } }, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
    series: [{ symbolSize: 12, data: scatterData, type: 'scatter', itemStyle: { color: '#3b82f6', opacity: 0.7 } }]
  }), [isDark, tooltipBg, tooltipBorder, tooltipText, axisLineColor, textColor, gridColor, scatterData]);

  const bubbleData = [[10, 8.04, 20, 'A'], [8.07, 6.95, 40, 'B'], [13, 7.58, 60, 'C'], [9.05, 8.81, 30, 'D'], [11, 8.33, 50, 'E'], [14, 7.66, 80, 'F'], [12.5, 6.82, 70, 'G']];
  const bubbleOption = useMemo(() => ({
    backgroundColor: 'transparent',
    xAxis: { axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    yAxis: { axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    series: [{
      data: bubbleData, type: 'scatter', symbolSize: (data: any) => data[2] * 0.8,
      itemStyle: { shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.4)', color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: 'transparent' }]) }
    }]
  }), [isDark, axisLineColor, textColor, gridColor]);

  const charts = [
    { title: "Retention Flow", type: "Linear Trend", option: lineOption, icon: TrendingUp, insight: "High recurring traffic in Q2." },
    { title: "Cluster Density", type: "Scatter Map", option: scatterOption, icon: Search, insight: "Positive correlation detected." },
    { title: "Revenue Nodes", type: "Bubble Cluster", option: bubbleOption, icon: Database, insight: "Segment G node dominant." },
  ];

  return (
    <div id="visuals-section" className="max-w-[1500px] mx-auto px-6 py-24 space-y-16 relative">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter px-4">Interactive Canvas</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg px-6">
          Pro-grade visualizations, natively handled.
        </p>
      </div>

      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 px-4">
          {charts.map((chart) => (
            <TiltCard key={chart.title} className="border-0 group" classNameContent="p-0 bg-background/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-border/10 hover:ambient-glow-blue transition-all flex flex-col shadow-2xl">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black text-foreground tracking-tight">{chart.title}</CardTitle>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 border border-blue-500/10">{chart.type}</span>
                </div>
                <chart.icon className="w-6 h-6 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
              </CardHeader>
              <CardContent className="flex-1 space-y-6 px-8 pb-8 pt-0">
                <div className="relative rounded-3xl overflow-hidden bg-secondary/20 dark:bg-black/40 border border-border/10 p-2">
                  <EChart option={chart.option} theme={resolvedTheme} style={{ height: '240px', width: '100%' }} />
                </div>
                <div className="bg-secondary/40 p-5 rounded-2xl border border-border/20 group-hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em] mb-2">Platform Insight</p>
                  <p className="text-sm font-medium text-foreground/80 leading-snug">{chart.insight}</p>
                </div>
              </CardContent>
            </TiltCard>
          ))}
        </div>
        <div className="flex justify-center mt-16">
          <Button variant="ghost" className="gap-2 rounded-full px-10 h-14 text-lg font-black hover:bg-blue-500/10 text-blue-500 transition-all" asChild>
            <Link href="/visuals">
              EXPLORE DATA LIBRARY <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}

// --- Main Assembly ---
export default function Home() {
  const scrollToVisuals = () => {
    const element = document.getElementById('visuals-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-blue-500/30 overflow-x-hidden">

      {/* GLOBAL BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-[10%] left-[20%] w-[150%] sm:w-[800px] h-[150%] sm:h-[800px] bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[120%] sm:w-[600px] h-[120%] sm:h-[600px] bg-emerald-500/[0.03] dark:bg-emerald-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-0">
        <HeroSection onStart={scrollToVisuals} />

        <div className="relative bg-background/50 backdrop-blur-3xl py-4 border-y border-border/20">
          <LogoTicker />
        </div>

        <ProductStory />

        <VisualizationPanel />

        <div className="max-w-[1400px] mx-auto px-6 relative">
          <ScrollReveal>
            <AnalysisFeatures />
          </ScrollReveal>
          <div className="pb-32">
            <PlatformFeatures />
          </div>
        </div>

        <CTASection onAction={scrollToVisuals} />
      </div>
    </main>
  );
}
