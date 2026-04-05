import Link from "next/link";
import {
    BookOpen, Zap, Shield, Package,
    ArrowRight, Database, BarChart2, Wand2, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocsCodeBlock } from "./DocsCodeBlock";

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

// Server Component — all static docs content.
// DocsCodeBlock is the only Client Component (isolated to the copy button).
// motion.div entry animation replaced with CSS animate-in.
export function DocsMain() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0 space-y-12">

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
                    Welcome to PyAnalypt. Here you&apos;ll find everything you need to start turning raw
                    data into boardroom-ready insights — no code required.
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
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                            card.bg
                        )}>
                            <card.icon size={20} className={card.color} aria-hidden="true" />
                        </div>
                        <h3 className="text-base font-black tracking-tight mb-1.5 flex items-center gap-2">
                            {card.title}
                            <ArrowRight
                                size={13}
                                className={cn("opacity-0 group-hover:opacity-100 transition-opacity", card.color)}
                                aria-hidden="true"
                            />
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">{card.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Code block — Client island (copy button only) */}
            <DocsCodeBlock />

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/10">
                {[
                    { icon: Zap,     color: "text-blue-500",    bg: "bg-blue-500/10",    title: "Instant Results", desc: "From upload to first chart in under 2 minutes." },
                    { icon: Shield,  color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Privacy First",   desc: "Your data never leaves your browser in Playground mode." },
                    { icon: Package, color: "text-violet-500",  bg: "bg-violet-500/10",  title: "50+ Chart Types", desc: "Area, bubble, scatter, sankey, Gantt, and more." },
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
                    Follow the step-by-step tutorials to see PyAnalypt in action, or jump straight into
                    the playground to experiment with your own data.
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
        </div>
    );
}
