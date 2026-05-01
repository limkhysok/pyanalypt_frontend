"use client";

import { Package, Activity, HardDrive } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize } from "../_lib";

interface DatasetStatsProps {
    total: number;
    formats: number;
    totalSize: number;
    usagePct: number;
    usageLabel: string;
}

export function DatasetStats({
    total,
    formats,
    totalSize,
    usagePct,
    usageLabel,
}: Readonly<DatasetStatsProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
            {/* Total files */}
            <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden transition-all hover:border-slate-300 group">
                <CardContent className="p-5 flex items-center gap-5">
                    <div className="h-11 w-11 border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-white transition-colors">
                        <Package className="h-5 w-5 text-muted-foreground/80" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5">
                            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">{total}</p>
                            <span className="text-xs font-semibold text-muted-foreground/40 lowercase">files</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mt-1.5 lowercase">Total datasets recorded</p>
                    </div>
                </CardContent>
            </Card>

            {/* Diversity */}
            <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden transition-all hover:border-slate-300 group">
                <CardContent className="p-5 flex items-center gap-5">
                    <div className="h-11 w-11 border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-white transition-colors">
                        <Activity className="h-5 w-5 text-muted-foreground/80" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5">
                            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">{formats}</p>
                            <span className="text-xs font-semibold text-muted-foreground/40 lowercase">formats</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mt-1.5 lowercase">File type diversity</p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden sm:col-span-2 lg:col-span-1 transition-all hover:border-slate-300 group relative">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <HardDrive className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
                            <p className="text-xs font-bold text-muted-foreground/70 lowercase">Storage usage</p>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground/40 tabular-nums lowercase">
                            {formatFileSize(totalSize)} of 2gb
                        </p>
                    </div>
                    
                    <div className="h-1.5 bg-muted/40 relative overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-foreground transition-all duration-1000 ease-out"
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3.5">
                        <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">{usageLabel}</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 w-2.5 rounded-none ${usagePct >= i * 20 ? 'bg-foreground' : 'bg-muted'}`} 
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}


