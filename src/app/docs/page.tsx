"use client";

import React from "react";
import { Search, Book, FileText, Code, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    { title: "Getting Started", icon: Book, items: ["Installation", "Quick Start", "Configuration", "Deployment"] },
    { title: "Core Concepts", icon: FileText, items: ["Data Models", "Architecture", "Encryption", "Plugins"] },
    { title: "API Reference", icon: Code, items: ["REST API", "Python SDK", "Webhooks", "Authentication"] },
    { title: "CLI Tool", icon: Terminal, items: ["Commands", "Flags", "Configuration", "Troubleshooting"] },
];

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-6">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar Navigation */}
                <div className="hidden lg:block col-span-3 space-y-8 sticky top-32 h-fit">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-6">
                        {categories.map((cat, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                    <cat.icon size={14} /> {cat.title}
                                </h4>
                                <ul className="space-y-1 border-l border-border/50 ml-1.5 pl-4">
                                    {cat.items.map((item, j) => (
                                        <li key={j}>
                                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-0.5">
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Main Content */}
                <div className="col-span-1 lg:col-span-9 space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            v2.4.0 Documentation
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Introduction</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Welcome to the PyAnalypt documentation. Here you'll find comprehensive guides and documentation to help you start working with PyAnalypt as quickly as possible.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                                <Book size={20} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Detailed Guides</h3>
                            <p className="text-muted-foreground text-sm">Step-by-step tutorials for real world scenarios.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                                <Code size={20} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">API Reference</h3>
                            <p className="text-muted-foreground text-sm">Detailed endpoints and parameter descriptions.</p>
                        </div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <h3>Quick Start</h3>
                        <p className="text-muted-foreground">Get up and running with PyAnalypt in less than 5 minutes.</p>
                        <div className="relative rounded-lg overflow-hidden border border-border bg-zinc-950 p-4 font-mono text-sm text-zinc-300 my-6">
                            <div className="flex items-center gap-2 mb-4 opacity-50">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <p><span className="text-accent underline">npm</span> install pyanalypt-client</p>
                            <p className="mt-2"><span className="text-accent underline">import</span> {"{ Client }"} <span className="text-accent underline">from</span> "pyanalypt-client";</p>
                            <p className="mt-2"><span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> Client("YOUR_API_KEY");</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
