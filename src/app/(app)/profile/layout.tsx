"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/lib/utils";
import { ProfileHero } from "./_components/ProfileHero";
import { ProfileNav } from "./_components/ProfileNav";

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user } = useAuth();

    const displayName =
        user?.full_name ||
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
        user?.username ||
        "User";

    const initials = user ? getInitials(user) : "U";

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Hero — visible on all profile sub-pages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProfileHero
                        user={user}
                        displayName={displayName}
                        initials={initials}
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar Navigation */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-3 lg:sticky lg:top-20"
                    >
                        <div className="p-1 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md">
                            <ProfileNav />
                        </div>
                    </motion.aside>

                    {/* Page Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-9 space-y-8"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
