"use client";
import { Database, ArrowRight, Search, History, TrendingUp, Compass, Zap, BarChart2, PieChart, Activity } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { LogoTicker } from "@/components/ui/logo-ticker";
import { CTASection } from "@/components/layout/CTASection";
import EChart from "@/components/ui/EChart";
import * as echarts from "echarts";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import React from "react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onStart: () => void;
}

import { TypewriterEffect } from "@/components/ui/text-animation";
import Link from "next/link";

function HeroSection({ onStart }: Readonly<HeroSectionProps>) {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50 pt-24 pb-16">
      {/* Hero Background Elements - Grid & Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Modern subtle grid pattern with higher contrast */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Primary Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-500/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />

        {/* Floating Animated Charts */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[25%] left-[12%] p-5 rounded-3xl bg-background/50 backdrop-blur-3xl border border-white/10 ambient-glow-blue opacity-70 hidden lg:block"
        >
          <BarChart2 size={36} className="text-blue-500" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          className="absolute top-[35%] right-[10%] p-6 rounded-3xl bg-background/50 backdrop-blur-3xl border border-white/10 ambient-glow-purple opacity-60 hidden lg:block"
        >
          <PieChart size={44} className="text-purple-500" />
        </motion.div>

        {/* Bottom fading gradient to smooth into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="space-y-8 max-w-5xl relative z-10 px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-fit p-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md mb-2 shadow-sm"
        >
          <span className="text-[10px] sm:text-[11px] font-black px-4 py-1.5 flex items-center gap-2 text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />AI-Powered Analytics Platform
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter leading-[0.95] text-center"
        >
          <span className="text-foreground drop-shadow-2xl">Transform Data into</span> <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 drop-shadow-sm pb-4 inline-block">
            <TypewriterEffect />
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-2xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium text-center balance"
        >
          PyAnalypt seamlessly simplifies complex data visualization. Upload raw datasets and let our AI engine generate stunning, interactive insights in seconds.
        </motion.p>
      </div>
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 relative z-10 pt-6"
        >
          <Link
            href="/playground"
            className="px-8 py-4 rounded-full bg-foreground text-background hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold whitespace-nowrap ambient-glow-mono hover:ambient-glow-blue flex items-center justify-center gap-2"
          >
            <Zap size={18} className="fill-current" /> Live Sandbox
          </Link>
          <Link
            href="https://github.com/soklimkhy/pyanalypt"
            target="_blank"
            className="px-8 py-4 rounded-full bg-background border border-border/50 text-foreground hover:bg-secondary/50 transition-all duration-300 font-bold whitespace-nowrap flex items-center justify-center gap-2"
          >
            <GithubIcon size={18} /> View GitHub
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="pt-12 relative z-10"
        >
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            Live Platform Activity
          </p>
          <div className="flex gap-8 md:gap-16 opacity-70 grayscale">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-foreground">1.4M+</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rows Analyzed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-foreground">15k+</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Charts Generated</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-foreground">99.9%</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Model Accuracy</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

import { TiltCard } from "@/components/ui/tilt-card";

function FeatureSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {[
        { title: "Instant Visualization", desc: "Drag & drop CSVs to see immediate charts and graphs." },
        { title: "AI-Driven Insights", desc: "Our engine automatically detects patterns and anomalies." },
        { title: "Export & Share", desc: "Download high-res reports or share interactive links." }
      ].map((feature) => (
        <TiltCard key={feature.title} className="group border-0" classNameContent="p-8 rounded-3xl border border-border/40 bg-background/50 backdrop-blur-sm hover:ambient-glow-mono transition-all h-full flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.desc}</p>
        </TiltCard>
      ))}
    </div>
  )
}


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
        {analysisTypes.map((type) => (
          <TiltCard key={type.title} className="border-0 group" classNameContent="p-8 h-full flex flex-col items-start gap-6 bg-background/40 backdrop-blur-sm rounded-3xl border border-border/40 hover:ambient-glow-mono transition-all">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${type.color} group-hover:scale-110 transition-transform duration-500 shadow-lg ring-1 ring-border/50`}>
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
    [10, 8.04, 10, 'A'], [8.07, 6.95, 20, 'B'], [13, 7.58, 30, 'C'], [9.05, 8.81, 15, 'D'], [11, 8.33, 25, 'E'], [14, 7.66, 40, 'F'], [12.5, 6.82, 35, 'G']
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
        {charts.map((chart) => (
          <TiltCard key={chart.title} className="border-0 group" classNameContent="p-0 bg-background/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/40 hover:ambient-glow-blue transition-all flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-foreground tracking-tight">{chart.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">{chart.type}</span>
                </div>
              </div>
              <chart.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2 mr-2" />
            </CardHeader>
            <CardContent className="flex-1 space-y-4 px-6 pb-6 pt-2">
              <div className="relative rounded-2xl overflow-hidden bg-secondary/10 border border-border/30">
                <EChart option={chart.option} style={{ height: '220px', width: '100%' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
              <div className="pt-4 border-t border-border/40 space-y-2 pb-2">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{chart.desc}"
                </p>
                <div className="bg-secondary/20 p-3 rounded-2xl border border-border/40 group-hover:border-primary/30 transition-all">
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
            Explore Visualization Library <ArrowRight size={16} />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const scrollToVisuals = () => {
    const element = document.getElementById('visuals-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/10 relative">

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
        <div id="visuals-section" className="max-w-[1400px] mx-auto px-6 py-16 space-y-8 relative">
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
        <div className="max-w-[1400px] mx-auto px-6 relative">
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
