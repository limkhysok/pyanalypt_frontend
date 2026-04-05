"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Book, FileText, Code, Terminal, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
    {
        title: "Getting Started",
        icon: Book,
        color: "text-blue-500",
        items: [
            { label: "Introduction",   id: "introduction" },
            { label: "Quick Start",    id: "quick-start" },
            { label: "Configuration",  id: "configuration" },
            { label: "First Analysis", id: "first-analysis" },
        ],
    },
    {
        title: "Core Concepts",
        icon: FileText,
        color: "text-violet-500",
        items: [
            { label: "Data Import",   id: "data-import" },
            { label: "Auto Cleaning", id: "auto-cleaning" },
            { label: "Visualization", id: "visualization" },
            { label: "AI Queries",    id: "ai-queries" },
        ],
    },
    {
        title: "API Reference",
        icon: Code,
        color: "text-emerald-500",
        items: [
            { label: "Authentication", id: "auth" },
            { label: "REST Endpoints", id: "rest" },
            { label: "Python SDK",     id: "python-sdk" },
            { label: "Webhooks",       id: "webhooks" },
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

// Client Component — isolated to sidebar search (useState) + active nav item highlight (useState).
// The main docs content is a Server Component and is unaffected by these state changes.
export function DocsSidebar() {
    const [searchTerm, setSearchTerm]       = useState("");
    const [activeSection, setActiveSection] = useState("introduction");

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
        <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">

                {/* Search */}
                <div className="relative group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        placeholder="Search docs..."
                        className="w-full bg-secondary/50 backdrop-blur-xl border border-border/20 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search documentation"
                    />
                </div>

                {/* Version badge */}
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
    );
}
