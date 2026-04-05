"use client";

import React from "react";
import {
    Monitor,
    Smartphone,
    Laptop,
    Shield,
    Globe,
    Clock,
    LogOut,
    Trash2,
    Eye,
    Info,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

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
    },
    {
        id: "4",
        device: "Ubuntu Workstation",
        os: "Linux (Ubuntu 22.04)",
        browser: "Firefox (121.0)",
        user_agent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
        location: "Berlin, EN",
        ip: "95.216.32.110",
        isCurrent: false,
        loginTime: "2024-03-08 02:15 PM",
        type: "desktop"
    }
];

export default function ProfileSessionsPage() {
    return (
        <div className="container max-w-5xl mx-auto py-10 px-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-extrabold tracking-tight">Active Sessions</h1>
                        <p className="text-muted-foreground">Manage and track your active logins across different devices.</p>
                    </div>
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10 border-destructive/20 border-2 font-bold px-6">
                        Logout from all other devices
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {SESSIONS.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`group border-border/40 hover:border-primary/40 transition-all duration-300 ${session.isCurrent ? "bg-primary/[0.03] border-primary/20" : "bg-card/20 shadow-sm"}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-6">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-colors ${session.isCurrent ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-secondary/40 border-border/40 text-muted-foreground group-hover:border-primary/20"}`}>
                                                {session.os.includes("Windows") && <Monitor size={28} />}
                                                {session.os.includes("Mac") && <Laptop size={28} />}
                                                {session.os.includes("iOS") && <Smartphone size={28} />}
                                                {session.os.includes("Linux") && <Monitor size={28} />}
                                            </div>
                                            
                                            <div className="space-y-1.5 pt-0.5">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold tracking-tight">{session.device}</h3>
                                                    {session.isCurrent && (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                                                            Current Device
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5 font-medium"><Globe size={14} className="opacity-70" /> {session.location}</span>
                                                    <span className="opacity-40">•</span>
                                                    <span className="flex items-center gap-1.5 font-medium"><span className="text-xs opacity-70">IP:</span> {session.ip}</span>
                                                    <span className="opacity-40">•</span>
                                                    <span className="flex items-center gap-1.5 font-medium italic"><Clock size={14} className="opacity-70" /> {session.loginTime}</span>
                                                </div>

                                                <div className="pt-2 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-bold bg-background/50 border-border/40 uppercase px-2 py-0 border-2">{session.browser}</Badge>
                                                    <Badge variant="outline" className="text-[10px] font-bold bg-background/50 border-border/40 uppercase px-2 py-0 border-2">{session.os}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 group/btn">
                                                <Info size={18} />
                                            </Button>
                                            {!session.isCurrent && (
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 size={18} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* User Agent Detail (Reveal On Group Hover or Mobile) */}
                                    <div className="mt-4 pt-4 border-t border-border/20 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                        <p className="text-[10px] font-mono text-muted-foreground truncate bg-black/5 p-2 rounded-lg">
                                            <span className="text-primary/70 font-bold uppercase mr-2">User Agent:</span>
                                            {session.user_agent}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-primary/5 border-2 border-primary/10 shadow-lg shadow-primary/5">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Shield size={24} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-sm uppercase tracking-tight">Security Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                            If you notice any sessions from unfamiliar locations or devices, revoke them immediately and reset your password for better protection. 
                        </p>
                        <Button variant="link" className="p-0 h-auto text-xs text-primary font-black uppercase tracking-widest mt-2">
                            Review Security Checklist <ChevronRight size={14} className="ml-1 inline" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
