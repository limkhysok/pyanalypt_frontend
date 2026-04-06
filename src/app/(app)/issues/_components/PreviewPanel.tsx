"use client";

import React from "react";
import { Loader2, Table2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type PreviewRow = Record<string, unknown>;

interface PreviewPanelProps {
    isLoading: boolean;
    previewRows: PreviewRow[];
    previewColumns: string[];
}

function displayCell(val: unknown): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
}

export function PreviewPanel({ isLoading, previewRows, previewColumns }: Readonly<PreviewPanelProps>) {
    if (isLoading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
            </div>
        );
    }

    if (previewRows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Table2 className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground/60 italic font-medium">No preview rows available.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="w-full">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-muted/50 border-b">
                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-12 text-center">#</th>
                        {previewColumns.map((col) => (
                            <th key={col} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {previewRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-2.5 text-[11px] text-muted-foreground/60 text-center font-mono tabular-nums select-none">
                                {rowIndex + 1}
                            </td>
                            {previewColumns.map((col) => {
                                const display = displayCell(row[col]);
                                return (
                                    <td
                                        key={col}
                                        className="px-4 py-2.5 text-xs font-mono text-foreground/80 whitespace-nowrap max-w-48 truncate"
                                        title={display}
                                    >
                                        {display}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
