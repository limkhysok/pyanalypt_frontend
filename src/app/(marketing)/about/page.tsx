import type { Metadata } from "next";
import { AboutHero } from "./_components/AboutHero";
import { AboutAnimatedSections } from "./_components/AboutAnimatedSections";
import { AboutCTA } from "./_components/AboutCTA";

export const metadata: Metadata = {
    title: "About | PyAnalypt",
    description: "Built by analysts, for everyone. Learn the story behind PyAnalypt and the mission to democratise data intelligence.",
};

// Server Component — statically pre-rendered at build time.
// Client JS is only sent for AboutAnimatedSections (whileInView motion).
// AboutHero and AboutCTA ship zero JS to the browser.
export default function AboutPage() {
    return (
        <main className="min-h-screen pt-28 pb-16 relative z-0 overflow-x-hidden">

            {/* Background — pure CSS, no JS */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-[10%] w-150 h-150 bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] right-[10%] w-150 h-150 bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6 space-y-28">
                <AboutHero />
                <AboutAnimatedSections />
                <AboutCTA />
            </div>
        </main>
    );
}
