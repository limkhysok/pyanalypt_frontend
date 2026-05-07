"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
    BrainCircuit, Database, Loader2, Sparkles, ChevronDown,
    FileText, Plus, Trash2, Check, X, Pencil, Bot, DatabaseZap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { datasetApi } from "@/services/dataset.service";
import { goalsApi, type AnalysisGoal, type AnalysisGoalDetail, type AnalysisQuestion } from "@/services/goals.service";
import { type Dataset } from "@/types/dataset";
import { toast } from "sonner";

const MAX_QUESTIONS = 20;

function applyGoalQuestionCount(goals: AnalysisGoal[], detail: AnalysisGoalDetail): AnalysisGoal[] {
    return goals.map(g => g.id === detail.id ? { ...g, question_count: detail.question_count } : g);
}

// ── Inline editable problem statement ─────────────────────────────────────────

function ProblemStatement({ goalId, value, onSaved }: Readonly<{
    goalId: number;
    value: string;
    onSaved: (v: string) => void;
}>) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setDraft(value); }, [value]);

    async function commit() {
        if (draft.trim() === value.trim()) { setEditing(false); return; }
        setSaving(true);
        try {
            await goalsApi.update(goalId, { problem_statement: draft.trim() });
            onSaved(draft.trim());
            setEditing(false);
        } catch {
            toast.error("Failed to save problem statement.");
        } finally {
            setSaving(false);
        }
    }

    if (editing) {
        return (
            <div className="flex flex-col gap-2">
                <textarea
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={3}
                    placeholder="What are you trying to find out?"
                    className="w-full border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    onKeyDown={e => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
                />
                <div className="flex gap-2">
                    <Button size="sm" className="h-7 rounded-none text-xs gap-1" onClick={commit} disabled={saving}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 rounded-none text-xs" onClick={() => { setDraft(value); setEditing(false); }} disabled={saving}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <button
            className="w-full text-left group flex items-start gap-2"
            onClick={() => setEditing(true)}
            title="Click to edit"
        >
            <p className={cn("text-sm leading-relaxed flex-1", value ? "text-foreground/80" : "text-muted-foreground/50 italic")}>
                {value || "Click to add a problem statement…"}
            </p>
            <Pencil className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-40 text-muted-foreground transition-opacity" />
        </button>
    );
}

// ── Question row ──────────────────────────────────────────────────────────────

function QuestionRow({ question, index, goalId, onUpdated, onDeleted }: Readonly<{
    question: AnalysisQuestion;
    index: number;
    goalId: number;
    onUpdated: (q: AnalysisQuestion) => void;
    onDeleted: (id: number) => void;
}>) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(question.question);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    async function commit() {
        if (draft.trim() === question.question.trim()) { setEditing(false); return; }
        if (!draft.trim()) { toast.error("Question cannot be empty."); return; }
        setSaving(true);
        try {
            const updated = await goalsApi.updateQuestion(goalId, question.id, { question: draft.trim() });
            onUpdated(updated);
            setEditing(false);
        } catch {
            toast.error("Failed to save question.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await goalsApi.deleteQuestion(goalId, question.id);
            onDeleted(question.id);
        } catch {
            toast.error("Failed to delete question.");
            setDeleting(false);
        }
    }

    return (
        <div className={cn(
            "group flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20"
        )}>
            <span className="text-xs font-mono text-muted-foreground/40 mt-0.5 shrink-0 w-6 text-right tabular-nums">
                {index + 1}.
            </span>

            {editing ? (
                <div className="flex-1 flex flex-col gap-2">
                    <Input
                        ref={inputRef}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        className="h-7 rounded-none text-xs"
                        onKeyDown={e => {
                            if (e.key === "Enter") commit();
                            if (e.key === "Escape") { setDraft(question.question); setEditing(false); }
                        }}
                    />
                    <div className="flex gap-1.5">
                        <Button size="sm" className="h-6 rounded-none text-[10px] gap-1 px-2" onClick={commit} disabled={saving}>
                            {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
                            Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 rounded-none text-[10px] px-2" onClick={() => { setDraft(question.question); setEditing(false); }} disabled={saving}>
                            <X className="h-2.5 w-2.5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="flex-1 text-sm text-foreground/80 leading-relaxed">{question.question}</p>
            )}

            <div className="flex items-center gap-1 shrink-0">
                {question.source === "ai" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 rounded-none border-border/50 text-muted-foreground font-normal">
                        <Bot className="h-2.5 w-2.5" /> AI
                    </Badge>
                )}
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="h-6 w-6 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Pencil className="h-3 w-3" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-6 w-6 flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>
            </div>
        </div>
    );
}

// ── Add question row ──────────────────────────────────────────────────────────

