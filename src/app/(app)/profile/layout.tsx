"use client";

import * as React from "react";
import { ProfileNav } from "./_components/ProfileNav";

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Minimal Background Grid */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-foreground/[0.02] blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Navigation Block */}
                    <aside className="lg:col-span-3 lg:sticky lg:top-24">
                        <div className="space-y-6">
                            <div className="px-1 py-2 flex items-center justify-between">
                                <h2 className="text-[10px] font-black tracking-[0.2em] text-foreground/30">Profile Navigation</h2>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                            </div>
                            <div className="relative border border-border bg-background/50 backdrop-blur-sm shadow-2xl group">
                                {/* Corner Accents */}
                                <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-foreground/20 pointer-events-none" />
                                <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-foreground/20 pointer-events-none" />
                                <ProfileNav />
                            </div>

                        </div>
                    </aside>

                    {/* Content Block */}
                    <div className="lg:col-span-9 space-y-8">
                        <div className="space-y-2 pb-6 border-b border-border/40 relative">
                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-foreground/60 -mb-[1px]" />
                            <h1 className="text-4xl font-black tracking-tight text-foreground">Account Settings</h1>
                            <p className="text-xs font-bold tracking-widest text-muted-foreground/40 italic">Manage your profile information and preferences</p>
                        </div>
                        <div className="max-w-4xl relative">
                            {/* Content Decor */}
                            <div className="absolute -top-4 -right-4 w-12 h-12 border-t border-r border-foreground/5 pointer-events-none hidden lg:block" />
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
