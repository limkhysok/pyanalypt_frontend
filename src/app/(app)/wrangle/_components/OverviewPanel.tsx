"use client";

import React from "react";
import { TableProperties, Columns, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DiagnoseOverview } from "@/types/dataset";

interface OverviewPanelProps {
    overview: DiagnoseOverview | null;
}

export function OverviewPanel({ overview }: Readonly<OverviewPanelProps>) {
    if (!overview) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <TableProperties className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground/60 italic font-medium">Run a scan to see the dataset overview.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px] font-semibold">
                    {overview.shape.rows} rows × {overview.shape.columns} cols
                </Badge>
                <Badge
                    variant={overview.duplicate_rows > 0 ? "destructive" : "secondary"}
                    className="text-[10px] font-semibold"
                >
                    {overview.duplicate_rows} duplicates
                </Badge>
                <Badge
                    variant={overview.total_missing > 0 ? "destructive" : "secondary"}
                    className="text-[10px] font-semibold"
                >
                    {overview.total_missing} missing
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column info */}
                {overview.columns && Object.keys(overview.columns).length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Columns className="h-3 w-3" /> Columns
                        </h4>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Nulls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(overview.columns || {}).map(([colName, info]) => {
                                        const colInfo = info as { dtype: string; null_count: number };
                                        return (
                                            <tr key={colName} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                                                <td className="px-4 py-2 text-xs font-medium">{colName}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{colInfo.dtype}</td>
                                                <td className={cn(
                                                    "px-4 py-2 text-xs font-semibold text-right tabular-nums",
                                                    colInfo.null_count > 0 ? "text-red-500" : "text-muted-foreground/40"
                                                )}>
                                                    {colInfo.null_count}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Numeric summary */}
                {overview.numeric_summary && Object.keys(overview.numeric_summary).length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <BarChart3 className="h-3 w-3" /> Numeric Stats
                        </h4>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Column</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Mean</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Std</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Min</th>
                                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(overview.numeric_summary || {}).map(([colName, s]) => {
                                        const stats = s as { mean: number; std: number; min: number; max: number };
                                        return (
                                            <tr key={colName} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                                                <td className="px-4 py-2 text-xs font-medium">{colName}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{stats.mean?.toFixed(2) ?? "—"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{stats.std?.toFixed(2) ?? "—"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{stats.min?.toFixed(2) ?? "—"}</td>
                                                <td className="px-4 py-2 text-xs font-mono text-right tabular-nums">{stats.max?.toFixed(2) ?? "—"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
