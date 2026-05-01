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
                num[col] = stats;
            } else {
                cat[col] = stats;
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
                <CardHeader className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-semibold font-mono">df.describe()</CardTitle>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                            {totalColumns} column{totalColumns === 1 ? "" : "s"}
                        </span>
                    </div>
                </CardHeader>

                <div className="border-b border-slate-200 px-5 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <input
                        type="text"
                        placeholder="Filter columns…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 font-mono text-foreground"
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
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {visibleTotal} / {totalColumns}
                        </span>
                    )}
                </div>

                <CardContent className="p-0">
                    {numericNames.length > 0 && (
                        <>
                            <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Numeric</span>
                                <span className="text-xs text-gray-400 font-mono">({numericNames.length})</span>
                            </div>
                            <ScrollArea className="w-full">
                                <table className="border-collapse min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-xs font-semibold text-gray-600 text-left border-r border-slate-200 min-w-20 whitespace-nowrap">
                                                stat
                                            </th>
                                            {numericNames.map((col) => (
                                                <th key={col} className="px-5 py-3 text-xs font-semibold font-mono text-right whitespace-nowrap text-gray-900">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {NUMERIC_STATS.map((stat) => (
                                            <tr key={stat} className="border-b border-slate-200 hover:bg-blue-50 transition-colors even:bg-gray-50">
                                                <td className="sticky left-0 z-10 bg-white px-5 py-2.5 text-xs font-mono font-semibold text-gray-400 border-r border-slate-200 whitespace-nowrap">
                                                    {stat}
                                                </td>
                                                {numericNames.map((col) => (
                                                    <td key={col} className="px-5 py-2.5 text-xs tabular-nums text-right text-gray-600 whitespace-nowrap">
                                                        {fmtNum(numericCols[col][stat as keyof DataLabDescribeNumericStats])}
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
                                "px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5",
                                numericNames.length > 0 && "border-t"
                            )}>
                                <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Categorical / String</span>
                                <span className="text-xs text-gray-400 font-mono">({categoricalNames.length})</span>
                            </div>
                            <ScrollArea className="w-full">
                                <table className="border-collapse min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-xs font-semibold text-gray-600 text-left border-r border-slate-200 min-w-20 whitespace-nowrap">
                                                stat
                                            </th>
                                            {categoricalNames.map((col) => (
                                                <th key={col} className="px-5 py-3 text-xs font-semibold font-mono text-right whitespace-nowrap text-gray-900">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CATEGORICAL_STATS.map((stat) => (
                                            <tr key={stat} className="border-b border-slate-200 hover:bg-blue-50 transition-colors even:bg-gray-50">
                                                <td className="sticky left-0 z-10 bg-white px-5 py-2.5 text-xs font-mono font-semibold text-gray-400 border-r border-slate-200 whitespace-nowrap">
                                                    {stat}
                                                </td>
                                                {categoricalNames.map((col) => {
                                                    const val = categoricalCols[col][stat as keyof DataLabDescribeCategoricalStats];
                                                    return (
                                                        <td key={col} className={cn(
                                                            "px-5 py-2.5 text-xs whitespace-nowrap text-right",
                                                            stat === "top" ? "font-mono text-gray-600" : "tabular-nums text-right text-gray-600"
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
                        <div className="px-5 py-8 text-sm text-center text-gray-400">
                            {search ? `No columns match "${search}"` : "No data available."}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
