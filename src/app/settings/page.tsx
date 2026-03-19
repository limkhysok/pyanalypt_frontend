"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "motion/react";
import { User, Shield, Monitor, Bell, CreditCard, Lock, ShieldCheck, LogOut, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Camera, Save, Settings } from "lucide-react";

const SESSIONS = [
    {
        id: "1",
        device: "MacBook Pro 16\"",
        browser: "Chrome",
        location: "San Francisco, US",
        ip: "192.168.1.1",
        isCurrent: true,
        lastActive: "Active now",
        type: "desktop"
    },
    {
        id: "2",
        device: "iPhone 15 Pro",
        browser: "Safari",
        location: "San Francisco, US",
        ip: "192.168.1.5",
        isCurrent: false,
        lastActive: "2 hours ago",
        type: "mobile"
    },
    {
        id: "3",
        device: "Windows Desktop",
        browser: "Edge",
        location: "London, UK",
        ip: "82.12.31.42",
        isCurrent: false,
        lastActive: "3 days ago",
        type: "desktop"
    }
];

const PROFILE_SETTINGS_TAB = "profile";

const ProfileSettingsTab = () => {
    const { user, isLoading } = useAuth();
    // fallback for bio property
    const bio = (user && typeof user === 'object' && 'bio' in user) ? (user as any).bio : undefined;

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your personal information and public presence.</p>
            </div>
            <div className="grid grid-cols-1 gap-8">
                <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>This information will be displayed to other users on the platform.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-8 space-y-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                            <div className="relative group">
                                <Avatar className="h-28 w-28 border-4 border-background ring-2 ring-primary/20 shadow-2xl transition-transform group-hover:scale-105">
                                    <AvatarImage src={user?.profile_picture ?? undefined} />
                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                                        {user?.username?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button className="absolute -bottom-1 -right-1 p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-lg font-bold">Profile Photo</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    A high-quality image helps others recognize you. PNG, JPG or GIF. Max 1MB.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <Button size="sm" variant="outline" className="px-5">Change Image</Button>
                                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">Delete Photo</Button>
                                </div>
                            </div>
                        </div>
                        {/* Form Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Username</Label>
                                <Input id="username" defaultValue={user?.username ?? undefined} className="bg-background/50 border-border/40 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Email Address</Label>
                                <Input id="email" type="email" defaultValue={user?.email ?? undefined} className="bg-background/50 border-border/40 focus:ring-primary/20" />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Bio</Label>
                                <div className="relative">
                                    <textarea 
                                        id="bio"
                                        rows={4}
                                        className="flex w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground"
                                        placeholder="Tell us about yourself..."
                                        defaultValue={bio ?? undefined}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground text-right italic pt-1">Briefly describe your expertise and interests.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" className="px-8">Discard Changes</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 shadow-lg shadow-primary/20 gap-2">
                                <Save size={16} />
                                Save Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-destructive/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-destructive font-bold">Advanced Settings</CardTitle>
                        <CardDescription>Actions that affect your entire account data visibility.</CardDescription>
                    </CardHeader>
                    <Separator className="opacity-20 bg-destructive" />
                    <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Reset Dashboard Layout</p>
                            <p className="text-xs text-muted-foreground">Restore your dashboard view components to their default state.</p>
                        </div>
                        <Button variant="outline" className="text-xs font-bold uppercase tracking-tight">Reset Now</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const SETTINGS_TABS = [
    { id: "general", label: "General", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "sessions", label: "Active Sessions", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: PROFILE_SETTINGS_TAB, label: "Profile", icon: Settings },
];

export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const [activeTab, setActiveTab] = React.useState("general");

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-10 px-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col space-y-1.5 px-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
                    {/* Navigation Sidebar */}
                    <aside className="space-y-1">
                        {SETTINGS_TABS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    activeTab === item.id
                                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content Area */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {activeTab === PROFILE_SETTINGS_TAB ? (
                                <ProfileSettingsTab />
                            ) : (
                                // ...existing tab content logic...
                                null
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
