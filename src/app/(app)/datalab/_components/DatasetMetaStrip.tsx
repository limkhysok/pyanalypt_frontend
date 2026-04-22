"use client";

import { Table2, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataLabPreview } from "@/services/api";

export function DatasetMetaStrip({ data }: Readonly<{ data: DataLabPreview }>) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-[11px] font-semibold gap-1.5 font-mono">
                {data.file_name}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5 font-mono">
                {data.file_format}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                {data.dataset_size}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                <Table2 className="h-3 w-3" />
                {data.total_rows.toLocaleString()} rows
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-semibold gap-1.5">
                <Database className="h-3 w-3" />
                {data.total_columns} columns
            </Badge>
        </div>
    );
}
