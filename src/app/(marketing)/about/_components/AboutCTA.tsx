import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Server Component — pure static markup, zero JS hydration cost.
export function AboutCTA() {
    return (
        <div className="text-center space-y-8 max-w-2xl mx-auto py-12 border-t border-border/10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Join 10K+ teams already using PyAnalypt.
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
                No credit card required. Start turning your data into decisions today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/playground">
                    <Button
                        className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        aria-label="Start using PyAnalypt for free"
                    >
                        Start for Free <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                </Link>
                <Link href="/contact">
                    <Button
                        variant="ghost"
                        className="h-14 px-10 rounded-2xl border border-border/40 hover:bg-muted font-black text-base flex items-center gap-2"
                    >
                        Get in Touch
                    </Button>
                </Link>
            </div>
        </div>
    );
}
