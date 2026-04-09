"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
    BrainCircuit,
    Database,
    Loader2,
    RefreshCw,
    Sparkles,
    ChevronDown,
    Clock,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { datasetApi, framingApi } from "@/services/api";
import { Dataset, DatasetFrame } from "@/types/dataset";
import { toast } from "sonner";

export function FramingPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [frames, setFrames] = useState<DatasetFrame[]>([]);
    const [activeFrame, setActiveFrame] = useState<DatasetFrame | null>(null);
    const [streamingText, setStreamingText] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
    const [isLoadingFrames, setIsLoadingFrames] = useState(false);

    // ── Fetch datasets on mount ───────────────────────────────────────────────
    const fetchDatasets = useCallback(async () => {
        setIsLoadingDatasets(true);
        try {
            const data = await datasetApi.listDatasets();
            setDatasets(data);
        } catch {
            toast.error("Failed to load datasets.");
        } finally {
            setIsLoadingDatasets(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) fetchDatasets();
    }, [authLoading, isAuthenticated, fetchDatasets]);

    // ── Fetch saved frames when dataset is selected ───────────────────────────
    const fetchFrames = useCallback(async (datasetId: number) => {
        setIsLoadingFrames(true);
        setActiveFrame(null);
        setStreamingText("");
        try {
            const data = await framingApi.history(datasetId);
            setFrames(data);
            // Auto-show the latest saved frame if one exists
            if (data.length > 0) setActiveFrame(data[0]);
        } catch {
            toast.error("Failed to load saved frames.");
        } finally {
            setIsLoadingFrames(false);
        }
    }, []);

    const handleSelectDataset = (dataset: Dataset) => {
        setSelectedDataset(dataset);
        fetchFrames(dataset.id);
    };

    // ── Run / Re-run Problem Framing ─────────────────────────────────────────
    const runFraming = async () => {
        if (!selectedDataset || isStreaming) return;

        setIsStreaming(true);
        setActiveFrame(null);
        setStreamingText("");

        try {
            await framingApi.stream(
                selectedDataset.id,
                (token) => setStreamingText((prev) => prev + token),
                async () => {
                    // Stream done — reload frames to get the saved record
                    const data = await framingApi.history(selectedDataset.id);
                    setFrames(data);
                    if (data.length > 0) setActiveFrame(data[0]);
                    setStreamingText("");
                    setIsStreaming(false);
                },
                (err) => {
                    console.error("Problem Framing error", err);
                    toast.error("Problem Framing failed. Make sure Ollama is running.");
                    setIsStreaming(false);
                }
            );
        } catch (error) {
            console.error("Problem Framing failed", error);
            toast.error("Problem Framing failed. Make sure Ollama is running.");
            setIsStreaming(false);
        }
    };

    // ── Derived state ─────────────────────────────────────────────────────────
    const hasFrames = frames.length > 0;
    const isFirstRun = !hasFrames && !isStreaming && !streamingText;
    const displayText = isStreaming ? streamingText : activeFrame?.result ?? "";

    // ── Markdown renderer config ──────────────────────────────────────────────
    const mdComponents = {
        h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-lg font-bold mt-4 mb-1">{children}</h1>,
        h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
        h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-sm font-semibold mt-2 mb-0.5">{children}</h3>,
        p:  ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
        ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-5 space-y-1 mb-2 text-sm">{children}</ul>,
        ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-5 space-y-1 mb-2 text-sm">{children}</ol>,
        li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-foreground">{children}</strong>,
        code: ({ children }: React.HTMLAttributes<HTMLElement>) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 px-6 md:px-10 bg-background">
            <div className="max-w-7xl mx-auto space-y-8 pt-8">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                        Problem Framing
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        AI-generated problem statements to guide your analysis.
                    </p>
                </div>

                {/* ── Dataset selector + action buttons ──────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

                    {/* Dataset picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-72 justify-between" disabled={isLoadingDatasets}>
                                {isLoadingDatasets ? (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading datasets...
                                    </span>
                                ) : selectedDataset ? (
                                    <span className="flex items-center gap-2 truncate">
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate">{selectedDataset.file_name}</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Database className="h-4 w-4" /> Select a dataset
                                    </span>
                                )}
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72">
                            {datasets.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                    No datasets found.
                                </div>
                            ) : (
                                datasets.map((d) => (
                                    <DropdownMenuItem
                                        key={d.id}
                                        onClick={() => handleSelectDataset(d)}
                                        className="flex items-center gap-2"
                                    >
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate">{d.file_name}</span>
                                        <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                                            {d.file_format.toLowerCase()}
                                        </Badge>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Generate / Re-run buttons */}
                    {selectedDataset && (
                        <div className="flex items-center gap-2">
                            {isFirstRun ? (
                                // No frames yet — show primary Generate button
                                <Button onClick={runFraming} disabled={isStreaming}>
                                    {isStreaming ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" /> Generate</>
                                    )}
                                </Button>
                            ) : (
                                // Frames exist — show Re-run button
                                <Button variant="outline" onClick={runFraming} disabled={isStreaming}>
                                    {isStreaming ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                    ) : (
                                        <><RefreshCw className="mr-2 h-4 w-4" /> Re-run</>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Main content area ───────────────────────────────────── */}
                {!selectedDataset ? (
                    // Empty state — no dataset selected
                    <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-md">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">Select a dataset to begin</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Choose a dataset above and click Generate. The AI will frame the key problems in your data.
                        </p>
                    </div>

                ) : isLoadingFrames ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>

                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                        {/* ── History sidebar ─────────────────────────────── */}
                        {hasFrames && (
                            <div className="lg:col-span-1 space-y-2">
                                <p className="text-xs font-black tracking-widest text-muted-foreground opacity-60 uppercase px-1">
                                    History
                                </p>
                                <div className="space-y-1">
                                    {frames.map((frame, idx) => (
                                        <button
                                            key={frame.id}
                                            onClick={() => { setActiveFrame(frame); setStreamingText(""); }}
                                            className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors ${
                                                activeFrame?.id === frame.id && !isStreaming
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "hover:bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Clock className="h-3 w-3 shrink-0" />
                                                <span className="text-xs">
                                                    {new Date(frame.created_at).toLocaleDateString()}
                                                </span>
                                                {idx === 0 && (
                                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-auto">
                                                        Latest
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground/70">
                                                {new Date(frame.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Result panel ────────────────────────────────── */}
                        <div className={hasFrames ? "lg:col-span-3" : "lg:col-span-4"}>
                            {isStreaming || streamingText ? (
                                // Live streaming view
                                <Card className="border-primary/30">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                            <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
                                            Generating problem statements...
                                        </CardTitle>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                                            <ReactMarkdown>{streamingText}</ReactMarkdown>
                                            {isStreaming && (
                                                <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                            ) : activeFrame ? (
                                // Saved frame view
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                                <BrainCircuit className="h-4 w-4 text-primary" />
                                                Problem Framing
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(activeFrame.created_at).toLocaleString()}
                                                <Badge variant="outline" className="text-[10px]">
                                                    {activeFrame.model_used}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                                            <ReactMarkdown>{activeFrame.result}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>

                            ) : (
                                // Dataset selected but no frames yet
                                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-md">
                                    <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-base font-semibold mb-1">No frames yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Click Generate to run the AI Problem Framing on this dataset.
                                    </p>
                                    <Button onClick={runFraming}>
                                        <Sparkles className="mr-2 h-4 w-4" /> Generate
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
