"use client";

import { useState, useEffect } from "react";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { reportsApi, type Report, type ChartType } from "@/services/reports.service";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chartType: ChartType;
    chartParams: Record<string, unknown>;
    getChartImage: () => string | null;
}

export function SaveToReportModal({ open, onOpenChange, chartType, chartParams, getChartImage }: Readonly<Props>) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [selectedId, setSelectedId] = useState<string>("");
    const [newTitle, setNewTitle] = useState("");
    const [annotation, setAnnotation] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoadingReports(true);
        reportsApi.list()
            .then(data => {
                setReports(data);
                if (data.length === 0) {
                    setMode("new");
                    setSelectedId("");
                } else {
                    setMode("existing");
                    setSelectedId(String(data[0].id));
                }
            })
            .catch(() => toast.error("Failed to load reports."))
            .finally(() => setLoadingReports(false));
    }, [open]);

    async function handleSave() {
        const chartImage = getChartImage();
        if (!chartImage) {
            toast.error("Chart not rendered yet — run the chart first.");
            return;
        }
        if (mode === "existing" && !selectedId) {
            toast.error("Select a report.");
            return;
        }
        if (mode === "new" && !newTitle.trim()) {
            toast.error("Enter a report title.");
            return;
        }

        setSaving(true);
        try {
            let reportId: number;
            if (mode === "new") {
                const report = await reportsApi.create({ title: newTitle.trim() });
                reportId = report.id;
            } else {
                reportId = Number(selectedId);
            }

            const detail = await reportsApi.get(reportId);
            const nextOrder = detail.items.length;

            await reportsApi.addItem(reportId, {
                order: nextOrder,
                chart_type: chartType,
                chart_params: chartParams,
                chart_image: chartImage,
                annotation: annotation.trim(),
            });

            toast.success("Saved to report.");
            onOpenChange(false);
            setAnnotation("");
            setNewTitle("");
        } catch {
            toast.error("Failed to save to report.");
        } finally {
            setSaving(false);
        }
    }

    function handlePickerChange(v: string) {
        if (v === "__new__") {
            setMode("new");
        } else {
            setMode("existing");
            setSelectedId(v);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                        <BookOpen className="h-4 w-4" /> Save to Report
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Choose an existing report or create a new one to save this chart.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {loadingReports ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading reports…
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium">Report</span>
                                <Select
                                    value={mode === "new" ? "__new__" : selectedId}
                                    onValueChange={handlePickerChange}
                                >
                                    <SelectTrigger className="h-8 rounded-none text-xs">
                                        <SelectValue placeholder="Select a report" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {reports.map(r => (
                                            <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                                                {r.title}
                                                <span className="ml-1.5 text-muted-foreground">({r.item_count})</span>
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__new__" className="text-xs text-blue-600">
                                            <span className="flex items-center gap-1">
                                                <Plus className="h-3 w-3" /> Create new report
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {mode === "new" && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-medium">Report title</span>
                                    <Input
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        placeholder="e.g. Q1 Sales Analysis"
                                        className="h-8 rounded-none text-xs"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium">
                                    Annotation{" "}
                                    <span className="text-muted-foreground font-normal">(optional)</span>
                                </span>
                                <textarea
                                    value={annotation}
                                    onChange={e => setAnnotation(e.target.value)}
                                    placeholder="Write your insight here…"
                                    rows={4}
                                    className="w-full rounded-none border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-none"
                        onClick={handleSave}
                        disabled={saving || loadingReports}
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
