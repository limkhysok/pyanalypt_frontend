"use client";

import React, { useState } from "react";
import {
    Database,
    Wand2,
    LineChart,
    BrainCircuit,
    Presentation,
    ChevronRight,
    PlayCircle,
    FileSpreadsheet,
    Code2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const tutorialSteps = [
    {
        id: "step-1",
        title: "Step 1: Connect & Ingest Data",
        description: "Securely connect your databases or upload flat files (CSV, Excel). PyAnalypt instantly profiles your schema and detects data types.",
        icon: Database,
        visualIcon: FileSpreadsheet,
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-500",
        features: ["CSV, Excel, JSON Support", "PostgreSQL, MySQL Integrations", "Automatic Schema Detection", "Secure Data Vault"]
    },
    {
        id: "step-2",
        title: "Step 2: Clean & Preprocess",
        description: "Handle missing values, encode categoricals, and scale numerical features with our intuitive UI. No pandas boilerplate required.",
        icon: Wand2,
        visualIcon: Code2,
        color: "from-purple-500/20 to-pink-500/20",
        borderColor: "border-purple-500/30",
        iconColor: "text-purple-500",
        features: ["Smart Imputation Algorithms", "One-Hot & Label Encoding", "Standard & Min-Max Scaling", "Outlier Detection"]
    },
    {
        id: "step-3",
        title: "Step 3: Exploratory Data Analysis",
        description: "Uncover hidden patterns instantly. Generate statistical summaries, correlation matrices, and distribution plots in real-time.",
        icon: LineChart,
        visualIcon: LineChart,
        color: "from-amber-500/20 to-orange-500/20",
        borderColor: "border-amber-500/30",
        iconColor: "text-amber-500",
        features: ["Interactive Correlation Heatmaps", "Distribution & Box Plots", "Target Variable Analysis", "Automated Insights"]
    },
    {
        id: "step-4",
        title: "Step 4: Train & Evaluate Models",
        description: "Configure and train machine learning models. PyAnalypt handles cross-validation and provides comprehensive performance metrics.",
        icon: BrainCircuit,
        visualIcon: BrainCircuit,
        color: "from-emerald-500/20 to-green-500/20",
        borderColor: "border-emerald-500/30",
        iconColor: "text-emerald-500",
        features: ["Classification & Regression", "Random Forests, XGBoost, SVM", "Hyperparameter Tuning", "ROC, AUC, Confusion Matrix"]
    },
    {
        id: "step-5",
        title: "Step 5: Visualize & Export Reports",
        description: "Translate complex models into business value. Create stunning dashboards and export comprehensive PDF/HTML reports.",
        icon: Presentation,
        visualIcon: Presentation,
        color: "from-rose-500/20 to-red-500/20",
        borderColor: "border-rose-500/30",
        iconColor: "text-rose-500",
        features: ["Interactive Dashboard Builder", "Feature Importance Visuals", "PDF & HTML Export", "Shareable Links"]
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export function TutorialsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(tutorialSteps[0].id);

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-rose-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4 max-w-3xl mx-auto"
                >
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-xs font-bold uppercase backdrop-blur-md">
                        Platform Workflow
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                        Master the PyAnalypt Pipeline
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Learn how to transform raw data into actionable intelligence in minutes. Follow our comprehensive guide from ingestion to final visualization.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
                    {/* Steps Container */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6 relative"
                    >
                        {/* Connecting Line */}
                        <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-border/40 -z-10 hidden md:block" />

                        {tutorialSteps.map((step, index) => {
                            const isActive = activeStep === step.id;
                            const StepIcon = step.icon;

                            return (
                                <motion.div
                                    key={step.id}
                                    variants={itemVariants}
                                    onMouseEnter={() => setActiveStep(step.id)}
                                    className="relative group cursor-pointer"
                                >
                                    <div className={cn(
                                        "relative p-6 md:p-8 overflow-hidden rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ease-out",
                                        isActive
                                            ? "bg-card/80 border-primary/30 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_-12px_rgba(255,255,255,0.05)] scale-[1.02]"
                                            : "bg-muted/30 border-border/40 hover:bg-muted/50 hover:border-border/80"
                                    )}>
                                        {/* Nested Glass Background Glow (Active State) */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 pointer-events-none",
                                            step.color,
                                            isActive && "opacity-100"
                                        )} />

                                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            {/* Icon Node */}
                                            <div className={cn(
                                                "shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                                                isActive ? "bg-background border-2 border-primary" : "bg-secondary text-muted-foreground"
                                            )}>
                                                <StepIcon className={cn(
                                                    "w-8 h-8 transition-colors duration-500",
                                                    isActive ? step.iconColor : ""
                                                )} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-2">
                                                <h3 className={cn(
                                                    "text-2xl font-bold tracking-tight transition-colors duration-300",
                                                    isActive ? "text-foreground" : "text-foreground/80"
                                                )}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>

                                            {/* Action Button (Visible on Active/Hover) */}
                                            <div className={cn(
                                                "shrink-0 transition-all duration-300",
                                                isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden md:block"
                                            )}>
                                                <Button variant={isActive ? "default" : "secondary"} className="rounded-full shadow-lg">
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    View Tutorial
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Interactive Preview Panel */}
                    <div className="sticky top-24 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="p-8 rounded-[3rem] bg-card/60 backdrop-blur-2xl border border-border/50 shadow-2xl overflow-hidden h-[600px] flex flex-col relative"
                        >
                            {/* Decorative Top Glow */}
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                            <AnimatePresence mode="wait">
                                {tutorialSteps.map((step) => {
                                    if (step.id !== activeStep) return null;
                                    const VisualIcon = step.visualIcon;

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex flex-col h-full relative z-10"
                                        >
                                            <div className={cn(
                                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br border shadow-inner",
                                                step.color,
                                                step.borderColor
                                            )}>
                                                <VisualIcon className={cn("w-10 h-10", step.iconColor)} />
                                            </div>

                                            <h4 className="text-2xl font-bold mb-4 tracking-tight">Key Capabilities</h4>

                                            <div className="space-y-4 flex-1">
                                                {step.features.map((feature, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                                        className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-border/30 backdrop-blur-sm"
                                                    >
                                                        <CheckCircle2 className={cn("w-5 h-5 shrink-0", step.iconColor)} />
                                                        <span className="font-medium text-sm md:text-base text-foreground/90">{feature}</span>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-border/40">
                                                <Button className="w-full rounded-2xl h-14 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-[1.02]">
                                                    Start Interactive Demo <ChevronRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Global CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 pt-12 pb-8 border-t border-border/20"
                >
                    <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-primary/25 transition-all w-full md:w-auto">
                        Open New Project
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8 font-bold w-full md:w-auto bg-card/50 backdrop-blur-sm">
                        Read Full Documentation
                    </Button>
                </motion.div>
            </div>
        </main>
    );
}
