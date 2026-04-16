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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: string;
    onChange: (value: string) => void;
    onConfirm: () => void;
}

export function RenameDialog({
    open,
    onOpenChange,
    value,
    onChange,
    onConfirm,
}: Readonly<RenameDialogProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none border-border shadow-none">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Rename artifact</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        Modify the unique identifier for this dataset.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="rename-input" className="text-sm font-medium text-muted-foreground">New identifier</Label>
                    <Input
                        id="rename-input"
                        className="rounded-none h-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-foreground transition-all shadow-none font-medium text-xs"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onConfirm()}
                        autoFocus
                    />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        className="rounded-none h-10 font-medium text-sm shadow-none flex-1 sm:flex-none"
                        onClick={() => onOpenChange(false)}
                    >
                        Abort
                    </Button>
                    <Button
                        className="rounded-none h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-none flex-1 sm:flex-none"
                        onClick={onConfirm}
                        disabled={!value.trim()}
                    >
                        Commit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
