"use client";

import { Plus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface DatasetHeaderProps {
    uploadLoading: boolean;
    onImport: () => void;
}

export function DatasetHeader({ uploadLoading, onImport }: Readonly<DatasetHeaderProps>) {
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

            <Button
                onClick={onImport}
                disabled={uploadLoading}
                className="rounded-sm h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
                {uploadLoading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                )}
                {uploadLoading ? "Uploading…" : "Import"}
            </Button>
        </motion.div>
    );
}
