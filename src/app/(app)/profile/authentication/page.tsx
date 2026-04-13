"use client";

import React, { useState } from "react";
import {
    Lock,
    Key,
    ShieldCheck,
    Smartphone,
    RotateCcw,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldAlert,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { ProfileNav } from "../_components/ProfileNav";

export default function ProfileAuthPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-1"
                >
                    <h1 className="text-2xl font-bold tracking-tight">Security & Authentication</h1>
                    <p className="text-sm text-muted-foreground">
                        Protect your account with robust passwords and multi-factor authentication.
                    </p>
                </motion.div>

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
                    <div className="lg:col-span-9 space-y-8">
                        
                        {/* Password Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                                    <Lock size={120} />
                                </div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                        <Key className="h-5 w-5 text-amber-500" />
                                        Modify Password
                                    </CardTitle>
                                    <CardDescription className="text-[12px]">
                                        Your password should be at least 12 characters long with symbols.
                                    </CardDescription>
                                </CardHeader>
                                <Separator className="opacity-40" />
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                            Current Password
                                        </Label>
                                        <div className="relative">
                                            <Input 
                                                id="current" 
                                                type={showPassword ? "text" : "password"} 
                                                className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all" 
                                            />
                                            <button 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                                New Password
                                            </Label>
                                            <Input 
                                                id="new" 
                                                type="password" 
                                                className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                                Confirm New Password
                                            </Label>
                                            <Input 
                                                id="confirm" 
                                                type="password" 
                                                className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                            <History size={14} /> Last changed 4 months ago
                                        </p>
                                        <Button className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20">
                                            Update Password
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* 2FA Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative border-t-2 border-t-blue-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                                Two-Factor Authentication (2FA)
                                            </CardTitle>
                                            <CardDescription className="text-[12px]">
                                                Secure your login with an extra verification layer.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="h-5 bg-destructive/10 text-destructive border-none px-2 font-bold text-[9px] uppercase tracking-widest rounded-full">
                                            Disabled
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <Separator className="opacity-40" />
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/40 group hover:border-blue-500/40 transition-all">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center text-blue-500 shadow-sm border border-border/20">
                                                <Smartphone size={18} />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <h4 className="font-bold text-[13px]">Authenticator App</h4>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Use Google Authenticator or Authy for code-based security.
                                                </p>
                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold mt-2 hover:bg-blue-500 hover:text-white rounded-lg border-2">Set up</Button>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center text-muted-foreground shadow-sm border border-border/20">
                                                <RotateCcw size={18} />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <h4 className="font-bold text-[13px]">Recovery Codes</h4>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Emergency backup codes to access your account.
                                                </p>
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/60 italic">Enable 2FA first</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/20">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                                            <ShieldAlert size={16} />
                                            Why enable 2FA? 
                                            <span className="text-xs text-muted-foreground font-normal">Account theft is reduced by 99% when active.</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
