"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BarChart2, Search,
  TrendingUp, Database, ArrowRight, Sparkles,
  CheckCircle2, Quote,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LogoTicker } from "@/components/ui/logo-ticker";
import { GithubIcon } from "@/components/ui/Icons";

// --- Hero Section ---
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
      <div className="container relative z-10 mx-auto px-6 max-w-325">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content - Left Side */}
          <div className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border shadow-sm">
              <Logo className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                Next-Gen Data Engine
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
                Turn Raw Data <br />
                Into <span className="text-foreground italic">Actionable</span> <br />
                Intelligence.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed pt-2">
                PyAnalypt is the bridge between complex data science and intuitive business decisions. No configuration, just insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={onStart}
                aria-label="Get Started for Free"
                className="w-full sm:w-auto gap-2"
              >
                Get Started Free <ArrowRight size={16} aria-hidden="true" />
              </Button>

              <Link href="https://github.com/soklimkhy/pyanalypt" target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <GithubIcon size={16} /> Repository
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Content - Right Side */}
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Main card */}
            <div className="relative rounded-xl bg-background/70 border border-border/10 shadow-md p-6 space-y-5 transform-gpu transition-all">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo className="w-9 h-9" />
                  <div>
                    <p className="text-sm font-black tracking-tight leading-none">PyAnalypt</p>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mt-0.5">AI Analyst · Active</p>
                  </div>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" aria-hidden="true" />
                  <span className="w-2 h-2 rounded-full bg-border/40" aria-hidden="true" />
                  <span className="w-2 h-2 rounded-full bg-border/40" aria-hidden="true" />
                </div>
              </div>

              {/* Raw → Chart transform */}
              <div className="grid grid-cols-[1fr_36px_1fr] gap-3 items-center">
                {/* Raw CSV */}
                <div className="rounded-2xl bg-secondary/30 border border-border/10 p-4 space-y-2 relative overflow-hidden">
                  <motion.div
                    className="absolute left-0 right-0 h-5 bg-muted pointer-events-none transform-gpu"
                    animate={{ y: [10, 82] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-2">Raw CSV</p>
                  {["Jan, 1200", "Feb, 2100", "Mar, 1800", "Apr, 2400"].map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" aria-hidden="true" />
                      <span className="text-[10px] font-mono text-muted-foreground opacity-60">{row}</span>
                    </div>
                  ))}
                </div>

                {/* Transform icon */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-9 h-9 flex items-center justify-center transform-gpu"
                  >
                    <Logo className="w-full h-full" />
                  </motion.div>
                </div>

                {/* Animated bar chart */}
                <div className="rounded-2xl bg-secondary/30 border border-border/10 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-3">Visual Output</p>
                  <div className="flex items-end gap-1 h-14" role="img" aria-label="Bar chart preview">
                    {[
                      { v: 40, m: "Jan" }, { v: 72, m: "Feb" }, { v: 55, m: "Mar" }, 
                      { v: 88, m: "Apr" }, { v: 62, m: "May" }, { v: 95, m: "Jun" }, { v: 78, m: "Jul" }
                    ].map((bar) => (
                      <div
                        key={bar.m}
                        style={{ height: `${bar.v}%` }}
                        className="flex-1 rounded-t bg-zinc-800 dark:bg-zinc-200"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insight callout */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border border-border transform-gpu">
                <Logo className="w-6 h-6 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                  Revenue peaked in <span className="text-foreground font-black">April (+12.5%)</span>. North America is the primary growth driver.
                </p>
              </div>

              {/* Stat chips */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: "Growth", value: "+12.5%" },
                  { icon: Database, label: "Records", value: "2.4M" },
                  { icon: Search, label: "Insight", value: "3 sec" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-3 rounded-2xl bg-background/60 border border-border/10 space-y-1.5 transform-gpu"
                  >
                    <s.icon size={12} className="text-foreground" aria-hidden="true" />
                    <p className="text-base font-black">{s.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute -top-5 -right-4 px-4 py-2.5 rounded-2xl bg-background border border-border/20 shadow-sm z-20 hidden md:flex items-center gap-2 transform-gpu">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" aria-hidden="true" />
              <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">Live Analysis</span>
            </div>

            <div className="absolute -bottom-5 -left-4 px-4 py-2.5 rounded-2xl bg-background border border-border/20 shadow-sm z-20 hidden md:flex items-center gap-2 transform-gpu">
              <BarChart2 size={13} className="text-foreground" aria-hidden="true" />
              <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">50+ Chart Types</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductStory() {
  const checkmarks = [
    "No Python, No SQL, No terminal — ever",
    "Works with Excel, JSON, CSV & Parquet",
    "Instant results — no setup, no wait",
    "Boardroom-ready charts, always",
  ];

  return (
    <section className="py-0 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
      </div>

      <div className="container mx-auto px-6 max-w-325 space-y-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <ScrollReveal>
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 shadow-sm">
                <Sparkles size={14} className="text-zinc-500" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Built for Real People
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                Your data has answers. <br />
                <span className="text-zinc-600 dark:text-zinc-400">You just need the right translator.</span>
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
              </div>

              <ul className="space-y-3 pt-2" aria-label="Key benefits">
                {checkmarks.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-zinc-500/10 border border-zinc-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-zinc-500" aria-hidden="true" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto space-y-4">
              <div className="relative p-8 rounded-xl bg-background/60 border border-border/10 shadow-md">
                <Quote size={32} className="text-zinc-500/30 mb-4" aria-hidden="true" />
                <p className="text-lg font-bold leading-relaxed text-foreground/80 italic">
                  &ldquo;I spent 3 days every month building reports in Excel. With PyAnalypt I get the same output in
                  4 minutes — and the charts actually look good.&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/10">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-black">
                    SL
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">Sarah L.</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">E-Commerce Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="flex justify-center pt-4">
            <Link href="/tutorials">
              <Button variant="outline" size="lg" className="gap-2">
                See the Full Guide <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function Home() {
  const scrollToVisuals = () => {
    const element = document.getElementById('visuals-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-foreground/30 overflow-x-hidden">
      <div className="relative z-0">
        <HeroSection onStart={scrollToVisuals} />
        <div className="relative bg-background/50 py-2 border-y border-border/10 transform-gpu">
          <LogoTicker />
        </div>
        <ProductStory />
      </div>
    </main>
  );
}
