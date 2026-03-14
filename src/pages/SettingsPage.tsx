"use client";

import React from "react";
import {
    User,
    Mail,
    Shield,
    Key,
    Laptop,
    Smartphone,
    Monitor,
    ShieldCheck,
    LogOut,
    CheckCircle2,
    Settings,
    Bell,
    Lock,
    Eye,
    Globe,
    CreditCard,
    History,
    MoreHorizontal,
    Trash2
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

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

export function SettingsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [activeTab, setActiveTab] = React.useState("general");

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
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
                        {[
                            { id: "general", label: "General", icon: User },
                            { id: "security", label: "Security", icon: Shield },
                            { id: "sessions", label: "Active Sessions", icon: Monitor },
                            { id: "notifications", label: "Notifications", icon: Bell },
                            { id: "billing", label: "Billing", icon: CreditCard },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={React.useMemo(() => (`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === item.id 
                                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary" 
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"}
                                `), [activeTab, item.id])}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content Area */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {activeTab === "general" && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                                        <CardHeader className="pb-4">
                                            <CardTitle>Profile Information</CardTitle>
                                            <CardDescription>Update your personal details and public profile.</CardDescription>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-6 space-y-8">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                <div className="relative group">
                                                    <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20 shadow-xl transition-transform group-hover:scale-105">
                                                        <AvatarImage src={user?.profile_picture} />
                                                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                                            {user?.username?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                                                        <Monitor size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5 flex-1">
                                                    <h3 className="text-lg font-semibold">Profile Photo</h3>
                                                    <p className="text-sm text-muted-foreground px-1">PNG, JPG or GIF. Max size of 800K.</p>
                                                    <div className="flex gap-2 pt-1">
                                                        <Button size="sm" variant="outline">Upload New</Button>
                                                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">Remove</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input id="username" defaultValue={user?.username} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" type="email" defaultValue={user?.email} />
                                                </div>
                                                <div className="sm:col-span-2 space-y-2">
                                                    <Label htmlFor="bio">Bio</Label>
                                                    <div className="relative">
                                                        <textarea 
                                                            id="bio"
                                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                            placeholder="Tell us a bit about yourself..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button variant="outline">Cancel</Button>
                                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">Save Changes</Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/60 bg-destructive/5 overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                            <CardDescription>Irreversible actions for your account.</CardDescription>
                                        </CardHeader>
                                        <Separator className="bg-destructive/10" />
                                        <CardContent className="pt-6 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold">Delete Account</p>
                                                <p className="text-xs text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                                            </div>
                                            <Button variant="ghost" className="text-destructive hover:bg-destructive/20 border-destructive/20 border">Delete Workspace</Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-border/60">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Lock className="h-5 w-5 text-amber-500" />
                                                Change Password
                                            </CardTitle>
                                            <CardDescription>Strengthen your account safety by updating your password regularly.</CardDescription>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="current">Current Password</Label>
                                                <Input id="current" type="password" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="new">New Password</Label>
                                                    <Input id="new" type="password" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirm">Confirm New Password</Label>
                                                    <Input id="confirm" type="password" />
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-end">
                                                <Button className="px-6">Update Password</Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/60">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                                Two-Factor Authentication
                                            </CardTitle>
                                            <CardDescription>Add an extra layer of protection to your account with 2FA.</CardDescription>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/40">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold">2FA is currently <span className="text-destructive">Disabled</span></span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground max-w-sm">Use an authenticator app like Google Authenticator or Authy to secure your account.</p>
                                                </div>
                                                <Button variant="outline">Setup 2FA</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {activeTab === "sessions" && (
                                <motion.div
                                    key="sessions"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">Active Sessions</h3>
                                                <p className="text-sm text-muted-foreground">Devices where you are currently logged in.</p>
                                            </div>
                                            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs gap-2">
                                                <LogOut size={14} /> Log out from all other sessions
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {SESSIONS.map((session) => (
                                                <Card key={session.id} className={React.useMemo(() => (`
                                                    border-border/40 hover:border-primary/20 transition-colors
                                                    ${session.isCurrent ? "bg-primary/[0.02] border-primary/20" : "bg-card/30"}
                                                `), [session.isCurrent])}>
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground border border-border/40">
                                                                {session.type === "desktop" ? <Monitor size={20} /> : <Smartphone size={20} />}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold">{session.device}</span>
                                                                    {session.isCurrent && (
                                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 text-[10px] h-4 font-bold border-none uppercase tracking-tight">Active Now</Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span>{session.browser}</span>
                                                                    <span>•</span>
                                                                    <span>{session.location}</span>
                                                                    <span>•</span>
                                                                    <span>{session.ip}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!session.isCurrent && (
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    <Card className="border-border/60 bg-primary/5 border-primary/20">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                                <Eye size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm">Review unrecognized sessions</h4>
                                                <p className="text-xs text-muted-foreground">If you see a session you don't recognize, log out out of it immediately and change your password.</p>
                                                <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold">Learn more about account security →</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
