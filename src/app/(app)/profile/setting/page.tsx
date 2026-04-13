"use client";

import React from "react";
import { motion } from "motion/react";
import { Bell, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProfileNav } from "../_components/ProfileNav";

export default function ProfileSettingsPage() {
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
                    <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Customize your workspace experience and notification preferences.
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
                        
                        {/* Appearance section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                        <Palette className="h-5 w-5 text-purple-500" />
                                        Appearance
                                    </CardTitle>
                                    <CardDescription className="text-[12px]">
                                        Manage how the application looks on your device.
                                    </CardDescription>
                                </CardHeader>
                                <Separator className="opacity-40" />
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-[13px] font-bold">High Contrast Mode</Label>
                                            <p className="text-[11px] text-muted-foreground">Increase visibility of UI elements.</p>
                                        </div>
                                        <div className="h-5 w-9 rounded-full bg-muted flex items-center px-1">
                                            <div className="h-3 w-3 rounded-full bg-background shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-[13px] font-bold">Reduce Motion</Label>
                                            <p className="text-[11px] text-muted-foreground">Minimize animations for better accessibility.</p>
                                        </div>
                                        <div className="h-5 w-9 rounded-full bg-blue-500 flex items-center justify-end px-1">
                                            <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Notifications section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                        <Bell className="h-5 w-5 text-blue-500" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription className="text-[12px]">
                                        Control which alerts you receive.
                                    </CardDescription>
                                </CardHeader>
                                <Separator className="opacity-40" />
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-[13px] font-bold">Email Notifications</Label>
                                            <p className="text-[11px] text-muted-foreground">Daily digest and account alerts.</p>
                                        </div>
                                        <div className="h-5 w-9 rounded-full bg-blue-500 flex items-center justify-end px-1">
                                            <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-[13px] font-bold">Desktop Alerts</Label>
                                            <p className="text-[11px] text-muted-foreground">Real-time status updates.</p>
                                        </div>
                                        <div className="h-5 w-9 rounded-full bg-muted flex items-center px-1">
                                            <div className="h-3 w-3 rounded-full bg-background shadow-sm" />
                                        </div>
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
