import React from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatasetFrame } from "@/types/dataset";
import { cn } from "@/lib/utils";

export function HistorySidebar({
    frames,
    activeFrame,
    isStreaming,
    onSelect,
}: Readonly<{
    frames: DatasetFrame[];
    activeFrame: DatasetFrame | null;
    isStreaming: boolean;
    onSelect: (frame: DatasetFrame) => void;
}>) {
    return (
        <div className="lg:col-span-1">
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <CardHeader className="p-4 pb-2 border-b border-border/10">
                    <p className="text-[10px] font-black tracking-widest text-muted-foreground capitalize">
                        History
                    </p>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="space-y-1">
                        {frames.map((frame, idx) => {
                            const isActive = activeFrame?.id === frame.id && !isStreaming;
                            return (
                                <button
                                    key={frame.id}
                                    onClick={() => onSelect(frame)}
                                    className={cn(
                                        "w-full text-left rounded-2xl px-3 py-2.5 transition-all border",
                                        isActive
                                            ? "bg-blue-500/10 border-blue-500/20"
                                            : "hover:bg-secondary/50 border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Clock
                                            className={cn(
                                                "h-3 w-3 shrink-0",
                                                isActive ? "text-blue-500" : "text-muted-foreground"
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "text-xs font-bold",
                                                isActive ? "text-blue-500" : "text-foreground/70"
                                            )}
                                        >
                                            {new Date(frame.created_at).toLocaleDateString()}
                                        </span>
                                        {idx === 0 && (
                                            <Badge className="text-[9px] font-black px-1.5 py-0 ml-auto border-blue-500/20 text-blue-500 bg-blue-500/10">
                                                Latest
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground/60 font-medium pl-4">
                                        {new Date(frame.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
