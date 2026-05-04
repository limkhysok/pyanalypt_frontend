"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Activity, 
    TrendingUp, 
    Database, 
    HardDrive, 
    Search, 
    Upload, 
    AlertCircle, 
    CheckCircle2, 
    Loader,
    LayoutDashboard,
    Clock,
    ArrowUpRight,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { datasetApi } from "@/services/dataset.service";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorkspaceStat {
    value: string;
    trend: string;
    trend_up: boolean;
}

interface WorkspaceSummary {
    stats: {
        total_datasets: WorkspaceStat;
        total_analyses: WorkspaceStat;
        total_insights: WorkspaceStat;
        storage_used: {
            value: string;
            label: string;
            pct: number;
            trend_up: boolean;
        };
    };
    recent_datasets: Array<{
        id: number;
        name: string;
        status: string;
        updated: string;
        rows?: number;
    }>;
    activity_feed: Array<{
        action: string;
        label: string;
        sub: string;
        time: string;
    }>;
    chart_data: {
        days: string[];
        analyses: number[];
        datasets: number[];
    };
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    ready:      { icon: CheckCircle2, label: "Ready",      className: "text-blue-500 bg-blue-500/10 border-blue-500/20"     },
    processing: { icon: Loader,       label: "Processing", className: "text-foreground/60 bg-secondary/60 border-border/20" },
    error:      { icon: AlertCircle,  label: "Error",      className: "text-amber-500 bg-amber-500/10 border-amber-500/20"  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ stat, index }: Readonly<{ 
    stat: { 
        title: string; 
        value: string; 
        label: string; 
        trend: string; 
        trendUp: boolean; 
        icon: React.ElementType 
    }; 
    index: number 
}>) {
    const Icon = stat.icon;
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
                        <p className="text-[10px] font-black capitalize tracking-widest text-muted-foreground">{stat.title}</p>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Icon size={14} className="text-blue-500" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="text-3xl font-black tracking-tight text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-bold capitalize tracking-widest mt-1">{stat.label}</p>
                    <div className="mt-4 pt-4 border-t border-border/10">
                        <span className={cn(
                            "text-[9px] font-black capitalize tracking-widest px-2.5 py-1 rounded-full border",
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

function ActivityChart({ data }: Readonly<{ data?: WorkspaceSummary["chart_data"] }>) {
    const days = data?.days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = data?.analyses || [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(...values, 10);

    return (
        <div className="h-full flex items-end justify-between gap-1 px-2 pb-2">
            {values.map((val: number, i: number) => (
                <div key={days[i]} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    <div className="relative w-full flex items-end justify-center h-32">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / max) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                            className="w-full max-w-[20px] bg-linear-to-t from-blue-600 to-blue-400 rounded-t-sm group-hover/bar:from-blue-500 group-hover/bar:to-blue-300 transition-all duration-300 relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded-sm opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                {val}
                            </div>
                        </motion.div>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{days[i]}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [summary, setSummary] = React.useState<WorkspaceSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    React.useEffect(() => {
        if (isAuthenticated) {
            datasetApi.workspaceSummary()
                .then(setSummary)
                .catch(err => console.error("Dashboard data load failed:", err))
                .finally(() => setSummaryLoading(false));
        }
    }, [isAuthenticated]);

    if (authLoading || summaryLoading) {
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

    const stats = summary ? [
        { title: "Total Datasets", value: summary.stats.total_datasets.value, label: "files uploaded", trend: summary.stats.total_datasets.trend, trendUp: summary.stats.total_datasets.trend_up, icon: Database },
        { title: "Analyses Run", value: summary.stats.total_analyses.value, label: "jobs completed", trend: summary.stats.total_analyses.trend, trendUp: summary.stats.total_analyses.trend_up, icon: Activity },
        { title: "Insights Found", value: summary.stats.total_insights.value, label: "auto-detections", trend: summary.stats.total_insights.trend, trendUp: summary.stats.total_insights.trend_up, icon: TrendingUp },
        { title: "Storage Used", value: summary.stats.storage_used.value, label: summary.stats.storage_used.label, trend: `${summary.stats.storage_used.pct}% capacity`, trendUp: false, icon: HardDrive },
    ] : [];

    const recentDatasets = summary?.recent_datasets || [];
    const activityFeed = summary?.activity_feed || [];
    const displayName = user?.full_name || user?.username || "there";
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    return (
        <main className="min-h-screen pb-16 px-6 md:px-10 bg-background relative z-0">
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10 pt-10">

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <LayoutDashboard size={16} className="text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Command Center</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            Welcome back, <span className="text-blue-500">{displayName}</span>
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground/60 flex items-center gap-2">
                            <Clock size={14} className="text-muted-foreground/40" />
                            {today} · Workspace status: <span className="text-emerald-500">Active</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-full h-11 px-6 border-border/20 bg-background/50 hover:bg-background font-bold text-[11px] uppercase tracking-widest transition-all" asChild>
                            <Link href="/datasets">View Data</Link>
                        </Button>
                        <Button className="rounded-full h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95" asChild>
                            <Link href="/datasets">
                                <Upload size={14} className="mr-2" /> Import
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {stats.map((stat, i) => (
                        <StatCard key={stat.title} stat={stat} index={i} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    <Card className="lg:col-span-2 bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground/80">Weekly Activity</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase">Analyses run per day</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full px-3 py-1 bg-blue-500/5 text-blue-500 border-blue-500/20 text-[9px] font-black uppercase tracking-widest">Live Trend</Badge>
                        </CardHeader>
                        <CardContent className="p-6 pt-10">
                            <ActivityChart data={summary?.chart_data} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="p-6 pb-2 border-b border-border/10">
                            <CardTitle className="text-base font-black tracking-tight flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" aria-hidden="true" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold capitalize tracking-widest mt-0.5">
                                Your latest workspace events
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ul className="space-y-2" aria-label="Recent activity">
                                {activityFeed.length > 0 ? activityFeed.map((item) => {
                                    let Icon = CheckCircle2;
                                    let color = "text-blue-500";
                                    let bg = "bg-blue-500/10";
                                    if (item.action === "UPLOAD") { Icon = Upload; color = "text-foreground/60"; bg = "bg-secondary/60"; }
                                    if (item.action === "AI_ANALYSIS") { Icon = Search; color = "text-blue-500"; bg = "bg-blue-500/10"; }
                                    return (
                                        <li key={`${item.label}-${item.time}`} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/40 transition-colors">
                                            <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5", bg)}>
                                                <Icon size={13} className={color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-foreground/80 leading-tight">{item.label}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{item.sub}</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground/50 shrink-0 pt-0.5">{item.time}</span>
                                        </li>
                                    );
                                }) : <p className="text-[10px] text-muted-foreground text-center py-4">No recent activity.</p>}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                >
                    <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-border/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-black tracking-tight">Recent Datasets</CardTitle>
                                <CardDescription className="text-[10px] font-bold capitalize tracking-widest mt-0.5">
                                    Manage your primary data assets
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black text-blue-500 hover:bg-blue-500/10 transition-all h-8 px-4" asChild>
                                <Link href="/datasets">
                                    View All <ArrowUpRight size={12} className="ml-1.5" aria-hidden="true" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <section className="overflow-x-auto" aria-label="Datasets list">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/5">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">File Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hidden sm:table-cell">Rows</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hidden md:table-cell">Last Sync</th>
                                            <th className="px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentDatasets.map((ds) => {
                                            const cfg = STATUS_CONFIG[ds.status] || STATUS_CONFIG.ready;
                                            return (
                                                <tr key={ds.id} className="border-b border-border/5 hover:bg-secondary/30 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-sm text-foreground/80">{ds.name}</td>
                                                    <td className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell">{ds.rows || "---"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", cfg.className)}>
                                                            <cfg.icon size={10} /> {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] text-muted-foreground hidden md:table-cell">{ds.updated}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href="/datasets" className="text-blue-500 hover:text-blue-600 text-[10px] font-black uppercase">Open</Link>
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
