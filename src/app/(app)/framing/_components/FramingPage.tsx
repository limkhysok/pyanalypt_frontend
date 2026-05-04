"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import {
    BrainCircuit, Database, Loader2, Sparkles, ChevronDown,
    FileText, Plus, Trash2, Check, X, Pencil, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { datasetApi } from "@/services/dataset.service";
import { goalsApi, type AnalysisGoal, type AnalysisGoalDetail, type AnalysisQuestion } from "@/services/goals.service";
import { type Dataset } from "@/types/dataset";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_QUESTIONS = 20;

function applyGoalQuestionCount(goals: AnalysisGoal[], detail: AnalysisGoalDetail): AnalysisGoal[] {
    return goals.map(g => g.id === detail.id ? { ...g, question_count: detail.question_count } : g);
}

// ── Dataset picker label ──────────────────────────────────────────────────────
function DatasetTriggerLabel({ loading, selected }: Readonly<{ loading: boolean; selected: Dataset | null }>) {
    if (loading) return <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Loading datasets…</span></span>;
    if (selected) return <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0 text-blue-500" /><span className="truncate text-sm">{selected.file_name}</span></span>;
    return <span className="flex items-center gap-2 text-muted-foreground"><Database className="h-4 w-4" /><span className="text-sm">Select a dataset</span></span>;
}

// ── Goals sidebar ─────────────────────────────────────────────────────────────
interface GoalsSidebarProps {
    goals: AnalysisGoal[];
    activeId: number | null;
    isStreaming: boolean;
    onSelect: (g: AnalysisGoal) => void;
    onNew: () => void;
}

