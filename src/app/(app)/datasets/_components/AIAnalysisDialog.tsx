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
            <DialogContent className="max-w-2xl rounded-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        Problem Framing
                    </DialogTitle>
                    <DialogDescription>{result?.fileName}</DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto rounded-md bg-muted/40 border p-3 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {result?.statements}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-sm h-8 text-sm"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
