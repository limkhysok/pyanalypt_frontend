"use client";

import React from "react";
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
    Clock,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

export default function ProfileAuthPage() {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className="container max-w-4xl mx-auto py-10 px-6">
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Security & Authentication</h1>
                    <p className="text-muted-foreground mt-1.5">Protect your account with robust passwords and multi-factor authentication.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Password Section */}
                    <Card className="border-border/60 bg-card/30 backdrop-blur-md overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                            <Lock size={120} />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Key className="h-6 w-6 text-amber-500" />
                                Modify Password
                            </CardTitle>
                            <CardDescription>Your password should be at least 12 characters long with symbols.</CardDescription>
                        </CardHeader>
                        <Separator className="opacity-40" />
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="current" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Current Password</Label>
                                <div className="relative">
                                    <Input id="current" type={showPassword ? "text" : "password"} className="bg-background/40 border-border/40 h-11" />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="new" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">New Password</Label>
                                    <Input id="new" type="password" className="bg-background/40 border-border/40 h-11 focus:ring-primary/30" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="confirm" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Confirm New Password</Label>
                                    <Input id="confirm" type="password" className="bg-background/40 border-border/40 h-11 focus:ring-primary/30" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-1">
                                    <History size={14} /> Last changed 4 months ago
                                </p>
                                <Button className="px-10 h-11 bg-primary font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2FA Section */}
                    <Card className="border-border/60 bg-card/30 backdrop-blur-md overflow-hidden relative border-t-4 border-t-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                                        <ShieldCheck className="h-7 w-7 text-emerald-500" />
                                        Two-Factor Authentication (2FA)
                                    </CardTitle>
                                    <CardDescription>Secure your login with an extra verification layer.</CardDescription>
                                </div>
                                <Badge variant="outline" className="h-6 bg-destructive/10 text-destructive border-none px-3 font-black text-[10px] uppercase tracking-widest">Disabled</Badge>
                            </div>
                        </CardHeader>
                        <Separator className="opacity-40" />
                        <CardContent className="pt-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/40 group hover:border-primary/40 transition-all">
                                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-inner">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-sm">Authenticator App</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Code-based security using apps like Google Authenticator or Authy.
                                        </p>
                                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold mt-2 hover:bg-primary hover:text-primary-foreground border-2">Set up</Button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/40 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
                                        <RotateCcw size={24} />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-sm">Recovery Codes</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Emergency backup codes to access your account if you lose your phone.
                                        </p>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60 italic">Enable 2FA first</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/[0.03] border-2 border-primary/20">
                                <p className="text-sm text-primary font-medium flex items-center gap-2">
                                    <ShieldAlert size={18} />
                                    Why enable 2FA? 
                                    <span className="text-xs text-muted-foreground font-normal">Account theft is reduced by 99% when 2FA is active.</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
