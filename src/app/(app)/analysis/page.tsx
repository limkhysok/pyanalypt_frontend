"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalysisPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Data Analysis</h1>
            </div>
            <p className="text-muted-foreground">
                Analyze your datasets with comprehensive tools and insights.
            </p>
            <div className="grid gap-4 mt-8">
                <div className="p-6 border border-border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold mb-2">Analysis Tools</h2>
                    <p className="text-sm text-muted-foreground">
                        Analysis features and data insights will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
}
