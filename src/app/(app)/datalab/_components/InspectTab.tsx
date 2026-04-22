"use client";

import React from "react";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { datalabApi } from "@/services/api";
import type { DataLabPreview, DataLabInspect, CastColumnResult, CastWarning } from "@/services/api";
import { toast } from "sonner";
import { DatasetMetaStrip } from "./DatasetMetaStrip";
import { CAST_TYPES, formatBytes } from "../_lib";

export function InspectTab({ data, preview, datasetId, onRefetchInspect }: Readonly<{
    data: DataLabInspect;
    preview: DataLabPreview;
    datasetId: number;
    onRefetchInspect: () => void;
}>) {
    const [pendingCasts, setPendingCasts] = React.useState<Record<string, string>>({});
    const [casting, setCasting] = React.useState(false);
    const [castResults, setCastResults] = React.useState<CastColumnResult[] | null>(null);
    const [castWarnings, setCastWarnings] = React.useState<CastWarning[] | null>(null);

    const hasPending = Object.keys(pendingCasts).length > 0;

    React.useEffect(() => {
        setPendingCasts({});
        setCastResults(null);
        setCastWarnings(null);
    }, [data]);

    async function handleCast(force = false) {
        setCasting(true);
        try {
            const result = await datalabApi.cast(datasetId, pendingCasts, force);
            setCastWarnings(null);
            setCastResults(result.updated_columns);
            const hasErrors = result.updated_columns.some((c) => c.status.startsWith("error"));
            if (hasErrors) {
                toast.warning("Some columns could not be cast. Check highlighted rows.");
            } else {
                toast.success("Columns cast successfully.");
                setPendingCasts({});
                onRefetchInspect();
            }
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: { warnings?: CastWarning[]; errors?: string[] } } })?.response?.data;
            if (errData?.warnings && errData.warnings.length > 0) {
                setCastWarnings(errData.warnings);
            } else if (errData?.errors && errData.errors.length > 0) {
                toast.error(errData.errors.join(" "));
            } else {
                toast.error("Failed to cast columns.");
            }
        } finally {
            setCasting(false);
        }
    }

    return (
        <div className="space-y-4">
            <DatasetMetaStrip data={preview} />

            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            <CardTitle className="text-xs font-semibold font-mono">df.info()</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasPending && (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs rounded-none gap-1.5"
                                    onClick={() => handleCast(false)}
                                    disabled={casting}
                                >
                                    {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Apply Casts
                                </Button>
                            )}
                            <span className="text-[11px] text-muted-foreground font-mono">
                                {formatBytes(data.info.memory_usage_bytes)} memory
                            </span>
                        </div>
                    </div>
                </CardHeader>

                {castWarnings && (
                    <div className="border-b border-amber-500/30 bg-amber-500/5 px-5 py-3 space-y-2">
                        <p className="text-[11px] font-semibold text-amber-600">Conversion warnings — confirm to proceed:</p>
                        <ul className="space-y-1">
                            {castWarnings.map((w) => (
                                <li key={w.column} className="text-[11px] text-muted-foreground font-mono">
                                    <span className="font-semibold">{w.column}:</span> {w.warning}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2 pt-1">
                            <Button size="sm" className="h-7 text-xs rounded-none gap-1.5" onClick={() => handleCast(true)} disabled={casting}>
                                {casting && <Loader2 className="h-3 w-3 animate-spin" />}
                                Confirm
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs rounded-none" onClick={() => setCastWarnings(null)} disabled={casting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                <CardContent className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Column</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Dtype</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Non-Null</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Nulls</th>
                                <th className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground text-right uppercase">Null %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.info.columns.map((col) => {
                                const result = castResults?.find((r) => r.column === col.column);
                                const hasError = result?.status.startsWith("error");
                                return (
                                    <tr
                                        key={col.column}
                                        className={cn(
                                            "border-b border-border/50 hover:bg-muted/30 transition-colors",
                                            (hasError || col.null_count > 0 || col.null_pct > 0) && "bg-red-600/5"
                                        )}
                                    >
                                        <td className="px-5 py-2.5 text-xs font-medium">{col.column}</td>
                                        <td className="px-5 py-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[11px] font-mono font-semibold shrink-0">
                                                    {result ? result.to_dtype : col.dtype}
                                                </Badge>

                                                <Select
                                                    value={pendingCasts[col.column] ?? "none"}
                                                    onValueChange={(val) => {
                                                        setPendingCasts((prev) => {
                                                            if (val === "none") {
                                                                const next = { ...prev };
                                                                delete next[col.column];
                                                                return next;
                                                            }
                                                            return { ...prev, [col.column]: val };
                                                        });
                                                    }}
                                                    disabled={casting}
                                                >
                                                    <SelectTrigger className="h-7 text-[11px] font-mono w-30 rounded-none border-border/60 bg-background/50 focus:ring-0 focus:ring-offset-0 transition-all hover:bg-muted/50">
                                                        <SelectValue placeholder="Cast to..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none border-border/60">
                                                        <SelectItem value="none" className="text-[11px] font-mono focus:bg-primary focus:text-primary-foreground">
                                                            none
                                                        </SelectItem>
                                                        {CAST_TYPES.map((t) => (
                                                            <SelectItem
                                                                key={t}
                                                                value={t}
                                                                className="text-[11px] font-mono focus:bg-primary focus:text-primary-foreground"
                                                            >
                                                                {t}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {result && (
                                                    <span className={cn(
                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded-none border",
                                                        hasError
                                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                            : "bg-green-500/10 text-green-600 border-green-500/20"
                                                    )}>
                                                        {hasError ? result.status : "Success"}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5 text-xs tabular-nums text-right text-muted-foreground">{col.non_null_count.toLocaleString()}</td>
                                        <td className={cn(
                                            "px-5 py-2.5 text-xs tabular-nums text-right font-semibold",
                                            col.null_count > 0 ? "text-red-500" : "text-muted-foreground/40"
                                        )}>
                                            {col.null_count.toLocaleString()}
                                        </td>
                                        <td className={cn(
                                            "px-5 py-2.5 text-xs tabular-nums text-right",
                                            col.null_pct > 0 ? "text-red-400" : "text-muted-foreground/40"
                                        )}>
                                            {col.null_pct.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
