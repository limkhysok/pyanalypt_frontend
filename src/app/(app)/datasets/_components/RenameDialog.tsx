"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
            <DialogContent 
                className="max-w-[320px] rounded-none sm:rounded-none border-border shadow-none p-5 gap-4"
                aria-describedby={undefined}
            >
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-base font-semibold">Rename artifact</DialogTitle>
                    <DialogDescription className="sr-only">
                        Enter a new name for the dataset.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="rename-input" className="text-sm font-medium text-muted-foreground">New identifier</Label>
                    <Input
                        id="rename-input"
                        className="rounded-none h-9 border-border bg-background focus-visible:ring-1 focus-visible:ring-foreground transition-all shadow-none font-medium text-sm"
                        value={value}
                        placeholder="e.g. sales_data_v2"
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onConfirm()}
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        className="rounded-none h-9 font-medium text-sm shadow-none px-4"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="rounded-none h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-none px-4"
                        onClick={onConfirm}
                        disabled={!value.trim()}
                    >
                        Rename
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
