"use client";

import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import type { DataLabPreview } from "@/services/api";

export function DatasetMetaStrip({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="flex items-stretch gap-px bg-border border border-border flex-wrap">
            <div className="bg-background px-4 py-2.5 flex flex-col gap-1 min-w-45 flex-1">
                <span className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Dataset Name</span>
                <span className="text-xs font-bold truncate text-foreground font-mono leading-none mt-0.5">{data.file_name}</span>
            </div>

            <div className="bg-background px-4 py-2.5 flex flex-col gap-1 min-w-25">
                <span className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Format</span>
                <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-bold text-foreground font-mono">{data.file_format}</span>
                </div>
            </div>

            <div className="bg-background px-4 py-2.5 flex flex-col gap-1 min-w-25">
                <span className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Storage</span>
                <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-bold text-foreground font-mono">{data.dataset_size}</span>
                </div>
            </div>

            <div className="bg-background px-4 py-2.5 flex flex-col gap-1 min-w-27.5">
                <span className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Total Rows</span>
                <div className="flex items-center gap-1.5 leading-none">
                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground font-mono tabular-nums">{data.total_rows.toLocaleString()}</span>
                </div>
            </div>

            <div className="bg-background px-4 py-2.5 flex flex-col gap-1 min-w-27.5">
                <span className="text-[9px] font-black text-muted-foreground tracking-widest leading-none">Total Columns</span>
                <div className="flex items-center gap-1.5 leading-none">
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground font-mono tabular-nums">{data.total_columns}</span>
                </div>
            </div>
        </div>
    );
}
