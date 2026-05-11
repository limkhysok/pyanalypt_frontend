import { Sparkles } from "lucide-react";

// Server Component — entry animation via CSS animate-in (tailwindcss-animate).
export function AboutHero() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-secondary border border-border shadow-sm">
                <Sparkles size={13} className="text-foreground/40" aria-hidden="true" />
                <span className="text-[10px] font-black capitalize tracking-widest text-foreground">
                    Our Story
                </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                Built by analysts,<br />
                <span className="text-foreground/60 italic">for everyone.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                We started as frustrated business analysts drowning in spreadsheets. We built the tool
                we wished existed — and then we made it available to everyone.
            </p>
        </div>
    );
}
