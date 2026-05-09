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
import { mlStudioApi, type MLModel, type PredictionResponse, type PredictionItem } from "@/services/mlstudio.service";
import { datasetApi } from "@/services/dataset.service";
import { type Dataset } from "@/types/dataset";
import EChart from "@/components/ui/EChart";
import * as echarts from "echarts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pending", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  training: { icon: Clock, label: "Training", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-500 bg-green-500/10 border-green-500/20" },
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
  const [predictionResult, setPredictionResult] = useState<string | number | null>(null);
  
  // Batch Prediction State
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [selectedBatchDatasetId, setSelectedBatchDatasetId] = useState<string>("");
  const [batchResults, setBatchResults] = useState<PredictionResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const loadModel = React.useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) loadModel();
  }, [id, loadModel]);

  useEffect(() => {
    datasetApi.listDatasets().then(res => setAllDatasets(res.results));
  }, []);

  async function handlePredict() {
    if (!model) return;
    setPredicting(true);
    try {
      // Convert inputs to numbers where appropriate
      const formattedInput: Record<string, string | number> = { ...predictionInput };
      Object.keys(formattedInput).forEach(key => {
        const val = formattedInput[key];
        if (typeof val === 'string' && !Number.isNaN(Number(val)) && val !== "") {
          formattedInput[key] = Number(val);
        }
      });

      const res = await mlStudioApi.predict(model.id, { data: [formattedInput] });
      // Real-time prediction returns: { "predictions": [val1, ...] } OR the new format
      // If it's the new format, it might be { "predictions": [{"row_index": 0, "prediction": val}] }
      const firstPred = res.predictions[0];
      if (typeof firstPred === 'object' && firstPred !== null && 'prediction' in firstPred) {
        setPredictionResult(firstPred.prediction);
      } else {
        setPredictionResult(firstPred);
      }
      toast.success("Prediction generated");
    } catch (err) {
      console.error(err);
      toast.error("Prediction failed");
    } finally {
      setPredicting(false);
    }
  }

  async function handleBatchPredict() {
    if (!model || !selectedBatchDatasetId) {
      toast.error("Please select a dataset for batch prediction");
      return;
    }
    setBatchLoading(true);
    setBatchResults(null);
    try {
      const res = await mlStudioApi.predict(model.id, { dataset_id: Number(selectedBatchDatasetId) });
      setBatchResults(res);
      toast.success(`Batch prediction complete: ${res.predicted_rows} rows processed`);
    } catch (err) {
      console.error(err);
      toast.error("Batch prediction failed");
    } finally {
      setBatchLoading(false);
    }
  }

  const importanceOption = useMemo<echarts.EChartsOption | null>(() => {
    if (!model?.feature_importance || !Array.isArray(model.feature_importance)) return null;
    const data = [...model.feature_importance]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 12);

    return {
      backgroundColor: "transparent",
      tooltip: { 
        trigger: "axis" as const, 
        axisPointer: { type: "shadow" as const },
        backgroundColor: isDark ? "#09090b" : "#ffffff",
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        textStyle: { color: isDark ? "#f4f4f5" : "#18181b", fontSize: 11 },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { 
        type: "value" as const, 
        splitLine: { lineStyle: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } },
        axisLabel: { color: "#71717a", fontSize: 10 }
      },
      yAxis: { 
        type: "category" as const, 
        data: data.map(d => d.feature).reverse(),
        axisLabel: { color: isDark ? "#a1a1aa" : "#3f3f46", fontSize: 11, fontWeight: "bold" },
        axisLine: { show: false }
      },
      series: [
        {
          name: "Importance",
          type: "bar" as const,
          data: data.map(d => d.importance).reverse(),
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
      <p className="text-[10px] font-black capitalize tracking-widest text-muted-foreground">Synchronizing model state...</p>
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
          <div className="h-10 w-px bg-border/60 mx-1" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <h1 className="text-xl font-black tracking-tight">{model.name}</h1>
               <Badge className={cn("text-[9px] font-black capitalize tracking-widest px-2 py-0.5 rounded-md", cfg.color)}>
                 {cfg.label}
               </Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground capitalize tracking-widest flex items-center gap-2">
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
                    <span className="text-[10px] font-black capitalize tracking-widest">Performance Metrics</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-6">
                  {model.metrics ? (
                    <div className="grid grid-cols-1 gap-4">
                       {Object.entries(model.metrics).map(([key, val]) => (
                         <div key={key} className="p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-between">
                            <span className="text-xs font-bold capitalize tracking-widest text-muted-foreground">{key.replace('_', ' ')}</span>
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
                    <span className="text-[10px] font-black capitalize tracking-widest">Training Context</span>
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
                     <div className="pt-2 border-t border-border/10 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground">Train Samples</span>
                           <span className="font-bold">{model.train_samples ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground">Test Samples</span>
                           <span className="font-bold">{model.test_samples ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground">Training Time</span>
                           <span className="font-bold">{model.training_time_seconds?.toFixed(2)}s</span>
                        </div>
                        {model.label_classes && model.label_classes.length > 0 && (
                          <div className="space-y-2 pt-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label Classes</span>
                             <div className="flex flex-wrap gap-1">
                                {model.label_classes.map(cls => (
                                  <Badge key={cls} variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-sm">{cls}</Badge>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column: Visualizations & Prediction */}
          <div className="lg:col-span-8 space-y-8">
             <Tabs defaultValue="insights" className="w-full">
                <TabsList className="h-12 w-full max-w-md bg-muted/40 p-1 rounded-2xl mb-6">
                   <TabsTrigger value="insights" className="flex-1 rounded-xl font-bold capitalize tracking-widest text-[10px]">
                      <BarChart3 className="h-3 w-3 mr-2" /> Model Insights
                   </TabsTrigger>
                   <TabsTrigger value="predict" className="flex-1 rounded-xl font-bold capitalize tracking-widest text-[10px]">
                      <Play className="h-3 w-3 mr-2" /> Make Prediction
                   </TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-8 focus-visible:outline-none">
                   <Card className="rounded-[2.5rem] border-border/40 bg-background/50">
                      <CardHeader>
                         <CardTitle className="text-lg font-black tracking-tight">Feature Importance</CardTitle>
                         <CardDescription className="text-xs font-medium">Which variables contribute most to the model&apos;s predictions?</CardDescription>
                      </CardHeader>
                      <CardContent>
                         {importanceOption ? (
                           <div className="h-100 w-full">
                              <EChart option={importanceOption} style={{ height: '100%', width: '100%' }} />
                           </div>
                         ) : (
                           <div className="h-75 flex flex-col items-center justify-center text-muted-foreground/40 italic">
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
                                <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground">{col}</Label>
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
                              className="w-full md:w-auto rounded-xl h-12 px-8 font-black text-[11px] capitalize tracking-widest gap-2 shadow-lg shadow-primary/20"
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
                                       <p className="text-[10px] font-black capitalize tracking-widest text-primary/70">Prediction Result</p>
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

                   <Card className="rounded-[2.5rem] border-2 border-border/40 bg-background/50 overflow-hidden">
                      <CardHeader className="bg-muted/30">
                         <CardTitle className="text-lg font-black tracking-tight">Batch Prediction</CardTitle>
                         <CardDescription className="text-xs font-medium">Select a dataset to generate predictions for all its rows.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black capitalize tracking-widest text-muted-foreground">Target Dataset</Label>
                            <div className="flex gap-4">
                               <select 
                                 className="flex-1 h-11 rounded-xl bg-muted/20 border-border/60 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                 value={selectedBatchDatasetId}
                                 onChange={(e) => setSelectedBatchDatasetId(e.target.value)}
                               >
                                 <option value="">Select a dataset...</option>
                                 {allDatasets.map(ds => (
                                   <option key={ds.id} value={ds.id}>{ds.file_name} ({ds.file_format.toUpperCase()})</option>
                                 ))}
                               </select>
                               <Button 
                                 onClick={handleBatchPredict} 
                                 disabled={batchLoading || !selectedBatchDatasetId}
                                 className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 gap-2"
                               >
                                  {batchLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TableIcon className="h-4 w-4" />}
                                  Run Batch
                               </Button>
                            </div>
                         </div>

                         {batchResults && (
                           <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <h4 className="font-bold text-sm">Batch Prediction Successful</h4>
                                 </div>
                                 <Badge className="bg-green-500 text-white border-none">
                                    {batchResults.predicted_rows} / {batchResults.total_rows} rows processed
                                 </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Predictions have been generated based on the model trained with target column <b>{batchResults.target_column}</b>.
                              </p>
                              <div className="pt-4 border-t border-border/10">
                                 <div className="max-h-50 overflow-y-auto rounded-xl border border-border/40">
                                    <table className="w-full text-[10px] font-mono">
                                       <thead className="bg-muted/50 sticky top-0">
                                          <tr>
                                             <th className="px-3 py-2 text-left border-b border-border/40">Row Index</th>
                                             <th className="px-3 py-2 text-left border-b border-border/40">Prediction</th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {batchResults.predictions.slice(0, 100).map((p) => {
                                             const item = p as PredictionItem;
                                             return (
                                               <tr key={item.row_index} className="border-b border-border/10 last:border-0">
                                                  <td className="px-3 py-2 text-muted-foreground">{item.row_index}</td>
                                                  <td className="px-3 py-2 font-bold text-primary">{typeof item.prediction === 'number' ? item.prediction.toFixed(4) : item.prediction}</td>
                                               </tr>
                                             );
                                          })}
                                          {batchResults.predictions.length > 100 && (
                                            <tr>
                                               <td colSpan={2} className="px-3 py-4 text-center text-muted-foreground italic">
                                                  ... and {batchResults.predictions.length - 100} more rows
                                               </td>
                                            </tr>
                                          )}
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                         )}
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
