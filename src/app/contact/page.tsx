"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Mail, MessageSquare, ArrowRight, Clock,
    Send, Sparkles, CheckCircle2, HelpCircle,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
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

function ContactForm() {
    const [state, action, isPending] = useActionState(submitContact, null);

    return (
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
    );
}

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-28 pb-16 relative z-0 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute -top-[10%] left-1/4 w-150 h-150 bg-blue-500/6 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] right-1/4 w-150 h-150 bg-violet-500/6 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-325 mx-auto px-6 space-y-16">

                {/* ── Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-6 max-w-2xl mx-auto"
                >
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
                        Whether you have a question about pricing, need help with your data, or just want to say hello — drop us a message. We reply to everything.
                    </p>
                </motion.div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

                    {/* Form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-border/10 shadow-xl"
                    >
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
                        <ContactForm />
                    </motion.div>

                    {/* Info cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-4"
                    >
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
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
