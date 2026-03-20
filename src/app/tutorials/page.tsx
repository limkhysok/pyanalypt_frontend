"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Database, Wand2, LineChart, BrainCircuit, Presentation,
    FileSpreadsheet, Code2, CheckCircle2, ArrowRight,
    BookOpen, Clock, Users, BarChart2, MessageSquareText,
    Lightbulb, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const tutorialSteps = [
    {
        id: "step-1",
        step: "01",
        title: "Import Your Data",
        subtitle: "Connect & Ingest",
        description: "Drop your raw CSV, Excel, or Google Sheets file directly into PyAnalypt. No formatting, no cleanup, no headaches — our engine accepts the messy real-world data you actually have.",
        icon: Database,
        visualIcon: FileSpreadsheet,
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10",
        tag: "2 seconds",
        features: [
            "CSV, Excel, JSON & Google Sheets",
            "PostgreSQL & MySQL integrations",
            "Automatic schema & type detection",
            "Secure encrypted data vault",
        ],
        tip: "You can drag & drop files directly onto the dashboard — no browse dialog needed.",
    },
    {
        id: "step-2",
        step: "02",
        title: "Clean & Preprocess",
        subtitle: "Auto Data Quality",
        description: "Duplicate rows, missing values, inconsistent formats — PyAnalypt auto-detects and resolves data quality issues before you even see them. What used to take hours now takes zero effort.",
        icon: Wand2,
        visualIcon: Code2,
        color: "from-violet-500/20 to-purple-500/20",
        borderColor: "border-violet-500/30",
        iconColor: "text-violet-500",
        iconBg: "bg-violet-500/10",
        tag: "Automatic",
        features: [
            "Smart missing-value imputation",
            "One-hot & label encoding",
            "Standard & min-max scaling",
            "Outlier detection & flagging",
        ],
        tip: "PyAnalypt shows you a before/after preview of every change before committing.",
    },
    {
        id: "step-3",
        step: "03",
        title: "Ask in Plain English",
        subtitle: "Exploratory Analysis",
        description: 'Type exactly what you want to know — "What drove Q3 revenue?" or "Which product is underperforming?" Our AI understands business language, not just code.',
        icon: MessageSquareText,
        visualIcon: LineChart,
        color: "from-amber-500/20 to-orange-500/20",
        borderColor: "border-amber-500/30",
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10",
        tag: "No SQL",
        features: [
            "Natural language query engine",
            "Interactive correlation heatmaps",
            "Distribution & box plot views",
            "Automated insight summaries",
        ],
        tip: "Use follow-up questions to drill deeper — the AI remembers your previous query context.",
    },
    {
        id: "step-4",
        step: "04",
        title: "Train & Evaluate Models",
        subtitle: "Optional · Advanced",
        description: "For power users — configure and train ML models without writing a single line of code. PyAnalypt handles cross-validation and gives you comprehensive performance metrics.",
        icon: BrainCircuit,
        visualIcon: BrainCircuit,
        color: "from-emerald-500/20 to-green-500/20",
        borderColor: "border-emerald-500/30",
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-500/10",
        tag: "Optional",
        features: [
            "Classification & regression support",
            "Random Forest, XGBoost, SVM",
            "Automated hyperparameter tuning",
            "ROC, AUC & confusion matrix",
        ],
        tip: "Skip this step entirely if you just need visual insights — it is fully optional.",
    },
    {
        id: "step-5",
        step: "05",
        title: "Decide & Share",
        subtitle: "Visualize & Export",
        description: "Export a full PDF report or share live interactive dashboards with your team in one click. From raw file to confident business decision — in under five minutes, every time.",
        icon: Presentation,
        visualIcon: Presentation,
        color: "from-rose-500/20 to-red-500/20",
        borderColor: "border-rose-500/30",
        iconColor: "text-rose-500",
        iconBg: "bg-rose-500/10",
        tag: "5 min total",
        features: [
            "Interactive dashboard builder",
            "Feature importance visuals",
            "PDF & HTML report export",
            "One-click shareable links",
        ],
        tip: "White-label exports are available on the Pro plan — your logo, your brand.",
    },
];

const quickStats = [
    { icon: Clock, value: "< 5 min", label: "First insight" },
    { icon: Users, value: "10K+", label: "Teams onboarded" },
    { icon: BarChart2, value: "50+", label: "Chart types" },
];

