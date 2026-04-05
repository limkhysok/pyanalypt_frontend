"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

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

// Client Component — isolated to only the copy-to-clipboard button (useState + navigator.clipboard).
// The surrounding code block markup lives in the Server Component (DocsMain).
export function DocsCodeBlock() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id="quick-start" className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Quick Start</h2>
            <p className="text-base text-muted-foreground font-medium">
                Get up and running with PyAnalypt in under 5 minutes using the client SDK.
            </p>

            <div className="relative rounded-4xl overflow-hidden border border-border/20 bg-zinc-950 shadow-xl">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"     aria-hidden="true" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"  aria-hidden="true" />
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
    );
}
