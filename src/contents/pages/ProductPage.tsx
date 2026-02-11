"use client";

import React from "react";
import {
    Zap,
    Shield,
    Globe,
    Smartphone,
    Layers,
    Cpu
} from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { CTASection } from "@/components/layout/CTASection";

const features = [
    { icon: Zap, title: "Lightning Fast Analysis", desc: "Process millions of rows in seconds with our optimized Python engine." },
    { icon: Shield, title: "Enterprise Grade Security", desc: "Your data is encrypted end-to-end. We are SOC2 compliant." },
    { icon: Globe, title: "Global CDN", desc: "Access your dashboards from anywhere in the world with low latency." },
    { icon: Smartphone, title: "Mobile First Design", desc: "Responsive layouts that look great on phones, tablets, and desktops." },
    { icon: Layers, title: "Seamless Integration", desc: "Connect with SQL, NoSQL, and cloud storage providers easily." },
    { icon: Cpu, title: "AI-Powered Insights", desc: "Let our ML models automatically find anomalies and trends for you." },
];

export function ProductPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-6 overflow-hidden">
            <div className="max-w-[1400px] mx-auto space-y-24">

                {/* Hero */}
                <div className="text-center space-y-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-xs font-semibold mb-4 border border-border">
                        Our Technology
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Built for <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                            Modern Data Teams
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        PyAnalypt isn't just a charting library. It's a complete analytical operating system designed to turn raw data into decisions.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <TiltCard key={i} classNameContent="p-8 h-full glass-card border rounded-3xl flex flex-col gap-4 hover:border-primary/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-background border border-border flex items-center justify-center">
                                <feature.icon size={24} className="text-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.desc}
                            </p>
                        </TiltCard>
                    ))}
                </div>

                {/* Big Showcase Image (Placeholder) */}
                <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
                    {/* Abstract UI Representation */}
                    <div className="h-[500px] w-full bg-grid-white/[0.02] flex items-center justify-center">
                        <div className="w-3/4 h-3/4 bg-background/50 backdrop-blur-md rounded-xl border border-border/30 flex items-center justify-center">
                            <span className="text-muted-foreground font-mono">Interactive Dashboard Demo Preview</span>
                        </div>
                    </div>
                </div>

                <CTASection onAction={() => { }} />

            </div>
        </main>
    );
}
