"use client";

import React from "react";

interface CellEditorProps {
    initialValue: string;
    onCommit: (value: string) => void;
    onCancel: () => void;
    onMoveRight: () => void;
    onMoveDown: () => void;
    cellSubmittingRef: React.RefObject<boolean>;
}

export function CellEditor({
    initialValue, onCommit, onCancel, onMoveRight, onMoveDown, cellSubmittingRef
}: Readonly<CellEditorProps>) {
    return (
        <input
            autoFocus
            defaultValue={initialValue}
            className="bg-background border border-primary px-2 py-0.5 text-sm font-mono text-foreground outline-none w-full min-w-20 rounded-none"
            onKeyDown={(e) => {
                if (e.key === "Tab") {
                    e.preventDefault();
                    cellSubmittingRef.current = true;
                    onCommit(e.currentTarget.value);
                    onMoveRight();
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    cellSubmittingRef.current = true;
                    onCommit(e.currentTarget.value);
                    onMoveDown();
                } else if (e.key === "Escape") {
                    cellSubmittingRef.current = true;
                    onCancel();
                }
            }}
            onBlur={(e) => {
                if (cellSubmittingRef.current) {
                    cellSubmittingRef.current = false;
                    return;
                }
                onCommit(e.target.value);
            }}
        />
    );
}
