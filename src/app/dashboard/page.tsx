"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";
import {
    LayoutDashboard,
    Plus,
    Upload,
    BarChart3,
    TrendingUp,
    Database,
    Activity,
    HardDrive,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader,
    FileText,
    Search,
} from "lucide-react";

import EChart from "@/components/ui/EChart";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Static demo data ────────────────────────────────────────────────────────

const STATS = [
    {
        title: "Total Datasets",
        value: "24",
        label: "files uploaded",
        trend: "+3 this week",
        trendUp: true,
        icon: Database,
    },
    {
        title: "Analyses Run",
        value: "142",
        label: "jobs completed",
        trend: "+18 today",
        trendUp: true,
        icon: Activity,
    },
    {
        title: "Insights Found",
        value: "1,284",
        label: "auto-detections",
        trend: "+12.5%",
        trendUp: true,
        icon: TrendingUp,
    },
    {
        title: "Storage Used",
        value: "84.2 GB",
        label: "of 120 GB plan",
        trend: "70% capacity",
        trendUp: false,
        icon: HardDrive,
    },
];

const QUICK_ACTIONS = [
    { label: "Import Dataset",   icon: Upload,    href: "/datasets",      desc: "Upload CSV, Excel or JSON" },
    { label: "New Analysis",     icon: BarChart3, href: "/analysis",      desc: "Run AI-powered analysis" },
    { label: "View Charts",      icon: TrendingUp, href: "/visualization", desc: "Explore your visualizations" },
    { label: "Browse Docs",      icon: FileText,  href: "/docs",          desc: "Tutorials and guides" },
];

const RECENT_DATASETS = [
    { name: "Sales_Q1_2026.csv",          rows: "12,400",  status: "ready",      updated: "2 min ago"  },
    { name: "Customer_Segments.xlsx",     rows: "5,820",   status: "processing", updated: "18 min ago" },
    { name: "Supply_Chain_2025.csv",      rows: "98,340",  status: "ready",      updated: "1 hr ago"   },
    { name: "Marketing_Attribution.json", rows: "2,100",   status: "error",      updated: "3 hr ago"   },
    { name: "Inventory_Report.csv",       rows: "41,000",  status: "ready",      updated: "Yesterday"  },
];

