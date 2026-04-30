"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function EdaError({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error("[EDA]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Something went wrong loading EDA.</p>
            <Button size="sm" variant="outline" className="rounded-none" onClick={reset}>
                Try again
            </Button>
        </div>
    );
}
