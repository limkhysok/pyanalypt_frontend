"use client";

import React from "react";
import {
    Monitor,
    Smartphone,
    Laptop,
    Shield,
    Globe,
    Clock,
    Trash2,
    Info,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { ProfileNav } from "../_components/ProfileNav";

const SESSIONS = [
    {
        id: "1",
        device: "Windows Desktop",
        os: "Windows 11",
        browser: "Chrome (122.0.0.0)",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
        location: "Phnom Penh, KH",
        ip: "119.124.31.42",
        isCurrent: true,
        loginTime: "2024-03-14 09:12 AM",
        type: "desktop"
    },
    {
        id: "2",
        device: "MacBook Pro 16\"",
        os: "macOS Sonoma",
        browser: "Safari (17.2.1)",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15...",
        location: "London, EN",
        ip: "203.115.15.98",
        isCurrent: false,
        loginTime: "2024-03-12 04:45 PM",
        type: "desktop"
    },
    {
        id: "3",
        device: "iPhone 15 Pro",
        os: "iOS 17.3",
        browser: "Safari Mobile",
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1...",
        location: "Paris, EN",
        ip: "82.12.31.42",
        isCurrent: false,
        loginTime: "2024-03-10 11:20 AM",
        type: "mobile"
    }
];

export default function ProfileSessionsPage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-1"
                    >
                        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and track your active logins across different devices.
                        </p>
                    </motion.div>
                    <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl border border-destructive/20 transition-all">
                        Logout from all other devices
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Sidebar Navigation */}
                    <motion.aside 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-3 lg:sticky lg:top-20"
                    >
                        <div className="p-1 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md">
                            <ProfileNav />
                        </div>
                    </motion.aside>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        <div className="space-y-4">
                            {SESSIONS.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                                >
                                    <Card className={`group rounded-2xl border-border/60 overflow-hidden transition-all duration-300 ${session.isCurrent ? "bg-blue-500/[0.03] border-blue-500/20" : "bg-background/50 backdrop-blur-xl hover:border-blue-500/20 shadow-sm"}`}>
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all ${session.isCurrent ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "bg-muted/40 border-border/40 text-muted-foreground group-hover:border-blue-500/20"}`}>
                                                        {session.os.includes("Windows") && <Monitor size={22} />}
                                                        {session.os.includes("Mac") && <Laptop size={22} />}
                                                        {session.os.includes("iOS") && <Smartphone size={22} />}
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-[14px] font-bold tracking-tight">{session.device}</h3>
                                                            {session.isCurrent && (
                                                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full">
                                                                    Current
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                                                            <span className="flex items-center gap-1.5"><Globe size={13} className="opacity-70" /> {session.location}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="flex items-center gap-1.5 font-mono opacity-80">{session.ip}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="flex items-center gap-1.5 italic"><Clock size={13} className="opacity-70" /> {session.loginTime}</span>
                                                        </div>

                                                        <div className="pt-2 flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[9px] font-bold bg-muted/20 border-border/40 uppercase px-2 py-0 rounded-md">{session.browser}</Badge>
                                                            <Badge variant="outline" className="text-[9px] font-bold bg-muted/20 border-border/40 uppercase px-2 py-0 rounded-md">{session.os}</Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                                                        <Info size={16} />
                                                    </Button>
                                                    {!session.isCurrent && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-start gap-4 p-5 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 shadow-sm"
                        >
                            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                                <Shield size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[13px] uppercase tracking-tight">Security Recommendations</h4>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    Notice any sessions from unfamiliar locations? Revoke them immediately and reset your password for maximum protection.
                                </p>
                                <Button variant="link" className="p-0 h-auto text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-1">
                                    Security Checklist <ChevronRight size={14} className="ml-1 inline" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
