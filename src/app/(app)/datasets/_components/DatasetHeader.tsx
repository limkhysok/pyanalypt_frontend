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
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
            <div className="space-y-1.5 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-foreground">
                    Datasets
                </h1>
                <p className="text-sm md:text-base font-medium text-muted-foreground max-w-lg leading-relaxed">
                    To manage your data files in one place. File size limit is 25 MB.
                </p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        disabled={uploadLoading}
                        className="rounded-none h-11 md:h-12 px-7 bg-foreground hover:bg-foreground/90 text-background font-bold text-sm tracking-normal transition-all self-start sm:self-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border border-foreground/10"
                    >
                        {uploadLoading ? (
                            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2.5 h-4 w-4" />
                        )}
                        {uploadLoading ? "Uploading..." : "Import dataset"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-border shadow-none min-w-[200px] p-1.5">
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
        </motion.div>
    );
}


