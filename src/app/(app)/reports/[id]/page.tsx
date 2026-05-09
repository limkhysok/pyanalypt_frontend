"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    BookOpen, ArrowLeft, Download, Loader2, Trash2,
    ChevronUp, ChevronDown, Plus, Check, X, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { reportsApi, type ReportDetail, type ReportItem } from "@/services/reports.service";
import { toast } from "sonner";

// ── Inline editable field ─────────────────────────────────────────────────────
interface InlineEditProps {
    value: string;
    onSave: (v: string) => Promise<void>;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
}

function InlineEdit({ value, onSave, placeholder, className = "", multiline }: Readonly<InlineEditProps>) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [saving, setSaving] = useState(false);
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    useEffect(() => { setDraft(value); }, [value]);
    useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

    async function commit() {
        if (draft.trim() === value.trim()) { setEditing(false); return; }
        setSaving(true);
        try {
            await onSave(draft.trim());
            setEditing(false);
        } catch {
            toast.error("Failed to save.");
        } finally {
            setSaving(false);
        }
    }

    function cancel() { setDraft(value); setEditing(false); }

    if (!editing) {
        return (
            <span
                className={`cursor-pointer hover:bg-accent/30 rounded px-1 -mx-1 transition-colors ${className}`}
                onClick={() => setEditing(true)}
                title="Click to edit"
            >
                {value || <span className="text-muted-foreground italic">{placeholder}</span>}
            </span>
        );
    }

    const sharedClass = `border border-input rounded-none bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`;

    return (
        <span className="flex items-center gap-1.5">
            {multiline ? (
                <textarea
                    ref={ref as React.RefObject<HTMLTextAreaElement>}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={3}
                    className={`${sharedClass} resize-none w-full`}
                    onKeyDown={e => { if (e.key === "Escape") cancel(); }}
                />
            ) : (
                <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className={`${sharedClass} w-full`}
                    onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
                />
            )}
            <button onClick={commit} disabled={saving} className="text-green-600 hover:text-green-700 shrink-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button onClick={cancel} disabled={saving} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="h-4 w-4" />
            </button>
        </span>
    );
}

// ── Item annotation inline edit ───────────────────────────────────────────────
interface AnnotationEditProps {
    itemId: number;
    reportId: number;
    value: string;
    onUpdated: (itemId: number, annotation: string) => void;
}

