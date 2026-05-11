"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    BookOpen, Plus, Trash2, FileText, Loader2, Calendar, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { reportsApi, type Report } from "@/services/reports.service";
import { datasetApi } from "@/services/dataset.service";
import type { Dataset } from "@/types/dataset";
import { toast } from "sonner";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ── New Report Dialog ──────────────────────────────────────────────────────────
interface NewReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (report: Report) => void;
    datasets: { id: number; file_name: string }[];
}

function NewReportDialog({ open, onOpenChange, onCreated, datasets }: Readonly<NewReportDialogProps>) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [datasetId, setDatasetId] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) { setTitle(""); setDescription(""); setDatasetId(""); }
    }, [open]);

    async function handleCreate() {
        if (!title.trim()) { toast.error("Title is required."); return; }
        setSaving(true);
        try {
            const report = await reportsApi.create({
                title: title.trim(),
                description: description.trim() || undefined,
                dataset: datasetId ? Number(datasetId) : undefined,
            });
            toast.success("Report created.");
            onCreated(report);
            onOpenChange(false);
        } catch {
            toast.error("Failed to create report.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">New Report</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Create a new report to save and share charts and insights.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium">Title</span>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Q1 Drug Sales Analysis"
                            className="h-8 rounded-none text-xs"
                            onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium">
                            Source Dataset <span className="text-muted-foreground font-normal">(optional)</span>
                        </span>
                        <Select value={datasetId} onValueChange={setDatasetId}>
                            <SelectTrigger className="h-8 rounded-none text-xs">
                                <SelectValue placeholder="No dataset selected" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                <SelectItem value="none" className="text-xs italic text-muted-foreground">None</SelectItem>
                                {datasets.map(ds => (
                                    <SelectItem key={ds.id} value={String(ds.id)} className="text-xs">
                                        {ds.file_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium">
                            Description <span className="text-muted-foreground font-normal">(optional)</span>
                        </span>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What is this report about?"
                            rows={3}
                            className="w-full rounded-none border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm" className="rounded-none" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-none" onClick={handleCreate} disabled={saving}>
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Delete Confirm Dialog ──────────────────────────────────────────────────────
interface DeleteDialogProps {
    report: Report | null;
    onClose: () => void;
    onDeleted: (id: number) => void;
}

function DeleteDialog({ report, onClose, onDeleted }: Readonly<DeleteDialogProps>) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!report) return;
        setDeleting(true);
        try {
            await reportsApi.delete(report.id);
            toast.success("Report deleted.");
            onDeleted(report.id);
            onClose();
        } catch {
            toast.error("Failed to delete report.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog open={!!report} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="rounded-none max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Delete Report</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                        Delete <span className="font-semibold text-foreground">&quot;{report?.title}&quot;</span> and all its items? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" size="sm" className="rounded-none" onClick={onClose} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" className="rounded-none" onClick={handleDelete} disabled={deleting}>
                        {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Report Card ────────────────────────────────────────────────────────────────
interface ReportCardProps {
    report: Report;
    datasetMap: Record<number, string>;
    onDelete: (report: Report) => void;
}

function ReportCard({ report, datasetMap, onDelete }: Readonly<ReportCardProps>) {
    return (
        <div className="group relative border border-border bg-card hover:border-border/80 hover:bg-accent/5 transition-colors flex flex-col gap-0">
            <Link href={`/reports/${report.id}`} className="flex flex-col gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                <div className="flex items-start gap-3 p-4 pb-3 min-w-0 pr-10">
                    <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center bg-secondary text-foreground border border-border">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{report.title}</p>
                        {report.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{report.description}</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-border/60 px-4 py-2.5 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <LayoutGrid className="h-3 w-3" />
                        {report.item_count} {report.item_count === 1 ? "item" : "items"}
                    </span>
                    {(report.dataset_name || (report.dataset ? datasetMap[report.dataset] : null)) && (
                        <span className="truncate">{report.dataset_name || (report.dataset ? datasetMap[report.dataset] : null)}</span>
                    )}
                    <span className="ml-auto flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.updated_at)}
                    </span>
                </div>
            </Link>

            {/* Delete button — absolute positioned, outside the link */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-none shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                onClick={e => { e.preventDefault(); onDelete(report); }}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [datasetMap, setDatasetMap] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [newOpen, setNewOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [reportsData, datasetsData] = await Promise.all([
                reportsApi.list(),
                datasetApi.listDatasets()
            ]);

            const map: Record<number, string> = {};
            const dsList = datasetsData.results || [];
            dsList.forEach((ds: Dataset) => {
                map[ds.id] = ds.file_name;
            });
            
            setDatasets(dsList);
            setDatasetMap(map);
            setReports(reportsData);
        } catch {
            toast.error("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    function handleCreated(report: Report) {
        setReports(prev => [report, ...prev]);
    }

    function handleDeleted(id: number) {
        setReports(prev => prev.filter(r => r.id !== id));
    }

    function renderContent() {
        if (loading) {
            return (
                <div className="border border-border bg-muted/5 h-64 flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading reports…</span>
                </div>
            );
        }
        if (reports.length === 0) {
            return (
                <div className="border border-border bg-muted/5 h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <BookOpen className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">No reports yet</p>
                    <p className="text-xs opacity-70">Create your first report or save a chart from the Visualization page</p>
                    <Button size="sm" variant="outline" className="rounded-none mt-1 gap-1.5" onClick={() => setNewOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> New Report
                    </Button>
                </div>
            );
        }
        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map(report => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        datasetMap={datasetMap}
                        onDelete={setDeleteTarget}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">Reports</h1>
                        <span className="text-sm text-muted-foreground leading-none">/ Save charts and insights into shareable reports</span>
                    </div>
                </div>
                <Button size="sm" className="h-8 gap-2 text-xs rounded-none capitalize bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0" onClick={() => setNewOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> New Report
                </Button>
            </div>

            {/* Content */}
            {renderContent()}

            <NewReportDialog open={newOpen} onOpenChange={setNewOpen} onCreated={handleCreated} datasets={datasets} />
            <DeleteDialog report={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
        </div>
    );
}
