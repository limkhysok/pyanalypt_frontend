"use client";

import { Plus, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatasetExportFormat } from "@/types/dataset";

interface DatasetHeaderProps {
    uploadLoading: boolean;
    onFormatSelect: (format: DatasetExportFormat) => void;
}

const FORMATS: DatasetExportFormat[] = ["csv", "json", "xlsx", "parquet"];

export function DatasetHeader({ uploadLoading, onFormatSelect }: Readonly<DatasetHeaderProps>) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Database className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight leading-none font-mono">Datasets</h1>
                    <p className="text-xs text-muted-foreground mt-1">Manage and organize your data files. File size limit is 25 MB.</p>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        disabled={uploadLoading}
                        className="rounded-none h-10 px-6 bg-foreground hover:bg-foreground/90 text-background font-bold text-sm tracking-normal transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border border-foreground/10"
                    >
                        {uploadLoading ? (
                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2.5 h-4 w-4" />
                        )}
                        {uploadLoading ? "Uploading..." : "Import dataset"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-50 p-1.5">
                    <div className="px-3 py-2.5 text-[11px] font-bold text-muted-foreground/50 border-b border-border/50 mb-1.5">
                        select file format
                    </div>
                    {FORMATS.map((fmt) => (
                        <DropdownMenuItem
                            key={fmt}
                            className="rounded-none text-[13px] font-semibold h-10 cursor-pointer focus:bg-primary focus:text-primary-foreground"
                            onClick={() => onFormatSelect(fmt)}
                        >
                            {fmt.toLowerCase()}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
