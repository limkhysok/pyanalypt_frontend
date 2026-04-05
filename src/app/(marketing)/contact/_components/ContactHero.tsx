import { MessageSquare } from "lucide-react";

// Server Component — CSS animate-in replaces motion.div entry animation.
export function ContactHero() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
                <MessageSquare size={13} className="text-blue-500" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Contact Us
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                Questions? Ideas?<br />
                <span className="text-blue-600 dark:text-blue-400 italic">We&apos;re all ears.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                Whether you have a question about pricing, need help with your data, or just want to say
                hello — drop us a message. We reply to everything.
            </p>
        </div>
    );
}
