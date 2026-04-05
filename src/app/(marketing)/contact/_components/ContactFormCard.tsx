"use client";

import { useActionState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContact } from "@/lib/actions/contact";
import { cn } from "@/lib/utils";

const topicOptions = [
    { value: "general",    label: "General Question" },
    { value: "bug",        label: "Bug Report" },
    { value: "feature",    label: "Feature Request" },
    { value: "enterprise", label: "Enterprise Inquiry" },
    { value: "other",      label: "Other" },
];

// Client Component — required for useActionState (React 19 form actions).
export function ContactFormCard() {
    const [state, action, isPending] = useActionState(submitContact, null);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-border/10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Mail size={18} className="text-blue-500" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tight">Send a Message</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        We reply within 24 hours
                    </p>
                </div>
            </div>

            <form action={action} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Your Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Sarah Johnson"
                            required
                            className="h-12 bg-background/50 border-border/20 focus:border-blue-500/50 rounded-2xl font-bold transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="h-12 bg-background/50 border-border/20 focus:border-blue-500/50 rounded-2xl font-bold transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Topic</p>
                    <fieldset className="flex flex-wrap gap-2">
                        <legend className="sr-only">Message topic</legend>
                        {topicOptions.map((opt) => (
                            <label key={opt.value} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="topic"
                                    value={opt.value}
                                    className="sr-only peer"
                                    defaultChecked={opt.value === "general"}
                                />
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-border/30 bg-background/50 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-500 transition-all peer-checked:border-blue-500/50 peer-checked:bg-blue-500/10 peer-checked:text-blue-500">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        required
                        className="w-full bg-background/50 border border-border/20 focus:border-blue-500/50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none placeholder:text-muted-foreground/40"
                    />
                </div>

                {state && (
                    <div className={cn(
                        "flex items-start gap-3 p-4 rounded-2xl border text-sm font-bold",
                        state.success
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        {state.success && <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />}
                        {state.message}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
                    aria-label="Send your message"
                >
                    {isPending ? "Sending..." : <><Send size={15} aria-hidden="true" /> Send Message</>}
                </Button>
            </form>
        </div>
    );
}
