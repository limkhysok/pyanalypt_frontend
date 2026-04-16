"use client";

import React from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Issue } from "@/types/dataset";

interface IssuesPanelProps {
    issuesByColumn: Record<string, Issue[]>;
    searchQuery: string;
    onDeleteIssue: (id: number) => void;
}

export function IssuesPanel({ issuesByColumn, searchQuery, onDeleteIssue }: Readonly<IssuesPanelProps>) {
    const q = searchQuery.toLowerCase();

    const visibleIssues = Object.values(issuesByColumn)
        .flat()
        .filter((issue) =>
            issue.description.toLowerCase().includes(q) ||
            issue.column_name?.toLowerCase().includes(q) ||
            issue.issue_type.toLowerCase().includes(q)
        );

    if (visibleIssues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 rounded-lg border border-dashed">
                <ShieldAlert className="h-6 w-6 text-emerald-500/40" />
                <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">No issues found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Run a scan to detect data quality issues.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b">
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Column</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Rows</th>
                        <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Fix</th>
                        <th className="px-4 py-2.5 w-10" />
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {visibleIssues.map((issue) => (
                            <motion.tr
                                key={issue.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-border/50 hover:bg-muted/40 transition-colors align-top group"
                            >
                                <td className="px-4 py-2 text-xs font-medium font-mono">
                                    {issue.column_name && issue.column_name !== "__dataset__"
                                        ? issue.column_name
                                        : <span className="text-muted-foreground italic">dataset</span>
                                    }
                                </td>
                                <td className="px-4 py-2">
                                    <Badge variant="secondary" className="text-[10px] font-semibold whitespace-nowrap">
                                        {issue.issue_type}
                                    </Badge>
                                </td>
                                <td className="px-4 py-2 text-xs text-muted-foreground max-w-64">{issue.description}</td>
                                <td className="px-4 py-2 text-xs font-semibold text-right tabular-nums">{issue.affected_rows ?? "—"}</td>
                                <td className="px-4 py-2 text-xs text-foreground/70 max-w-48">{issue.suggested_fix || "—"}</td>
                                <td className="px-4 py-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => onDeleteIssue(issue.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
