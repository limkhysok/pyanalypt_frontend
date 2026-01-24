"use client";

import React from "react";
import { Activity, Database, Server, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";

export function StatsPanel() {
    const stats = [
        { label: "Total Rows", value: "24,593", icon: Database, color: "text-zinc-100" },
        { label: "Features", value: "18", icon: Server, color: "text-zinc-300" },
        { label: "Processing Time", value: "0.4s", icon: Zap, color: "text-white" },
        { label: "Health Score", value: "98%", icon: Activity, color: "text-zinc-200" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-4 animate-in slide-in-from-right duration-700">
            {stats.map((stat, i) => (
                <TiltCard key={i} className="glass-card border-0" classNameContent="p-0">
                    <CardContent className="p-6 flex items-center justify-between h-full">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h4 className="text-2xl font-bold mt-1 text-foreground">{stat.value}</h4>
                        </div>
                        <div className={`p-3 rounded-full bg-secondary ${stat.color}`}>
                            <stat.icon size={20} className="text-foreground" />
                        </div>
                    </CardContent>
                </TiltCard>
            ))}
        </div>
    );
}
