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
            <DialogContent className="rounded-md">
                <DialogHeader>
                    <DialogTitle>Import Dataset</DialogTitle>
                    <DialogDescription>
                        Select the source format for your data import.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 py-3">
                    {FORMATS.map((fmt) => (
                        <Button
                            key={fmt}
                            variant="outline"
                            className="h-9 rounded-sm font-medium text-sm"
                            onClick={() => onFormatSelect(fmt)}
                        >
                            {fmt.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
