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
            <DialogContent className="rounded-md">
                <DialogHeader>
                    <DialogTitle>Rename Dataset</DialogTitle>
                    <DialogDescription>Enter a new name for your dataset.</DialogDescription>
                </DialogHeader>
                <div className="py-3 space-y-1.5">
                    <Label htmlFor="rename-input" className="text-sm">New name</Label>
                    <Input
                        id="rename-input"
                        className="rounded-sm h-8 text-sm"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onConfirm()}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-sm h-8 text-sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="rounded-sm h-8 text-sm"
                        onClick={onConfirm}
                        disabled={!value.trim()}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