function GoalsSidebar({ goals, activeId, isStreaming, onSelect, onNew }: Readonly<GoalsSidebarProps>) {
    return (
        <div className="lg:col-span-1">
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-center justify-between gap-2">
                    <p className="text-[10px] font-black tracking-widest text-muted-foreground capitalize">Goals</p>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 rounded-full p-0 text-blue-500 hover:bg-blue-500/10"
                        onClick={onNew}
                        title="New Goal"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-2">
                    {goals.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/60 text-center py-4 font-medium">No goals yet</p>
                    ) : (
                        <div className="space-y-1">
                            {goals.map((g, idx) => {
                                const isActive = activeId === g.id && !isStreaming;
                                return (
                                    <button
                                        key={g.id}
                                        onClick={() => onSelect(g)}
                                        className={cn(
                                            "w-full text-left rounded-2xl px-3 py-2.5 transition-all border",
                                            isActive ? "bg-blue-500/10 border-blue-500/20" : "hover:bg-secondary/50 border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={cn("text-[10px] font-black", isActive ? "text-blue-500" : "text-muted-foreground")}>
                                                Goal {idx + 1}
                                            </span>
                                            {idx === 0 && (
                                                <Badge className="text-[9px] font-black px-1.5 py-0 ml-auto border-blue-500/20 text-blue-500 bg-blue-500/10">Latest</Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/70 font-medium line-clamp-2 leading-relaxed">
                                            {g.problem_statement || <span className="italic opacity-50">No problem statement</span>}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground/40 mt-1">
                                            {g.question_count} {g.question_count === 1 ? "question" : "questions"}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ── Inline editable problem statement ─────────────────────────────────────────
interface ProblemStatementProps {
    goalId: number;
    value: string;
    onSaved: (v: string) => void;
}

function ProblemStatement({ goalId, value, onSaved }: Readonly<ProblemStatementProps>) {
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
                    className="w-full rounded-2xl border border-blue-500/30 bg-background/60 px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    onKeyDown={e => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
                />
                <div className="flex gap-2">
                    <Button size="sm" className="h-7 rounded-xl text-xs gap-1 bg-blue-600 hover:bg-blue-700" onClick={commit} disabled={saving}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 rounded-xl text-xs" onClick={() => { setDraft(value); setEditing(false); }} disabled={saving}>
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
            <Pencil className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-50 text-muted-foreground transition-opacity" />
        </button>
    );
}

// ── Question card ─────────────────────────────────────────────────────────────
interface QuestionCardProps {
    question: AnalysisQuestion;
    index: number;
    goalId: number;
    onUpdated: (q: AnalysisQuestion) => void;
    onDeleted: (id: number) => void;
}

function QuestionCard({ question, index, goalId, onUpdated, onDeleted }: Readonly<QuestionCardProps>) {
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
            "group flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
            "bg-background/40 border-border/20 hover:border-border/40"
        )}>
            <span className="text-[10px] font-black text-blue-500/60 mt-0.5 shrink-0 w-5 text-right">Q{index + 1}</span>

            {editing ? (
                <div className="flex-1 flex flex-col gap-2">
                    <Input
                        ref={inputRef}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        className="h-7 rounded-xl text-xs border-blue-500/30"
                        onKeyDown={e => {
                            if (e.key === "Enter") commit();
                            if (e.key === "Escape") { setDraft(question.question); setEditing(false); }
                        }}
                    />
                    <div className="flex gap-1.5">
                        <Button size="sm" className="h-6 rounded-xl text-[10px] gap-1 bg-blue-600 hover:bg-blue-700 px-2" onClick={commit} disabled={saving}>
                            {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />} Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 rounded-xl text-[10px] px-2" onClick={() => { setDraft(question.question); setEditing(false); }} disabled={saving}>
                            <X className="h-2.5 w-2.5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="flex-1 text-sm text-foreground/80 leading-relaxed">{question.question}</p>
            )}

            <div className="flex items-center gap-1 shrink-0">
                {question.source === "ai" && (
                    <Badge className="text-[9px] font-black px-1.5 py-0 border-blue-500/20 text-blue-500 bg-blue-500/8 gap-0.5">
                        <Bot className="h-2.5 w-2.5" /> AI
                    </Badge>
                )}
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/60 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Pencil className="h-3 w-3" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
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
            <p className="text-[10px] text-muted-foreground/50 text-center py-1">
                Maximum {MAX_QUESTIONS} questions reached.
            </p>
        );
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60 hover:text-blue-500 transition-colors py-1"
            >
                <Plus className="h-3.5 w-3.5" /> Add question manually
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type your question…"
                className="h-8 rounded-xl text-xs flex-1 border-blue-500/30"
                onKeyDown={e => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") { setText(""); setOpen(false); }
                }}
            />
            <Button size="sm" className="h-8 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 px-3 gap-1" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs px-2" onClick={() => { setText(""); setOpen(false); }} disabled={saving}>
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ── Streaming panel ───────────────────────────────────────────────────────────
function StreamingPanel({ text }: Readonly<{ text: string }>) {
    return (
        <Card className="bg-background/60 backdrop-blur-xl border border-blue-500/30 rounded-4xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/10 flex flex-row items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                </div>
                <span className="text-sm font-black tracking-tight">AI is suggesting questions…</span>
                <Badge variant="outline" className="ml-auto text-[9px] font-black capitalize tracking-widest border-blue-500/20 text-blue-500 bg-blue-500/8">
                    Live <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                </Badge>
            </CardHeader>
            <CardContent className="p-5">
                <div className="space-y-2">
                    {text.split('\n').filter(Boolean).map((line) => (
                        <p key={line} className="text-sm text-foreground/80 leading-relaxed">{line}</p>
                    ))}
                    <span className="inline-block w-2 h-4 ml-0.5 bg-blue-500 animate-pulse rounded-sm" />
                </div>
            </CardContent>
        </Card>
    );
}

// ── Active goal detail ────────────────────────────────────────────────────────
interface GoalDetailProps {
    goal: AnalysisGoalDetail;
    isStreaming: boolean;
    streamingText: string;
    onGoalUpdated: (patch: Partial<AnalysisGoalDetail>) => void;
    onSuggest: () => void;
}

function GoalDetail({ goal, isStreaming, streamingText, onGoalUpdated, onSuggest }: Readonly<GoalDetailProps>) {
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
        <div className="lg:col-span-3 space-y-5">

            {/* Problem statement */}
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-border/10">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <BrainCircuit className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground capitalize">Problem Statement</p>
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
            <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <p className="text-[10px] font-black tracking-widest text-muted-foreground capitalize">Research Questions</p>
                            <Badge variant="outline" className="text-[9px] font-black border-border/30">
                                {questions.length}/{MAX_QUESTIONS}
                            </Badge>
                        </div>
                        <Button
                            size="sm"
                            disabled={isStreaming || atLimit}
                            onClick={onSuggest}
                            className="rounded-2xl h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] capitalize tracking-widest shadow-sm shadow-blue-500/20 transition-all"
                        >
                            {isStreaming
                                ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Generating…</>
                                : <><Sparkles className="mr-2 h-3.5 w-3.5" /> Suggest with AI</>
                            }
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                    {/* Streaming panel */}
                    {isStreaming && <StreamingPanel text={streamingText} />}

                    {/* Saved questions */}
                    {!isStreaming && questions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground/50">
                            <Sparkles className="h-7 w-7 mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-medium">No questions yet</p>
                            <p className="text-[11px] opacity-60 mt-0.5">Click "Suggest with AI" or add one manually below</p>
                        </div>
                    )}

                    {!isStreaming && questions.map((q, i) => (
                        <QuestionCard
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

// ── Create goal form ──────────────────────────────────────────────────────────
interface CreateGoalFormProps {
    datasetId: number;
    onCreated: (goal: AnalysisGoalDetail) => void;
    onCancel?: () => void;
}

function CreateGoalForm({ datasetId, onCreated, onCancel }: Readonly<CreateGoalFormProps>) {
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
        <Card className="bg-background/60 backdrop-blur-xl border border-blue-500/30 rounded-4xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/10 flex flex-row items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <BrainCircuit className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="text-sm font-black tracking-tight">New Analysis Goal</p>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="goal-statement" className="text-[10px] font-black tracking-widest text-muted-foreground capitalize">
                        What are you trying to find out?
                    </label>
                    <textarea
                        id="goal-statement"
                        autoFocus
                        value={statement}
                        onChange={e => setStatement(e.target.value)}
                        rows={3}
                        placeholder="e.g. Why did Q3 revenue drop 18% compared to last year?"
                        className="w-full rounded-2xl border border-border/30 bg-background/60 px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleCreate}
                        disabled={saving}
                        className="rounded-2xl h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] capitalize tracking-widest shadow-sm shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Create Goal
                    </Button>
                    {onCancel && (
                        <Button variant="ghost" className="rounded-2xl h-9 px-5 font-black text-[10px] capitalize tracking-widest" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                    )}
                </div>
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
    const [streamingText, setStreamingText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Load datasets
    useEffect(() => {
        setLoadingDatasets(true);
        datasetApi.listDatasets()
            .then(data => setDatasets(Array.isArray(data) ? data : (data as { results: Dataset[] }).results ?? []))
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    // Load goals for selected dataset
    const loadGoals = useCallback(async (dataset: Dataset) => {
        setLoadingGoals(true);
        setActiveGoal(null);
        setShowCreateForm(false);
        setStreamingText("");
        try {
            const all = await goalsApi.list();
            const filtered = all.filter(g => g.dataset === dataset.id).sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
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
        setStreamingText("");
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
                g.id === activeGoal?.id ? { ...g, ...patch, question_count: patch.question_count ?? (patch.questions?.length ?? g.question_count) } : g
            ));
        }
    }

    async function runSuggest() {
        if (!activeGoal || isStreaming) return;
        setIsStreaming(true);
        setStreamingText("");
        try {
            await goalsApi.suggest(
                activeGoal.id,
                token => setStreamingText(prev => prev ? `${prev}\n${token}` : token),
                async () => {
                    const detail = await goalsApi.get(activeGoal.id);
                    setActiveGoal(detail);
                    setGoals(prev => applyGoalQuestionCount(prev, detail));
                    setStreamingText("");
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

    return (
        <main className="min-h-screen pb-20 px-6 md:px-10 bg-background relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 pt-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={13} className="text-blue-500" />
                        <span className="text-[10px] font-black capitalize tracking-widest text-blue-600 dark:text-blue-400">Analysis Goals</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">Problem Framing</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Define what you're investigating and break it into focused research questions.
                    </p>
                </motion.div>

                {/* Dataset picker */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={loadingDatasets}
                                className="w-full sm:w-80 justify-between rounded-2xl h-10 border-border/30 bg-background/60 hover:bg-secondary/50 font-bold transition-all"
                            >
                                <DatasetTriggerLabel loading={loadingDatasets} selected={selectedDataset} />
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 rounded-2xl">
                            {datasets.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">No datasets found.</div>
                            ) : datasets.map(d => (
                                <DropdownMenuItem key={d.id} onClick={() => handleSelectDataset(d)} className="flex items-center gap-2 rounded-xl">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate text-sm">{d.file_name}</span>
                                    <Badge variant="secondary" className="ml-auto shrink-0 text-[10px] font-black">{d.file_format.toLowerCase()}</Badge>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>

                {/* Main content */}
                {selectedDataset && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                        {loadingGoals ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-3">
                                <div className="h-7 w-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                <p className="text-xs font-bold text-muted-foreground capitalize tracking-widest">Loading goals…</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Sidebar */}
                                <GoalsSidebar
                                    goals={datasetGoals}
                                    activeId={activeGoal?.id ?? null}
                                    isStreaming={isStreaming}
                                    onSelect={g => selectGoal(g)}
                                    onNew={() => { setShowCreateForm(true); setActiveGoal(null); }}
                                />

                                {/* Main panel */}
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
                                        <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">Loading goal…</span>
                                        </div>
                                    )}

                                    {!showCreateForm && !loadingGoalDetail && activeGoal && (
                                        <GoalDetail
                                            goal={activeGoal}
                                            isStreaming={isStreaming}
                                            streamingText={streamingText}
                                            onGoalUpdated={handleGoalUpdated}
                                            onSuggest={runSuggest}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* No dataset selected */}
                {!selectedDataset && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/30 rounded-4xl bg-background/40 backdrop-blur-xl">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                                <BrainCircuit className="h-7 w-7 text-blue-500/60" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-1">Select a dataset to begin</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-sm">
                                Choose a dataset above, then define your analysis goal and research questions.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
