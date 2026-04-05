import type { Metadata } from "next";
import { DocsSidebar } from "./_components/DocsSidebar";
import { DocsMain } from "./_components/DocsMain";

export const metadata: Metadata = {
    title: "Documentation | PyAnalypt",
    description: "Everything you need to start turning raw data into boardroom-ready insights. Guides, API reference, and CLI docs.",
};

// Server Component — statically pre-rendered at build time.
// Client JS only sent for two isolated islands:
//   · DocsSidebar  — search input + active nav highlight (useState)
//   · DocsCodeBlock — copy-to-clipboard button (useState), nested inside DocsMain
// All other content (intro, quick-start cards, feature highlights) ships as plain HTML.
export default function DocsPage() {
    return (
        <main className="min-h-screen pt-24 pb-16 relative z-0">

            {/* Background — pure CSS, no JS */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-[20%] w-150 h-150 bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-12">
                    <DocsSidebar />
                    <DocsMain />
                </div>
            </div>
        </main>
    );
}
