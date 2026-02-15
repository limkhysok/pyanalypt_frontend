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
        <main className="min-h-screen pt-28 pb-12 px-6 md:px-12 bg-background">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back, <span className="text-foreground font-medium">{user?.username || "Explorer"}</span>. Here's what's happening with your data.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <Clock className="mr-2 h-4 w-4" />
                            History
                        </Button>
                        <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href="/playground">
                                <Plus className="mr-2 h-4 w-4" />
                                New Analysis
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <span className="text-emerald-500 font-medium">{stat.trend}</span> from last month
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                    {/* Main Analytics Chart Placeholder */}
                    <Card className="lg:col-span-4 border-border/40 bg-card/30">
                        <CardHeader>
                            <CardTitle>Usage Analytics</CardTitle>
                            <CardDescription>Daily compute hours consumed over the last 30 days.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-end justify-between gap-2 px-6">
                            {[40, 60, 45, 90, 65, 48, 75, 55, 95, 60, 40, 80].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors border-t border-primary/50"
                                />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="lg:col-span-3 border-border/40 bg-card/30">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest processing jobs.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-secondary flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">{activity.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.type} • {activity.date}</p>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activity.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {activity.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-6 variant-outline group" variant="outline">
                                Manage Datasets
                                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
