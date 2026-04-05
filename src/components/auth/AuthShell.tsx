"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

interface AuthShellProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthShell({ children, title, subtitle }: Readonly<AuthShellProps>) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6 pt-32 relative overflow-hidden selection:bg-foreground/10">
            
            {/* Precision Blueprint Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />
            
            <div className="w-full max-w-[350px] relative z-10 py-10">
                
                {/* ── Brand Unit ── */}
                <div className="mb-6 flex flex-col items-center gap-4">
                    <Link href="/" className="group">
                        <div className="p-2 rounded-xl bg-background border border-border shadow-xl transition-all duration-500 group-hover:scale-110">
                             <Logo className="w-7 h-7 grayscale" />
                        </div>
                    </Link>
                    <div className="flex flex-col items-center text-center gap-1">
                        <h1 className="text-xl font-black tracking-tighter uppercase leading-none">{title}</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mt-1">{subtitle}</p>
                    </div>
                </div>

                {/* ── Main Interface ── */}
                <div className="relative group p-px rounded-[1.5rem] bg-border/40 overflow-hidden">
                    <div className="relative bg-background/60 backdrop-blur-3xl p-6 pt-7 shadow-2xl shadow-foreground/[0.01]">
                        
                        {/* Technical Corners */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-foreground/20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-foreground/20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-foreground/20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-foreground/20" />

                        {children}
                    </div>
                </div>

            </div>
        </main>
    );
}
