"use client";

import { Database, HardDrive, Layers } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatFileSize } from "./_lib";

interface DatasetStatsProps {
    total: number;
    formats: number;
    totalSize: number;
    usagePct: number;
    storageColorClass: string;
    usageLabel: string;
}

export function DatasetStats({
    total,
    formats,
    totalSize,
    usagePct,
    storageColorClass,
    usageLabel,
}: Readonly<DatasetStatsProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
            {/* Total datasets */}
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-md overflow-hidden order-1 hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Database className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tabular-nums leading-none">{total}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Total datasets</p>
                    </div>
                </CardContent>
            </Card>

            {/* Formats */}
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-md overflow-hidden order-2 sm:order-3 hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <Layers className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tabular-nums leading-none">{formats}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Formats</p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-md overflow-hidden col-span-2 sm:col-span-1 order-3 sm:order-2 hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
                            <p className="text-[11px] font-medium text-muted-foreground">Storage</p>
                        </div>
                        <p className="text-[11px] tabular-nums text-muted-foreground font-medium">
                            {formatFileSize(totalSize)} / 2 GB
                        </p>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", storageColorClass)}
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                    <p className="text-xl font-bold tabular-nums leading-none mt-2">{usageLabel}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
