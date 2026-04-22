"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DataLabPreview } from "@/services/api";
import { DatasetMetaStrip } from "./DatasetMetaStrip";
import { displayCell } from "../_lib";

export function PreviewTab({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="space-y-3">
            <DatasetMetaStrip data={data} />

            <Card className="shadow-sm overflow-hidden rounded-none">
                <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground w-12 text-center select-none">#</th>
                                {data.columns.map((col) => (
                                    <th key={col} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.length === 0 ? (
                                <tr>
                                    <td colSpan={data.columns.length + 1} className="px-4 py-12 text-center text-xs text-muted-foreground italic">
                                        No rows available.
                                    </td>
                                </tr>
                            ) : (
                                data.rows.map((row, rowIndex) => (
                                    <tr key={`${rowIndex}_${displayCell(row[data.columns[0]])}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground/50 text-center font-mono select-none tabular-nums">
                                            {rowIndex + 1}
                                        </td>
                                        {data.columns.map((col) => {
                                            const raw = row[col];
                                            const val = displayCell(raw);
                                            const isNull = raw === null || raw === undefined;
                                            return (
                                                <td
                                                    key={col}
                                                    className={cn(
                                                        "px-4 py-2.5 text-xs font-mono whitespace-nowrap max-w-48 truncate",
                                                        isNull ? "text-muted-foreground/30 italic" : "text-foreground/80"
                                                    )}
                                                    title={val || "—"}
                                                >
                                                    {isNull ? "—" : val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Card>
        </div>
    );
}
