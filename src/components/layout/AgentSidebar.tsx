"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Plus, 
  Send, 
  Database, 
  Loader2,
  History,
  X
} from "lucide-react";
import { QwenIcon } from "@/components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn, getInitials } from "@/lib/utils";
import { chatApi, type ChatSession, type ChatMessage } from "@/services/chat.service";
import { datasetApi, type Dataset } from "@/services/dataset.service";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useAgent } from "@/context/agent-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// ── Markdown Sub-Components ──
// Use a more specific type to avoid 'any' while satisfying ReactMarkdown's requirements
type MarkdownComponentProps<T extends HTMLElement> = React.HTMLAttributes<T> & {
  node?: unknown;
};

const MarkdownPre = ({ children, ...props }: MarkdownComponentProps<HTMLPreElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props;
  return (
    <pre 
      {...rest}
      className="whitespace-pre-wrap break-words bg-black/5 dark:bg-white/5 p-3 border border-border/40 my-3 overflow-hidden text-[11px] font-mono leading-relaxed"
    >
      {children}
    </pre>
  );
};

const MarkdownCode = ({ className, children, ...props }: MarkdownComponentProps<HTMLElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props;
  return (
    <code 
      className={cn(className, "whitespace-pre-wrap break-words overflow-wrap-anywhere bg-muted/40 px-1 py-0.5 rounded-sm")} 
      {...rest}
    >
      {children}
    </code>
  );
};

const MarkdownP = ({ children, ...props }: MarkdownComponentProps<HTMLParagraphElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props;
  return (
    <p {...rest} className="mb-3 last:mb-0">{children}</p>
  );
};

// ── Markdown Content Component ──
const MarkdownContent = React.memo(({ content }: { content: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]}
    components={{
      pre: MarkdownPre,
      code: MarkdownCode,
      p: MarkdownP
    }}
  >
    {content}
  </ReactMarkdown>
));
MarkdownContent.displayName = "MarkdownContent";

