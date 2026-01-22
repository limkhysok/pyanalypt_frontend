"use client";

import { useState } from "react";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { VisualizationPanel } from "@/components/dashboard/VisualizationPanel";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { Sparkles } from "lucide-react";

export function HomePage() {
    const [dataReady, setDataReady] = useState(false);

    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12 overflow-hidden selection:bg-white/20">

            {/* Background Ambience - Monochrome */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[20%] left-[20%] w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-[1700px] mx-auto space-y-8 pt-8">

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left Panel: Upload & Control */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight text-white">Data Input</h2>
                            <p className="text-sm text-zinc-400">Upload your dataset to begin analysis.</p>
                        </div>
                        <UploadZone onUploadSuccess={() => setDataReady(true)} />
                    </div>

                    {/* Center Panel: Visualization */}
                    <div className="xl:col-span-7 space-y-6 min-h-[600px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight text-white">Visualization</h2>
                            {dataReady && <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20 animate-pulse">Live Analysis</span>}
                        </div>

                        {dataReady ? (
                            <VisualizationPanel />
                        ) : (
                            <div className="h-full min-h-[600px] glass-card border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center text-zinc-500 gap-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center shadow-inner border border-zinc-800">
                                    <Sparkles className="text-zinc-600" size={40} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium text-zinc-300">Waiting for Data</p>
                                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">Upload a CSV or JSON file to generate interactive visualizations and insights.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Statistics */}
                    <div className="xl:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold tracking-tight text-white">Quick Stats</h2>
                        {dataReady ? (
                            <StatsPanel />
                        ) : (
                            <div className="space-y-4 opacity-40 blur-sm pointer-events-none transition-all duration-500 grayscale">
                                <StatsPanel />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
