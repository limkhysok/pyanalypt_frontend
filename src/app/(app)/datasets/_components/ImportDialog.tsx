"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatasetExportFormat } from "@/types/dataset";

interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFormatSelect: (format: DatasetExportFormat) => void;
}

const FORMATS: DatasetExportFormat[] = ["csv", "xlsx", "json", "parquet"];

export function ImportDialog({ open, onOpenChange, onFormatSelect }: Readonly<ImportDialogProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none border-border shadow-none">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Import sequence</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        Select source format for data ingestion.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {FORMATS.map((fmt) => (
                        <Button
                            key={fmt}
                            variant="outline"
                            className="h-10 rounded-none border-border hover:bg-muted font-medium text-sm transition-all shadow-none"
                            onClick={() => onFormatSelect(fmt)}
                        >
                            {fmt}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
