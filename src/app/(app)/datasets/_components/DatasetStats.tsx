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
            <Card className="bg-background border border-border/40 rounded-none shadow-none overflow-hidden order-1 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 border border-border/40 flex items-center justify-center shrink-0 bg-muted">
                        <Database className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tabular-nums leading-none font-mono">{total}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Total datasets</p>
                    </div>
                </CardContent>
            </Card>

            {/* Formats */}
            <Card className="bg-background border border-border/40 rounded-none shadow-none overflow-hidden order-2 sm:order-3 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 border border-border/40 flex items-center justify-center shrink-0 bg-muted">
                        <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tabular-nums leading-none font-mono">{formats}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Formats</p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-background border border-border/40 rounded-none shadow-none overflow-hidden col-span-2 sm:col-span-1 order-3 sm:order-2 transition-colors">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <HardDrive className="h-3.5 w-3.5" />
                            <p className="text-[11px] font-medium text-muted-foreground">Storage</p>
                        </div>
                        <p className="text-[11px] tabular-nums text-muted-foreground font-mono">
                            {formatFileSize(totalSize)} / 2 GB
                        </p>
                    </div>
                    <div className="relative h-1 bg-muted/60 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-foreground transition-all duration-500"
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                    <p className="text-xl font-bold tabular-nums leading-none mt-2 font-mono">{usageLabel}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