function AddQuestionRow({ goalId, nextOrder, onAdded, disabled }: Readonly<{
    goalId: number;
    nextOrder: number;
    onAdded: (q: AnalysisQuestion) => void;
    disabled: boolean;
}>) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleAdd() {
        if (!text.trim()) { toast.error("Enter a question first."); return; }
        setSaving(true);
        try {
            const q = await goalsApi.addQuestion(goalId, { question: text.trim(), order: nextOrder });
            onAdded(q);
            setText("");
            setOpen(false);
        } catch {
            toast.error("Failed to add question.");
        } finally {
            setSaving(false);
        }
    }

    if (disabled) {
        return (
            <p className="px-4 py-2 text-xs text-muted-foreground/50">
                Maximum {MAX_QUESTIONS} questions reached.
            </p>
        );
    }

    if (!open) {
        return (
            <div className="px-4 py-2">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add question manually
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 py-2 flex items-center gap-2 border-t border-border/50">
            <Input
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type your question…"
                className="h-8 rounded-none text-xs flex-1"
                onKeyDown={e => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") { setText(""); setOpen(false); }
                }}
            />
            <Button size="sm" className="h-8 rounded-none text-xs px-3 gap-1" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 rounded-none text-xs px-2" onClick={() => { setText(""); setOpen(false); }} disabled={saving}>
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ── Skeleton while AI generates ──────────────────────────────────────────────

const SKELETON_ROWS: { id: string; width: string }[] = [
    { id: "sq-1", width: "w-full"  },
    { id: "sq-2", width: "w-4/5"  },
    { id: "sq-3", width: "w-3/4"  },
    { id: "sq-4", width: "w-full"  },
    { id: "sq-5", width: "w-5/6"  },
    { id: "sq-6", width: "w-2/3"  },
];

function SkeletonQuestions() {
    return (
        <div>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/10">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Generating questions…</span>
            </div>
            {SKELETON_ROWS.map(({ id, width }) => (
                <div key={id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0">
                    <Skeleton className="h-3 w-4 mt-1 shrink-0 rounded-none" />
                    <Skeleton className={cn("h-3.5 rounded-none flex-1", width)} />
                    <Skeleton className="h-4 w-7 shrink-0 rounded-none" />
                </div>
            ))}
        </div>
    );
}

// ── Create goal form ──────────────────────────────────────────────────────────

function CreateGoalForm({ datasetId, onCreated, onCancel }: Readonly<{
    datasetId: number;
    onCreated: (goal: AnalysisGoalDetail) => void;
    onCancel?: () => void;
}>) {
    const [statement, setStatement] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleCreate() {
        setSaving(true);
        try {
            const goal = await goalsApi.create({ dataset: datasetId, problem_statement: statement.trim() || undefined });
            onCreated(goal);
        } catch {
            toast.error("Failed to create goal.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card className="rounded-none shadow-sm">
            <CardHeader className="px-5 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold font-mono">New Analysis Goal</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="goal-statement" className="text-xs font-medium text-muted-foreground">
                        What are you trying to find out? <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <textarea
                        id="goal-statement"
                        autoFocus
                        value={statement}
                        onChange={e => setStatement(e.target.value)}
                        rows={3}
                        placeholder="e.g. Why did Q3 revenue drop 18% compared to last year?"
                        className="w-full border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleCreate}
                        disabled={saving}
                        size="sm"
                        className="h-8 rounded-none gap-1.5 text-xs"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        Create Goal
                    </Button>
                    {onCancel && (
                        <Button variant="outline" size="sm" className="h-8 rounded-none text-xs" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ── Goal detail panel ─────────────────────────────────────────────────────────

function GoalDetail({ goal, isStreaming, onGoalUpdated, onSuggest }: Readonly<{
    goal: AnalysisGoalDetail;
    isStreaming: boolean;
    onGoalUpdated: (patch: Partial<AnalysisGoalDetail>) => void;
    onSuggest: () => void;
}>) {
    const questions = [...(goal.questions ?? [])].sort((a, b) => a.order - b.order);
    const atLimit = questions.length >= MAX_QUESTIONS;

    function handleQuestionUpdated(updated: AnalysisQuestion) {
        onGoalUpdated({ questions: questions.map(q => q.id === updated.id ? updated : q) });
    }

    function handleQuestionDeleted(id: number) {
        onGoalUpdated({ questions: questions.filter(q => q.id !== id), question_count: goal.question_count - 1 });
    }

    function handleQuestionAdded(q: AnalysisQuestion) {
        onGoalUpdated({ questions: [...questions, q], question_count: goal.question_count + 1 });
    }

    return (
        <div className="space-y-4">
            {/* Problem statement */}
            <Card className="rounded-none shadow-sm">
                <CardHeader className="px-5 py-3 border-b border-border bg-muted/40">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold font-mono">Problem Statement</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ProblemStatement
                        goalId={goal.id}
                        value={goal.problem_statement}
                        onSaved={v => onGoalUpdated({ problem_statement: v })}
                    />
                </CardContent>
            </Card>

            {/* Questions */}
            <Card className="rounded-none shadow-sm overflow-hidden">
                <CardHeader className="px-5 py-3 border-b border-border bg-muted/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <CardTitle className="text-sm font-semibold font-mono">Research Questions</CardTitle>
                            <span className="text-xs text-muted-foreground font-mono">
                                {questions.length}/{MAX_QUESTIONS}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            disabled={isStreaming || atLimit}
                            onClick={onSuggest}
                            className="h-7 rounded-none gap-1.5 text-xs"
                        >
                            {isStreaming
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                                : <><Sparkles className="h-3.5 w-3.5" /> Suggest with AI</>
                            }
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isStreaming && <SkeletonQuestions />}

                    {!isStreaming && questions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                            <Sparkles className="h-7 w-7 opacity-20" />
                            <p className="text-sm font-medium">No questions yet</p>
                            <p className="text-xs opacity-60">Click "Suggest with AI" or add one manually below</p>
                        </div>
                    )}

                    {!isStreaming && questions.map((q, i) => (
                        <QuestionRow
                            key={q.id}
                            question={q}
                            index={i}
                            goalId={goal.id}
                            onUpdated={handleQuestionUpdated}
                            onDeleted={handleQuestionDeleted}
                        />
                    ))}

                    {!isStreaming && (
                        <AddQuestionRow
                            goalId={goal.id}
                            nextOrder={questions.length}
                            onAdded={handleQuestionAdded}
                            disabled={atLimit}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ── Goals sidebar ─────────────────────────────────────────────────────────────

function GoalsSidebar({ goals, activeId, isStreaming, onSelect, onNew }: Readonly<{
    goals: AnalysisGoal[];
    activeId: number | null;
    isStreaming: boolean;
    onSelect: (g: AnalysisGoal) => void;
    onNew: () => void;
}>) {
    return (
        <Card className="rounded-none shadow-sm overflow-hidden h-fit">
            <CardHeader className="px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold font-mono text-muted-foreground">Goals</CardTitle>
                    <button
                        onClick={onNew}
                        title="New Goal"
                        className="h-5 w-5 flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {goals.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 text-center py-6">No goals yet</p>
                ) : (
                    <div className="divide-y divide-border/50">
                        {goals.map((g, idx) => {
                            const isActive = activeId === g.id && !isStreaming;
                            return (
                                <button
                                    key={g.id}
                                    onClick={() => onSelect(g)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 transition-colors border-l-2",
                                        isActive
                                            ? "bg-primary/5 border-l-primary"
                                            : "border-l-transparent hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={cn("text-[10px] font-semibold font-mono", isActive ? "text-primary" : "text-muted-foreground")}>
                                            Goal {idx + 1}
                                        </span>
                                        {idx === 0 && (
                                            <span className="text-[9px] font-medium text-muted-foreground/50 ml-auto">latest</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-2">
                                        {g.problem_statement || <span className="italic opacity-50">No problem statement</span>}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">
                                        {g.question_count} {g.question_count === 1 ? "question" : "questions"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function FramingPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [goals, setGoals] = useState<AnalysisGoal[]>([]);
    const [activeGoal, setActiveGoal] = useState<AnalysisGoalDetail | null>(null);
    const [loadingDatasets, setLoadingDatasets] = useState(true);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [loadingGoalDetail, setLoadingGoalDetail] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        datasetApi.listDatasets()
            .then(data => setDatasets(Array.isArray(data) ? data : (data as { results: Dataset[] }).results ?? []))
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    const loadGoals = useCallback(async (dataset: Dataset) => {
        setLoadingGoals(true);
        setActiveGoal(null);
        setShowCreateForm(false);
        try {
            const all = await goalsApi.list();
            const filtered = all
                .filter(g => g.dataset === dataset.id)
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setGoals(filtered);
            if (filtered.length > 0) {
                await selectGoal(filtered[0]);
            } else {
                setShowCreateForm(true);
            }
        } catch {
            toast.error("Failed to load goals.");
        } finally {
            setLoadingGoals(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function selectGoal(goal: AnalysisGoal) {
        setLoadingGoalDetail(true);
        try {
            const detail = await goalsApi.get(goal.id);
            setActiveGoal(detail);
            setShowCreateForm(false);
        } catch {
            toast.error("Failed to load goal.");
        } finally {
            setLoadingGoalDetail(false);
        }
    }

    function handleSelectDataset(dataset: Dataset) {
        setSelectedDataset(dataset);
        loadGoals(dataset);
    }

    function handleGoalCreated(goal: AnalysisGoalDetail) {
        setGoals(prev => [goal, ...prev]);
        setActiveGoal(goal);
        setShowCreateForm(false);
    }

    function handleGoalUpdated(patch: Partial<AnalysisGoalDetail>) {
        setActiveGoal(prev => prev ? { ...prev, ...patch } : prev);
        if (patch.problem_statement !== undefined || patch.question_count !== undefined) {
            setGoals(prev => prev.map(g =>
                g.id === activeGoal?.id
                    ? { ...g, ...patch, question_count: patch.question_count ?? (patch.questions?.length ?? g.question_count) }
                    : g
            ));
        }
    }

    async function runSuggest() {
        if (!activeGoal || isStreaming) return;
        setIsStreaming(true);
        try {
            await goalsApi.suggest(
                activeGoal.id,
                () => {},
                async () => {
                    const detail = await goalsApi.get(activeGoal.id);
                    setActiveGoal(detail);
                    setGoals(prev => applyGoalQuestionCount(prev, detail));
                    setIsStreaming(false);
                },
                err => {
                    toast.error(`AI suggestion failed: ${err.message}`);
                    setIsStreaming(false);
                }
            );
        } catch {
            toast.error("AI suggestion failed. Make sure Ollama is running.");
            setIsStreaming(false);
        }
    }

    const datasetGoals = selectedDataset ? goals.filter(g => g.dataset === selectedDataset.id) : [];
    const hasGoals = datasetGoals.length > 0;
    const selectedName = selectedDataset?.file_name ?? null;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">Framing</h1>
                        <span className="text-sm text-muted-foreground leading-none">/ Define your analysis goals and research questions</span>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 border-b border-border pb-4">

                {/* New goal button — only when dataset selected */}
                {selectedDataset && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-none gap-1.5 text-xs"
                        onClick={() => { setShowCreateForm(true); setActiveGoal(null); }}
                        disabled={loadingGoals || isStreaming}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Goal
                    </Button>
                )}

                {/* Dataset picker — mirrors DataLab style, pushed to right */}
                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 w-full sm:w-auto sm:min-w-44 min-w-0 justify-between text-xs rounded-none"
                                disabled={loadingDatasets}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-36">
                                        {loadingDatasets ? "Loading…" : (selectedName ?? "Select dataset")}
                                    </span>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-none shadow-md">
                            <DropdownMenuLabel className="text-[13px] font-semibold text-muted-foreground">
                                Dataset
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={selectedDataset ? String(selectedDataset.id) : ""}
                                onValueChange={id => {
                                    const d = datasets.find(d => String(d.id) === id);
                                    if (d) handleSelectDataset(d);
                                }}
                            >
                                {datasets.length === 0
                                    ? <DropdownMenuRadioItem value="" disabled className="text-sm opacity-50">No datasets found</DropdownMenuRadioItem>
                                    : datasets.map(d => (
                                        <DropdownMenuRadioItem key={d.id} value={String(d.id)} className="text-sm truncate cursor-pointer">
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))
                                }
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── No dataset selected ── */}
            {!selectedDataset && (
                <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <DatabaseZap className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">No dataset selected</p>
                    <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                </div>
            )}

            {/* ── Loading goals ── */}
            {selectedDataset && loadingGoals && (
                <div className="flex items-center justify-center h-80 gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading goals…</span>
                </div>
            )}

            {/* ── Main content ── */}
            {selectedDataset && !loadingGoals && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                    {/* Goals sidebar */}
                    <div className="lg:col-span-1">
                        <GoalsSidebar
                            goals={datasetGoals}
                            activeId={activeGoal?.id ?? null}
                            isStreaming={isStreaming}
                            onSelect={g => selectGoal(g)}
                            onNew={() => { setShowCreateForm(true); setActiveGoal(null); }}
                        />
                    </div>

                    {/* Right panel */}
                    <div className="lg:col-span-3">

                        {showCreateForm && (
                            <CreateGoalForm
                                datasetId={selectedDataset.id}
                                onCreated={handleGoalCreated}
                                onCancel={hasGoals ? () => {
                                    setShowCreateForm(false);
                                    if (datasetGoals[0]) selectGoal(datasetGoals[0]);
                                } : undefined}
                            />
                        )}

                        {loadingGoalDetail && (
                            <div className="flex items-center justify-center h-80 gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading goal…</span>
                            </div>
                        )}

                        {!showCreateForm && !loadingGoalDetail && activeGoal && (
                            <GoalDetail
                                goal={activeGoal}
                                isStreaming={isStreaming}
                                onGoalUpdated={handleGoalUpdated}
                                onSuggest={runSuggest}
                            />
                        )}

                        {!showCreateForm && !loadingGoalDetail && !activeGoal && (
                            <div className="border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <BrainCircuit className="h-10 w-10 opacity-20" />
                                <p className="text-sm font-medium">Select a goal to view</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
