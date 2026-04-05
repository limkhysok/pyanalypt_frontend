"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export default function VisualizationPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Visualization</h1>
            </div>
            <p className="text-muted-foreground">
                Create and explore visual representations of your data.
            </p>
            <div className="grid gap-4 mt-8">
                <div className="p-6 border border-border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold mb-2">Visualization Tools</h2>
                    <p className="text-sm text-muted-foreground">
                        Chart creation and data visualization options will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
}
