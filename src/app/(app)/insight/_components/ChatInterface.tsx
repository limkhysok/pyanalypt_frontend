"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Send, 
  Trash2, 
  Database, 
  Bot, 
  User, 
  Loader2,
  Search,
  Sparkles,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { chatApi, type ChatSession, type ChatMessage } from "@/services/chat.service";
import { datasetApi, type Dataset } from "@/services/dataset.service";
import { toast } from "sonner";

export default function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingToken, setStreamingToken] = useState("");
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newChatDataset, setNewChatDataset] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    loadDatasets();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingToken]);

  async function loadSessions() {
    try {
      const data = await chatApi.listSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat history");
    }
  }

  async function loadDatasets() {
    try {
      const res = await datasetApi.listDatasets();
      setDatasets(res.results);
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
    setIsCreating(true);
    try {
      const datasetId = Number.parseInt(newChatDataset);
      const dataset = datasets.find(d => d.id === datasetId);
      const session = await chatApi.createSession({
        dataset_id: datasetId,
        title: `Discussion on ${dataset?.file_name || 'Dataset'}`,
      });
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setNewChatDataset("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create chat session");
    } finally {
      setIsCreating(false);
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
        (token) => {
          setStreamingToken((prev) => prev + token);
        },
        () => {
          // Done - refetch to get the official persistent message
          loadMessages(currentSession.id);
          setStreamingToken("");
          setLoading(false);
        },
        (err) => {
          toast.error(err.message || "Streaming failed");
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
      setLoading(false);
    }
  }

  async function handleDeleteSession(id: number) {
    // Note: API_DOC says CLEAR history, not delete session. 
    // Assuming clear for now.
    try {
      await chatApi.clearHistory(id);
      if (currentSession?.id === id) {
        setMessages([]);
      }
      toast.success("Chat history cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear history");
    }
  }

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.dataset_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-(--spacing(12))-1px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/60 bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border/60">
          <Button 
            className="w-full justify-start gap-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-none"
            onClick={() => setCurrentSession(null)}
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold tracking-wide">New Chat</span>
          </Button>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 h-9 text-[13px] bg-background/50 border-border/40 focus:bg-background transition-all rounded-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-[11px] font-bold capitalize tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <History className="h-3 w-3" /> Recent Activity
              </h3>
            </div>
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="group relative w-full"
              >
                <button
                  onClick={() => setCurrentSession(session)}
                  className={cn(
                    "w-full flex flex-col gap-1 p-3 text-left transition-all relative overflow-hidden outline-none focus:bg-muted/50",
                    currentSession?.id === session.id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  {currentSession?.id === session.id && (
                    <motion.div 
                      layoutId="active-chat"
                      className="absolute left-0 top-0 w-1 h-full bg-primary" 
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 pr-6">
                    <span className={cn(
                      "text-[13px] font-medium truncate flex-1",
                      currentSession?.id === session.id ? "text-primary" : "text-foreground/80"
                    )}>
                      {session.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                    <Database className="h-3 w-3" />
                    <span className="truncate">{session.dataset_name || "Unknown dataset"}</span>
                    <span>•</span>
                    <span>{session.message_count} msgs</span>
                  </div>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 hover:text-destructive transition-all outline-none rounded-none hover:bg-destructive/10 z-10"
                  title="Clear history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold truncate leading-tight">{currentSession.title}</h3>
                  <p className="text-[11px] text-muted-foreground truncate capitalize tracking-tight">Source: {currentSession.dataset_name}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setCurrentSession(null)}>
                Change Dataset
              </Button>
            </header>

            {/* Messages Scroll Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Retrieving conversation history...</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex gap-4 max-w-4xl mx-auto group animate-in fade-in slide-in-from-bottom-2 duration-300",
                        msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-none shrink-0 flex items-center justify-center border",
                        msg.role === "assistant" 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-muted border-border text-muted-foreground"
                      )}>
                        {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "flex-1 space-y-1.5",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}>
                        <div className={cn(
                          "rounded-none px-5 py-4 text-[14.5px] leading-relaxed w-fit max-w-[90%] shadow-sm",
                          msg.role === "assistant" 
                            ? "bg-muted/40 border border-border/30 text-foreground mr-auto" 
                            : "bg-primary text-primary-foreground shadow-md shadow-primary/10 ml-auto font-medium"
                        )}>
                          <div className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/40 max-w-none break-words whitespace-pre-wrap text-[14.5px]">
                            <ReactMarkdown>
                              {msg.content.replaceAll(String.raw`\n`, "\n")}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground capitalize tracking-widest px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Streaming Message Indicator */}
                  {streamingToken && (
                    <div className="flex gap-4 max-w-4xl mx-auto">
                      <div className="h-8 w-8 rounded-none shrink-0 flex items-center justify-center border bg-primary/10 border-primary/20 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="rounded-none px-5 py-4 text-[14.5px] leading-relaxed bg-muted/40 border border-border/30 text-foreground w-fit max-w-[90%] mr-auto shadow-sm">
                          <div className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/40 max-w-none break-words whitespace-pre-wrap text-[14.5px]">
                            <ReactMarkdown>
                              {streamingToken.replaceAll(String.raw`\n`, "\n")}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                          <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading more state */}
                  {loading && messages.length > 0 && !streamingToken && (
                     <div className="flex gap-4 max-w-4xl mx-auto opacity-80">
                        <div className="h-8 w-8 rounded-none shrink-0 flex items-center justify-center border bg-primary/10 border-primary/20 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-3">
                           <div className="flex items-center gap-2">
                              <Skeleton className="h-3 w-24 bg-muted/60" />
                              <Loader2 className="h-3 w-3 animate-spin text-primary/40" />
                           </div>
                           <div className="space-y-2 bg-muted/30 rounded-none p-4 border border-border/40">
                              <Skeleton className="h-3 w-full bg-muted/60" />
                              <Skeleton className="h-3 w-[90%] bg-muted/60" />
                              <Skeleton className="h-3 w-[75%] bg-muted/60" />
                           </div>
                        </div>
                     </div>
                  )}
                </>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-border/60 bg-background">
              <div className="max-w-4xl mx-auto relative">
                <div className="absolute inset-x-0 bottom-full h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
                <div className="relative flex items-end gap-2 bg-muted/30 border border-border/60 rounded-none p-2 transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background shadow-sm">
                  <div className="flex-1 min-h-11 flex items-center px-3 py-1">
                    <textarea
                      rows={1}
                      placeholder={`Ask anything about ${currentSession.dataset_name}...`}
                      className="w-full bg-transparent border-none outline-none resize-none py-1.5 text-[14px] leading-relaxed scrollbar-none"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-none transition-all",
                      input.trim() ? "bg-primary scale-100" : "bg-muted-foreground/20 scale-90 pointer-events-none"
                    )}
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-2 px-3 flex items-center justify-between">
                   <p className="text-[10px] text-muted-foreground capitalize tracking-widest flex items-center gap-2">
                     <Sparkles className="h-2.5 w-2.5 text-primary" /> Press Enter to send • Shift+Enter for new line
                   </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-full" />
              <div className="relative bg-background border border-border/60 p-5 rounded-none shadow-2xl">
                <Bot className="h-12 w-12 text-foreground/60" />
              </div>
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">AI Chat on Data</h2>
              <p className="text-muted-foreground text-[14px]">
                Ask questions about your datasets using natural language. 
                Our AI analyzes your schema to provide instant insights.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-4 pt-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="dataset-select" className="text-[12px] font-bold text-muted-foreground capitalize tracking-wider px-1">Select Dataset</Label>
                <Select value={newChatDataset} onValueChange={setNewChatDataset}>
                  <SelectTrigger id="dataset-select" className="h-11 rounded-none border-border/60 bg-muted/20">
                    <SelectValue placeholder="Choose a source dataset..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border/60">
                    {datasets.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()} className="rounded-none">
                        <div className="flex flex-col">
                          <span className="font-medium">{d.file_name}</span>
                          <span className="text-[10px] text-muted-foreground capitalize tracking-tight">{d.file_size.toLocaleString()} bytes</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full h-11 rounded-none gap-2 font-semibold tracking-wide shadow-xl shadow-primary/10 transition-transform active:scale-[0.98]"
                disabled={!newChatDataset || isCreating}
                onClick={handleCreateSession}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Start Conversation
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-2xl text-[13px]">
              <div className="p-4 rounded-none border border-border/40 bg-muted/10 text-left space-y-2">
                <p className="font-bold text-foreground/80 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" /> Statistical Analysis
                </p>
                <p className="text-muted-foreground">&quot;What was the highest revenue month in 2023?&quot;</p>
              </div>
              <div className="p-4 rounded-none border border-border/40 bg-muted/10 text-left space-y-2">
                <p className="font-bold text-foreground/80 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" /> Data Filtering
                </p>
                <p className="text-muted-foreground">&quot;Show me all customers from the North region.&quot;</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
