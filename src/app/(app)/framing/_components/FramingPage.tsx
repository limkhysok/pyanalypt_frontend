"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
    BrainCircuit,
    Database,
    Loader2,
    RefreshCw,
    Sparkles,
    ChevronDown,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { datasetApi, framingApi } from "@/services/api";
import { Dataset, DatasetFrame } from "@/types/dataset";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HistorySidebar } from "./HistorySidebar";
import { ResultPanel } from "./ResultPanel";

// ── Small utilities ───────────────────────────────────────────────────────────

function DatasetTriggerLabel({
    isLoading,
    selected,
}: Readonly<{
    isLoading: boolean;
    selected: Dataset | null;
}>) {
    if (isLoading) {
        return (
            <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading datasets…</span>
            </span>
        );
    }
    if (selected) {
        return (
            <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="truncate text-sm">{selected.file_name}</span>
            </span>
        );
    }
    return (
        <span className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4" />
            <span className="text-sm">Select a dataset</span>
        </span>
    );
}

function GenerateButton({
    isFirstRun,
    isStreaming,
    onClick,
}: Readonly<{
    isFirstRun: boolean;
    isStreaming: boolean;
    onClick: () => void;
}>) {
    if (isStreaming) {
        return (
            <Button
                disabled
                variant={isFirstRun ? "default" : "outline"}
                className={cn(
                    "rounded-2xl h-10 px-5 font-black text-[10px] uppercase tracking-widest transition-all",
                    isFirstRun
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : "border-border/30 bg-background/60"
                )}
            >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
            </Button>
        );
    }
    if (isFirstRun) {
        return (
            <Button
                onClick={onClick}
                className="rounded-2xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-sm shadow-blue-500/20 transition-all"
            >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
            </Button>
        );
    }
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="rounded-2xl h-10 px-5 border-border/30 bg-background/60 hover:bg-secondary/50 font-black text-[10px] uppercase tracking-widest transition-all"
        >
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-run
        </Button>
    );
}

// ── Content area (after dataset is selected) ──────────────────────────────────

function FramingContent({
    frames,
    activeFrame,
    isStreaming,
    streamingText,
    isLoadingFrames,
    onSelectFrame,
    onGenerate,
}: Readonly<{
    frames: DatasetFrame[];
    activeFrame: DatasetFrame | null;
    isStreaming: boolean;
    streamingText: string;
    isLoadingFrames: boolean;
    onSelectFrame: (frame: DatasetFrame) => void;
    onGenerate: () => void;
}>) {
    if (isLoadingFrames) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-7 w-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Loading frames…
                    </p>
                </div>
            </div>
        );
    }

    const hasFrames = frames.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
            {hasFrames && (
                <HistorySidebar
                    frames={frames}
                    activeFrame={activeFrame}
                    isStreaming={isStreaming}
                    onSelect={onSelectFrame}
                />
            )}
            <div className={hasFrames ? "lg:col-span-3" : "lg:col-span-4"}>
                <ResultPanel
                    isStreaming={isStreaming}
                    streamingText={streamingText}
                    activeFrame={activeFrame}
                    onGenerate={onGenerate}
                />
            </div>
        </motion.div>
    );
}

// ── Page component ────────────────────────────────────────────────────────────

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

    const fetchFrames = useCallback(async (datasetId: number) => {
        setIsLoadingFrames(true);
        setActiveFrame(null);
        setStreamingText("");
        try {
            const data = await framingApi.history(datasetId);
            setFrames(data);
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

    const handleSelectFrame = (frame: DatasetFrame) => {
        setActiveFrame(frame);
        setStreamingText("");
    };

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

    const hasFrames = frames.length > 0;
    const isFirstRun = !hasFrames && !isStreaming && !streamingText;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading workspace…</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 px-6 md:px-10 bg-background relative z-0">

            {/* ── Background ─────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 pt-8">

                {/* ── Header ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={13} className="text-blue-500" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            AI Analysis
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                        Problem Framing
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        AI-generated problem statements to guide your analysis.
                    </p>
                </motion.div>

                {/* ── Dataset selector + action buttons ──────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-80 justify-between rounded-2xl h-10 border-border/30 bg-background/60 hover:bg-secondary/50 font-bold transition-all"
                                disabled={isLoadingDatasets}
                            >
                                <DatasetTriggerLabel isLoading={isLoadingDatasets} selected={selectedDataset} />
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 rounded-2xl">
                            {datasets.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                    No datasets found.
                                </div>
                            ) : (
                                datasets.map((d) => (
                                    <DropdownMenuItem
                                        key={d.id}
                                        onClick={() => handleSelectDataset(d)}
                                        className="flex items-center gap-2 rounded-xl"
                                    >
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate text-sm">{d.file_name}</span>
                                        <Badge variant="secondary" className="ml-auto shrink-0 text-[10px] font-black">
                                            {d.file_format.toLowerCase()}
                                        </Badge>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {selectedDataset && (
                        <GenerateButton
                            isFirstRun={isFirstRun}
                            isStreaming={isStreaming}
                            onClick={runFraming}
                        />
                    )}
                </motion.div>

                {/* ── Main content area ───────────────────────────────────── */}
                {selectedDataset ? (
                    <FramingContent
                        frames={frames}
                        activeFrame={activeFrame}
                        isStreaming={isStreaming}
                        streamingText={streamingText}
                        isLoadingFrames={isLoadingFrames}
                        onSelectFrame={handleSelectFrame}
                        onGenerate={runFraming}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/30 rounded-4xl bg-background/40 backdrop-blur-xl">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                                <BrainCircuit className="h-7 w-7 text-blue-500/60" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-1">Select a dataset to begin</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-sm">
                                Choose a dataset above and click Generate. The AI will frame the key problems in your data.
                            </p>
                        </div>
                    </motion.div>
                )}

            </div>
        </main>
    );
}
