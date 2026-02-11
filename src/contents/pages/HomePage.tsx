"use client";

import { useState } from "react";
import { UploadZone } from "@/contents/dashboard/UploadZone";
import { VisualizationPanel, LandingPageCharts } from "@/contents/dashboard/VisualizationPanel";
// import { StatsPanel } from "@/contents/dashboard/StatsPanel"; // Note: not used in current layout, can re-add if needed
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroSection, FeatureSection } from "@/contents/pages/LandingSections";
import { Sparkles } from "lucide-react";

import { LogoTicker } from "@/components/ui/logo-ticker";
import { CTASection } from "@/components/layout/CTASection";

export function HomePage() {
    const [view, setView] = useState<'landing' | 'dashboard'>('landing');

    const scrollToVisuals = () => {
        const element = document.getElementById('visuals-section');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/10">

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
                <div id="visuals-section" className="max-w-[1400px] mx-auto px-6 py-24 space-y-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Stunning Visualizations</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            PyAnalypt uses Apache ECharts to render high-performance, interactive charts that help you make sense of your data instantly.
                        </p>
                    </div>

                    <ScrollReveal>
                        <LandingPageCharts />
                    </ScrollReveal>
                </div>

                {/* 3. Features Grid */}
                <div className="max-w-[1400px] mx-auto px-6 pb-24">
                    <FeatureSection />
                </div>

                {/* 4. Final CTA */}
                <CTASection onAction={scrollToVisuals} />

                {/* Dashboard logic hidden for now as per user request */}
                {/*
                {view === 'dashboard' && (
                    <div id="dashboard-view" className="min-h-screen border-t border-border/50 bg-background/50 backdrop-blur-3xl py-24">
                        <div className="max-w-[1700px] mx-auto px-6 space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-bold">Your Workspace</h2>
                                <p className="text-muted-foreground">Upload your data below to generate your own report.</p>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                {/* Left Panel: Upload * /}
                                <div className="xl:col-span-3 space-y-6">
                                    <ScrollReveal>
                                        <UploadZone onUploadSuccess={() => { }} />
                                    </ScrollReveal>
                                </div>

                                {/* Right Panel: Live Stats (Placeholder for demo) * /}
                                <div className="xl:col-span-9">
                                    <ScrollReveal>
                                        <VisualizationPanel />
                                    </ScrollReveal>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                */}

            </div>
        </main>
    );
}
