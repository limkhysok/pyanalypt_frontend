"use client";

import React from "react";
import {
    LayoutDashboard,
    Database,
    Clock,
    BarChart2,
    ArrowUpRight,
    Plus,
    FileText,
    Zap
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stats = [
    { title: "Total Analyses", value: "128", icon: BarChart2, trend: "+12.5%", color: "text-blue-500" },
    { title: "Datasets Saved", value: "12", icon: Database, trend: "+2", color: "text-purple-500" },
    { title: "API Uptime", value: "99.9%", icon: Zap, trend: "Stable", color: "text-amber-500" },
    { title: "Report Credits", value: "850", icon: FileText, trend: "Renewed", color: "text-emerald-500" },
];

const recentActivity = [
    { name: "Financial_Report_Q4.csv", type: "CSV Analysis", date: "2 hours ago", status: "Completed" },
    { name: "User_Retention_Cohort.parquet", type: "Statistical Modeling", date: "5 hours ago", status: "Completed" },
    { name: "Sales_Forecast_2026.xlsx", type: "Predictive Analytics", date: "Yesterday", status: "Processing" },
];

export function DashboardPage() {
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
                            <Link href="/project">
                                <Plus className="mr-2 h-4 w-4" />
                                New Analysis
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: "easeOut" }}
                        >
                            <Card className="group relative bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[2.5rem] p-2 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-background/60">
                                <div className="bg-secondary/10 rounded-[2rem] border border-white/5 h-full p-6 transition-all duration-700 group-hover:bg-secondary/20 relative z-10">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] pointer-events-none" />
                                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-4 relative z-20">
                                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            {stat.title}
                                        </CardTitle>
                                        <div className={`p-2.5 rounded-xl bg-background/50 border border-border/30 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500`}>
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 relative z-20">
                                        <div className="text-4xl font-black tracking-tight">{stat.value}</div>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-wider">
                                            <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5 border border-emerald-500/20">{stat.trend}</span>
                                            from last month
                                        </p>
                                    </CardContent>
                                </div>
                                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-primary/20 rounded-[2.5rem] transition-colors duration-700 z-20" />
                            </Card>
                        </motion.div>
                    ))}
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
                                {[40, 60, 45, 90, 65, 48, 75, 55, 95, 60, 40, 80].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.05), ease: "easeOut" }}
                                        className="w-full bg-primary/20 group-hover:bg-primary/40 hover:!bg-primary rounded-t-lg transition-colors border-t border-primary/50 relative overflow-hidden group/bar cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </CardContent>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="lg:col-span-3 bg-background/40 backdrop-blur-2xl border border-border/30 rounded-[3rem] p-3 overflow-hidden group hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="bg-secondary/10 rounded-[2.5rem] border border-white/5 h-full p-8 transition-all duration-700 group-hover:bg-secondary/20 flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between relative z-10">
                                <div>
                                    <CardTitle className="text-xl font-black">Recent Activity</CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Your latest processing jobs.</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-background/50 h-8">View All</Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col relative z-10">
                                <div className="space-y-3 flex-1">
                                    {recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-center gap-4 group/item hover:bg-background/40 p-4 rounded-3xl transition-all duration-300 border border-transparent hover:border-border/50 cursor-pointer">
                                            <div className="p-3.5 rounded-2xl bg-background border border-border/30 flex items-center justify-center group-hover/item:scale-110 group-hover/item:border-primary/30 transition-all shadow-sm">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold leading-none truncate group-hover/item:text-primary transition-colors">{activity.name}</p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-2">{activity.type} • {activity.date}</p>
                                            </div>
                                            <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${activity.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {activity.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6 rounded-[1.5rem] h-12 font-bold uppercase tracking-widest text-[10px] bg-background/50 hover:bg-primary hover:text-white transition-all duration-300 group/btn border border-border/50 hover:border-primary" variant="outline">
                                    Manage Datasets
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
