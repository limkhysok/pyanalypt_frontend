"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DatasetsError({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Something went wrong loading Datasets.</p>
            <Button size="sm" variant="outline" className="rounded-none" onClick={reset}>
                Try again
            </Button>
        </div>
    );
}
