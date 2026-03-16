"use client";

import React from "react";
import {
    AlertCircle,
    Search,
    Plus,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function IssuesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-red-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] tracking-[0.3em] uppercase">
                            <AlertCircle size={14} className="text-red-500" /> System Integrity
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]">Issue Tracking</h1>
                        <p className="text-muted-foreground mt-1 text-base max-w-xl leading-relaxed">
                            Monitor data quality issues, pipeline failures, and analytical discrepancies across your intelligence network.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto"
                    >
                        <div className="relative group/search flex-1 sm:min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/search:text-red-500 transition-colors" />
                            <Input
                                placeholder="Audit system issues..."
                                className="pl-12 h-10 bg-background/50 border-border/40 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 rounded-full text-xs font-bold transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-10 px-6 rounded-full font-bold tracking-widest text-[10px] uppercase shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Report Incident
                        </Button>
                    </motion.div>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-muted/5 rounded-[3.5rem] border border-dashed border-border/60">
                    <div className="p-10 rounded-[3rem] bg-emerald-500/10 text-emerald-500/30 shadow-inner">
                        <ShieldAlert className="h-20 w-20" />
                    </div>
                    <div className="max-w-md space-y-3">
                        <h3 className="text-3xl font-black tracking-tight text-emerald-500">System Nominal</h3>
                        <p className="text-muted-foreground font-medium text-lg italic font-bold">
                            No active intelligence discrepancies detected. Your data pipelines are operating within optimal parameters.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
