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
            <Card className="bg-background border border-slate-200 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden transition-all hover:border-slate-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] group">
                <CardContent className="p-5 flex items-center gap-5">
                    <div className="h-11 w-11 border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-white transition-colors">
                        <Package className="h-5 w-5 text-muted-foreground/80" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5">
                            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight font-mono">{total}</p>
                            <span className="text-[10px] font-black text-muted-foreground/40 capitalize tracking-widest">files</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 capitalize tracking-tight">Total datasets recorded</p>
                    </div>
                </CardContent>
            </Card>

            {/* Diversity */}
            <Card className="bg-background border border-slate-200 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden transition-all hover:border-slate-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] group">
                <CardContent className="p-5 flex items-center gap-5">
                    <div className="h-11 w-11 border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-white transition-colors">
                        <Activity className="h-5 w-5 text-muted-foreground/80" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5">
                            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight font-mono">{formats}</p>
                            <span className="text-[10px] font-black text-muted-foreground/40 capitalize tracking-widest">formats</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 capitalize tracking-tight">File type diversity</p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-background border border-slate-200 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden sm:col-span-2 lg:col-span-1 transition-all hover:border-slate-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] group relative">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <HardDrive className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
                            <p className="text-[10px] font-black text-muted-foreground/70 capitalize tracking-widest">Storage usage</p>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 tabular-nums capitalize">
                            {formatFileSize(totalSize)} / 2gb
                        </p>
                    </div>
                    
                    <div className="h-1.5 bg-muted/60 relative overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-foreground transition-all duration-1000 ease-out"
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3.5">
                        <p className="text-2xl font-bold tabular-nums leading-none tracking-tight font-mono">{usageLabel}</p>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 w-2.5 rounded-none transition-colors duration-500 ${usagePct >= i * 20 ? 'bg-foreground' : 'bg-muted'}`} 
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}


