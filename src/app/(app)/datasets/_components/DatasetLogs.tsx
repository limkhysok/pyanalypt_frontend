"use client";

import { DatasetActivityLog } from "@/types/dataset";
import { 
    LucideIcon,
    Clock,
    Upload,
    Edit2,
    Trash2,
    Copy,
    Download,
    Terminal,
    Layers,
    Filter,
    RefreshCw,
    Minus,
    Plus,
    Calculator,
    Wrench,
    Scissors,
    BarChart2,
    ArrowUpDown,
    Zap,
    Columns,
    ListPlus,
    ListFilter,
    Eraser,
    Gauge,
    CalendarClock,
    Hash,
    CaseSensitive,
    RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

interface DatasetLogsProps {
    logs: DatasetActivityLog[];
    isLoading: boolean;
}

const ACTION_ICONS: Record<string, LucideIcon> = {
    UPLOAD:           Upload,
    RENAME:           Edit2,
    DELETE:           Trash2,
    DUPLICATE:        Copy,
    EXPORT:           Download,
    CAST:             Layers,
    RENAME_COLUMN:    Edit2,
    DROP_DUPLICATES:  Filter,
    REPLACE_VALUES:   RefreshCw,
    DROP_NULLS:       Minus,
    FILL_NULLS:       Plus,
    FILL_DERIVED:     Calculator,
    FIX_FORMULA:      Wrench,
    TRIM_OUTLIERS:           Scissors,
    IMPUTE_OUTLIERS:         BarChart2,
    CAP_OUTLIERS:            ArrowUpDown,
    TRANSFORM_COLUMN:        Zap,
    DROP_COLUMNS:            Columns,
    ADD_COLUMN:              ListPlus,
    FILTER_ROWS:             ListFilter,
    CLEAN_STRING:            Eraser,
    SCALE_COLUMNS:           Gauge,
    EXTRACT_DATETIME:        CalendarClock,
    ENCODE_COLUMNS:          Hash,
    NORMALIZE_COLUMN_NAMES:  CaseSensitive,
    REVERT:                  RotateCcw,
};

const ACTION_COLORS: Record<string, string> = {
    UPLOAD:           "text-emerald-500 bg-emerald-500/10",
    RENAME:           "text-blue-500 bg-blue-500/10",
    DELETE:           "text-destructive bg-destructive/10",
    DUPLICATE:        "text-purple-500 bg-purple-500/10",
    EXPORT:           "text-amber-500 bg-amber-500/10",
    CAST:             "text-blue-500 bg-blue-500/10",
    RENAME_COLUMN:    "text-blue-500 bg-blue-500/10",
    DROP_DUPLICATES:  "text-orange-500 bg-orange-500/10",
    REPLACE_VALUES:   "text-cyan-500 bg-cyan-500/10",
    DROP_NULLS:       "text-orange-500 bg-orange-500/10",
    FILL_NULLS:       "text-teal-500 bg-teal-500/10",
    FILL_DERIVED:     "text-teal-500 bg-teal-500/10",
    FIX_FORMULA:      "text-purple-500 bg-purple-500/10",
    TRIM_OUTLIERS:           "text-amber-500 bg-amber-500/10",
    IMPUTE_OUTLIERS:         "text-amber-500 bg-amber-500/10",
    CAP_OUTLIERS:            "text-amber-500 bg-amber-500/10",
    TRANSFORM_COLUMN:        "text-purple-500 bg-purple-500/10",
    DROP_COLUMNS:            "text-orange-500 bg-orange-500/10",
    ADD_COLUMN:              "text-emerald-500 bg-emerald-500/10",
    FILTER_ROWS:             "text-orange-500 bg-orange-500/10",
    CLEAN_STRING:            "text-cyan-500 bg-cyan-500/10",
    SCALE_COLUMNS:           "text-blue-500 bg-blue-500/10",
    EXTRACT_DATETIME:        "text-purple-500 bg-purple-500/10",
    ENCODE_COLUMNS:          "text-indigo-500 bg-indigo-500/10",
    NORMALIZE_COLUMN_NAMES:  "text-teal-500 bg-teal-500/10",
    REVERT:                  "text-blue-500 bg-blue-500/10",
};

const ACTION_LABELS: Record<string, string> = {
    UPLOAD:           "Upload",
    RENAME:           "Rename",
    DELETE:           "Delete",
    DUPLICATE:        "Duplicate",
    EXPORT:           "Export",
    CAST:             "Cast Columns",
    RENAME_COLUMN:    "Rename Column",
    DROP_DUPLICATES:  "Drop Duplicates",
    REPLACE_VALUES:   "Replace Values",
    DROP_NULLS:       "Drop Nulls",
    FILL_NULLS:       "Fill Nulls",
    FILL_DERIVED:     "Fill Derived",
    FIX_FORMULA:      "Fix Formula",
    TRIM_OUTLIERS:           "Trim Outliers",
    IMPUTE_OUTLIERS:         "Impute Outliers",
    CAP_OUTLIERS:            "Cap Outliers",
    TRANSFORM_COLUMN:        "Transform Column",
    DROP_COLUMNS:            "Drop Columns",
    ADD_COLUMN:              "Add Column",
    FILTER_ROWS:             "Filter Rows",
    CLEAN_STRING:            "Clean String",
    SCALE_COLUMNS:           "Scale Columns",
    EXTRACT_DATETIME:        "Extract Datetime",
    ENCODE_COLUMNS:          "Encode Columns",
    NORMALIZE_COLUMN_NAMES:  "Normalize Column Names",
    REVERT:                  "Revert",
};

function getNumericSummary(details: Record<string, unknown>): string | null {
    if (typeof details.cells_filled === 'number') {
        const strategy = typeof details.strategy === 'string' ? ` using ${details.strategy} strategy` : "";
        return `Filled ${details.cells_filled} cells${strategy}`;
    }
    if (typeof details.rows_dropped === 'number') return `Dropped ${details.rows_dropped} rows`;
    if (typeof details.columns_dropped === 'number') return `Dropped ${details.columns_dropped} columns`;
    
    if (typeof details.rows_before === 'number' && typeof details.rows_after === 'number') {
        return `${details.rows_before - details.rows_after} duplicates removed`;
    }
    return null;
}

function getStructuralSummary(details: Record<string, unknown>): string | null {
    if (typeof details.column === 'string') {
        if (typeof details.to_dtype === 'string') return `Cast '${details.column}' → ${details.to_dtype}`;
        if (typeof details.outliers_treated === 'number') return `Treated ${details.outliers_treated} outliers in '${details.column}'`;
    }

    if (typeof details.old_name === 'string' && typeof details.new_name === 'string') {
        return `'${details.old_name}' → '${details.new_name}'`;
    }
    return null;
}

function summarizeDetails(action: string, details: Record<string, unknown>): string | null {
    if (!details || Object.keys(details).length === 0) return null;

    if (action === "REVERT") {
        return details.was_undo ? "Undid last action" : `Reverted to snapshot #${details.snapshot_id}`;
    }

    return getNumericSummary(details) ?? getStructuralSummary(details);
}


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
                        <Card className="rounded-none border-slate-200 shadow-none hover:bg-blue-50 transition-colors p-4">
                            <div className="flex items-center gap-5">
                                <div className={`h-10 w-10 shrink-0 flex items-center justify-center ${colorClass}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted-foreground/60 w-28 shrink-0">
                                            {ACTION_LABELS[log.action] ?? log.action.replaceAll("_", " ")}
                                        </span>
                                        <span className="text-sm font-bold truncate tracking-tight">
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
                                        
                                        {/* Details summary */}
                                        {(() => {
                                            const summary = summarizeDetails(log.action, log.details);
                                            return summary
                                                ? <span className="text-xs text-muted-foreground/70 font-medium">{summary}</span>
                                                : Object.entries(log.details).map(([key, val]) => (
                                                    <div key={key} className="text-xs px-2 py-0.5 bg-muted font-bold text-muted-foreground/70">
                                                        {key}: <span className="text-foreground/80">
                                                            {typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'
                                                                ? String(val)
                                                                : JSON.stringify(val)}
                                                        </span>
                                                    </div>
                                                ));
                                        })()}
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