// ── Agent Sidebar ──
export function AgentSidebar() {
  const { user } = useAuth();
  const { isOpen, close, width, setWidth } = useAgent();
  const [view, setView] = useState<"list" | "chat" | "create">("list");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingToken, setStreamingToken] = useState("");
  const [input, setInput] = useState("");
  const [newChatDataset, setNewChatDataset] = useState<string>("");
  const [isResizing, setIsResizing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Resizing Logic ──
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = globalThis.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setWidth(newWidth);
      }
    }
  }, [isResizing, setWidth]);

  useEffect(() => {
    globalThis.addEventListener("mousemove", resize);
    globalThis.addEventListener("mouseup", stopResizing);
    return () => {
      globalThis.removeEventListener("mousemove", resize);
      globalThis.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // ── Data Fetching ──
  useEffect(() => {
    if (isOpen) {
      loadSessions();
      loadDatasets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
      setView("chat");
    }
  }, [currentSession]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, streamingToken]);

  async function loadSessions() {
    try {
      const data = await chatApi.listSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDatasets() {
    try {
      const res = await datasetApi.listDatasets();
      setDatasets(res.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages(sessionId: number) {
    setLoading(true);
    try {
      const data = await chatApi.getSession(sessionId);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSession() {
    if (!newChatDataset) return;
    setLoading(true);
    try {
      const datasetId = Number.parseInt(newChatDataset);
      const dataset = datasets.find(d => d.id === datasetId);
      const session = await chatApi.createSession({
        dataset_id: datasetId,
        title: `Analysis: ${dataset?.file_name || 'Dataset'}`,
      });
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setNewChatDataset("");
      setView("chat");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !currentSession || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      session: currentSession.id,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreamingToken("");
    setLoading(true);

    try {
      await chatApi.streamMessage(
        currentSession.id,
        input,
        (token) => setStreamingToken((prev) => prev + token),
        () => {
          loadMessages(currentSession.id);
          setStreamingToken("");
          setLoading(false);
        },
        (err) => {
          toast.error(err.message || "Error");
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed right-0 top-0 bottom-0 bg-background border-l border-border/60 z-[70] shadow-2xl flex flex-col"
          style={{ width: `${width}px` }}
        >
          {/* Resize Handle */}
          <button 
            type="button"
            onMouseDown={startResizing}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setWidth(width + 10);
              if (e.key === "ArrowRight") setWidth(width - 10);
            }}
            aria-label="Resize AI Agent"
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-[80] outline-none bg-transparent border-none p-0",
              isResizing && "bg-primary w-0.5"
            )}
          />

          {/* Header */}
          <header className="h-12 border-b border-border/60 px-4 flex items-center justify-between shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <QwenIcon size={14} />
              </div>
              <span className="text-[11px] font-black tracking-tight capitalize font-mono">Qwen 2.5 @ Ollama</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={close}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>

          {/* Content Views */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {view === "list" && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border/60">
                  <Button className="w-full gap-2 rounded-none h-9 font-bold lowercase text-xs border border-foreground/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all bg-foreground text-background" onClick={() => setView("create")}>
                    <Plus className="h-3.5 w-3.5" /> new analysis session
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                     <p className="px-3 py-2 text-[10px] font-black capitalize tracking-widest text-muted-foreground/40 flex items-center gap-2">
                       <History className="h-3 w-3" /> interaction history
                     </p>
                     {sessions.map(s => (
                       <button
                         key={s.id}
                         onClick={() => setCurrentSession(s)}
                         className="w-full p-3 rounded-none hover:bg-muted/30 text-left transition-all border-b border-border/40 group outline-none focus:bg-muted/50"
                       >
                         <p className="text-xs font-bold truncate group-hover:text-primary transition-colors lowercase tracking-tight">{s.title}</p>
                         <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-bold">
                            <Database className="h-2.5 w-2.5" />
                            <span className="truncate lowercase opacity-60">{s.dataset_name}</span>
                         </div>
                       </button>
                     ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {view === "create" && (
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                     <h3 className="text-xs font-black capitalize tracking-widest text-muted-foreground/40 mb-2">Initialize Instance</h3>
                     <h4 className="text-base font-bold font-mono lowercase">new_analysis_v1</h4>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label className="text-[10px] font-black capitalize tracking-widest px-1 text-muted-foreground/40">Select Source Data</Label>
                    <Select value={newChatDataset} onValueChange={setNewChatDataset}>
                      <SelectTrigger className="h-10 rounded-none border-border/60 bg-muted/10 font-mono text-xs lowercase">
                        <SelectValue placeholder="choose dataset source..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none z-[100] border-border shadow-2xl">
                        {datasets.length === 0 ? (
                           <div className="p-3 text-[10px] text-muted-foreground italic">No datasets available</div>
                        ) : (
                          datasets.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()} className="lowercase text-xs font-mono py-2">
                              {d.file_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full h-10 rounded-none font-bold lowercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all mt-4" 
                    disabled={!newChatDataset || loading}
                    onClick={handleCreateSession}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QwenIcon size={16} />}
                    start analysis
                  </Button>
                  <Button variant="ghost" className="w-full h-10 rounded-none font-bold lowercase text-[10px] opacity-40 hover:opacity-100" onClick={() => setView("list")}>
                     cancel_operation
                  </Button>
                </div>
              </div>
            )}

            {view === "chat" && currentSession && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2 bg-muted/10 border-b border-border/40 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold truncate lowercase tabular-nums opacity-60 font-mono">{currentSession.dataset_name}</span>
                   </div>
                   <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black capitalize tracking-widest px-2 opacity-40 hover:opacity-100" onClick={() => setView("list")}>
                      logs
                   </Button>
                </div>
                
                <div 
                  ref={scrollRef} 
                  className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 custom-scrollbar"
                >
                  {messages.map((msg, i) => (
                    <div key={msg.id || i} className={cn(
                      "flex flex-col gap-1.5", 
                      msg.role === "assistant" ? "items-start" : "items-end"
                    )}>
                      {/* Avatar */}
                      <div className={cn(
                        "h-5 w-5 rounded-none flex items-center justify-center border overflow-hidden shrink-0",
                        msg.role === "assistant" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" : "bg-muted border-border"
                      )}>
                        {msg.role === "assistant" ? (
                          <QwenIcon size={12} />
                        ) : (
                          <Avatar className="h-full w-full rounded-none">
                            <AvatarImage src={user?.profile_picture || undefined} />
                            <AvatarFallback className="text-[8px] font-bold rounded-none">
                              {user ? getInitials(user) : "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Content Bubble */}
                      <div className={cn(
                        "rounded-none px-3.5 py-2.5 text-xs leading-relaxed w-fit max-w-full shadow-sm",
                        msg.role === "assistant" ? "bg-muted/30 border border-border/40" : "bg-foreground text-background"
                      )}>
                        <div className="prose prose-xs dark:prose-invert max-w-none">
                          <MarkdownContent content={msg.content} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {streamingToken && (
                    <div className="flex flex-col gap-1.5 items-start animate-in fade-in slide-in-from-bottom-1">
                       <div className="h-5 w-5 rounded-none bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                          <QwenIcon size={12} />
                       </div>
                       <div className="rounded-none px-3.5 py-2.5 bg-muted/30 border border-border/40 text-xs w-fit max-w-full shadow-sm">
                          <div className="prose prose-xs dark:prose-invert max-w-none">
                             <MarkdownContent content={streamingToken} />
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border/60 bg-background/50">
                   <div className="relative flex items-end gap-2 bg-background border border-border/60 rounded-none p-2 transition-all focus-within:ring-1 focus-within:ring-primary/20">
                      <textarea
                        rows={1}
                        placeholder="query kaic_agent..."
                        className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-1 text-xs leading-normal max-h-32 lowercase font-mono scrollbar-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        className={cn("h-7 w-7 rounded-none shrink-0 transition-all", input.trim() ? "bg-foreground text-background" : "bg-muted/40 pointer-events-none opacity-40")}
                        onClick={handleSendMessage}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                   </div>
                   <div className="mt-2 flex items-center justify-between px-1">
                      <p className="text-[8px] text-muted-foreground font-black capitalize tracking-widest opacity-30">ollama_host_active</p>
                      <p className="text-[8px] text-muted-foreground font-black capitalize tracking-widest opacity-30">session_v2.5</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