function AnnotationEdit({ itemId, reportId, value, onUpdated }: Readonly<AnnotationEditProps>) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setDraft(value); }, [value]);

    async function commit() {
        if (draft.trim() === value.trim()) { setEditing(false); return; }
        setSaving(true);
        try {
            await reportsApi.updateItem(reportId, itemId, { annotation: draft.trim() });
            onUpdated(itemId, draft.trim());
            setEditing(false);
        } catch {
            toast.error("Failed to save annotation.");
        } finally {
            setSaving(false);
        }
    }

    if (!editing) {
        return (
            <p
                className="text-sm text-muted-foreground cursor-pointer hover:bg-accent/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-8 flex items-center"
                onClick={() => setEditing(true)}
                title="Click to edit annotation"
            >
                {value || <span className="italic opacity-50">Add annotation…</span>}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={4}
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={e => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
            />
            <div className="flex gap-2">
                <Button size="sm" className="h-7 rounded-none text-xs gap-1" onClick={commit} disabled={saving}>
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                </Button>
                <Button size="sm" variant="ghost" className="h-7 rounded-none text-xs" onClick={() => { setDraft(value); setEditing(false); }} disabled={saving}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Item card ─────────────────────────────────────────────────────────────────
interface ItemCardProps {
    item: ReportItem;
    reportId: number;
    isFirst: boolean;
    isLast: boolean;
    onMoveUp: (item: ReportItem) => void;
    onMoveDown: (item: ReportItem) => void;
    onDelete: (item: ReportItem) => void;
    onAnnotationUpdated: (itemId: number, annotation: string) => void;
    movingId: number | null;
}

function ItemCard({
    item, reportId, isFirst, isLast,
    onMoveUp, onMoveDown, onDelete, onAnnotationUpdated, movingId,
}: Readonly<ItemCardProps>) {
    const isMoving = movingId === item.id;

    return (
        <div className={`border border-border bg-card flex flex-col gap-0 transition-opacity ${isMoving ? "opacity-40" : ""}`}>
            {/* Image */}
            {item.chart_image && item.chart_type !== "text" && (
                <div className="border-b border-border/60 bg-muted/10 p-4">
                    <img
                        src={item.chart_image.startsWith("data:") ? item.chart_image : `data:image/png;base64,${item.chart_image}`}
                        alt={`Chart: ${item.chart_type}`}
                        className="w-full max-h-96 object-contain"
                    />
                </div>
            )}

            {/* Text-only block header */}
            {item.chart_type === "text" && (
                <div className="border-b border-border/60 bg-muted/5 px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" /> Text block
                </div>
            )}

            {/* Annotation + controls */}
            <div className="flex gap-3 p-4">
                <div className="flex-1 min-w-0">
                    <AnnotationEdit
                        itemId={item.id}
                        reportId={reportId}
                        value={item.annotation}
                        onUpdated={onAnnotationUpdated}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 shrink-0">
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
                        onClick={() => onMoveUp(item)}
                        disabled={isFirst || !!movingId}
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground"
                        onClick={() => onMoveDown(item)}
                        disabled={isLast || !!movingId}
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(item)}
                        disabled={!!movingId}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Order badge */}
            <div className="border-t border-border/60 px-4 py-1.5 flex items-center text-[10px] text-muted-foreground gap-2">
                <span className="font-mono">#{item.order + 1}</span>
                <span className="capitalize">{item.chart_type}</span>
            </div>
        </div>
    );
}

// ── Delete item confirm ───────────────────────────────────────────────────────
interface DeleteItemDialogProps {
    item: ReportItem | null;
    reportId: number;
    onClose: () => void;
    onDeleted: (itemId: number) => void;
}

function DeleteItemDialog({ item, reportId, onClose, onDeleted }: Readonly<DeleteItemDialogProps>) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!item) return;
        setDeleting(true);
        try {
            await reportsApi.deleteItem(reportId, item.id);
            toast.success("Item removed.");
            onDeleted(item.id);
            onClose();
        } catch {
            toast.error("Failed to delete item.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog open={!!item} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="rounded-none max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Remove Item</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground py-2">Remove this item from the report? The chart data is not deleted.</p>
                <DialogFooter>
                    <Button variant="outline" size="sm" className="rounded-none" onClick={onClose} disabled={deleting}>Cancel</Button>
                    <Button variant="destructive" size="sm" className="rounded-none" onClick={handleDelete} disabled={deleting}>
                        {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);

    const [report, setReport] = useState<ReportDetail | null>(null);
    const [items, setItems] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [addingText, setAddingText] = useState(false);
    const [movingId, setMovingId] = useState<number | null>(null);
    const [deleteItem, setDeleteItem] = useState<ReportItem | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        reportsApi.get(reportId)
            .then(data => {
                setReport(data);
                setItems([...data.items].sort((a, b) => a.order - b.order));
            })
            .catch(() => toast.error("Failed to load report."))
            .finally(() => setLoading(false));
    }, [reportId]);

    useEffect(() => { load(); }, [load]);

    // ── Title / description save ──────────────────────────────────────────────
    async function saveTitle(title: string) {
        if (!title) { toast.error("Title cannot be empty."); throw new Error(); }
        await reportsApi.update(reportId, { title });
        setReport(prev => prev ? { ...prev, title } : prev);
    }

    async function saveDescription(description: string) {
        await reportsApi.update(reportId, { description });
        setReport(prev => prev ? { ...prev, description } : prev);
    }

    // ── Reorder ───────────────────────────────────────────────────────────────
    async function moveItem(item: ReportItem, direction: "up" | "down") {
        const sorted = [...items];
        const idx = sorted.findIndex(i => i.id === item.id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;

        const swapItem = sorted[swapIdx];
        const newOrder = swapItem.order;
        const swapOrder = item.order;

        setMovingId(item.id);
        try {
            await Promise.all([
                reportsApi.updateItem(reportId, item.id, { order: newOrder }),
                reportsApi.updateItem(reportId, swapItem.id, { order: swapOrder }),
            ]);
            const updated = sorted.map(i => {
                if (i.id === item.id) return { ...i, order: newOrder };
                if (i.id === swapItem.id) return { ...i, order: swapOrder };
                return i;
            });
            setItems(updated.sort((a, b) => a.order - b.order));
        } catch {
            toast.error("Failed to reorder.");
        } finally {
            setMovingId(null);
        }
    }

    // ── Item deleted ──────────────────────────────────────────────────────────
    function handleItemDeleted(itemId: number) {
        setItems(prev => prev.filter(i => i.id !== itemId));
    }

    // ── Annotation updated ────────────────────────────────────────────────────
    function handleAnnotationUpdated(itemId: number, annotation: string) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, annotation } : i));
    }

    // ── Add text block ────────────────────────────────────────────────────────
    async function addTextBlock() {
        setAddingText(true);
        try {
            const nextOrder = items.length;
            const newItem = await reportsApi.addItem(reportId, {
                order: nextOrder,
                chart_type: "text",
                annotation: "",
            });
            setItems(prev => [...prev, newItem].sort((a, b) => a.order - b.order));
        } catch {
            toast.error("Failed to add text block.");
        } finally {
            setAddingText(false);
        }
    }

    // ── Export PDF ────────────────────────────────────────────────────────────
    async function handleExport() {
        setExporting(true);
        try {
            const { blob, filename } = await reportsApi.exportPdf(reportId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to export PDF.");
        } finally {
            setExporting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div className="h-64 flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading report…</span>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <p className="text-sm">Report not found.</p>
                    <Button variant="outline" size="sm" className="rounded-none gap-1.5" onClick={() => router.push("/reports")}>
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl">

            {/* Back link */}
            <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                onClick={() => router.push("/reports")}
            >
                <ArrowLeft className="h-3.5 w-3.5" /> All Reports
            </button>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <BookOpen className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <div className="text-2xl font-bold tracking-tight font-mono">
                            <InlineEdit
                                value={report.title}
                                onSave={saveTitle}
                                placeholder="Untitled Report"
                                className="text-2xl font-bold"
                            />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            <InlineEdit
                                value={report.description ?? ""}
                                onSave={saveDescription}
                                placeholder="Add a description…"
                                multiline
                                className="text-sm text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none gap-1.5 shrink-0"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    {exporting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Download className="h-3.5 w-3.5" />
                    }
                    Export PDF
                </Button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
                <div className="border border-slate-200 bg-muted/5 h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <BookOpen className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No items yet</p>
                    <p className="text-xs opacity-70">Save a chart from Visualization, or add a text block below</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {items.map((item, idx) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            reportId={reportId}
                            isFirst={idx === 0}
                            isLast={idx === items.length - 1}
                            onMoveUp={item => moveItem(item, "up")}
                            onMoveDown={item => moveItem(item, "down")}
                            onDelete={setDeleteItem}
                            onAnnotationUpdated={handleAnnotationUpdated}
                            movingId={movingId}
                        />
                    ))}
                </div>
            )}

            {/* Add text block */}
            <div>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none gap-1.5 text-xs"
                    onClick={addTextBlock}
                    disabled={addingText}
                >
                    {addingText
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Plus className="h-3.5 w-3.5" />
                    }
                    Add text block
                </Button>
            </div>

            <DeleteItemDialog
                item={deleteItem}
                reportId={reportId}
                onClose={() => setDeleteItem(null)}
                onDeleted={handleItemDeleted}
            />
        </div>
    );
}
