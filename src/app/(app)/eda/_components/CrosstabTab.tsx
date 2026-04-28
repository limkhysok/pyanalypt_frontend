"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { CrosstabResponse } from "@/services/eda.service";
import { edaApi } from "@/services/eda.service";
import { toast } from "sonner";

interface Props {
    datasetId: number;
    columns: string[];
    loading: boolean;
    setLoading: (v: boolean) => void;
}

export function CrosstabTab({ datasetId, columns, loading, setLoading }: Readonly<Props>) {
    const [colA, setColA] = useState(columns[0] ?? "");
    const [colB, setColB] = useState(columns[1] ?? "");
    const [normalize, setNormalize] = useState(false);
    const [result, setResult] = useState<CrosstabResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    function run() {
        if (!colA || !colB) return;
        if (colA === colB) { toast.error("Pick two different columns."); return; }
        setError(null);
        setLoading(true);
        edaApi.crosstab(datasetId, { col_a: colA, col_b: colB, normalize })
            .then((r) => { setResult(r); })
            .catch((e: unknown) => {
                const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to compute cross-tabulation.";
                setError(msg);
                toast.error(msg);
            })
            .finally(() => setLoading(false));
    }

    // Derive column headers from response
    const rowKey = colA;
    const valCols = result
        ? Object.keys(result.table[0] ?? {}).filter((k) => k !== rowKey)
        : [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Row axis</span>
                <Select value={colA} onValueChange={setColA}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-sm">
                        <SelectValue placeholder="Column A" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span className="text-sm font-medium">Column axis</span>
                <Select value={colB} onValueChange={setColB}>
                    <SelectTrigger className="h-8 w-44 rounded-none text-sm">
                        <SelectValue placeholder="Column B" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <Switch id="normalize" checked={normalize} onCheckedChange={setNormalize} />
                    <Label htmlFor="normalize" className="text-sm cursor-pointer">Show %</Label>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-none" onClick={run} disabled={loading || !colA || !colB}>
                    <Search className="h-3 w-3" />
                    Run
                </Button>
            </div>

            {error && (
                <div className="border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500 rounded-none">
                    {error}
                </div>
            )}

            {!result && !error && (
                <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Select two columns and click Run to see the cross-tabulation.
                </div>
            )}

            {result && (
                <div className="border bg-card">
                    <ScrollArea className="w-full">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground font-mono">{rowKey}</th>
                                    {valCols.map((c) => (
                                        <th key={c} className="px-3 py-2 text-right font-semibold text-xs text-muted-foreground font-mono">{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.table.map((row) => {
                                    const rowLabel = String(row[rowKey] ?? "");
                                    return (
                                        <tr key={rowLabel} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-3 py-2 font-medium font-mono text-xs">{rowLabel}</td>
                                            {valCols.map((c) => {
                                                const val = row[c];
                                                let display: string;
                                                if (typeof val === "number") {
                                                    display = normalize ? `${(val * 100).toFixed(1)}%` : val.toLocaleString();
                                                } else {
                                                    display = String(val ?? "");
                                                }
                                                return (
                                                    <td key={c} className="px-3 py-2 text-right font-mono text-xs">{display}</td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Columns with more than 50 unique values are not supported — use Value Counts instead.
            </p>
        </div>
    );
}
