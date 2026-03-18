"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Mail, Calendar, ArrowRight, ShieldCheck, Fingerprint, CheckCircle2, Sparkles, Camera } from "lucide-react";

export default function ProfilePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container max-w-5xl mx-auto py-16 px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-12"
                >
                    {/* Premium Profile Header */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
                        <div className="relative group">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative p-1 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-2xl shadow-primary/20"
                            >
                                <Avatar className="h-40 w-40 border-[6px] border-background  transition-transform duration-500 group-hover:scale-[0.98]">
                                    <AvatarImage src={user?.profile_picture ?? undefined} alt={user?.username} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-secondary text-primary font-black">
                                        {user?.username?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                className="absolute bottom-2 right-2 p-3 rounded-2xl bg-primary text-primary-foreground shadow-xl cursor-pointer border-4 border-background"
                            >
                                <Camera size={18} />
                            </motion.div>
                        </div>
                        
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="space-y-1">
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col sm:flex-row items-center gap-3"
                                >
                                    <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                        {user?.full_name || `${user?.first_name} ${user?.last_name}`.trim() || user?.username}
                                    </h1>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest h-fit">
                                        PRO MEMBER
                                    </Badge>
                                </motion.div>
                                <p className="text-xl text-muted-foreground font-medium flex items-center justify-center lg:justify-start gap-2">
                                    <span className="opacity-50">@</span>{user?.username}
                                </p>
                            </div>

                            {/* ...existing code... */}
                        </div>
                    </div>

                    {/* Identity Glass Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <Card className="lg:col-span-8 border-none bg-secondary/20 backdrop-blur-3xl overflow-hidden relative shadow-2xl ring-1 ring-border/50">
                            {/* Decorative Grid Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                            />
                            
                            <CardContent className="p-0">
                                <div className="p-8 border-b border-border/50 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                                            <Fingerprint size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase tracking-tight">Personal Identity</h3>
                                            <p className="text-xs text-muted-foreground font-medium">Verify your authenticated credentials and workspace details.</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Trust Score: High</span>
                                    </div>
                                </div>

                                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-2 group">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Legal Full Name</p>
                                        <div className="text-xl font-bold tracking-tight text-foreground/90">{user?.full_name || "Not Specified"}</div>
                                        <div className="h-1 w-8 bg-primary/20 rounded-full" />
                                    </div>

                                    <div className="space-y-2 group">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Digital Identity</p>
                                        <div className="text-xl font-extrabold tracking-tight text-foreground/90">@{user?.username}</div>
                                        <div className="h-1 w-8 bg-primary/20 rounded-full" />
                                    </div>

                                    <div className="md:col-span-2 space-y-6">
                                        <div className="space-y-2 group">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Primary Communication</p>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                                                <span className="text-xl font-bold tracking-tight text-foreground/90">{user?.email}</span>
                                                <div className="flex items-center gap-3">
                                                    {/* ...existing code... */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Snapshot (Secondary Info) */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none bg-primary/[0.03] ring-1 ring-primary/10 overflow-hidden group hover:bg-primary/[0.05] transition-colors duration-300">
                                <CardContent className="p-8 space-y-6">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                        <ShieldCheck size={26} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-sm uppercase tracking-wider">Workspace Security</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Your account is secured with Google OAuth 2.0. Manage your active sessions and device history in the security hub.
                                        </p>
                                    </div>
                                    <Link href="/profile/authentication">
                                        <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:no-underline group/link">
                                            Security Hub 
                                            <ArrowRight size={14} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <div className="p-8 rounded-3xl bg-secondary/10 border border-border/50 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-3 rounded-full bg-background border border-border/50 shadow-sm">
                                    <Sparkles size={20} className="text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-xs font-black uppercase tracking-widest">Premium Workspace</h5>
                                    <p className="text-[10px] text-muted-foreground font-medium underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">View Subscription Tier</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
