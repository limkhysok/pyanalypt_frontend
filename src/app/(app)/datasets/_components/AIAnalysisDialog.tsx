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
import { BrainCircuit } from "lucide-react";

interface AIAnalysisResult {
    fileName: string;
    statements: string;
}

interface AIAnalysisDialogProps {
    result: AIAnalysisResult | null;
    isStreaming: boolean;
    onClose: () => void;
}

export function AIAnalysisDialog({
    result,
    isStreaming,
    onClose,
}: Readonly<AIAnalysisDialogProps>) {
    return (
        <Dialog open={!!result} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl rounded-none sm:rounded-none border-border shadow-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <BrainCircuit className="h-4 w-4" />
                        Analysis output
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground truncate">
                        Artifact: {result?.fileName}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto rounded-none border-border bg-muted/30 border p-4 text-[11px] whitespace-pre-wrap font-mono leading-relaxed selection:bg-primary selection:text-primary-foreground">
                    {result?.statements}
                    {isStreaming && (
                        <span className="inline-block w-2.5 h-4 ml-1 bg-foreground animate-pulse" />
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-none h-10 font-medium text-sm shadow-none min-w-[100px]"
                        onClick={onClose}
                    >
                        Terminate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
