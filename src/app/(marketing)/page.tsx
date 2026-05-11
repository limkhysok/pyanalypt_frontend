"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, ShieldCheck,
  Database, Code2, Search, Settings, Filter,
  FileSpreadsheet, FileCode, FileType, FileArchive
} from "lucide-react";

import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";

// --- Hero Section ---
function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      setMounted(true);
    };
    init();
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-26 pb-10 md:pt-34 md:pb-16 overflow-hidden bg-background">

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />

      {/* Subtle Neutral Glow — top-right */}
      <div className="absolute top-0 right-0 w-150 h-125 bg-foreground/5 blur-[120px] rounded-full pointer-events-none" />
      {/* Subtle Gray Glow — bottom-left */}
      <div className="absolute bottom-1/4 left-1/4 w-87.5 h-87.5 bg-foreground/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">

          {/* Left Column */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 md:space-y-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-secondary border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
              <span className="text-[10px] font-black text-foreground tracking-tight capitalize">
                Now in Beta
              </span>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] md:leading-[0.95] text-foreground">
                Analytics As Fast As{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-br from-foreground via-foreground/60 to-foreground/20">
                  Your Decision Making.
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium tracking-tight">
                Stop wrestling with CSVs. Upload your data and get boardroom-ready dashboards in under 30 seconds—all without your data ever leaving your browser.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto pt-2">
              {/* Primary — Blue */}
              <Link href="/datasets" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-11 md:h-12 px-7 md:px-8 text-sm font-black gap-3 rounded-none bg-blue-600 dark:bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 dark:hover:bg-blue-500 hover:scale-[1.03] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] active:scale-95 transition-all duration-300"
                >
                  Launch Dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 pt-2">
              <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-none bg-emerald-500/5 border border-emerald-500/10 cursor-help transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Secure local processing</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-none opacity-0 group-hover:opacity-100 transition-all pointer-events-none w-64 z-50 translate-y-2 group-hover:translate-y-0">
                   <p className="text-xs font-bold leading-relaxed text-foreground/80">
                      Your data never leaves your computer. We process everything locally in your browser for 100% privacy and zero latency.
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 animate-pulse" />
                <span className="text-[11px] font-bold text-muted-foreground/80 italic tracking-tight">Free while in Beta</span>
              </div>
            </div>
          </div>

          {/* Right Column — Dashboard Mockup */}
          <div className="relative w-full max-w-2xl mx-auto lg:ml-auto">
            {/* Background Glows for Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-foreground/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative rounded-none bg-background/80 backdrop-blur-sm border border-border/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden group/card hover:scale-[1.01] transition-all duration-700 ease-out">

              {/* Terminal Header */}
              <div className="h-10 md:h-12 border-b border-border/60 bg-muted/40 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-foreground/40 transition-colors" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-foreground/20 transition-colors" />
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-border/60 group-hover/card:bg-foreground/60 transition-colors" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground/60 tracking-tight truncate max-w-30 md:max-w-none">dist/v1.0/performance_snapshot.json</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-muted-foreground/40">
                  <div className="p-1 hover:bg-background hover:text-foreground rounded-none transition-colors cursor-pointer">
                    <Settings size={14} />
                  </div>
                  <div className="p-1 hover:bg-background hover:text-foreground rounded-none transition-colors cursor-pointer">
                    <Database size={14} />
                  </div>
                </div>
              </div>

              {/* Mockup Toolbar */}
              <div className="h-12 md:h-14 border-b border-border/60 bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 bg-muted/30 border border-border/60 rounded-none text-[10px] font-bold text-muted-foreground/80 hover:border-foreground/30 transition-colors cursor-text min-w-27.5 md:min-w-35">
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
                {/* Chart */}
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-black tracking-tighter">Growth Attribution</h3>
                      <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-foreground/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]" aria-hidden="true" />
                        <span>Real-time Stream Active</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2 group/legend cursor-help">
                        <div className="w-2 h-2 rounded-full border-2 border-border group-hover:border-foreground/40 transition-colors" />
                        <span className="text-[11px] font-black text-muted-foreground group-hover:text-foreground transition-colors">Projected</span>
                      </div>
                      <div className="flex items-center gap-2 group/legend cursor-help">
                        <div className="w-2 h-2 rounded-full bg-foreground shadow-sm" />
                        <span className="text-[11px] font-black text-foreground">Actual</span>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-40 md:h-44 flex items-end gap-1 md:gap-2 border-b border-border/80 pb-3 relative group/chart">
                    {[35, 65, 52, 88, 60, 95, 75, 90, 62, 84, 68, 98].map((h, i) => {
                      const colorMap = [
                        'bg-zinc-200 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700',
                        'bg-foreground/20 dark:bg-foreground/30 border-foreground/30 dark:border-foreground/40',
                        'bg-zinc-300/60 dark:bg-zinc-700/40 border-zinc-400/40 dark:border-zinc-600/40',
                      ];
                      const colorClass = colorMap[i % 3];

                      return (
                        <div
                          key={`bar-${i}-${h}`}
                          style={{ height: `${h}%` }}
                          className={`flex-1 transition-all duration-500 border-x border-t hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] cursor-pointer group/bar ${colorClass} relative`}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[8px] font-black text-foreground">{h}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Processing Status */}
                <div className="p-4 md:p-5 rounded-none border border-dashed border-border/80 bg-transparent backdrop-blur-sm flex items-center justify-between hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-none bg-background border border-border shadow-sm flex items-center justify-center text-foreground/40 transition-colors">
                      <Code2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-xs md:text-sm font-black text-foreground">Worker Active</p>
                      <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground lowercase opacity-70">instance: px-9802</p>
                    </div>
                  </div>
                  <div className="h-8 md:h-10 px-3 md:px-4 rounded-none border border-border bg-secondary flex items-center text-[10px] font-black tracking-widest text-foreground capitalize shadow-sm">
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

function TrustRow() {
  const stats = [
    { label: "Data Leaks", value: "0", sub: "100% Client-Side" },
    { label: "Latency", value: "<1s", sub: "Local Processing" },
    { label: "Lines of Code", value: "0", sub: "True No-Code" },
  ];

  return (
    <div className="border-y border-border/40 bg-muted/10 py-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center space-y-1">
                <div className="text-3xl font-black tracking-tighter text-foreground">{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{s.label}</div>
                <div className="text-[11px] font-bold text-muted-foreground/60">{s.sub}</div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-4">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Powering the engine</span>
             <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                {['Rust', 'WebAssembly', 'DuckDB', 'Parquet'].map(tech => (
                  <span key={tech} className="text-xs font-black tracking-widest uppercase">{tech}</span>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Connect", desc: "Drag and drop your Excel, CSV, or Parquet files.", icon: Database },
    { title: "Process", desc: "Our local engine cleans and structures your data instantly.", icon: Code2 },
    { title: "Present", desc: "Export high-res visuals or share a live, secure link.", icon: Sparkles },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden border-b border-border/40">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">How It Works</h2>
          <p className="text-muted-foreground font-medium">From raw files to professional insights in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-border to-transparent" />
          
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center space-y-6 relative group">
              <div className="w-20 h-20 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-500 shadow-sm relative z-10">
                <s.icon size={32} strokeWidth={2.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-none bg-background border border-border flex items-center justify-center text-[10px] font-black">0{i+1}</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-secondary border border-border">
               <span className="text-[10px] font-black text-foreground tracking-tight uppercase">Visual Proof</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]">
                 From Chaos <br />
                 <span className="text-foreground/80">to Professional Clarity.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                 Stop wrestling with messy spreadsheets and complex formulas. PyAnalypt automatically cleans, 
                 structures, and visualizes your data into boardroom-ready dashboards in seconds.
              </p>
            </div>
          </div>

          <div className="relative group lg:h-[450px]">
            {/* Decorative Glow */}
            <div className="absolute -inset-8 bg-foreground/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative h-full rounded-none border border-border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col group/compare">
               {/* Comparison Header */}
               <div className="h-14 border-b border-border/50 flex items-center justify-between px-8 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Workflow Comparison</div>
               </div>

               <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/30">
                  {/* Left: Manual Hell */}
                  <div className="flex-1 p-8 bg-red-500/[0.02] space-y-6 relative overflow-hidden">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Legacy Method</span>
                       <h4 className="text-xs font-black">Manual Analysis</h4>
                    </div>
                    <div className="space-y-3 opacity-20">
                      {[85, 70, 95, 60, 80].map((w, i) => (
                        <div key={`manual-bar-${w}-${i}`} className="h-1.5 bg-foreground/20 rounded-full" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="px-3 py-1.5 bg-background/80 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rotate-[-12deg] shadow-xl rounded-lg">Manual Hell</span>
                    </div>
                  </div>

                  {/* Right: PyAnalypt */}
                  <div className="flex-1 p-8 bg-emerald-500/[0.02] space-y-6 relative overflow-hidden">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">PyAnalypt OS</span>
                       <h4 className="text-xs font-black">Automated Insights</h4>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[30, 70, 50, 90, 60].map((h, i) => (
                        <div key={`auto-bar-${h}-${i}`} style={{ height: `${h}%` }} className="flex-1 bg-foreground/20 rounded-t-sm animate-in fade-in slide-in-from-bottom-1 duration-700 delay-100" />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="px-3 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rotate-[12deg] shadow-xl rounded-lg">Instant ROI</span>
                    </div>
                  </div>
               </div>

               {/* Footer Decoration */}
               <div className="h-1.5 w-full bg-linear-to-r from-transparent via-foreground/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



function BuiltForSection() {
  const personas = [
    { title: "Founders", desc: "Turn investor updates from a weekend chore into a 5-minute task.", icon: Sparkles },
    { title: "Marketing Leads", desc: "See which 20% of your ads are driving 80% of your revenue in real-time.", icon: Database },
    { title: "Data Analysts", desc: "Skip the boilerplate Python setup. Use us for rapid prototyping and EDA.", icon: Code2 },
  ];

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-foreground/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-foreground/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {personas.map((p) => (
            <div key={p.title} className="space-y-6 p-10 rounded-none bg-background border border-border shadow-sm hover:border-foreground/20 hover:shadow-xl transition-all duration-500 group">
               <div className="w-14 h-14 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-500 shadow-sm">
                  <p.icon size={28} strokeWidth={2.5} />
               </div>
               <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-foreground transition-colors">Built for {p.title}</h3>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed">{p.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntelTeaser() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-foreground opacity-[0.01]" />
      <div className="container mx-auto px-6 max-w-4xl text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Ready to see the truth in your data?</h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Join 500+ early-access users transforming their data workflows. No credit card required.
          </p>
        </div>
        <Link href="/datasets">
          <Button size="lg" className="rounded-none font-black text-xs h-12 px-10 bg-foreground text-background hover:scale-105 transition-all">
            Get My 30-Second Report
          </Button>
        </Link>
      </div>
    </section>
  );
}

function ProductStory() {
  const productFeatures = [
    { text: "Enterprise Security", sub: "Unlike other AI tools, we don't train on your data. Your records stay 100% on your machine.", icon: ShieldCheck },
    { text: "Zero Code required", sub: "No Python, SQL, or Terminal", icon: Code2 },
    { text: "Universal Formats", sub: "Excel, JSON, CSV & Parquet", icon: FileSpreadsheet },
    { text: "Instant ROI", sub: "Boardroom-ready in seconds", icon: Sparkles },
    { text: "Professional Exports", sub: "PDF & High-res images", icon: FileType },
    { text: "Live Integration", sub: "Real-time data streaming", icon: Database },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Backdrop */}
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-secondary/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />
      {/* Subtle neutral glow center */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-100 bg-foreground/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-secondary border border-border">
            <Sparkles size={14} className="text-foreground" aria-hidden="true" />
            <span className="text-[10px] font-black text-foreground tracking-tight">
              Enterprise Grade Power
            </span>
          </div>

          <div className="space-y-6 max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] text-foreground">
              Stop waiting for reports. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground via-foreground/60 to-foreground/40">
                Start leading with data.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto opacity-80">
              We built PyAnalypt for leaders who need answers, not code. Upload your data and get professional insights in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 w-full">
            {productFeatures.map((f) => (
              <div
                key={`feature-${f.text.toLowerCase().replaceAll(/\s+/g, '-')}`}
                className="flex items-start gap-5 p-8 rounded-none border border-border/40 bg-zinc-50/10 dark:bg-zinc-900/20 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-500 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-none bg-secondary border border-border flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  <f.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left space-y-1">
                   <h4 className="text-sm font-black text-foreground transition-colors">
                      {f.text}
                   </h4>
                   <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {f.sub}
                   </p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrations Row */}
          <div className="pt-16 pb-8 space-y-8 w-full">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Supported Ecosystem</span>
              <div className="h-px w-12 bg-border/40" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {[
                { name: "Excel", icon: FileSpreadsheet, color: "group-hover:text-emerald-500" },
                { name: "CSV", icon: FileType, color: "group-hover:text-blue-500" },
                { name: "JSON", icon: FileCode, color: "group-hover:text-amber-500" },
                { name: "Parquet", icon: FileArchive, color: "group-hover:text-indigo-500" },
              ].map((format) => (
                <div key={format.name} className="flex items-center gap-3 group cursor-default">
                  <format.icon size={20} className={cn("transition-colors duration-300", format.color)} />
                  <span className="text-xs font-black tracking-widest">{format.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-blue-500/20 overflow-x-hidden">
      <div className="relative z-0">
        <HeroSection />
        <TrustRow />
        <HowItWorks />
        <BeforeAfterSection />
        <BuiltForSection />
        <ProductStory />
        <IntelTeaser />
      </div>
    </main>
  );
}
