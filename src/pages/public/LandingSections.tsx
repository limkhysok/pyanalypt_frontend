"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
    onStart: () => void;
}

import { TypewriterEffect } from "@/components/ui/text-animation";
import { Zap, BarChart2, LineChart, PieChart, TrendingUp, GithubIcon, Activity } from "lucide-react";

import Link from "next/link";

export function HeroSection({ onStart }: Readonly<HeroSectionProps>) {
    return (
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50 pt-24 pb-16">

            {/* Hero Background Elements - Grid & Glows */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                {/* Modern subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Floating Animated Charts */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[10%] md:left-[15%] p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 ambient-glow-blue opacity-50 md:opacity-80"
                >
                    <BarChart2 size={32} className="text-blue-500" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 30, 0], x: [0, 10, 0], rotate: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[30%] right-[5%] md:right-[12%] p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 ambient-glow-purple opacity-40 md:opacity-70"
                >
                    <PieChart size={40} className="text-purple-500" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, -25, 0], x: [0, -15, 0], rotate: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2.5 }}
                    className="absolute bottom-[25%] left-[5%] md:left-[18%] p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 ambient-glow-emerald opacity-50 md:opacity-80 hidden sm:block"
                >
                    <TrendingUp size={28} className="text-emerald-500" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[35%] right-[15%] md:right-[22%] p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 ambient-glow-mono opacity-50 md:opacity-70 hidden md:block"
                >
                    <LineChart size={36} className="text-foreground" />
                </motion.div>

                {/* Top blue glow anchoring the navbar */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
                {/* Secondary ambient glow */}
                <div className="absolute bottom-0 right-[-10%] w-[800px] h-[600px] bg-primary/5 blur-[150px] rounded-full" />
                {/* Bottom fading gradient to smooth into the next section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="space-y-6 max-w-4xl relative z-10 px-4 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mx-auto w-fit p-1 rounded-full border border-border/50 bg-background/50 backdrop-blur-md mb-4 shadow-sm"
                >
                    <span className="text-[11px] font-bold px-3 py-1.5 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> AI-Powered Analytics v2.0
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                    className="text-5xl md:text-[5rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 drop-shadow-sm leading-[1.1] md:leading-[1.1] pb-2"
                >
                    Transform Data into <br />
                    <span className="text-foreground">
                        <TypewriterEffect />
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-medium mt-2"
                >
                    PyAnalypt seamlessly simplifies complex data visualization. Upload your raw datasets and let our AI engine generate stunning, interactive charts in seconds.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 relative z-10 pt-6"
            >
                <Link
                    href="/playground"
                    className="px-8 py-4 rounded-full bg-foreground text-background hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold whitespace-nowrap ambient-glow-mono hover:ambient-glow-blue flex items-center justify-center gap-2"
                >
                    <Zap size={18} className="fill-current" /> Live Sandbox
                </Link>
                <Link
                    href="https://github.com/soklimkhy/pyanalypt"
                    target="_blank"
                    className="px-8 py-4 rounded-full bg-background border border-border/50 text-foreground hover:bg-secondary/50 transition-all duration-300 font-bold whitespace-nowrap flex items-center justify-center gap-2"
                >
                    <GithubIcon size={18} /> View GitHub
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                className="pt-12 relative z-10"
            >
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500 animate-pulse" />
                        Live Platform Activity
                    </p>
                    <div className="flex gap-8 md:gap-16 opacity-70 grayscale">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-foreground">1.4M+</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rows Analyzed</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-foreground">15k+</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Charts Generated</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-foreground">99.9%</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Model Accuracy</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

import { TiltCard } from "@/components/ui/tilt-card";

export function FeatureSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
            {[
                { title: "Instant Visualization", desc: "Drag & drop CSVs to see immediate charts and graphs." },
                { title: "AI-Driven Insights", desc: "Our engine automatically detects patterns and anomalies." },
                { title: "Export & Share", desc: "Download high-res reports or share interactive links." }
            ].map((feature) => (
                <TiltCard key={feature.title} className="group border-0" classNameContent="p-8 rounded-3xl border border-border/40 bg-background/50 backdrop-blur-sm hover:ambient-glow-mono transition-all h-full flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                </TiltCard>
            ))}
        </div>
    )
}
