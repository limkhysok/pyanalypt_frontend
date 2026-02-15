"use client";

import React from "react";
import {
    User as UserIcon,
    Mail,
    Shield,
    Key,
    Camera,
    Globe,
    Github,
    LogOut,
    CheckCircle2,
    Settings
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";

export function ProfilePage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (!isLoading && !isAuthenticated) {
        redirect("/login");
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-6 bg-background">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-4">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20 transition-transform group-hover:scale-105">
                            <AvatarImage src={user?.profile_picture} alt={user?.username} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={14} />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user?.username}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1 lowercase">
                            <Mail size={14} /> {user?.email}
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                                <CheckCircle2 size={10} /> Verified
                            </span>
                        </p>
                    </div>
                    <div className="md:ml-auto">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Settings size={14} /> Edit Profile
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="border-border/40 bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm">Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Shield size={14} /> Security Level
                                    </span>
                                    <span className="text-xs font-bold text-emerald-500 uppercase">High</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Globe size={14} /> Language
                                    </span>
                                    <span className="text-xs font-medium">English (US)</span>
                                </div>
                                <Separator className="bg-border/40" />
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => logout()}
                                >
                                    <LogOut size={14} className="mr-2" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/40 bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm">Connected Accounts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-secondary flex items-center justify-center">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium">Google</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Connected</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-secondary flex items-center justify-center">
                                            <Github className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">GitHub</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold">Link Account</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Settings/Info Area */}
                    <div className="md:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="border-border/40 bg-card/30">
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>Personal information and workspace appearance.</CardDescription>
                                </CardHeader>
                                <Separator className="bg-border/40" />
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Username</label>
                                            <div className="p-2.5 rounded-md bg-secondary/50 text-sm border border-border/50">{user?.username}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                                            <div className="p-2.5 rounded-md bg-secondary/50 text-sm border border-border/50 truncate">{user?.email}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Bio / Description</label>
                                        <div className="p-2.5 rounded-md bg-secondary/50 text-sm border border-border/50 h-24 italic text-muted-foreground">
                                            No bio provided. Write something about yourself to show on your workspace profile.
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card className="border-border/40 bg-card/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-amber-500" />
                                        Password & Security
                                    </CardTitle>
                                    <CardDescription>Manage your credentials and account safety.</CardDescription>
                                </CardHeader>
                                <Separator className="bg-border/40" />
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">Two-Factor Authentication</p>
                                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                                        </div>
                                        <Button size="sm" variant="outline">Enable 2FA</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">Change Password</p>
                                            <p className="text-xs text-muted-foreground">Last updated 3 months ago.</p>
                                        </div>
                                        <Button size="sm" variant="outline">Update</Button>
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
