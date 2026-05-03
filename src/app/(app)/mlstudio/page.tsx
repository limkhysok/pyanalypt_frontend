"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  BrainCircuit, 
  Search, 
  MoreVertical, 
  Trash2, 
  Play, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  BarChart3,
  Cpu,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mlStudioApi, type MLModel } from "@/services/mlstudio.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  training: { icon: Clock, label: "training", color: "text-amber-600 bg-amber-50 border-amber-200" },
  completed: { icon: CheckCircle2, label: "completed", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  failed: { icon: AlertCircle, label: "failed", color: "text-rose-600 bg-rose-50 border-rose-200" },
};

export default function MLStudioListPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("models");

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);
    try {
      const data = await mlStudioApi.list();
      setModels(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await mlStudioApi.delete(id);
      setModels(models.filter(m => m.id !== id));
      toast.success("Model deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete model");
    }
  }

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.task_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none font-mono">ML Studio</h1>
            <p className="text-xs text-muted-foreground mt-1">Train and manage predictive models. Automation power for your data.</p>
          </div>
        </div>

        <Button asChild className="rounded-none h-10 px-6 bg-foreground hover:bg-foreground/90 text-background font-bold text-sm tracking-normal transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border border-foreground/10">
          <Link href="/mlstudio/train">
            <Plus className="mr-2.5 h-4 w-4" /> Train new model
          </Link>
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <Cpu className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">{models.length}</p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">models</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Total intelligence assets</p>
                </div>
            </CardContent>
         </Card>
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <Activity className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">{models.filter(m => m.status === 'completed').length}</p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">active</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Models ready for inference</p>
                </div>
            </CardContent>
         </Card>
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <Clock className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">{models.filter(m => m.status === 'training').length}</p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">training</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Jobs currently processing</p>
                </div>
            </CardContent>
         </Card>
      </div>

      {/* ── Tabs & Content ── */}
      <div className="w-full">
        <div className="flex items-stretch border-b border-border mb-6">
          {[
            { value: "models", label: "Models", icon: Activity },
            { value: "history", label: "Activity Logs", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none lowercase",
                activeTab === tab.value
                  ? "text-blue-600 font-bold border-blue-600 bg-blue-50/60"
                  : "text-gray-500 hover:text-gray-900 hover:bg-slate-50 border-transparent"
              )}
            >
              <tab.icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 p-3 border border-slate-200 rounded-none">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="search models..." 
                className="pl-9 h-9 bg-background border-slate-200 rounded-none text-xs lowercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-muted-foreground/40 lowercase mr-2">{filteredModels.length} models found</span>
               <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-slate-200" onClick={loadModels}>
                 <RefreshCw className="h-3.5 w-3.5" />
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="h-48 rounded-none border-slate-200 animate-pulse bg-slate-50/50" />
              ))
            ) : filteredModels.length === 0 ? (
               <div className="col-span-full py-20 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-muted-foreground/60 lowercase">no models found in this view</p>
               </div>
            ) : (
              filteredModels.map((model, i) => {
                const cfg = STATUS_CONFIG[model.status] || STATUS_CONFIG.failed;
                return (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group bg-background border border-slate-200 rounded-none shadow-none hover:border-slate-400 transition-all">
                      <CardContent className="p-0">
                        <div className="p-5 border-b border-slate-100">
                          <div className="flex justify-between items-start mb-3">
                            <div className="h-10 w-10 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                              <Cpu className="h-5 w-5" />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-none border-border shadow-none p-1.5">
                                <DropdownMenuItem asChild className="rounded-none text-sm font-semibold cursor-pointer">
                                  <Link href={`/mlstudio/${model.id}`}>view details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-rose-600 rounded-none text-sm font-semibold cursor-pointer" onClick={() => handleDelete(model.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h3 className="text-base font-bold tracking-tight lowercase truncate">{model.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Activity className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-[10px] font-bold text-muted-foreground lowercase">{model.algorithm} • {model.task_type}</span>
                          </div>
                        </div>

                        <div className="p-5 bg-slate-50 group-hover:bg-white transition-colors space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">dataset</span>
                                 <div className="flex items-center gap-1.5">
                                    <Database className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs font-bold lowercase truncate max-w-[120px]">{model.dataset_name || "untitled"}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col text-right">
                                 <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">created</span>
                                 <span className="text-xs font-bold lowercase text-muted-foreground">{format(new Date(model.created_at), "MMM d, yyyy")}</span>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 border text-[10px] font-bold lowercase",
                                cfg.color
                              )}>
                                <cfg.icon className="h-3 w-3" />
                                {cfg.label}
                              </div>
                              <Button asChild size="sm" variant="outline" className="rounded-none h-8 px-4 text-xs font-bold lowercase border-slate-200 hover:border-slate-800 transition-all">
                                <Link href={`/mlstudio/${model.id}`}>
                                  {model.status === 'completed' ? 'predict' : 'open'}
                                </Link>
                              </Button>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
