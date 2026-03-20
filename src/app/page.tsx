"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  BarChart2, Search,
  TrendingUp, Database, ArrowRight, Sparkles,
  Target, Wand2, Brain,
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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-4 overflow-hidden border-b border-border/10">
      {/* 1. Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-[1300px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content - Left Side */}
          <div className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm"
            >
              <Sparkles size={14} className="text-blue-500" aria-hidden="true" />
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
                aria-label="Get Started for Free"
                className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2 w-full sm:w-auto"
              >
                Get Started Free <ArrowRight size={18} aria-hidden="true" />
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
            className="relative group w-full max-w-2xl mx-auto"
          >
            <div className="relative z-10 p-1 rounded-[3rem] bg-gradient-to-br from-blue-500/30 via-border/50 to-emerald-500/20 shadow-2xl">
              <div className="rounded-[2.8rem] bg-background border border-border/10 overflow-hidden flex flex-col h-[450px] shadow-inner relative">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border/10 bg-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight leading-none">PyAnalypt Analyst</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Status: Ready</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <div className="h-2 w-8 bg-border/40 rounded-full" />
                    <div className="h-2 w-12 bg-border/40 rounded-full" />
                  </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 p-8 space-y-6 overflow-hidden bg-gradient-to-b from-transparent to-secondary/5">
                  {/* AI Message Preview */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-blue-600 text-white p-5 rounded-[1.5rem] rounded-tl-none max-w-[80%] shadow-xl shadow-blue-500/10 text-sm font-medium leading-relaxed"
                  >
                    "I've analyzed your 2024 revenue. There's a 12.5% outlier growth in North America. Want me to visualize it?"
                  </motion.div>

                  {/* Visual Dashboard Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="bg-background border border-border/10 p-6 rounded-[2rem] shadow-lg space-y-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue Growth</p>
                        <p className="text-2xl font-black">+12.5%</p>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.4, duration: 0.6 }}
                      className="bg-background border border-border/10 p-6 rounded-[2rem] shadow-lg space-y-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Database size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data Points</p>
                        <p className="text-2xl font-black">2.4M</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Mock Action Bar */}
                  <div className="absolute bottom-6 left-8 right-8 h-14 bg-secondary/50 backdrop-blur-3xl border border-border/10 rounded-[1.2rem] flex items-center px-6 justify-between animate-pulse">
                    <p className="text-zinc-500 text-xs font-bold">Waiting for your command...</p>
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                      <Search size={16} />
                    </div>
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
      </div>
    </section>
  );
}
function ProductStory() {
  return (
    <div className="py-16 container mx-auto px-6 max-w-[1300px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <ScrollReveal>
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
              <Sparkles size={14} className="text-emerald-500" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Zero Code Needed
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              Data Science, <br /> <span className="text-emerald-600 dark:text-emerald-400">Minus the Code.</span>
            </h2>
            <div className="space-y-5 text-lg text-muted-foreground leading-relaxed font-medium">
              <p>
                We believe deep insights shouldn't be locked behind complex Python scripts or steep learning curves. You don't need a data science degree to understand your own business.
              </p>
              <p>
                PyAnalypt is built for business owners, marketers, and operators. Learn a few basic navigation steps, upload your raw data, and our smart engine handles the heavy lifting instantly.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex-1 p-5 rounded-[2rem] bg-secondary/30 border border-border/10 backdrop-blur-xl">
                <Wand2 size={24} className="text-blue-500 mb-3" aria-hidden="true" />
                <h4 className="font-black text-sm uppercase tracking-widest mb-1">No Scripts</h4>
                <p className="text-xs font-medium opacity-70">Forget SQL and Python. Just point and click.</p>
              </div>
              <div className="flex-1 p-5 rounded-[2rem] bg-secondary/30 border border-border/10 backdrop-blur-xl">
                <Brain size={24} className="text-emerald-500 mb-3" aria-hidden="true" />
                <h4 className="font-black text-sm uppercase tracking-widest mb-1">AI Assisted</h4>
                <p className="text-xs font-medium opacity-70">Let the engine find the patterns for you.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative w-full max-w-md mx-auto lg:ml-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl rounded-full" />
            
            <div className="relative space-y-4">
              {[
                { 
                  icon: Database, 
                  title: "1. Upload Your Data", 
                  desc: "Drop in your raw CSV, Excel, or connect an API.", 
                  color: "text-blue-500", 
                  bg: "bg-blue-500/10" 
                },
                { 
                  icon: MessageSquareText, 
                  title: "2. Ask Questions", 
                  desc: "Interact with your data in plain English.", 
                  color: "text-indigo-500", 
                  bg: "bg-indigo-500/10" 
                },
                { 
                  icon: BarChart2, 
                  title: "3. Get Visual Answers", 
                  desc: "Receive boardroom-ready charts instantly.", 
                  color: "text-emerald-500", 
                  bg: "bg-emerald-500/10" 
                }
              ].map((step, i) => (
                <motion.div 
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="p-5 sm:p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border border-border/10 shadow-xl flex items-center gap-5 sm:gap-6 hover:scale-[1.02] transition-transform"
                >
                  <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${step.bg} ${step.color}`}>
                    <step.icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">{step.title}</h3>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Connecting line */}
              <div className="absolute top-10 bottom-10 left-[2.3rem] sm:left-[2.8rem] w-0.5 bg-gradient-to-b from-blue-500/20 via-indigo-500/20 to-emerald-500/20 -z-10 hidden sm:block" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

// --- Features Section Components ---


function AnalysisFeatures() {
  const workflow = [
    { title: "Define Objective", desc: "Identify the problem and business goals for targeted analysis.", icon: Target, isOptional: false },
    { title: "Data Collection", desc: "Gather raw data from APIs, databases, and local files.", icon: Database, isOptional: false },
    { title: "Cleaning & Prep", desc: "Process and normalize data to ensure high-quality inputs.", icon: Wand2, isOptional: false },
    { title: "EDA", desc: "Uncover initial patterns and anomalies via statistical summaries.", icon: Search, isOptional: false },
    { title: "Modeling", desc: "Apply ML models or statistical methods for deeper insights.", icon: Brain, isOptional: "Optional" },
    { title: "Visualization", desc: "Communicate results via high-performance interactives.", icon: BarChart2, isOptional: false },
    { title: "Interpretation", desc: "Translate patterns into actionable business recommendations.", icon: MessageSquareText, isOptional: false },
    { title: "Feedback", desc: "Refine objectives based on results for continuous growth.", icon: RefreshCcw, isOptional: "Critical" }
  ];

  return (
    <div className="py-8 space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm mx-auto">
          <RefreshCcw size={12} className="text-blue-500" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Lifecycle Workflow
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">The Analyst Path</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-6">
          A seamless transition from raw data to business decisions.
        </p>
      </div>

      <div className="relative">
        {/* Connection Line Visual */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent hidden lg:block z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 px-4">
          {workflow.map((step, idx) => (
            <TiltCard key={step.title} className="border-0 h-full group" classNameContent="p-6 h-full flex flex-col items-center text-center gap-6 bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-border/10 hover:border-blue-500/20 transition-all shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="p-5 rounded-[2rem] bg-blue-500/10 text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <step.icon size={32} aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border/10 flex items-center justify-center text-[10px] font-black text-blue-500">
                  {idx + 1}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-black tracking-tight leading-tight">{step.title}</h3>
                  {step.isOptional && (
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                      step.isOptional === "Critical" 
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    )}>
                      {step.isOptional}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed opacity-70">
                  {step.desc}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
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
    <div id="visuals-section" className="max-w-[1300px] mx-auto px-6 py-8 space-y-12 relative">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm mx-auto">
          <BarChart2 size={12} className="text-blue-500" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Real-time Insights
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">Interactive Canvas</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-6">
          Pro-grade visualizations, natively handled.
        </p>
      </div>

      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 auto-rows-min">
          {/* Main Large Chart */}
          <div className="lg:col-span-8">
            <TiltCard className="border-0 h-full" classNameContent="p-0 bg-background/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-border/10 transition-all flex flex-col shadow-2xl h-full">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tight">{charts[0].title}</CardTitle>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 border border-blue-500/10">{charts[0].type}</span>
                </div>
                <BarChart2 className="w-6 h-6 text-blue-500" />
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 flex flex-col gap-6">
                <div className="relative flex-1 rounded-3xl overflow-hidden bg-secondary/20 dark:bg-black/40 border border-border/10 p-2 min-h-[300px]">
                  <EChart option={charts[0].option} theme={resolvedTheme} style={{ height: '100%', width: '100%' }} />
                </div>
                <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/10 flex items-center justify-between">
                  <p className="text-sm font-medium opacity-80">{charts[0].insight}</p>
                  <ArrowRight size={16} className="text-blue-500" />
                </div>
              </CardContent>
            </TiltCard>
          </div>

          {/* Side Stacked Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {charts.slice(1).map((chart) => (
              <TiltCard key={chart.title} className="border-0" classNameContent="p-0 bg-background/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-border/10 transition-all flex flex-col shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <chart.icon size={20} aria-hidden="true" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{chart.type}</span>
                  </div>
                  <h4 className="text-lg font-black tracking-tight">{chart.title}</h4>
                  <div className="h-[120px] rounded-2xl bg-secondary/30 border border-border/5 p-2 overflow-hidden">
                    <EChart option={chart.option} theme={resolvedTheme} style={{ height: '100%', width: '100%' }} />
                  </div>
                </CardContent>
              </TiltCard>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-20">
          <Button variant="ghost" aria-label="Explore our wide library of data visualizations" className="gap-2 rounded-2xl px-12 h-16 text-lg font-black hover:bg-blue-500/10 text-blue-500 transition-all border border-blue-500/10" asChild>
            <Link href="/visuals">
              EXPLORE DATA LIBRARY <ArrowRight size={22} aria-hidden="true" />
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

        <div className="relative bg-background/50 backdrop-blur-3xl py-2 border-y border-border/20">
          <LogoTicker />
        </div>

        <ProductStory />

        <VisualizationPanel />

        <div className="max-w-[1300px] mx-auto px-6 relative">
          <ScrollReveal>
            <AnalysisFeatures />
          </ScrollReveal>

        </div>
      </div>
    </main>
  );
}
