"use client";

import React from "react";

interface AuthShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthShell({ children, title, subtitle }: Readonly<AuthShellProps>) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-background text-foreground px-4 py-8 sm:px-6 sm:py-12 relative overflow-hidden selection:bg-blue-500/20">

            {/* Blueprint grid — faded toward edges */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right,#80808009 1px,transparent 1px),linear-gradient(to bottom,#80808009 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                    maskImage:
                        "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                }}
            />

            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-150 h-125 bg-blue-500/5 dark:bg-blue-500/8 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-100 h-100 bg-foreground opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-87.5 h-87.5 bg-indigo-500/4 dark:bg-indigo-500/7 blur-[120px] rounded-full pointer-events-none" />

            {/* Card + title — entrance animation */}
            <div className="w-full max-w-sm sm:max-w-90 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-500">

                {/* ── Title ── */}
                <div className="mb-5 sm:mb-6 flex flex-col items-center text-center gap-1">
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight leading-none">{title}</h1>
                    {subtitle && (
                        <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 mt-0.5">{subtitle}</p>
                    )}
                </div>

                {/* ── Main Card ── */}
                <div className="relative p-px rounded-2xl bg-linear-to-b from-border/70 via-border/40 to-border/20 shadow-2xl shadow-black/8">

                    {/* Hover shimmer overlay */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-700 bg-linear-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative bg-background/70 backdrop-blur-3xl rounded-[15px] p-5 pt-6 sm:p-6 sm:pt-7 overflow-hidden">

                        {/* Top glowing accent strip */}
                        <div className="absolute top-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />

{children}
                    </div>
                </div>

            </div>
        </main>
    );
}
