"use client";

import { DatasetActivityLog } from "@/types/dataset";
import { 
    Clock, 
    Upload, 
    Edit2, 
    Trash2, 
    Copy, 
    Download, 
    Terminal
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

interface DatasetLogsProps {
    logs: DatasetActivityLog[];
    isLoading: boolean;
}

const ACTION_ICONS: Record<string, any> = {
    UPLOAD:      Upload,
    RENAME:      Edit2,
    DELETE:      Trash2,
    DUPLICATE:   Copy,
    EXPORT:      Download,
};

const ACTION_COLORS: Record<string, string> = {
    UPLOAD:      "text-emerald-500 bg-emerald-500/10",
    RENAME:      "text-blue-500 bg-blue-500/10",
    DELETE:      "text-destructive bg-destructive/10",
    DUPLICATE:   "text-purple-500 bg-purple-500/10",
    EXPORT:      "text-amber-500 bg-amber-500/10",
};


export function DatasetLogs({ logs, isLoading }: Readonly<DatasetLogsProps>) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-none border border-border/20" />
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 bg-muted/5">
                <Terminal className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">No activity logs recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log, idx) => {
                const Icon = ACTION_ICONS[log.action] || Terminal;
                const colorClass = ACTION_COLORS[log.action] || "text-muted-foreground bg-muted";
                
                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                        <Card className="rounded-none border-border/40 shadow-none hover:bg-muted/30 transition-colors p-4">
                            <div className="flex items-center gap-5">
                                <div className={`h-10 w-10 shrink-0 flex items-center justify-center ${colorClass}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold lowercase text-muted-foreground/60 w-24">
                                            {log.action.replace("_", " ")}
                                        </span>
                                        <span className="text-[15px] font-bold truncate tracking-tight">
                                            {log.dataset_name_snap}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium lowercase">
                                            <Clock size={12} />
                                            {new Date(log.timestamp).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            })}
                                        </div>
                                        
                                        {/* Dynamic details badge */}
                                        {Object.entries(log.details).map(([key, val]) => (
                                            <div key={key} className="text-xs px-2 py-0.5 bg-muted font-bold text-muted-foreground/70 lowercase">
                                                {key}: <span className="text-foreground/80">
                                                    {typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'
                                                        ? String(val)
                                                        : JSON.stringify(val)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
