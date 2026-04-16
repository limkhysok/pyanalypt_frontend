"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
            <DialogContent className="rounded-none border-border shadow-none">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Purge artifact</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        Are you sure you want to permanently erase{" "}
                        <span className="font-bold text-foreground border-b border-foreground/30">{fileName}</span>?
                        This operation is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button
                        variant="outline"
                        className="rounded-none h-10 font-medium text-sm shadow-none flex-1 sm:flex-none"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-none h-10 font-medium text-sm shadow-none flex-1 sm:flex-none"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                        {isLoading ? "Purging…" : "Confirm purge"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
