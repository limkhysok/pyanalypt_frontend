"use client";

import React from "react";
import {
    LayoutDashboard,
    Clock,
    ArrowUpRight,
    Plus,
    Cpu,
    Activity,
    PieChart as PieChartIcon,
    Brain,
    HardDrive
} from "lucide-react";
import ReactECharts from 'echarts-for-react';
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stats = [
    { title: "Global Insights", value: "1,284", icon: Brain, trend: "+12.5%", color: "text-blue-500", label: "neural detections" },
    { title: "Vector Storage", value: "84.2", icon: HardDrive, trend: "72%", color: "text-purple-500", label: "GB used" },
    { title: "Compute Pulse", value: "99.9%", icon: Activity, trend: "Stable", color: "text-amber-500", label: "system health" },
    { title: "Active Forges", value: "8", icon: Cpu, trend: "High Load", color: "text-emerald-500", label: "processing units" },
];

const recentActivity = [
    { name: "Financial_Report_Q4.csv", type: "CSV Analysis", date: "2 hours ago", status: "Completed" },
    { name: "User_Retention_Cohort.parquet", type: "Statistical Modeling", date: "5 hours ago", status: "Completed" },
    { name: "Sales_Forecast_2026.xlsx", type: "Predictive Analytics", date: "Yesterday", status: "Processing" },
];

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.3em] uppercase">
                            <LayoutDashboard size={14} className="text-primary" /> Workspace
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Dashboard Overview</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Welcome back{user ? `, ${user.username}` : ""}! Here’s a summary of your workspace activity and system health.
                        </p>
                    </motion.div>
                </div>
                {/* ...existing code... */}
            </div>
        </main>
    );
}
