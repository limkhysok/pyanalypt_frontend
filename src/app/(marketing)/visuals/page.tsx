"use client";

import React, { useState, useMemo } from "react";
import { Search, Info, Grid3X3, Filter, ChevronDown } from "lucide-react";
import { VISUALIZATIONS_CATALOG, SCENARIOS } from "@/lib/visualizations-data";
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
        <main className="min-h-screen bg-background relative selection:bg-zinc-500/10 overflow-x-hidden pt-24 pb-20">

            {/* Precision Blueprint Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Monochrome Ambient Glows */}
            <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-foreground opacity-[0.015] blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-foreground opacity-[0.02] blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl py-12">

                {/* ── Integrated Control HUD ── */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-12">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                            <Grid3X3 size={14} className="text-foreground/60" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">dist/architectures.lib</span>
                        </div>
                        <h2 className="text-xl font-black tracking-tighter opacity-80 uppercase">Global Visual Library</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-foreground transition-colors" />
                            <Input
                                placeholder="Search architectures..."
                                className="pl-11 h-10 bg-background border-border/80 rounded-xl text-xs font-bold shadow-xs transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative group w-full md:w-56 h-10 bg-background border border-border/80 rounded-xl px-11 flex items-center justify-between cursor-pointer focus:border-foreground/30 transition-all outline-none">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                                    <span className="text-[11px] font-black uppercase tracking-widest truncate">{activeScenario}</span>
                                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl p-2 shadow-2xl">
                                {SCENARIOS.map((scenario) => (
                                    <DropdownMenuItem
                                        key={scenario}
                                        onClick={() => setActiveScenario(scenario)}
                                        className={cn(
                                            "rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-200",
                                            activeScenario === scenario ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {scenario}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ── High-Density Chart Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {filteredCatalog.length > 0 ? (
                        filteredCatalog.map((chart) => {
                            const ChartIcon = chart.icon;
                            return (
                                <div
                                    key={chart.id}
                                    className="group relative h-48 rounded-3xl bg-background border border-border/80 p-6 flex flex-col justify-between transition-all duration-500 hover:border-foreground/20 hover:bg-muted/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Aesthetic Corner Glow */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-foreground/40 group-hover:text-foreground group-hover:bg-muted/80 transition-all duration-500">
                                                <ChartIcon size={18} />
                                            </div>
                                            <div className="flex gap-1.5">
                                                {chart.scenarios.slice(0, 1).map(s => (
                                                    <span key={s} className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground opacity-60">
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

                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-foreground opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 uppercase tracking-widest">
                                        View Architecture <Info size={10} />
                                    </div>

                                    {/* Tech Ornament */}
                                    <div className="absolute -bottom-1 -right-1 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                                        <ChartIcon size={80} />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest opacity-40">No architectures matching current filter</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
