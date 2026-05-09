"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CellDisplayProps {
    val: string;
    isNull: boolean;
    hasError: boolean;
    errorMsg?: string;
    textStyle: string;
}

export function CellDisplay({
    val, isNull, hasError, errorMsg, textStyle
}: Readonly<CellDisplayProps>) {
    return (
        <span
            className={cn("block truncate", textStyle)}
            title={hasError ? errorMsg : (val || "—")}
        >
            {isNull ? "—" : val}
        </span>
    );
}
