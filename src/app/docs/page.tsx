"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Search, Book, FileText, Code, Terminal, ExternalLink,
    BookOpen, Zap, Shield, Package, Copy, Check,
    ArrowRight, Database, BarChart2, Wand2, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navSections = [
    {
        title: "Getting Started",
        icon: Book,
        color: "text-blue-500",
        items: [
            { label: "Introduction",    id: "introduction" },
            { label: "Quick Start",     id: "quick-start" },
            { label: "Configuration",   id: "configuration" },
            { label: "First Analysis",  id: "first-analysis" },
        ],
    },
    {
        title: "Core Concepts",
        icon: FileText,
        color: "text-violet-500",
        items: [
            { label: "Data Import",     id: "data-import" },
            { label: "Auto Cleaning",   id: "auto-cleaning" },
            { label: "Visualization",   id: "visualization" },
            { label: "AI Queries",      id: "ai-queries" },
        ],
    },
    {
        title: "API Reference",
        icon: Code,
        color: "text-emerald-500",
        items: [
            { label: "Authentication",  id: "auth" },
            { label: "REST Endpoints",  id: "rest" },
            { label: "Python SDK",      id: "python-sdk" },
            { label: "Webhooks",        id: "webhooks" },
        ],
    },
    {
        title: "CLI Tool",
        icon: Terminal,
        color: "text-orange-500",
        items: [
            { label: "Installation",    id: "cli-install" },
            { label: "Commands",        id: "commands" },
            { label: "Flags & Options", id: "flags" },
            { label: "Troubleshooting", id: "troubleshooting" },
        ],
    },
];

const quickStartCards = [
    {
        icon: Database,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Import Your Data",
        desc: "Connect CSV, Excel, or databases in seconds.",
        href: "#data-import",
    },
    {
        icon: Wand2,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        title: "Auto Cleaning",
        desc: "Let PyAnalypt handle missing values and formatting.",
        href: "#auto-cleaning",
    },
    {
        icon: BarChart2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        title: "Create Visuals",
        desc: "Generate 50+ chart types from your data instantly.",
        href: "#visualization",
    },
    {
        icon: Play,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        title: "Try the Playground",
        desc: "Experiment with live data in the sandbox — no signup.",
        href: "/playground",
    },
];

const codeSnippet = `npm install pyanalypt-client

import { PyAnalypt } from "pyanalypt-client";

const client = new PyAnalypt("YOUR_API_KEY");

// Import your data
const dataset = await client.import("./sales-data.csv");

// Ask a question in plain English
const insight = await client.query(
  dataset,
  "What drove Q3 revenue?"
);

console.log(insight.chart);    // ECharts option object
console.log(insight.summary);  // Plain English explanation`;

