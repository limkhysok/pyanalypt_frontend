"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Sparkles, ArrowRight, Target, Zap, Shield, Heart,
    Users, BarChart2, Clock, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

const values = [
    {
        icon: Target,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Radical Simplicity",
        desc: "We believe the most powerful tools disappear. If you have to think about the interface, we haven't done our job.",
    },
    {
        icon: Shield,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        title: "Privacy by Design",
        desc: "Your data belongs to you. We never sell it, share it, or use it to train models without your explicit consent.",
    },
    {
        icon: Zap,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        title: "Speed as a Feature",
        desc: "Every second you wait is a decision delayed. We obsess over performance so you can move at the speed of thought.",
    },
    {
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        title: "Built with Empathy",
        desc: "We design for the person who knows their business but doesn't know Python. That person deserves world-class tools.",
    },
];

const timeline = [
    {
        year: "2023",
        title: "The Problem",
        desc: "Our founder — a business analyst — spent 30+ hours per week manually wrangling spreadsheets. The data was there. The insight wasn't.",
    },
    {
        year: "Early 2024",
        title: "First Version",
        desc: "A rough internal tool built over a weekend. 12 chart types, one CSV upload field. Shared it with 5 friends in operations roles.",
    },
    {
        year: "Mid 2024",
        title: "Open Beta",
        desc: "300 early adopters signed up in the first week. Feedback was clear: everyone wanted it, everyone had the same frustrations we did.",
    },
    {
        year: "2025",
        title: "PyAnalypt Today",
        desc: "10K+ teams across e-commerce, retail, and finance use PyAnalypt to run their weekly reporting — without a single line of code.",
    },
];

const stats = [
    { icon: Users,     value: "10K+",   label: "Teams onboarded" },
    { icon: BarChart2, value: "50+",    label: "Chart types" },
    { icon: Clock,     value: "< 5 min", label: "Time to first insight" },
    { icon: TrendingUp, value: "97%",   label: "Less setup time" },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-28 pb-16 relative z-0 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-[10%] w-150 h-150 bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] right-[10%] w-150 h-150 bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6 space-y-28">

                {/* ── Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-8 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                        <Sparkles size={13} className="text-blue-500" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Our Story
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                        Built by analysts,<br />
                        <span className="text-blue-600 dark:text-blue-400 italic">for everyone.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                        We started as frustrated business analysts drowning in spreadsheets. We built the tool we wished existed — and then we made it available to everyone.
                    </p>
                </motion.div>

                {/* ── Stats ── */}
                <ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-border/10 shadow-lg text-center space-y-2"
                            >
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto">
                                    <stat.icon size={16} className="text-blue-500" aria-hidden="true" />
                                </div>
                                <p className="text-3xl font-black text-foreground">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </ScrollReveal>

                {/* ── Mission + Values ── */}
                <ScrollReveal>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div className="space-y-6 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                                <Target size={13} className="text-emerald-500" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    Our Mission
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                                Democratise data intelligence.
                            </h2>

                            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                                <p>
                                    Fortune 500 companies spend{" "}
                                    <span className="text-foreground font-bold">hundreds of thousands of dollars</span>{" "}
                                    on data science teams, custom dashboards, and BI consultants. The result? A 30-page report that took 3 weeks to produce.
                                </p>
                                <p>
                                    Small and mid-size business owners have the same data — sales records, customer logs, inventory files — but none of the infrastructure. They're making half-a-million-dollar decisions with a six-year-old spreadsheet and a gut feeling.
                                </p>
                                <p>
                                    That's the gap we're here to close.{" "}
                                    <span className="text-foreground font-bold">Every business owner deserves the same analytical power, regardless of technical background.</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {values.map((val, i) => (
                                <motion.div
                                    key={val.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.07 }}
                                    className={cn(
                                        "p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border shadow-lg space-y-3",
                                        val.border
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", val.bg)}>
                                        <val.icon size={20} className={val.color} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-base font-black tracking-tight">{val.title}</h3>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{val.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* ── Timeline ── */}
                <ScrollReveal>
                    <div className="space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 shadow-sm mx-auto">
                                <TrendingUp size={13} className="text-violet-500" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                                    The Journey
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">How we got here.</h2>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute left-9 top-10 bottom-10 w-px bg-linear-to-b from-blue-500/30 via-violet-500/20 to-emerald-500/30 hidden sm:block" aria-hidden="true" />
                            <div className="space-y-4">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        key={item.year}
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.08 }}
                                        className="flex gap-6 p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-border/10 shadow-lg items-start"
                                    >
                                        <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <span className="text-[10px] font-black text-blue-500 text-center leading-tight">{item.year}</span>
                                        </div>
                                        <div className="space-y-1 pt-1">
                                            <h4 className="text-base font-black tracking-tight">{item.title}</h4>
                                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* ── CTA ── */}
                <ScrollReveal>
                    <div className="text-center space-y-8 max-w-2xl mx-auto py-12 border-t border-border/10">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                            Join 10K+ teams already using PyAnalypt.
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium">
                            No credit card required. Start turning your data into decisions today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/playground">
                                <Button
                                    className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    aria-label="Start using PyAnalypt for free"
                                >
                                    Start for Free <ArrowRight size={18} aria-hidden="true" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button
                                    variant="ghost"
                                    className="h-14 px-10 rounded-2xl border border-border/40 hover:bg-muted font-black text-base flex items-center gap-2"
                                >
                                    Get in Touch
                                </Button>
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </main>
    );
}
