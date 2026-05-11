import React from "react";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatasetFrame } from "@/types/dataset";

// ── Markdown renderer — module-level to avoid re-creation on every render ─────

const MD_COMPONENTS = {
    h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="text-xl font-black tracking-tight mt-6 mb-3 text-foreground border-b border-border/20 pb-2">
            {children}
        </h1>
    ),
    h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="text-base font-black tracking-tight mt-5 mb-2 text-foreground">
            {children}
        </h2>
    ),
    h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="text-sm font-bold mt-4 mb-1.5 text-foreground/80">
            {children}
        </h3>
    ),
    p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="text-sm leading-7 mb-4 text-foreground/70">
            {children}
        </p>
    ),
    ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-3 ml-5 space-y-2 text-sm text-foreground/70 list-disc marker:text-foreground/40">
            {children}
        </ul>
    ),
    ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="my-3 ml-5 space-y-2 text-sm text-foreground/70 list-decimal marker:text-foreground/40 marker:font-bold">
            {children}
        </ol>
    ),
    li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="leading-7 pl-1">{children}</li>
    ),
    strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <strong className="font-bold text-foreground">{children}</strong>
    ),
    em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <em className="italic text-foreground/80">{children}</em>
    ),
    blockquote: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <blockquote className="border-l-2 border-foreground/20 pl-4 my-4 text-foreground/60 italic text-sm">
            {children}
        </blockquote>
    ),
    code: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <code className="bg-foreground/5 text-foreground px-1.5 py-0.5 rounded-md text-xs font-mono border border-foreground/10">
            {children}
        </code>
    ),
    hr: () => (
        <hr className="my-5 border-none border-t border-border/20" />
    ),
};

// ── Streaming panel ───────────────────────────────────────────────────────────

function StreamingPanel({
    streamingText,
    isStreaming,
}: Readonly<{ streamingText: string; isStreaming: boolean }>) {
    return (
        <Card className="bg-background/60 backdrop-blur-xl border border-foreground/20 rounded-4xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/10">
                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-tight">
                    <div className="w-7 h-7 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                        <BrainCircuit className="h-3.5 w-3.5 text-foreground/60 animate-pulse" />
                    </div>
                    Generating problem statements…
                    <Badge
                        variant="outline"
                        className="ml-auto text-[9px] font-black capitalize tracking-widest border-foreground/20 text-foreground/60 bg-foreground/5"
                    >
                        {"Live "}
                        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse inline-block" />
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-0">
                    <ReactMarkdown components={MD_COMPONENTS}>{streamingText.replaceAll(String.raw`\n`, "\n")}</ReactMarkdown>
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-0.5 bg-foreground/40 animate-pulse rounded-sm" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ── Saved frame panel ─────────────────────────────────────────────────────────

function SavedFramePanel({ frame }: Readonly<{ frame: DatasetFrame }>) {
    return (
        <Card className="bg-background/60 backdrop-blur-xl border border-border/20 rounded-4xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/10">
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-sm font-black tracking-tight">
                        <div className="w-7 h-7 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
                            <BrainCircuit className="h-3.5 w-3.5 text-foreground/60" />
                        </div>
                        Problem Framing
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            {new Date(frame.created_at).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black border-border/30">
                            {frame.model_used}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <Separator className="opacity-10" />
            <CardContent className="p-6">
                <div className="space-y-0">
                    <ReactMarkdown components={MD_COMPONENTS}>{frame.result.replaceAll(String.raw`\n`, "\n")}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Empty — no frames yet ─────────────────────────────────────────────────────

function NoFramesPanel({ onGenerate }: Readonly<{ onGenerate: () => void }>) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/30 rounded-4xl bg-background/40 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-5">
                <Sparkles className="h-7 w-7 text-foreground/40" />
            </div>
            <h3 className="text-base font-black tracking-tight mb-1">No frames yet</h3>
            <p className="text-sm text-muted-foreground font-medium mb-5">
                Click Generate to run the AI Problem Framing on this dataset.
            </p>
            <Button
                onClick={onGenerate}
                className="rounded-2xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] capitalize tracking-widest shadow-sm shadow-blue-500/20 transition-all"
            >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
            </Button>
        </div>
    );
}

// ── Result panel — picks the right sub-panel ──────────────────────────────────

export function ResultPanel({
    isStreaming,
    streamingText,
    activeFrame,
    onGenerate,
}: Readonly<{
    isStreaming: boolean;
    streamingText: string;
    activeFrame: DatasetFrame | null;
    onGenerate: () => void;
}>) {
    if (isStreaming || streamingText) {
        return <StreamingPanel streamingText={streamingText} isStreaming={isStreaming} />;
    }
    if (activeFrame) {
        return <SavedFramePanel frame={activeFrame} />;
    }
    return <NoFramesPanel onGenerate={onGenerate} />;
}
