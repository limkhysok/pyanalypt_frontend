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

    if (!isAuthenticated) return null;

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
                            Welcome back, <span className="text-foreground font-medium">{user?.username || "Explorer"}</span>. Here's what's happening with your data.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="flex items-center gap-3"
                    >
                        <Button variant="outline" size="sm" className="hidden sm:flex rounded-full px-6 h-10 bg-background/50 border-border/50 hover:bg-secondary/50 transition-all font-bold tracking-widest text-[10px] uppercase">
                            <Clock className="mr-2 h-4 w-4" />
                            History
                        </Button>
                        <Button size="sm" asChild className="rounded-full px-6 h-10 bg-foreground text-background hover:bg-primary transition-all duration-300 font-bold tracking-widest text-[10px] uppercase hover:ambient-glow-mono shadow-sm">
                            <Link href="/datasets">
                                <Plus className="mr-2 h-4 w-4" />
                                Import Dataset
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: "easeOut" }}
                        >
                            <Card className="group relative bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[2.5rem] p-2 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-background/60">
                                <div className="bg-secondary/10 rounded-[2rem] border border-white/5 h-full p-6 transition-all duration-700 group-hover:bg-secondary/20 relative z-10">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] pointer-events-none" />
                                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-4 relative z-20">
                                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                            {stat.title}
                                        </CardTitle>
                                        <div className={`p-2.5 rounded-xl bg-background/50 border border-border/30 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500 shadow-inner`}>
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 relative z-20">
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <p className="text-[9px] font-black text-muted-foreground mt-4 uppercase tracking-[0.15em] flex items-center gap-2">
                                            <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">{stat.trend}</span> momentum
                                        </p>
                                    </CardContent>
                                </div>
                                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary/20 rounded-[2.5rem] transition-colors duration-700 z-20" />
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Neural Discovery Spotlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full bg-foreground text-background rounded-[3.5rem] overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-colors" />
                            
                            <CardContent className="p-12 relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-background/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <Brain className="h-6 w-6 text-primary" />
                                    </div>
                                    <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full">Neural Spotlight</Badge>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black tracking-tight leading-none">High-Fidelity Correlation Detected.</h2>
                                    <p className="text-background/60 text-lg font-medium max-w-xl">
                                        In your recent <span className="text-primary font-black">Supply Chain Optimization</span> dataset, the core algorithm detected a <span className="text-white font-black underline decoration-primary underline-offset-4">0.92 coefficient</span> between automated latency and total fuel expenditure.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-background/40 mb-1">Confidence Score</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">98.4%</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-background/40 mb-1">Impact Radius</span>
                                        <span className="text-2xl font-black text-white tracking-tighter">GLOBAL_LOGISTICS</span>
                                    </div>
                                    <Button className="ml-auto bg-primary text-primary-foreground hover:ambient-glow rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                        Inspect Vector Space
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Category Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        <Card className="h-full bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3.5rem] p-3 overflow-hidden group hover:border-primary/40 transition-all duration-700">
                            <div className="bg-secondary/10 rounded-[3rem] border border-white/5 h-full p-8 transition-all duration-700 group-hover:bg-secondary/20 flex flex-col relative overflow-hidden">
                                <CardHeader className="p-0 pb-6 relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <PieChartIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl font-black">Dataset Matrix</CardTitle>
                                    </div>
                                    <CardDescription className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Analytical volume by domain.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 flex items-center justify-center relative z-10">
                                    <ReactECharts
                                        style={{ height: '300px', width: '100%' }}
                                        option={{
                                            tooltip: { trigger: 'item' },
                                            legend: { bottom: '0%', left: 'center', textStyle: { color: '#888', fontSize: 10, fontWeight: 'bold' }, icon: 'circle' },
                                            series: [{
                                                name: 'Intelligence Domain',
                                                type: 'pie',
                                                radius: ['45%', '75%'],
                                                avoidLabelOverlap: false,
                                                itemStyle: { borderRadius: 12, borderColor: 'transparent', borderWidth: 2 },
                                                label: { show: false },
                                                emphasis: { label: { show: false } },
                                                data: [
                                                    { value: 40, name: 'Machine Learning', itemStyle: { color: '#3b82f6' } },
                                                    { value: 25, name: 'Data Research', itemStyle: { color: '#a855f7' } },
                                                    { value: 20, name: 'Financials', itemStyle: { color: '#10b981' } },
                                                    { value: 15, name: 'Predictive', itemStyle: { color: '#f59e0b' } },
                                                ]
                                            }]
                                        }}
                                    />
                                </CardContent>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="grid grid-cols-1 lg:grid-cols-7 gap-8"
                >
                    {/* Main Analytics Chart Placeholder */}
                    <Card className="lg:col-span-4 bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-3 overflow-hidden group hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="bg-secondary/10 rounded-[2.5rem] border border-white/5 h-full p-8 transition-all duration-700 group-hover:bg-secondary/20 flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <CardHeader className="p-0 pb-6 relative z-10">
                                <CardTitle className="text-xl font-black">Usage Analytics</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily compute hours consumed over the last 30 days.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex items-end justify-between gap-3 h-[300px] relative z-10">
                                {[
                                    { h: 40, id: 'h1' }, { h: 60, id: 'h2' }, { h: 45, id: 'h3' }, 
                                    { h: 90, id: 'h4' }, { h: 65, id: 'h5' }, { h: 48, id: 'h6' }, 
                                    { h: 75, id: 'h7' }, { h: 55, id: 'h8' }, { h: 95, id: 'h9' }, 
                                    { h: 60, id: 'h10' }, { h: 40, id: 'h11' }, { h: 80, id: 'h12' }
                                ].map((bar, i) => (
                                    <motion.div
                                        key={bar.id}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${bar.h}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.05), ease: "easeOut" }}
                                        className="w-full bg-primary/20 group-hover:bg-primary/40 hover:!bg-primary rounded-t-lg transition-colors border-t border-primary/50 relative overflow-hidden group/bar cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </CardContent>
                        </div>
                    </Card>

                    {/* Recent Activity / Pipeline Pulse */}
                    <Card className="lg:col-span-3 bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-3 overflow-hidden group hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="bg-secondary/10 rounded-[2.5rem] border border-white/5 h-full p-8 transition-all duration-700 group-hover:bg-secondary/20 flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                                        </div>
                                        <CardTitle className="text-xl font-black">Pipeline Pulse</CardTitle>
                                    </div>
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time vector operations status.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col relative z-10">
                                <div className="space-y-4 flex-1">
                                    {[
                                        { name: "Global_Sales_2026", type: "Neural Ingestion", status: "Active", progress: 65, color: "bg-blue-500" },
                                        { name: "Retention_Analysis", type: "Clustering ML", status: "Indexing", progress: 88, color: "bg-purple-500" },
                                        { name: "Risk_Profiling_Vector", type: "Vector Alignment", status: "Queued", progress: 0, color: "bg-zinc-500" }
                                    ].map((job) => (
                                        <div key={job.name} className="p-5 rounded-[2rem] bg-background/40 border border-border/20 group/item hover:bg-background/60 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]", job.color)} />
                                                    <p className="text-sm font-black text-foreground/80 truncate max-w-[120px]">{job.name}</p>
                                                </div>
                                                <Badge className="bg-background border-border/4 hover:bg-background h-6 text-[9px] font-black uppercase tracking-widest px-2.5">{job.status}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    <span>{job.type}</span>
                                                    <span>{job.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${job.progress}%` }}
                                                        transition={{ duration: 1.5 }}
                                                        className={cn("h-full rounded-full shadow-[0_0_10px", job.progress > 0 ? job.color : "bg-transparent")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6 rounded-[2rem] h-14 font-black uppercase tracking-widest text-[10px] bg-background/50 hover:bg-primary hover:text-white transition-all duration-300 group/btn border border-border/50 hover:border-primary" variant="outline" onClick={() => router.push('/datasets')}>
                                    Explore Datasets
                                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                </Button>
                            </CardContent>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}
