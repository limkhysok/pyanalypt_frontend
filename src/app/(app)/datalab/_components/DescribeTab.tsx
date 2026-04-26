"use client";

import React from "react";
import { BarChart2, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
    DataLabDescribe,
    DataLabDescribeNumericStats,
    DataLabDescribeCategoricalStats,
    DataLabPreview,
} from "@/services/api";
import { DatasetMetaStrip } from "./DatasetMetaStrip";

const NUMERIC_STATS = ["count", "mean", "std", "min", "25%", "50%", "75%", "max"] as const;
const CATEGORICAL_STATS = ["count", "unique", "top", "freq"] as const;

function fmtNum(v: number | string | undefined | null): string {
    if (v === undefined || v === null) return "—";
    if (typeof v === "string") return v;
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function DescribeTab({ data, preview }: Readonly<{
    data: DataLabDescribe;
    preview: DataLabPreview;
}>) {
    const [search, setSearch] = React.useState("");

    const { numericCols, categoricalCols } = React.useMemo(() => {
        const num: Record<string, DataLabDescribeNumericStats> = {};
        const cat: Record<string, DataLabDescribeCategoricalStats> = {};
        for (const [col, stats] of Object.entries(data.columns)) {
            if ("mean" in stats || "std" in stats || "min" in stats || "max" in stats) {
                num[col] = stats as DataLabDescribeNumericStats;
            } else {
                cat[col] = stats as DataLabDescribeCategoricalStats;
            }
        }
        return { numericCols: num, categoricalCols: cat };
    }, [data.columns]);

    const q = search.toLowerCase();
    const numericNames = Object.keys(numericCols).filter((c) => !q || c.toLowerCase().includes(q));
    const categoricalNames = Object.keys(categoricalCols).filter((c) => !q || c.toLowerCase().includes(q));
    const totalColumns = Object.keys(data.columns).length;
    const visibleTotal = numericNames.length + categoricalNames.length;

    return (
        <div className="space-y-4">
            <DatasetMetaStrip data={preview} />

            <Card className="rounded-none shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-[15px] font-semibold font-mono">df.describe()</CardTitle>
                        </div>
                        <span className="text-[13px] text-muted-foreground font-mono">
                            {totalColumns} column{totalColumns === 1 ? "" : "s"}
                        </span>
                    </div>
                </CardHeader>

                <div className="border-b px-5 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <input
                        type="text"
                        placeholder="Filter columns…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/40 font-mono text-foreground"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="text-muted-foreground/40 hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {search && (
                        <span className="text-[13px] text-muted-foreground font-mono shrink-0">
                            {visibleTotal} / {totalColumns}
                        </span>
                    )}
                </div>

                <CardContent className="p-0">
                    {numericNames.length > 0 && (
                        <>
                            <div className="px-5 py-2 bg-muted/30 border-b border-border/40 flex items-center gap-1.5">
                                <span className="text-[13px] font-semibold text-muted-foreground tracking-wider uppercase">Numeric</span>
                                <span className="text-[13px] text-muted-foreground/60 font-mono">({numericNames.length})</span>
                            </div>
                            <ScrollArea className="w-full">
                                <table className="border-collapse min-w-full">
                                    <thead>
                                        <tr className="bg-muted/20 border-b">
                                            <th className="sticky left-0 z-10 bg-muted/30 px-5 py-3 text-[13px] font-semibold text-muted-foreground text-left border-r border-border/40 min-w-20 whitespace-nowrap">
                                                stat
                                            </th>
                                            {numericNames.map((col) => (
                                                <th key={col} className="px-5 py-3 text-[15px] font-semibold font-mono text-right whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {NUMERIC_STATS.map((stat) => (
                                            <tr key={stat} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="sticky left-0 z-10 bg-background px-5 py-2.5 text-[13px] font-mono font-semibold text-muted-foreground border-r border-border/40 whitespace-nowrap">
                                                    {stat}
                                                </td>
                                                {numericNames.map((col) => (
                                                    <td key={col} className="px-5 py-2.5 text-[15px] tabular-nums text-right text-foreground/80 whitespace-nowrap">
                                                        {fmtNum(numericCols[col][stat as keyof DataLabDescribeNumericStats] as number | undefined)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </>
                    )}

                    {categoricalNames.length > 0 && (
                        <>
                            <div className={cn(
                                "px-5 py-2 bg-muted/30 border-b border-border/40 flex items-center gap-1.5",
                                numericNames.length > 0 && "border-t"
                            )}>
                                <span className="text-[13px] font-semibold text-muted-foreground tracking-wider uppercase">Categorical / String</span>
                                <span className="text-[13px] text-muted-foreground/60 font-mono">({categoricalNames.length})</span>
                            </div>
                            <ScrollArea className="w-full">
                                <table className="border-collapse min-w-full">
                                    <thead>
                                        <tr className="bg-muted/20 border-b">
                                            <th className="sticky left-0 z-10 bg-muted/30 px-5 py-3 text-[13px] font-semibold text-muted-foreground text-left border-r border-border/40 min-w-20 whitespace-nowrap">
                                                stat
                                            </th>
                                            {categoricalNames.map((col) => (
                                                <th key={col} className="px-5 py-3 text-[15px] font-semibold font-mono text-right whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CATEGORICAL_STATS.map((stat) => (
                                            <tr key={stat} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="sticky left-0 z-10 bg-background px-5 py-2.5 text-[13px] font-mono font-semibold text-muted-foreground border-r border-border/40 whitespace-nowrap">
                                                    {stat}
                                                </td>
                                                {categoricalNames.map((col) => {
                                                    const val = categoricalCols[col][stat as keyof DataLabDescribeCategoricalStats];
                                                    return (
                                                        <td key={col} className={cn(
                                                            "px-5 py-2.5 text-[15px] whitespace-nowrap text-right",
                                                            stat === "top" ? "font-mono text-foreground/80" : "tabular-nums text-right text-foreground/80"
                                                        )}>
                                                            {fmtNum(val as number | string | undefined | null)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </>
                    )}

                    {numericNames.length === 0 && categoricalNames.length === 0 && (
                        <div className="px-5 py-8 text-[15px] text-center text-muted-foreground">
                            {search ? `No columns match "${search}"` : "No data available."}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
