"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileName: string | undefined;
    isLoading: boolean;
    onConfirm: () => void;
}

export function DeleteDialog({
    open,
    onOpenChange,
    fileName,
    isLoading,
    onConfirm,
}: Readonly<DeleteDialogProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[320px] rounded-none sm:rounded-none border-border shadow-none p-5 gap-4"
            >
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-base font-semibold text-destructive">Delete artifact</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        This action cannot be undone. Are you sure you want to erase <span className="font-bold text-foreground border-b border-foreground/30">{fileName}</span>?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="rounded-none h-9 font-medium text-sm shadow-none px-4"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-none h-9 font-medium text-sm shadow-none px-4"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                        {isLoading ? "Deleting…" : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
