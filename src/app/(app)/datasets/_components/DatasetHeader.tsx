"use client";

import { Plus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
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

const FORMATS: DatasetExportFormat[] = ["csv", "json", "xlsx", "parquet", "sql"];

export function DatasetHeader({ uploadLoading, onFormatSelect }: Readonly<DatasetHeaderProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight leading-none">Datasets</h1>
                <p className="text-sm text-muted-foreground">
                    Manage and process your data artifacts.
                </p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        disabled={uploadLoading}
                        className="rounded-none h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all self-start sm:self-auto shadow-none border border-primary/10"
                    >
                        {uploadLoading ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-3.5 w-3.5" />
                        )}
                        {uploadLoading ? "Uploading…" : "Import"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-[140px]">
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/50 mb-1">
                        Select source format
                    </div>
                    {FORMATS.map((fmt) => (
                        <DropdownMenuItem
                            key={fmt}
                            className="rounded-none text-sm font-medium cursor-pointer"
                            onClick={() => onFormatSelect(fmt)}
                        >
                            {fmt.toLowerCase()}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}
