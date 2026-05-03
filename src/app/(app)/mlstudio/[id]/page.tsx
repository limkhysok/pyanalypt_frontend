"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Play, 
  BarChart3,
  Cpu,
  Trophy,
  Zap,
  RefreshCw,
  Plus,
  Table as TableIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mlStudioApi, type MLModel } from "@/services/mlstudio.service";
import EChart from "@/components/ui/EChart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const STATUS_CONFIG = {
  training: { icon: Clock, label: "Training", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  failed: { icon: AlertCircle, label: "Failed", color: "text-destructive bg-destructive/10 border-destructive/20" },
};

export default function MLModelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [model, setModel] = useState<MLModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predictionInput, setPredictionInput] = useState<Record<string, string>>({});
  const [predictionResult, setPredictionResult] = useState<any>(null);

  useEffect(() => {
    if (id) loadModel();
  }, [id]);

  async function loadModel() {
    try {
      const data = await mlStudioApi.get(Number(id));
      setModel(data);
      
      // Initialize prediction input with feature columns
      const initialInput: Record<string, string> = {};
      data.feature_columns.forEach(col => {
        initialInput[col] = "";
      });
      setPredictionInput(initialInput);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load model details");
    } finally {
      setLoading(false);
    }
  }

  async function handlePredict() {
    if (!model) return;
    setPredicting(true);
    try {
      // Convert inputs to numbers where appropriate
      const formattedInput = { ...predictionInput };
      Object.keys(formattedInput).forEach(key => {
        const val = formattedInput[key];
        if (!Number.isNaN(Number(val)) && val !== "") {
          (formattedInput as any)[key] = Number(val);
        }
      });

      const res = await mlStudioApi.predict(model.id, { data: [formattedInput] });
      setPredictionResult(res.predictions[0]);
      toast.success("Prediction generated");
    } catch (err) {
      console.error(err);
      toast.error("Prediction failed");
    } finally {
      setPredicting(false);
    }
  }

  const importanceOption = useMemo(() => {
    if (!model?.feature_importance) return null;
    const data = Object.entries(model.feature_importance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      backgroundColor: "transparent",
      tooltip: { 
        trigger: "axis", 
        axisPointer: { type: "shadow" },
        backgroundColor: isDark ? "#09090b" : "#ffffff",
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        textStyle: { color: isDark ? "#f4f4f5" : "#18181b", fontSize: 11 },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { 
        type: "value", 
        splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } },
        axisLabel: { color: "#71717a", fontSize: 10 }
      },
      yAxis: { 
        type: "category", 
        data: data.map(d => d[0]).reverse(),
        axisLabel: { color: isDark ? "#a1a1aa" : "#3f3f46", fontSize: 11, fontWeight: "bold" },
        axisLine: { show: false }
      },
      series: [
        {
          name: "Importance",
          type: "bar",
          data: data.map(d => d[1]).reverse(),
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: "linear",
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: "#3b82f6" },
                { offset: 1, color: "#60a5fa" }
              ]
            }
          }
        }
      ]
    };
  }, [model, isDark]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing model state...</p>
    </div>
  );

  if (!model) return <div>Model not found.</div>;

  const cfg = STATUS_CONFIG[model.status] || STATUS_CONFIG.failed;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Detail Header */}
      <header className="h-20 border-b border-border/60 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" onClick={() => router.push("/mlstudio")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-[1px] bg-border/60 mx-1" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <h1 className="text-xl font-black tracking-tight">{model.name}</h1>
               <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", cfg.color)}>
                 {cfg.label}
               </Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Cpu className="h-3 w-3" /> {model.algorithm} • {model.task_type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 border-border/60 gap-2 font-bold" onClick={loadModel}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
             <Plus className="h-4 w-4" /> Deploy API
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Performance */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[2.5rem] border-border/40 bg-background/50 overflow-hidden">
               <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Trophy className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Performance Metrics</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-6">
                  {model.metrics ? (
                    <div className="grid grid-cols-1 gap-4">
                       {Object.entries(model.metrics).map(([key, val]) => (
                         <div key={key} className="p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{key.replace('_', ' ')}</span>
                            <span className="text-xl font-black text-primary">{(val * 100).toFixed(2)}{key.includes('score') || key.includes('accuracy') ? '%' : ''}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-3">
                       <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                       <p className="text-xs text-muted-foreground font-medium">No metrics available yet.</p>
                    </div>
                  )}
               </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-border/40 bg-background/50">
               <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Database className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Training Context</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground font-medium">Dataset</span>
                       <span className="font-bold">{model.dataset_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground font-medium">Target Column</span>
                       <Badge variant="secondary" className="font-bold">{model.target_column || "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground font-medium">Features</span>
                       <span className="font-bold">{model.feature_columns.length} columns</span>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column: Visualizations & Prediction */}
          <div className="lg:col-span-8 space-y-8">
             <Tabs defaultValue="insights" className="w-full">
                <TabsList className="h-12 w-full max-w-md bg-muted/40 p-1 rounded-2xl mb-6">
                   <TabsTrigger value="insights" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                      <BarChart3 className="h-3 w-3 mr-2" /> Model Insights
                   </TabsTrigger>
                   <TabsTrigger value="predict" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                      <Play className="h-3 w-3 mr-2" /> Make Prediction
                   </TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-8 focus-visible:outline-none">
                   <Card className="rounded-[2.5rem] border-border/40 bg-background/50">
                      <CardHeader>
                         <CardTitle className="text-lg font-black tracking-tight">Feature Importance</CardTitle>
                         <CardDescription className="text-xs font-medium">Which variables contribute most to the model's predictions?</CardDescription>
                      </CardHeader>
                      <CardContent>
                         {importanceOption ? (
                           <div className="h-[400px] w-full">
                              <EChart option={importanceOption} style={{ height: '100%', width: '100%' }} />
                           </div>
                         ) : (
                           <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground/40 italic">
                              <BarChart3 className="h-12 w-12 mb-3" />
                              <p>Feature importance data not generated for this model type.</p>
                           </div>
                         )}
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="predict" className="space-y-8 focus-visible:outline-none">
                   <Card className="rounded-[2.5rem] border-border/40 bg-background/50">
                      <CardHeader>
                         <CardTitle className="text-lg font-black tracking-tight">Real-time Prediction</CardTitle>
                         <CardDescription className="text-xs font-medium">Input feature values to get an immediate prediction from the model.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {model.feature_columns.map(col => (
                              <div key={col} className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{col}</Label>
                                <Input 
                                  placeholder={`Value for ${col}`} 
                                  className="h-11 rounded-xl bg-muted/20 border-border/60 font-medium"
                                  value={predictionInput[col] || ""}
                                  onChange={(e) => setPredictionInput(prev => ({ ...prev, [col]: e.target.value }))}
                                />
                              </div>
                            ))}
                         </div>
                         
                         <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t border-border/10">
                            <Button 
                              onClick={handlePredict} 
                              disabled={predicting || model.status !== 'completed'} 
                              className="w-full md:w-auto rounded-xl h-12 px-8 font-black text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                            >
                              {predicting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                              Run Prediction
                            </Button>
                            
                            {predictionResult !== null && (
                              <div className="flex-1 w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                       <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Prediction Result</p>
                                       <p className="text-xl font-black text-primary">
                                          {typeof predictionResult === 'number' ? predictionResult.toFixed(4) : predictionResult}
                                       </p>
                                    </div>
                                 </div>
                                 <Button variant="ghost" size="icon" className="text-primary" onClick={() => setPredictionResult(null)}>
                                    <ArrowLeft className="h-4 w-4 rotate-90" />
                                 </Button>
                              </div>
                            )}
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="rounded-[2.5rem] border-dashed border-2 border-border/40 bg-muted/5">
                      <CardContent className="p-8 text-center space-y-4">
                         <TableIcon className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                         <div className="space-y-1">
                            <h3 className="text-sm font-bold">Batch Prediction</h3>
                            <p className="text-xs text-muted-foreground">Upload a CSV or JSON file to run predictions on multiple rows at once.</p>
                         </div>
                         <Button variant="outline" className="rounded-xl font-bold h-10 px-6 border-border/60">Upload Batch Data</Button>
                      </CardContent>
                   </Card>
                </TabsContent>
             </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
