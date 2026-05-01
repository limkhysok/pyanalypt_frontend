"use client";

import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import type { DataLabPreview } from "@/services/api";

export function DatasetMetaStrip({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="flex items-stretch gap-px bg-slate-200 border border-slate-200 flex-wrap">
            <div className="bg-slate-50 px-4 py-2.5 flex flex-col gap-1 min-w-45 flex-1">
                <span className="text-xs font-semibold text-gray-400">Dataset Name</span>
                <span className="text-xs font-bold truncate text-gray-900 font-mono mt-0.5">{data.file_name}</span>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 flex flex-col gap-1 min-w-25">
                <span className="text-xs font-semibold text-gray-400">Format</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 font-mono">{data.file_format}</span>
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 flex flex-col gap-1 min-w-25">
                <span className="text-xs font-semibold text-gray-400">Storage</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 font-mono">{data.dataset_size}</span>
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 flex flex-col gap-1 min-w-27.5">
                <span className="text-xs font-semibold text-gray-400">Total Rows</span>
                <div className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-900 font-mono tabular-nums">{data.total_rows.toLocaleString()}</span>
                </div>
            </div>

            <div className="bg-slate-50 px-4 py-2.5 flex flex-col gap-1 min-w-27.5">
                <span className="text-xs font-semibold text-gray-400">Total Columns</span>
                <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-900 font-mono tabular-nums">{data.total_columns}</span>
                </div>
            </div>
        </div>
    );
}
