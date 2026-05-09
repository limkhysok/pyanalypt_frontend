"use client";

import React from "react";
import { Pencil, Loader2 } from "lucide-react";
import type { DataLabInspectColumn } from "@/services/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function StatRow({ label, value, mono, accent }: Readonly<{ label: string; value: string; mono?: boolean; accent?: boolean }>) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={cn("text-xs", mono && "font-mono", accent ? "text-destructive font-semibold" : "text-foreground")}>
                {value}
            </span>
        </div>
    );
}

function ColStatsTooltip({ col, info, children }: Readonly<{
    col: string;
    info: DataLabInspectColumn;
    children: React.ReactNode;
}>) {
    return (
        <TooltipProvider delayDuration={400}>
            <Tooltip>
                <TooltipTrigger asChild>{children as React.ReactElement}</TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    align="start"
                    className="rounded-none p-0 border border-border shadow-md min-w-44"
                >
                    <div className="px-3 py-2 border-b bg-muted/30">
                        <p className="text-xs font-semibold font-mono">{col}</p>
                    </div>
                    <div className="px-3 py-2 space-y-1">
                        <StatRow label="dtype" value={info.dtype} mono />
                        <StatRow label="non-null" value={info.non_null_count.toLocaleString()} />
                        <StatRow label="unique" value={info.unique_count.toLocaleString()} />
                        <StatRow
                            label="null %"
                            value={`${info.null_pct.toFixed(1)}%`}
                            accent={info.null_pct > 0}
                        />
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface HeaderContentProps {
    col: string;
    colInfo?: DataLabInspectColumn;
    isEditing: boolean;
    isRenaming: boolean;
    onStartEdit: () => void;
    onSubmitRename: (newName: string) => void;
    onCancelEdit: () => void;
}

export function HeaderContent({
    col, colInfo, isEditing, isRenaming,
    onStartEdit, onSubmitRename, onCancelEdit
}: Readonly<HeaderContentProps>) {
    const headerSubmittingRef = React.useRef(false);

    if (isEditing) {
        return (
            <input
                autoFocus
                defaultValue={col}
                className="bg-background border border-primary px-2 py-0.5 text-xs font-semibold text-foreground outline-none w-full min-w-24 rounded-none"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        headerSubmittingRef.current = true;
                        onSubmitRename(e.currentTarget.value);
                    }
                    if (e.key === "Escape") {
                        headerSubmittingRef.current = true;
                        onCancelEdit();
                    }
                }}
                onBlur={(e) => {
                    if (headerSubmittingRef.current) {
                        headerSubmittingRef.current = false;
                        return;
                    }
                    onSubmitRename(e.target.value);
                }}
            />
        );
    }

    const content = (
        <div className="flex items-center gap-1.5">
            {isRenaming && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50 shrink-0" />
            )}
            <span>{col}</span>
            <button
                className="opacity-0 group-hover/th:opacity-50 hover:opacity-100! transition-opacity ml-auto shrink-0"
                onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
            >
                <Pencil className="h-3 w-3" />
            </button>
        </div>
    );

    if (colInfo) {
        return <ColStatsTooltip col={col} info={colInfo}>{content}</ColStatsTooltip>;
    }

    return content;
}
