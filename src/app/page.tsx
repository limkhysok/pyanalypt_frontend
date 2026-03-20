"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart2, Search,
  TrendingUp, Database, ArrowRight, Sparkles,
  Target, Wand2, Brain,
  MessageSquareText, RefreshCcw,
  CheckCircle2, Quote,
} from "lucide-react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";

// UI Components
import { Button } from "@/components/ui/button";
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

  if (!mounted) return <div className="min-h-[85vh]" />;

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-4 overflow-hidden border-b border-border/10">
      {/* 1. Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-325">
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
            <div className="relative z-10 p-1 rounded-[3rem] bg-linear-to-br from-blue-500/30 via-border/50 to-emerald-500/20 shadow-2xl">
              <div className="rounded-[2.8rem] bg-background border border-border/10 overflow-hidden flex flex-col h-112.5 shadow-inner relative">
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
                <div className="flex-1 p-8 space-y-6 overflow-hidden bg-linear-to-b from-transparent to-secondary/5">
                  {/* AI Message Preview */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-blue-600 text-white p-5 rounded-3xl rounded-tl-none max-w-[80%] shadow-xl shadow-blue-500/10 text-sm font-medium leading-relaxed"
                  >
                    "I've analyzed your 2024 revenue. There's a 12.5% outlier growth in North America. Want me to visualize it?"
                  </motion.div>

                  {/* Visual Dashboard Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="bg-background border border-border/10 p-6 rounded-4xl shadow-lg space-y-3"
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
                      className="bg-background border border-border/10 p-6 rounded-4xl shadow-lg space-y-3"
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
  const checkmarks = [
    "No Python, No SQL, No terminal — ever",
    "Works with Excel, CSV & Google Sheets",
    "Instant results — no setup, no wait",
    "Boardroom-ready charts, always",
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
      </div>

      <div className="container mx-auto px-6 max-w-325 space-y-28">

        {/* ── Part 1: The Problem + Solution narrative ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <ScrollReveal>
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                <Sparkles size={14} className="text-emerald-500" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Built for Real People
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                Your data has answers. <br />
                <span className="text-emerald-600 dark:text-emerald-400">You just need the right translator.</span>
              </h2>

              <div className="space-y-5 text-lg text-muted-foreground leading-relaxed font-medium">
                <p>
                  Most business owners have data. Sales reports. Customer records. Inventory logs. But it&apos;s all{" "}
                  <span className="text-foreground font-bold">trapped in spreadsheets</span>, disconnected tools, and dashboards that take a PhD to understand.
                </p>
                <p>
                  We built PyAnalypt so every business owner gets the same analytical power that Fortune 500 companies
                  pay data teams{" "}
                  <span className="text-foreground font-bold">hundreds of thousands of dollars</span> for — without
                  writing a single line of code.
                </p>
                <p>
                  Import your file. Ask a question. Get the answer.{" "}
                  <span className="text-foreground font-bold">No technical knowledge required — ever.</span>
                </p>
              </div>

              {/* Checkmarks */}
              <ul className="space-y-3 pt-2" aria-label="Key benefits">
                {checkmarks.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-emerald-500" aria-hidden="true" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Mini stats */}
              <div className="flex gap-8 pt-6 border-t border-border/10">
                {[
                  { value: "10K+", label: "Businesses" },
                  { value: "< 5 min", label: "First Insight" },
                  { value: "0", label: "Lines of Code" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Testimonial + stat chips */}
          <ScrollReveal>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto space-y-4">
              <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

              {/* Testimonial card */}
              <div className="relative p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border border-border/10 shadow-2xl">
                <Quote size={32} className="text-emerald-500/30 mb-4" aria-hidden="true" />
                <p className="text-lg font-bold leading-relaxed text-foreground/80 italic">
                  &ldquo;I spent 3 days every month building reports in Excel. With PyAnalypt I get the same output in
                  4 minutes — and the charts actually look good.&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/10">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black" aria-hidden="true">
                    SL
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">Sarah L.</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">E-Commerce Owner</p>
                  </div>
                </div>
              </div>

              {/* Stat chips */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-4xl bg-background/60 backdrop-blur-xl border border-border/10 shadow-lg space-y-2">
                  <p className="text-3xl font-black text-blue-500">97%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Less setup time</p>
                </div>
                <div className="p-5 rounded-4xl bg-background/60 backdrop-blur-xl border border-border/10 shadow-lg space-y-2">
                  <p className="text-3xl font-black text-emerald-500">50+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Chart types ready</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── CTA to Tutorials ── */}
        <ScrollReveal>
          <div className="flex justify-center pt-4">
            <Link href="/tutorials" aria-label="See the full step-by-step tutorial guide">
              <Button variant="ghost" className="gap-2 rounded-2xl px-10 h-14 text-base font-black hover:bg-blue-500/10 text-blue-500 transition-all border border-blue-500/20">
                See the Full Step-by-Step Guide <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}

// --- Features Section Components ---


function AnalysisFeatures() {
  const workflow = [
    { title: "Define Objective", desc: "Identify the problem and business goals for targeted analysis.", icon: Target, badge: null },
    { title: "Data Collection", desc: "Gather raw data from APIs, databases, and local files.", icon: Database, badge: null },
    { title: "Cleaning & Prep", desc: "Process and normalize data to ensure high-quality inputs.", icon: Wand2, badge: null },
    { title: "EDA", desc: "Uncover initial patterns and anomalies via statistical summaries.", icon: Search, badge: null },
    { title: "Modeling", desc: "Apply ML models or statistical methods for deeper insights.", icon: Brain, badge: "Optional" },
    { title: "Visualization", desc: "Communicate results via high-performance interactives.", icon: BarChart2, badge: null },
    { title: "Interpretation", desc: "Translate patterns into actionable business recommendations.", icon: MessageSquareText, badge: null },
    { title: "Feedback", desc: "Refine objectives based on results for continuous growth.", icon: RefreshCcw, badge: "Critical" }
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
        <div className="absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent hidden lg:block z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 px-4">
          {workflow.map((step, idx) => (
            <TiltCard key={step.title} className="border-0 h-full group" classNameContent="p-6 h-full flex flex-col items-center text-center gap-6 bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-border/10 hover:border-blue-500/20 transition-all shadow-lg hover:shadow-2xl">
              <div className="relative">
                <div className="p-5 rounded-4xl bg-blue-500/10 text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <step.icon size={32} aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border/10 flex items-center justify-center text-[10px] font-black text-blue-500">
                  {idx + 1}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-black tracking-tight leading-tight">{step.title}</h3>
                  {step.badge && (
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                      step.badge === "Critical" 
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    )}>
                      {step.badge}
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
  const [activeTab, setActiveTab] = useState(0);

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
    series: [{ name: 'Revenue', type: 'line', smooth: true, lineStyle: { width: 3, color: '#3b82f6' }, showSymbol: false, areaStyle: { opacity: 0.1, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: 'transparent' }]) }, data: [420, 932, 901, 1234, 1290, 1530, 2120] }]
  }), [tooltipBg, tooltipBorder, tooltipText, axisLineColor, textColor, gridColor]);

  const scatterData = useMemo(() => Array.from({ length: 40 }, () => [Math.random() * 100, Math.random() * 100]), []);
  const scatterOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: tooltipBg, borderColor: tooltipBorder, textStyle: { color: tooltipText } },
    xAxis: { splitLine: { lineStyle: { color: gridColor } }, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
    yAxis: { splitLine: { lineStyle: { color: gridColor } }, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
    series: [{ symbolSize: 12, data: scatterData, type: 'scatter', itemStyle: { color: '#6366f1', opacity: 0.7 } }]
  }), [tooltipBg, tooltipBorder, tooltipText, axisLineColor, textColor, gridColor, scatterData]);

  const bubbleData = [[10, 8.04, 20, 'A'], [8.07, 6.95, 40, 'B'], [13, 7.58, 60, 'C'], [9.05, 8.81, 30, 'D'], [11, 8.33, 50, 'E'], [14, 7.66, 80, 'F'], [12.5, 6.82, 70, 'G']];
  const bubbleOption = useMemo(() => ({
    backgroundColor: 'transparent',
    xAxis: { axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    yAxis: { axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    series: [{
      data: bubbleData, type: 'scatter', symbolSize: (data: number[]) => data[2] * 0.8,
      itemStyle: { shadowBlur: 10, shadowColor: 'rgba(16, 185, 129, 0.4)', color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: 'transparent' }]) }
    }]
  }), [axisLineColor, textColor, gridColor]);

  const charts = [
    {
      id: 0,
      title: "Revenue Trend",
      subtitle: "Monthly Growth · Jan – Jul",
      type: "Area Chart",
      option: lineOption,
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      insight: "12.5% outlier growth detected in Q2. North America segment is the primary driver.",
      stats: [
        { label: "Peak Month", value: "Jul" },
        { label: "Total Growth", value: "+405%" },
        { label: "Trend", value: "↑ Strong" },
      ],
    },
    {
      id: 1,
      title: "Customer Clusters",
      subtitle: "Behavioural Segmentation",
      type: "Scatter Plot",
      option: scatterOption,
      icon: Search,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      insight: "Positive correlation detected. High-value segment concentrated in the upper-right quadrant.",
      stats: [
        { label: "Data Points", value: "40" },
        { label: "Correlation", value: "0.82" },
        { label: "Segments", value: "3" },
      ],
    },
    {
      id: 2,
      title: "Market Nodes",
      subtitle: "Segment Size Analysis",
      type: "Bubble Chart",
      option: bubbleOption,
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      insight: "Segment G is the dominant revenue node. High volume, high efficiency — prioritise for Q4 investment.",
      stats: [
        { label: "Segments", value: "7" },
        { label: "Top Node", value: "G" },
        { label: "Dominance", value: "38%" },
      ],
    },
  ];

  const active = charts[activeTab];

  return (
    <div id="visuals-section" className="max-w-325 mx-auto px-6 py-16 space-y-12 relative">

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm mx-auto">
          <BarChart2 size={12} className="text-blue-500" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Interactive Canvas
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
          Charts that <span className="text-blue-600 dark:text-blue-400">think with you.</span>
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-6">
          Explore 50+ chart types — each one rendered in real-time from your data, no design tools required.
        </p>
      </div>

      <ScrollReveal>
        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-secondary/50 border border-border/10 backdrop-blur-xl" role="tablist" aria-label="Chart types">
            {charts.map((chart, i) => (
              <button
                key={chart.id}
                role="tab"
                aria-selected={activeTab === i}
                aria-controls={`chart-panel-${i}`}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all",
                  activeTab === i
                    ? `bg-background shadow-lg ${chart.color} border border-border/10`
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <chart.icon size={14} aria-hidden="true" />
                {chart.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chart showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`chart-panel-${activeTab}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TiltCard className="border-0" classNameContent="p-0 bg-background/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-border/10 shadow-2xl">

              {/* Chart header row */}
              <div className="flex items-start justify-between p-8 pb-0">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${active.bg} ${active.color}`}>
                    <active.icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{active.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-0.5">{active.subtitle}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${active.border} ${active.bg} ${active.color}`}>
                  {active.type}
                </span>
              </div>

              {/* Chart canvas */}
              <div className="px-8 pt-6">
                <div className="rounded-3xl overflow-hidden bg-secondary/20 dark:bg-black/40 border border-border/10 p-4" style={{ height: '360px' }}>
                  <EChart option={active.option} theme={resolvedTheme} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>

              {/* Insight + stats */}
              <div className="p-8 pt-6 space-y-4">
                <div className={`p-4 rounded-2xl border ${active.border} ${active.bg} flex items-start gap-3`}>
                  <Sparkles size={16} className={`${active.color} shrink-0 mt-0.5`} aria-hidden="true" />
                  <p className="text-sm font-bold opacity-80">{active.insight}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {active.stats.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-secondary/30 border border-border/10 text-center">
                      <p className="text-xl font-black">{stat.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <Button variant="ghost" aria-label="Explore our wide library of data visualizations" className="gap-2 rounded-2xl px-12 h-16 text-lg font-black hover:bg-blue-500/10 text-blue-500 transition-all border border-blue-500/10" asChild>
            <Link href="/visuals">
              EXPLORE 50+ CHART TYPES <ArrowRight size={22} aria-hidden="true" />
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
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-[10%] left-[20%] w-[150%] sm:w-200 h-[150%] sm:h-200 bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[120%] sm:w-150 h-[120%] sm:h-150 bg-emerald-500/3 dark:bg-emerald-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-0">
        <HeroSection onStart={scrollToVisuals} />

        <div className="relative bg-background/50 backdrop-blur-3xl py-2 border-y border-border/20">
          <LogoTicker />
        </div>

        <ProductStory />

        <VisualizationPanel />

        <div className="max-w-325 mx-auto px-6 relative">
          <ScrollReveal>
            <AnalysisFeatures />
          </ScrollReveal>

        </div>
      </div>
    </main>
  );
}
