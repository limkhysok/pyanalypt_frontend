"use client";

import React, { useState, useMemo } from "react";
import { Search, Info, Grid3X3, Filter, ChevronDown, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VISUALIZATIONS_CATALOG, SCENARIOS, type ChartArchitecture } from "@/lib/visualizations-data";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function VisualsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeScenario, setActiveScenario] = useState("All Scenarios");
    const [selectedChart, setSelectedChart] = useState<ChartArchitecture | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredCatalog = useMemo(() =>
        VISUALIZATIONS_CATALOG.filter(c => {
            const matchesSearch = c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.desc.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesScenario = activeScenario === "All Scenarios" || c.scenarios.includes(activeScenario);
            return matchesSearch && matchesScenario;
        }),
        [searchTerm, activeScenario]
    );

    return (
        <main className="min-h-screen bg-background relative selection:bg-blue-500/20 overflow-x-hidden pt-24 pb-20">

            {/* Blueprint Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Blue Ambient Glow — top-left */}
            <div className="fixed top-1/4 left-1/4 w-100 h-100 bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            {/* Gray Glow — bottom-right */}
            <div className="fixed bottom-1/4 right-1/4 w-md h-md bg-foreground opacity-[0.02] blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl py-12">

                {/* ── Control HUD ── */}
                <div className="flex flex-col items-center gap-12 pb-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">
                            <Grid3X3 size={12} className="text-blue-500 dark:text-blue-400" />
                            <span className="text-[10px] font-black capitalize tracking-widest text-blue-600 dark:text-blue-400">dist/architectures.lib</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">Global Visual Library</h2>
                        <p className="text-sm text-muted-foreground font-medium max-w-lg opacity-60">
                           Explore our high-performance architectural patterns for data transformation and visualization.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl">
                        <div className="relative group flex-1 w-full">
                            <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-[2rem]" />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors z-10" />
                            <Input
                                placeholder="Search architectures (e.g. Alluvial, Heatmap, Sankey...)"
                                className="relative pl-12 h-14 bg-background/50 backdrop-blur-sm border-border/80 rounded-2xl text-sm font-bold shadow-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 dark:focus:border-blue-400/40 transition-all z-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative group w-full md:w-64 h-14 bg-background/50 backdrop-blur-sm border border-border/80 rounded-2xl px-12 flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 dark:focus:border-blue-400/40 transition-all outline-none">
                                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                    <span className="text-xs font-black capitalize tracking-widest truncate">{activeScenario}</span>
                                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-40 group-hover:translate-y-[-40%] transition-transform" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl z-50">
                                {SCENARIOS.map((scenario) => (
                                    <DropdownMenuItem
                                        key={scenario}
                                        onClick={() => setActiveScenario(scenario)}
                                        className={cn(
                                            "rounded-xl px-4 py-3 text-[10px] font-black capitalize tracking-widest cursor-pointer transition-all duration-200",
                                            activeScenario === scenario
                                                ? "bg-blue-600 dark:bg-blue-500 text-white"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {scenario}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ── Chart Grid ── */}
                <motion.div 
                   layout
                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                >
                    <AnimatePresence mode="popLayout">
                    {filteredCatalog.length > 0 ? (
                        filteredCatalog.map((chart: ChartArchitecture) => {
                            const ChartIcon = chart.icon;
                            return (
                                <motion.div
                                    key={chart.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedChart(chart)}
                                    className="group relative h-56 rounded-3xl bg-background border border-border/80 p-6 flex flex-col justify-between transition-all duration-500 hover:border-blue-500/25 dark:hover:border-blue-400/25 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.08)] hover:-translate-y-1 overflow-hidden cursor-pointer"
                                >
                                    {/* Blue corner glow on hover */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/8 dark:bg-blue-400/8 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-foreground/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/30 group-hover:border-blue-200/60 dark:group-hover:border-blue-800/40 transition-all duration-500 relative overflow-hidden">
                                                <ChartIcon size={20} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                                
                                                {/* Hover Micro-animation */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                                   <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 to-transparent animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {chart.scenarios.slice(0, 1).map(s => (
                                                    <span key={s} className="text-[8px] font-black capitalize tracking-tighter px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground opacity-60">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black tracking-tighter text-foreground group-hover:translate-x-1 transition-transform duration-500">
                                                {chart.label}
                                            </h3>
                                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                                {chart.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 capitalize tracking-widest">
                                        View Architecture <Info size={10} />
                                    </div>

                                    {/* Tech Ornament with Looped Animation */}
                                    <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none text-blue-500">
                                        <motion.div
                                           animate={{ 
                                              rotate: [0, 5, 0],
                                              scale: [1, 1.05, 1],
                                           }}
                                           transition={{ 
                                              duration: 4, 
                                              repeat: Infinity, 
                                              ease: "easeInOut" 
                                           }}
                                        >
                                           <ChartIcon size={120} />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="col-span-full py-24 text-center space-y-6"
                        >
                            <div className="space-y-2">
                                <p className="text-lg font-black text-foreground capitalize tracking-tighter">Architecture Not Found</p>
                                <p className="text-sm text-muted-foreground font-medium opacity-60">We couldn&apos;t find &quot;{searchTerm}&quot;. Try a different term or scenario.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                               {["Heatmap", "Sankey", "Network", "Matrix"].map(suggestion => (
                                  <button 
                                     key={suggestion}
                                     onClick={() => setSearchTerm(suggestion)}
                                     className="px-4 py-1.5 rounded-full bg-muted border border-border text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                  >
                                     {suggestion}
                                  </button>
                               ))}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Deep Dive Modal ── */}
                <AnimatePresence>
                   {selectedChart && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                         <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedChart(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                         />
                         
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[80vh]"
                         >
                            <button 
                               onClick={() => setSelectedChart(null)}
                               className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-50"
                            >
                               <X size={20} />
                            </button>

                            {/* Info Side */}
                            <div className="p-8 md:p-12 flex-1 space-y-8 overflow-y-auto">
                               <div className="space-y-4">
                                  <div className="p-4 w-fit rounded-2xl bg-blue-500/10 text-blue-500">
                                     <selectedChart.icon size={32} />
                                  </div>
                                  <div className="space-y-2">
                                     <h3 className="text-3xl font-black tracking-tighter">{selectedChart.label}</h3>
                                     <p className="text-muted-foreground font-medium">{selectedChart.desc}</p>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compatible Scenarios</h4>
                                  <div className="flex flex-wrap gap-2">
                                     {selectedChart.scenarios.map((s: string) => (
                                        <span key={s} className="px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-black uppercase tracking-widest">{s}</span>
                                     ))}
                                  </div>
                               </div>

                               <div className="pt-8 border-t border-border/60">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Intelligence OS v1.0.4</p>
                               </div>
                            </div>

                            {/* Skeleton Side */}
                            <div className="flex-1 bg-muted/30 p-8 md:p-12 border-l border-border/60 flex flex-col gap-6 overflow-hidden">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                     <h4 className="text-xs font-black uppercase tracking-widest">Data Skeleton</h4>
                                  </div>
                                  <button 
                                     onClick={() => handleCopy(selectedChart.skeleton.content)}
                                     className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
                                  >
                                     {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                     {copied ? "Copied" : "Copy Template"}
                                  </button>
                               </div>

                               <div className="flex-1 relative group bg-background/50 border border-border/60 rounded-2xl p-6 font-mono text-[11px] overflow-auto">
                                  <div className="absolute top-0 right-0 p-3 opacity-20 text-[9px] font-black uppercase tracking-widest">{selectedChart.skeleton.type}</div>
                                  <pre className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                                     {selectedChart.skeleton.content}
                                  </pre>
                               </div>

                               <p className="text-[10px] font-medium text-muted-foreground italic">
                                  Structure your {selectedChart.skeleton.type === 'excel' ? 'Spreadsheet' : 'JSON'} exactly like this to automate architecture generation.
                               </p>
                            </div>
                         </motion.div>
                      </div>
                   )}
                </AnimatePresence>

            </div>
        </main>
    );
}
