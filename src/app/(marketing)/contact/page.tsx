import type { Metadata } from "next";
import { ContactHero } from "./_components/ContactHero";
import { ContactFormCard } from "./_components/ContactFormCard";
import { ContactInfoCards } from "./_components/ContactInfoCards";

export const metadata: Metadata = {
    title: "Contact | PyAnalypt",
    description: "Questions? Ideas? Get in touch with the PyAnalypt team. We reply to every message personally within 24 hours.",
};

// Server Component — statically pre-rendered at build time.
// Only ContactFormCard is a Client Component (useActionState for form submission).
// ContactHero and ContactInfoCards ship zero JS to the browser.
export default function ContactPage() {
    return (
        <main className="min-h-screen pt-28 pb-16 relative z-0 overflow-x-hidden">

            {/* Background — pure CSS, no JS */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-1/4 w-150 h-150 bg-blue-500/6 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] right-1/4 w-150 h-150 bg-violet-500/6 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6 space-y-16">
                <ContactHero />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
                    <ContactFormCard />
                    <ContactInfoCards />
                </div>
            </div>
        </main>
    );
}
