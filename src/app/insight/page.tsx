"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

export default function InsightPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Insights</h1>
            </div>
            <p className="text-muted-foreground">
                Discover key insights and patterns in your data.
            </p>
            <div className="grid gap-4 mt-8">
                <div className="p-6 border border-border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold mb-2">AI-Powered Insights</h2>
                    <p className="text-sm text-muted-foreground">
                        Automated insights and recommendations will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
}