const ACTIVITY_FEED = [
    { icon: CheckCircle2, color: "text-blue-500",       bg: "bg-blue-500/10",  label: "Analysis completed",    sub: "Sales_Q1_2026 · Regression model",   time: "2 min ago"  },
    { icon: Upload,       color: "text-foreground/60",  bg: "bg-secondary/60", label: "Dataset imported",      sub: "Customer_Segments.xlsx · 5,820 rows",time: "18 min ago" },
    { icon: AlertCircle,  color: "text-amber-500",      bg: "bg-amber-500/10", label: "Issue detected",        sub: "Marketing_Attribution.json · 3 nulls",time: "3 hr ago"  },
    { icon: BarChart3,    color: "text-blue-500",       bg: "bg-blue-500/10",  label: "Chart exported",        sub: "Revenue Trend · PNG 2×",             time: "Yesterday"  },
    { icon: Search,       color: "text-foreground/60",  bg: "bg-secondary/60", label: "Insight generated",     sub: "High correlation: Latency ↔ Fuel",   time: "Yesterday"  },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    ready:      { icon: CheckCircle2, label: "Ready",      className: "text-blue-500 bg-blue-500/10 border-blue-500/20"     },
    processing: { icon: Loader,       label: "Processing", className: "text-foreground/60 bg-secondary/60 border-border/20" },
    error:      { icon: AlertCircle,  label: "Error",      className: "text-amber-500 bg-amber-500/10 border-amber-500/20"  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ stat, index }: Readonly<{ stat: typeof STATS[number]; index: number }>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.08, ease: "easeOut" }}
        >
            <Card className="group relative bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                <div className="absolute inset-0 bg-linear-to-b from-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-4xl" />
                <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <stat.icon size={14} className="text-blue-500" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black tracking-tight text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    <div className="mt-4 pt-4 border-t border-border/10">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                            stat.trendUp
                                ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
                                : "text-muted-foreground bg-secondary/60 border-border/20"
                        )}>
                            {stat.trend}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ActivityChart() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const option = useMemo(() => ({
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
            textStyle: { color: isDark ? "#f4f4f5" : "#18181b", fontSize: 11 },
        },
        grid: { left: "0%", right: "0%", top: "10%", bottom: "0%", containLabel: true },
        xAxis: {
            type: "category",
            data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            axisLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" } },
            axisLabel: { color: isDark ? "#52525b" : "#a1a1aa", fontSize: 10, fontWeight: "bold" },
        },
        yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" } },
            axisLabel: { color: isDark ? "#52525b" : "#a1a1aa", fontSize: 10 },
        },
        series: [
            {
                name: "Analyses",
                type: "line",
                smooth: true,
                lineStyle: { width: 2.5, color: "#3b82f6" },
                showSymbol: false,
                symbol: "circle",
                symbolSize: 6,
                areaStyle: {
                    opacity: 0.12,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#3b82f6" },
                        { offset: 1, color: "transparent" },
                    ]),
                },
                data: [18, 25, 20, 42, 31, 14, 28],
                itemStyle: { color: "#3b82f6" },
            },
            {
                name: "Datasets",
                type: "line",
                smooth: true,
                lineStyle: { width: 2, color: "#94a3b8", type: "dashed" },
                showSymbol: false,
                data: [4, 7, 5, 9, 6, 3, 5],
                itemStyle: { color: "#94a3b8" },
            },
        ],
    }), [isDark]);

    return (
        <EChart
            option={option}
            style={{ height: "240px", width: "100%" }}
        />
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading workspace…</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const displayName = user?.username || user?.first_name || "there";
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    return (
        <main className="min-h-screen pb-16 px-6 md:px-10 bg-background relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 pt-8">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <LayoutDashboard size={13} className="text-blue-500" aria-hidden="true" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                Workspace
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            Good morning, <span className="text-blue-600 dark:text-blue-400">{displayName}.</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock size={12} aria-hidden="true" />
                            {today}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-2xl h-10 px-5 border-border/30 bg-background/60 hover:bg-secondary/50 font-black text-[10px] uppercase tracking-widest transition-all"
                            asChild
                        >
                            <Link href="/datasets">
                                <Upload size={13} className="mr-1.5" aria-hidden="true" />
                                Import Data
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-2xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-sm shadow-blue-500/20 transition-all"
                            asChild
                        >
                            <Link href="/analysis">
                                <Plus size={13} className="mr-1.5" aria-hidden="true" />
                                New Analysis
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {STATS.map((stat, i) => (
                        <StatCard key={stat.title} stat={stat} index={i} />
                    ))}
                </div>

                {/* ── Quick Actions ── */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                >
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {QUICK_ACTIONS.map((action) => (
                            <Link key={action.label} href={action.href}>
                                <div className="group p-5 rounded-[1.75rem] bg-background/60 backdrop-blur-xl border border-border/20 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 cursor-pointer space-y-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <action.icon size={15} className="text-blue-500" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black tracking-tight group-hover:text-blue-500 transition-colors">{action.label}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{action.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div> */}

                {/* ── Main Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                >
                    {/* Activity chart */}
                    <Card className="lg:col-span-3 bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="p-6 pb-2 border-b border-border/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-black tracking-tight">Weekly Activity</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        Analyses &amp; datasets · last 7 days
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-blue-500/20 text-blue-500 bg-blue-500/8">
                                    {"Live"}
                                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" aria-hidden="true" />
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-4">
                            <ActivityChart />
                            <div className="flex items-center gap-5 mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" aria-hidden="true" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Analyses</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-0.5 bg-slate-400 rounded-full inline-block border-dashed" aria-hidden="true" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Datasets</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent activity feed */}
                    <Card className="lg:col-span-2 bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="p-6 pb-2 border-b border-border/10">
                            <CardTitle className="text-base font-black tracking-tight flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" aria-hidden="true" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                Your latest actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ul className="space-y-2" aria-label="Recent activity">
                                {ACTIVITY_FEED.map((item) => (
                                    <li
                                        key={item.label + item.time}
                                        className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/40 transition-colors"
                                    >
                                        <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5", item.bg)}>
                                            <item.icon size={13} className={item.color} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-foreground/80 leading-tight">{item.label}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{item.sub}</p>
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground/50 shrink-0 pt-0.5">{item.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ── Recent Datasets ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                >
                    <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-border/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-black tracking-tight flex items-center gap-2">
                                        <Database size={14} className="text-blue-500" aria-hidden="true" />
                                        Recent Datasets
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        Last 5 uploaded files
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10 transition-all"
                                    asChild
                                >
                                    <Link href="/datasets">
                                        View all
                                        <ArrowUpRight size={12} className="ml-1" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <section aria-label="Recent datasets table" className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/10">
                                            <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground px-6 py-3">Name</th>
                                            <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground px-6 py-3 hidden sm:table-cell">Rows</th>
                                            <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground px-6 py-3">Status</th>
                                            <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground px-6 py-3 hidden md:table-cell">Updated</th>
                                            <th className="px-6 py-3" aria-label="Actions" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {RECENT_DATASETS.map((ds) => {
                                            const cfg = STATUS_CONFIG[ds.status];
                                            return (
                                                <tr
                                                    key={ds.name}
                                                    className="border-b border-border/5 hover:bg-secondary/30 transition-colors group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-sm text-foreground/80 truncate max-w-50">{ds.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4 hidden sm:table-cell">
                                                        <span className="text-xs font-bold text-muted-foreground">{ds.rows}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                                            cfg.className
                                                        )}>
                                                            <cfg.icon size={10} aria-hidden="true" />
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className="text-[10px] font-bold text-muted-foreground/60">{ds.updated}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="opacity-0 group-hover:opacity-100 rounded-xl text-[10px] font-black text-blue-500 hover:bg-blue-500/10 transition-all h-7 px-3"
                                                            asChild
                                                        >
                                                            <Link href="/datasets" aria-label={`Open ${ds.name}`}>
                                                                Open <ArrowUpRight size={11} className="ml-1" aria-hidden="true" />
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </section>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </main>
    );
}
