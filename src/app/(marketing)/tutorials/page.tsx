import type { Metadata } from "next";
import { TutorialsHero } from "./_components/TutorialsHero";
import { TutorialsStepper } from "./_components/TutorialsStepper";
import { TutorialsCTA } from "./_components/TutorialsCTA";

export const metadata: Metadata = {
    title: "Tutorials | PyAnalypt",
    description: "Step-by-step guide to turn any spreadsheet into an interactive analysis in under five minutes. No Python, no SQL, no terminal.",
};

// Server Component — statically pre-rendered at build time.
// Only TutorialsStepper is a Client Component (useState + motion).
// TutorialsHero and TutorialsCTA are Server Components — zero JS hydration cost.
export default function TutorialsPage() {
    return (
        <main className="min-h-screen pt-28 pb-16 px-6 relative z-0 overflow-x-hidden">

            {/* Background — pure CSS, no JS */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-[-10%] left-1/4 w-150 h-150 bg-blue-500/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-1/4 w-150 h-150 bg-violet-500/8 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
                <TutorialsHero />
                <TutorialsStepper />
                <TutorialsCTA />
            </div>
        </main>
    );
}
