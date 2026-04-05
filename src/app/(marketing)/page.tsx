"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles,
  CheckCircle2, Quote, Database, Code2, Search, Settings, Filter
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GithubIcon } from "@/components/ui/Icons";

// --- Hero Section ---
function HeroSection({ onStart }: Readonly<{ onStart: () => void }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-26 pb-10 md:pt-34 md:pb-16 overflow-hidden bg-background">

      {/* Precision Blueprint Grid Background - High Fidelity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent shadow-[0_0_20px_rgba(0,0,0,0.05)]" />

      {/* Decorative Layered Glows (Monochrome) */}
      <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-foreground opacity-[0.01] blur-[100px] md:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] md:w-[550px] h-[350px] md:h-[550px] bg-foreground opacity-[0.02] blur-[120px] md:blur-[150px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">

          {/* Left Column - High-Density Typography */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 md:space-y-10 group/text">

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] md:leading-[0.95] text-foreground">
                Analytics As Fast As <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground via-muted-foreground/60 to-muted-foreground/20">Your Decision Making.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium tracking-tight">
                PyAnalypt bridges the gap between raw data and actionable strategy. No code, no complexity. Just results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto pt-2">
              <Button
                size="lg"
                onClick={onStart}
                className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 text-sm font-black gap-3 rounded-xl bg-foreground text-background hover:scale-[1.03] hover:shadow-2xl hover:shadow-foreground/20 active:scale-95 transition-all duration-300"
              >
                Launch Dashboard <ArrowRight size={16} />
              </Button>
              <Link href="https://github.com/soklimkhy/pyanalypt" target="_blank" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 text-sm font-black gap-3 rounded-xl border-border/60 hover:bg-muted hover:border-foreground/20 active:scale-95 transition-all duration-300"
                >
                  <GithubIcon size={16} /> View Source
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - PREMIUM INTERACTIVE DASHBOARD MOCKUP */}
          <div className="relative w-full max-w-2xl mx-auto lg:ml-auto">
            <div className="relative rounded-2xl md:rounded-3xl bg-background border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden group/card hover:scale-[1.01] transition-all duration-700 ease-out">

              {/* Terminal Style Header - PREMIUM BORDERS */}
              <div className="h-10 md:h-12 border-b border-border/60 bg-muted/40 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-red-500/50 transition-colors" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-amber-500/50 transition-colors" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-emerald-500/50 transition-colors" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground/60 tracking-tight truncate max-w-[120px] md:max-w-none">dist/v1.0/performance_snapshot.json</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-muted-foreground/40">
                  <div className="p-1 hover:bg-background hover:text-foreground rounded-lg transition-colors cursor-pointer">
                    <Settings size={14} />
                  </div>
                  <div className="p-1 hover:bg-background hover:text-foreground rounded-lg transition-colors cursor-pointer">
                    <Database size={14} />
                  </div>
                </div>
              </div>

              {/* Mockup Toolbar */}
              <div className="h-12 md:h-14 border-b border-border/60 bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 bg-muted/30 border border-border/60 rounded-lg text-[10px] font-bold text-muted-foreground/80 hover:border-foreground/30 transition-colors cursor-text min-w-[110px] md:min-w-[140px]">
                    <Search size={12} className="opacity-40" /> <span className="hidden sm:inline">Search Telemetry...</span><span className="sm:hidden">Search...</span>
                  </div>
                  <div className="h-6 w-px bg-border/60" />
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors cursor-pointer group/filter">
                    <Filter size={12} className="group-hover/filter:scale-90 transition-transform" /> <span className="hidden sm:inline">Attribution: Active</span><span className="sm:hidden">Active</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 md:p-10 space-y-8 md:space-y-12">
                {/* Performance Chart Grid */}
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-black tracking-tighter">Growth Attribution</h3>
                      <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" aria-hidden="true" />
                        <span>Real-time Stream Active</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2 group/legend cursor-help">
                        <div className="w-2 h-2 rounded-full border-2 border-border group-hover:border-foreground transition-colors" />
                        <span className="text-[10px] font-black text-muted-foreground group-hover:text-foreground transition-colors">Projected</span>
                      </div>
                      <div className="flex items-center gap-2 group/legend cursor-help">
                        <div className="w-2 h-2 rounded-full bg-foreground shadow-sm" />
                        <span className="text-[10px] font-black text-foreground">Actual</span>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart Area */}
                  <div className="h-40 md:h-44 flex items-end gap-1 md:gap-2 border-b border-border/80 pb-3 relative group/chart">
                    {[35, 65, 52, 88, 60, 95, 75, 90, 62, 84, 68, 98].map((h, i) => {
                      const colorMap = [
                        'bg-foreground/5 border-foreground/10',
                        'bg-foreground/10 border-foreground/20',
                        'bg-foreground/20 border-foreground/30'
                      ];
                      const colorClass = colorMap[i % 3];

                      return (
                        <div
                          key={`gray-bar-${i}-${h}`}
                          style={{ height: `${h}%` }}
                          className={`flex-1 transition-all duration-300 border-x border-t border-transparent hover:h-[${h + 4}%] hover:brightness-125 hover:shadow-[0_0_15px_rgba(0,0,0,0.05)] cursor-pointer group/bar ${colorClass} relative`}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[8px] font-black">{h}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Processing Status Bar */}
                <div className="p-4 md:p-5 rounded-xl md:rounded-2xl border border-dashed border-border/80 bg-transparent dark:bg-transparent backdrop-blur-sm flex items-center justify-between hover:border-foreground/30 hover:bg-background transition-all duration-300">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center text-zinc-400 group-hover/card:text-foreground transition-colors">
                      <Code2 className="w-[18px] h-[18px] md:w-5 md:h-5" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-xs md:text-sm font-black text-foreground">Worker Active</p>
                      <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground lowercase opacity-70">instance: px-9802</p>
                    </div>
                  </div>
                  <div className="h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl border border-border bg-background flex items-center text-[10px] font-black tracking-widest text-muted-foreground uppercase cursor-wait hover:text-foreground transition-colors shadow-sm">
                    0.4s
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ProductStory() {
  const checkmarks = [
    "No python, no sql, no terminal — Ever",
    "Works with Excel, JSON, CSV & Parquet",
    "Instant results — No setup, no wait",
    "Boardroom-ready charts, always",
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-secondary/5">
      <div className="container mx-auto px-6 max-w-7xl space-y-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <ScrollReveal>
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border shadow-sm">
                <Sparkles size={14} className="text-zinc-500" aria-hidden="true" />
                <span className="text-[10px] font-black text-muted-foreground ">
                  The Problem & Solved
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] ">
                Your data has answers. <br />
                <span className="text-muted-foreground">You just need the right translator.</span>
              </h2>

              <div className="space-y-5 text-lg text-muted-foreground leading-relaxed font-medium">
                <p>
                  Spreadsheets are where data goes to die. They are disconnected, slow, and impossible to scale. We built the engine that breathes life back into your numbers.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {checkmarks.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-zinc-400" aria-hidden="true" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative p-10 rounded-2xl bg-background border border-border shadow-2xl">
              <Quote size={40} className="text-zinc-200 dark:text-zinc-800 mb-6" aria-hidden="true" />
              <p className="text-xl font-bold leading-relaxed text-foreground/80 italic ">
                &ldquo;I spent 3 days every month building reports in Excel. With PyAnalypt I get the same output in
                4 minutes — and the charts actually look good.&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border/10">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-black overflow-hidden">
                  SL
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight ">Sarah L.</p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60 ">E-commerce Founder</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
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
    <main className="min-h-screen bg-background relative selection:bg-zinc-500/20 overflow-x-hidden">
      <div className="relative z-0">
        <HeroSection onStart={scrollToVisuals} />
        <ProductStory />
      </div>
    </main>
  );
}
