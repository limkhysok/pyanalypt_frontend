import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Server Component — pure static markup, zero JS hydration cost.
export function TutorialsCTA() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-border/10">
            <Link href="/playground" className="w-full sm:w-auto">
                <Button
                    className="h-14 w-full sm:w-auto px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    aria-label="Start your first analysis"
                >
                    <Play size={16} aria-hidden="true" /> Start Your First Analysis
                </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
                <Button
                    variant="ghost"
                    className="h-14 w-full sm:w-auto px-10 rounded-2xl border border-border/40 hover:bg-muted font-black text-base flex items-center gap-2 transition-all"
                    aria-label="Read the full documentation"
                >
                    <BookOpen size={16} aria-hidden="true" /> Full Documentation
                </Button>
            </Link>
        </div>
    );
}
