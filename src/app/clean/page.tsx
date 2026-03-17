"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function CleanPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Data Cleaning</h1>
            </div>
            <p className="text-muted-foreground">
                Clean and preprocess your datasets for analysis.
            </p>
            <div className="grid gap-4 mt-8">
                <div className="p-6 border border-border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold mb-2">Data Cleaning Tools</h2>
                    <p className="text-sm text-muted-foreground">
                        Tools and features for data cleaning will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
}