export default function Tutorials() {
    const [activeStep, setActiveStep] = useState(tutorialSteps[0].id);
    const active = tutorialSteps.find((s) => s.id === activeStep) ?? tutorialSteps[0];

    return (
        <main className="min-h-screen pt-28 pb-16 px-6 relative z-0 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-[-10%] left-1/4 w-150 h-150 bg-blue-500/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-1/4 w-150 h-150 bg-violet-500/8 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto space-y-16">

                {/* ── Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-8 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                        <BookOpen size={13} className="text-blue-500" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Step-by-Step Guide
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                        From Raw File <br />
                        to <span className="text-blue-600 dark:text-blue-400 italic">Boardroom Insight</span><br />
                        in Five Steps.
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                        No Python. No SQL. No terminal. Follow this guide to turn any spreadsheet into an interactive, shareable analysis — in under five minutes.
                    </p>

                    {/* Quick stats */}
                    <div className="flex items-center justify-center gap-8 pt-2">
                        {quickStats.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                    <stat.icon size={14} className="text-blue-500" aria-hidden="true" />
                                    <span className="text-xl font-black text-foreground">{stat.value}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Step progress bar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="hidden md:flex items-center justify-center gap-0"
                    role="tablist"
                    aria-label="Tutorial steps"
                >
                    {tutorialSteps.map((step, i) => (
                        <React.Fragment key={step.id}>
                            <button
                                role="tab"
                                aria-selected={activeStep === step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 group",
                                    activeStep === step.id
                                        ? "bg-background border border-border/20 shadow-md"
                                        : "hover:bg-secondary/40"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300",
                                    activeStep === step.id
                                        ? `${step.iconBg} ${step.iconColor}`
                                        : "bg-secondary/60 text-muted-foreground group-hover:bg-secondary"
                                )}>
                                    {step.step}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors",
                                    activeStep === step.id ? "text-foreground" : "text-muted-foreground opacity-60"
                                )}>
                                    {step.subtitle}
                                </span>
                            </button>
                            {i < tutorialSteps.length - 1 && (
                                <div className="w-8 h-px bg-border/30 shrink-0" aria-hidden="true" />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

                {/* ── Main content: steps + preview ── */}
                <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">

                    {/* Step cards */}
                    <div className="space-y-4 relative">
                        {/* Vertical connector */}
                        <div className="absolute left-9 top-10 bottom-10 w-px bg-linear-to-b from-blue-500/20 via-violet-500/15 to-rose-500/20 -z-10 hidden md:block" aria-hidden="true" />

                        {tutorialSteps.map((step, index) => {
                            const isActive = activeStep === step.id;
                            const StepIcon = step.icon;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.07 }}
                                    onMouseEnter={() => setActiveStep(step.id)}
                                    onClick={() => setActiveStep(step.id)}
                                    className="relative group cursor-pointer"
                                    role="tab"
                                    aria-selected={isActive}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setActiveStep(step.id)}
                                >
                                    <div className={cn(
                                        "relative p-6 md:p-7 overflow-hidden rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500",
                                        isActive
                                            ? "bg-background/80 shadow-xl scale-[1.01]"
                                            : "bg-background/30 border-border/30 hover:bg-background/50 hover:border-border/50"
                                    )}
                                        style={isActive ? { borderColor: "transparent" } : {}}
                                    >
                                        {/* Active border gradient overlay */}
                                        {isActive && (
                                            <div className={cn("absolute inset-0 rounded-[2.5rem] bg-linear-to-br opacity-100 pointer-events-none", step.color)} />
                                        )}

                                        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                            {/* Icon node */}
                                            <div className={cn(
                                                "shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm relative",
                                                isActive
                                                    ? `${step.iconBg} border-2 ${step.borderColor}`
                                                    : "bg-secondary/60 text-muted-foreground"
                                            )}>
                                                <StepIcon className={cn("w-6 h-6 transition-colors duration-300", isActive ? step.iconColor : "")} aria-hidden="true" />
                                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border/20 flex items-center justify-center text-[9px] font-black text-muted-foreground">
                                                    {step.step}
                                                </span>
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                    <h3 className={cn(
                                                        "text-lg md:text-xl font-black tracking-tight transition-colors",
                                                        isActive ? "text-foreground" : "text-foreground/70"
                                                    )}>
                                                        {step.title}
                                                    </h3>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest",
                                                        isActive ? `${step.iconBg} ${step.borderColor} ${step.iconColor}` : "bg-secondary/60 border-border/20 text-muted-foreground"
                                                    )}>
                                                        {step.tag}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-sm font-medium leading-relaxed transition-colors",
                                                    isActive ? "text-foreground/70" : "text-muted-foreground opacity-70"
                                                )}>
                                                    {step.description}
                                                </p>
                                            </div>

                                            <ArrowRight size={16} className={cn("shrink-0 transition-all mt-1 hidden sm:block", isActive ? `${step.iconColor} opacity-100` : "opacity-0 group-hover:opacity-40")} aria-hidden="true" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Sticky preview panel */}
                    <div className="sticky top-24 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-border/20 shadow-2xl overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active.id}
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="p-8 space-y-7"
                                >
                                    {/* Panel header */}
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-to-br border shadow-inner",
                                            active.color, active.borderColor
                                        )}>
                                            <active.visualIcon className={cn("w-7 h-7", active.iconColor)} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Step {active.step}</p>
                                            <h4 className="text-lg font-black tracking-tight">{active.title}</h4>
                                        </div>
                                    </div>

                                    {/* Key capabilities */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Key Capabilities</p>
                                        {active.features.map((feature, i) => (
                                            <motion.div
                                                key={feature}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.25, delay: i * 0.06 }}
                                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/20"
                                            >
                                                <CheckCircle2 className={cn("w-4 h-4 shrink-0", active.iconColor)} aria-hidden="true" />
                                                <span className="text-sm font-bold text-foreground/80">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Pro tip */}
                                    <div className={cn("p-4 rounded-2xl border flex items-start gap-3", active.color, active.borderColor)}>
                                        <Lightbulb size={15} className={cn("shrink-0 mt-0.5", active.iconColor)} aria-hidden="true" />
                                        <p className="text-xs font-bold text-foreground/70 leading-relaxed">
                                            <span className={cn("font-black", active.iconColor)}>Tip: </span>
                                            {active.tip}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* ── Bottom CTAs ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-border/10"
                >
                    <Link href="/playground" className="w-full sm:w-auto">
                        <Button
                            className="h-14 w-full sm:w-auto px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            aria-label="Start your first analysis"
                        >
                            <Play size={16} aria-hidden="true" /> Start Your First Analysis
                        </Button>
                    </Link>
                    <Link href="/docs" className="w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            className="h-14 w-full sm:w-auto px-10 rounded-2xl border border-border/40 hover:bg-muted font-black text-base flex items-center gap-2 transition-all"
                            aria-label="Read the full documentation"
                        >
                            <BookOpen size={16} aria-hidden="true" /> Full Documentation
                        </Button>
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}
