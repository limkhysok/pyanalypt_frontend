"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface HeroSectionProps {
    onStart: () => void;
}

import { TypewriterEffect } from "@/components/ui/text-animation";

export function HeroSection({ onStart }: HeroSectionProps) {
    return (
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4 max-w-4xl relative z-10"
            >
                <div className="mx-auto w-fit p-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-4">
                    <span className="text-xs font-medium px-2 py-0.5">🚀 AI-Powered Analytics v2.0</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                    Transform Data into <br />
                    <TypewriterEffect />
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    PyAnalypt simplifies complex data visualization. Upload your datasets and let our AI engine generate stunning, interactive charts in seconds.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex gap-4 relative z-10"
            >
                <button
                    onClick={onStart}
                    className="px-8 py-4 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
                >
                    Start Analyzing Free
                </button>
                <button className="px-8 py-4 rounded-full border border-border bg-background/50 hover:bg-secondary transition-colors font-semibold">
                    View Demo
                </button>
            </motion.div>

            {/* Hero Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 to-secondary/20 blur-[120px] rounded-full opacity-50" />
            </div>
        </section>
    );
}

import { TiltCard } from "@/components/ui/tilt-card";

export function FeatureSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
            {[
                { title: "Instant Visualization", desc: "Drag & drop CSVs to see immediate charts and graphs." },
                { title: "AI-Driven Insights", desc: "Our engine automatically detects patterns and anomalies." },
                { title: "Export & Share", desc: "Download high-res reports or share interactive links." }
            ].map((feature, i) => (
                <TiltCard key={i} className="group" classNameContent="p-8 rounded-2xl border border-border bg-background/50 backdrop-blur-sm hover:bg-secondary/20 transition-colors h-full flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                </TiltCard>
            ))}
        </div>
    )
}
