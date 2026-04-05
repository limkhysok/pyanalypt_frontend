import Link from "next/link";
import { Clock, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const contactInfo = [
    {
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Response Time",
        value: "Within 24 hours",
        desc: "We reply to every message personally — no automated bots.",
        href: undefined,
    },
    {
        icon: GithubIcon,
        color: "text-foreground",
        bg: "bg-secondary/60",
        border: "border-border/20",
        title: "Open Source",
        value: "GitHub Repository",
        desc: "Found a bug or want to contribute? Open an issue on GitHub.",
        href: "https://github.com/soklimkhy/pyanalypt",
    },
    {
        icon: HelpCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        title: "Help Center",
        value: "Docs & Tutorials",
        desc: "Most questions are already answered in our documentation.",
        href: "/docs",
    },
];

// Server Component — static info cards with no interactivity, zero JS cost.
// motion.div entry animation replaced with CSS animate-in.
export function ContactInfoCards() {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
            {contactInfo.map((info) => {
                const inner = (
                    <div className={cn(
                        "p-6 rounded-4xl bg-background/60 backdrop-blur-xl border shadow-lg space-y-3 transition-all hover:shadow-xl",
                        info.border
                    )}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", info.bg)}>
                            <info.icon size={18} className={info.color} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">
                                {info.title}
                            </p>
                            <p className="text-base font-black tracking-tight flex items-center gap-1.5">
                                {info.value}
                                {info.href && <ArrowRight size={14} className={info.color} aria-hidden="true" />}
                            </p>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">{info.desc}</p>
                    </div>
                );

                return info.href ? (
                    <Link
                        key={info.title}
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                        {inner}
                    </Link>
                ) : (
                    <div key={info.title}>{inner}</div>
                );
            })}

            {/* Expectations card */}
            <div className="p-6 rounded-4xl bg-linear-to-br from-blue-500/10 via-background/60 to-emerald-500/5 border border-blue-500/20 space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        What to expect
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {[
                        "A real reply from a real person",
                        "No templates or scripted responses",
                        "Honest answers, even when it's 'not yet'",
                    ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-foreground/70">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
