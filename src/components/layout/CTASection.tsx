"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
    onAction: () => void;
}

export function CTASection({ onAction }: CTASectionProps) {
    return (
        <section className="relative py-32 overflow-hidden border-t border-border/40">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold tracking-tighter"
                >
                    Ready to see the unseen?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-xl text-muted-foreground"
                >
                    Join the future of Data Analysis today. No credit card required.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <button
                        onClick={onAction}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105"
                    >
                        <span>Start Analyzing Now</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
