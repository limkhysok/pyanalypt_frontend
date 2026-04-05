"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, ArrowRight, Sparkles,
  CheckCircle2, Quote, Activity, Users, DollarSign,
  ChevronRight, ChevronLeft
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LogoTicker } from "@/components/ui/logo-ticker";
import { GithubIcon } from "@/components/ui/Icons";

// --- Data Sets ---
const RECENT_DATA = [35, 42, 38, 52, 64, 58, 75, 82, 68, 88, 95, 92];
const PREVIOUS_DATA = [28, 33, 40, 45, 38, 44, 48, 52, 58, 62, 59, 65];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Hero Section ---
interface HeroSectionProps {
  onStart: () => void;
}

function HeroSection({ onStart }: Readonly<HeroSectionProps>) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"recent" | "previous">("recent");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[85vh]" />;

  const currentData = timeframe === "recent" ? RECENT_DATA : PREVIOUS_DATA;

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden border-b border-border/10">
      <div className="container relative z-10 mx-auto px-6 max-w-325">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
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
                PyAnalypt is the bridge between complex data analytics and your next best business move. No configuration, just results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button size="lg" onClick={onStart} className="w-full sm:w-auto gap-2">
                Launch Dashboard <ArrowRight size={16} />
              </Button>
              <Link href="https://github.com/soklimkhy/pyanalypt" target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <GithubIcon size={16} /> Repository
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Interactive Data Overview */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="rounded-2xl bg-background border border-border shadow-2xl p-6 space-y-6">

              {/* Dashboard Header */}
              <div className="flex items-center justify-between border-b border-border/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">Revenue Analysis</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {timeframe === "recent" ? "Recent Months" : "Previous Period"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl border border-border/10">
                  <button
                    onClick={() => setTimeframe("previous")}
                    className={`p-1.5 rounded-lg transition-all ${timeframe === "previous" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Previous month data"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setTimeframe("recent")}
                    className={`p-1.5 rounded-lg transition-all ${timeframe === "recent" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Recent month data"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue", value: timeframe === "recent" ? "$1.24M" : "$0.92M", delta: timeframe === "recent" ? "+12.5%" : "+4.2%", color: "text-emerald-500", icon: DollarSign },
                  { label: "Active Users", value: timeframe === "recent" ? "48.2K" : "32.1K", delta: "+8.3%", color: "text-blue-500", icon: Users },
                  { label: "Conversion", value: timeframe === "recent" ? "3.42%" : "2.85%", delta: timeframe === "recent" ? "-1.2%" : "+0.5%", color: timeframe === "recent" ? "text-rose-500" : "text-emerald-500", icon: TrendingUp },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-secondary/30 border border-border/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <stat.icon size={16} className="text-muted-foreground opacity-50" />
                      <span className={`text-[9px] font-black ${stat.color}`}>{stat.delta}</span>
                    </div>
                    <div>
                      <p className="text-xl font-black tracking-tight">{stat.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Revenue Trend - HIT AREA STABILIZED */}
              <div className="space-y-4">
                <div className="flex items-center justify-between h-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue Trend</p>
                  {hoveredIndex !== null && (
                    <p className="text-[10px] font-black text-blue-600 animate-in fade-in slide-in-from-right-1 duration-200">
                      {MONTHS[hoveredIndex]}: ${currentData[hoveredIndex]}k
                    </p>
                  )}
                </div>

                <div className="h-44 relative mt-2">
                  {/* The visual layer */}
                  <div className="absolute inset-0 flex items-end gap-1.5 px-1.5">
                    {currentData.map((height, i) => (
                      <div key={`visual-${MONTHS[i]}`} className="flex-1 flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${height}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${hoveredIndex === i ? "bg-blue-600" : "bg-blue-600/20"}`}
                        />
                        <div className="mt-2 text-center h-4">
                          <span className={`text-[8px] font-bold transition-all duration-300 ${hoveredIndex === i ? "text-blue-600 opacity-100" : "text-muted-foreground opacity-40"}`}>
                            {MONTHS[i]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* The Hit Layer - Completely independent and static */}
                  <div className="absolute inset-0 flex items-end gap-1.5 px-1.5 z-10">
                    {currentData.map((_, i) => (
                      <div
                        key={`hit-${MONTHS[i]}`}
                        className="flex-1 h-full cursor-pointer bg-transparent"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    ))}
                  </div>

                  {/* Tooltip Overlay */}
                  {hoveredIndex !== null && (
                    <div
                      className="absolute z-20 pointer-events-none transition-all duration-200 ease-out py-1.5 px-2.5 bg-zinc-900 text-white rounded text-[10px] font-black shadow-2xl"
                      style={{
                        left: `${(hoveredIndex * (100 / 12)) + (100 / 24)}%`,
                        bottom: `${currentData[hoveredIndex] + 12}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      ${currentData[hoveredIndex]}k
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              <div className="pt-4 border-t border-border/10 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Intelligence Stream</p>
                {[
                  timeframe === "recent" ? "Growth spike detected in Western region (+18%)." : "Ad spend efficiency increased by 12% in Q4.",
                  timeframe === "recent" ? "Churn rate reduced by 2.4%." : "New segment identified: 'High-Value Small Business'."
                ].map((insight) => (
                  <div key={insight} className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.2 bg-blue-500 rounded text-white"><Sparkles size={11} /></div>
                      <p className="text-xs font-bold text-foreground/80">{insight}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
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
        <div className="relative bg-background/50 py-2 border-y border-border/10">
          <LogoTicker />
        </div>
        <ProductStory />
      </div>
    </main>
  );
}
