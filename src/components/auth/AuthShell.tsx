"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthShell({ children, title, subtitle }: Readonly<AuthShellProps>) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center flex flex-col items-center gap-2">
                    <Link
                        href="/"
                        className="p-2 rounded-xl bg-foreground text-background transition-transform hover:scale-110 mb-4 block"
                    >
                        <Sparkles size={24} fill="currentColor" />
                    </Link>
                    <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                </div>
                <div className="border border-border/50 bg-card rounded-2xl p-8 shadow-sm">
                    {children}
                </div>
            </div>
        </main>
    );
}
