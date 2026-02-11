"use client";

import React from "react";
import {
    BarChart3,
    LineChart,
    PieChart,
    ScatterChart,
    AreaChart,
    Activity,
    CandlestickChart,
    Radar,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";

const templates = [
    { name: "Sales Trend Analysis", icon: LineChart, desc: "Track revenue growth over time with predictive regression lines." },
    { name: "Market Segmentation", icon: PieChart, desc: "Break down market share by demographics and regions." },
    { name: "Performance Metrics", icon: BarChart3, desc: "Comparative analysis of team or product performance." },
    { name: "Correlation Matrix", icon: ScatterChart, desc: "Identify relationships between multiple variables." },
    { name: "Financial Forecasting", icon: AreaChart, desc: "Project future financial states based on historical data." },
    { name: "Real-time Monitoring", icon: Activity, desc: "Live dashboard for server or system health tracking." },
    { name: "Stock Analysis", icon: CandlestickChart, desc: "OHLC charts for technical stock market analysis." },
    { name: "Skill Gap Analysis", icon: Radar, desc: "Visualize team competencies and training needs." },
];

export function TemplatesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-[1400px] mx-auto space-y-12">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Visualization Templates</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Choose from our library of professional chart templates to jumpstart your analysis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template, i) => (
                        <TiltCard key={i} className="group" classNameContent="p-6 h-full flex flex-col glass-card border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="p-3 w-fit rounded-lg bg-secondary/50 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <template.icon size={24} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                            <p className="text-sm text-muted-foreground flex-grow">
                                {template.desc}
                            </p>
                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Use Template</span>
                                <ArrowUpRight size={16} />
                            </div>
                        </TiltCard>
                    ))}
                </div>

            </div>
        </main>
    );
}