export default function DocsPage() {
    const [searchTerm, setSearchTerm]     = useState("");
    const [activeSection, setActiveSection] = useState("introduction");
    const [copied, setCopied]             = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredNav = navSections
        .map((section) => ({
            ...section,
            items: section.items.filter(
                (item) =>
                    !searchTerm ||
                    item.label.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        }))
        .filter((s) => !searchTerm || s.items.length > 0);

    return (
        <main className="min-h-screen pt-24 pb-16 relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-[20%] w-150 h-150 bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-12">

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">

                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="Search docs..."
                                    className="w-full bg-secondary/50 backdrop-blur-xl border border-border/20 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Search documentation"
                                />
                            </div>

                            {/* Version */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    v2.4.0 · Latest
                                </span>
                            </div>

                            {/* Nav */}
                            <nav aria-label="Documentation navigation" className="space-y-5">
                                {filteredNav.map((section) => (
                                    <div key={section.title} className="space-y-1">
                                        <div className="flex items-center gap-2 px-2 mb-2">
                                            <section.icon size={12} className={section.color} aria-hidden="true" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                                                {section.title}
                                            </span>
                                        </div>
                                        <ul className="space-y-0.5 border-l border-border/20 ml-2.5 pl-4">
                                            {section.items.map((item) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => setActiveSection(item.id)}
                                                        className={cn(
                                                            "w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all font-bold",
                                                            activeSection === item.id
                                                                ? "text-blue-500 bg-blue-500/8"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                                        )}
                                                    >
                                                        {item.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>

                            <div className="pt-4 border-t border-border/10">
                                <Link
                                    href="/contact"
                                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-colors"
                                >
                                    <ExternalLink size={12} aria-hidden="true" /> Need help? Contact us
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="min-w-0 space-y-12"
                    >
                        {/* Introduction */}
                        <div id="introduction" className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                                <BookOpen size={13} className="text-blue-500" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    v2.4.0 Documentation
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                                Introduction
                            </h1>

                            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                Welcome to PyAnalypt. Here you&apos;ll find everything you need to start turning raw data into boardroom-ready insights — no code required.
                            </p>
                        </div>

                        {/* Quick-start cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickStartCards.map((card) => (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className={cn(
                                        "group p-6 rounded-4xl border bg-background/60 backdrop-blur-xl hover:shadow-lg transition-all",
                                        card.border
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.bg)}>
                                        <card.icon size={20} className={card.color} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-base font-black tracking-tight mb-1.5 flex items-center gap-2">
                                        {card.title}
                                        <ArrowRight size={13} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", card.color)} aria-hidden="true" />
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{card.desc}</p>
                                </Link>
                            ))}
                        </div>

                        {/* Quick start code block */}
                        <div id="quick-start" className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Quick Start</h2>
                            <p className="text-base text-muted-foreground font-medium">
                                Get up and running with PyAnalypt in under 5 minutes using the client SDK.
                            </p>

                            <div className="relative rounded-4xl overflow-hidden border border-border/20 bg-zinc-950 shadow-xl">
                                {/* Window chrome */}
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/60"    aria-hidden="true" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" aria-hidden="true" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/60" aria-hidden="true" />
                                        <span className="ml-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                            quick-start.ts
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
                                        aria-label="Copy code to clipboard"
                                    >
                                        {copied
                                            ? <><Check size={12} className="text-emerald-500" /> Copied</>
                                            : <><Copy size={12} /> Copy</>
                                        }
                                    </button>
                                </div>
                                <pre className="p-6 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                                    <code>{codeSnippet}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/10">
                            {[
                                { icon: Zap,     color: "text-blue-500",   bg: "bg-blue-500/10",   title: "Instant Results",  desc: "From upload to first chart in under 2 minutes." },
                                { icon: Shield,  color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Privacy First",    desc: "Your data never leaves your browser in Playground mode." },
                                { icon: Package, color: "text-violet-500",  bg: "bg-violet-500/10",  title: "50+ Chart Types",  desc: "Area, bubble, scatter, sankey, Gantt, and more." },
                            ].map((item) => (
                                <div key={item.title} className="p-5 rounded-[1.8rem] bg-background/60 border border-border/10 space-y-3">
                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", item.bg)}>
                                        <item.icon size={18} className={item.color} aria-hidden="true" />
                                    </div>
                                    <h4 className="text-sm font-black tracking-tight">{item.title}</h4>
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* What's next */}
                        <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-blue-500/10 via-background/60 to-emerald-500/5 border border-blue-500/20 space-y-4">
                            <h3 className="text-xl font-black tracking-tight">What&apos;s next?</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Follow the step-by-step tutorials to see PyAnalypt in action, or jump straight into the playground to experiment with your own data.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link href="/tutorials">
                                    <Button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm gap-2 shadow-md shadow-blue-500/20 transition-all">
                                        View Tutorials <ArrowRight size={14} aria-hidden="true" />
                                    </Button>
                                </Link>
                                <Link href="/playground">
                                    <Button variant="ghost" className="h-11 px-6 rounded-xl border border-border/40 hover:bg-muted font-black text-sm gap-2 transition-all">
                                        <Play size={14} aria-hidden="true" /> Try Playground
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
