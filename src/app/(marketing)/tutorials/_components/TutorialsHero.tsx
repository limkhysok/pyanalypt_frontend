import { BookOpen, Clock, Users, BarChart2 } from "lucide-react";

const quickStats = [
    { icon: Clock, value: "< 5 min", label: "First insight" },
    { icon: Users, value: "10K+", label: "Teams onboarded" },
    { icon: BarChart2, value: "50+", label: "Chart types" },
];

// Server Component — no "use client", no JS sent for this section.
// motion.div replaced with tailwindcss-animate CSS classes (animate-in, fade-in, slide-in-from-bottom-6).
export function TutorialsHero() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                <BookOpen size={13} className="text-blue-500" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Step-by-Step Guide
                </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                From Raw File <br />
                to <span className="text-blue-600 dark:text-blue-400 italic">Boardroom Insight</span><br />
                in Five Steps.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                No Python. No SQL. No terminal. Follow this guide to turn any spreadsheet into an
                interactive, shareable analysis — in under five minutes.
            </p>

            <div className="flex items-center justify-center gap-8 pt-2">
                {quickStats.map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                            <stat.icon size={14} className="text-blue-500" aria-hidden="true" />
                            <span className="text-xl font-black text-foreground">{stat.value}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
