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
                <Database className="h-6 w-6 text-primary shrink-0" />
                <div className="flex items-baseline gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">Datasets</h1>
                    <span className="text-sm text-muted-foreground leading-none">/  Manage and organize your data workspace<span className="ml-1.5 text-xs text-muted-foreground/40 font-mono">· 25MB limit</span></span>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        disabled={uploadLoading}
                        className="h-8 gap-2 text-xs rounded-none capitalize bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0"
                    >
                        {uploadLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="h-3.5 w-3.5" />
                        )}
                        {uploadLoading ? "Uploading…" : "Import dataset"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none w-40 shadow-md">
                    {FORMATS.map((fmt) => (
                        <DropdownMenuItem
                            key={fmt}
                            className="rounded-none gap-2 text-xs cursor-pointer"
                            onClick={() => onFormatSelect(fmt)}
                        >
                            {fmt.toUpperCase()}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
