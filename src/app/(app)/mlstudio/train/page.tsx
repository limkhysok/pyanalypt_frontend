"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BrainCircuit, 
  Check, 
  Database, 
  ChevronRight, 
  Target, 
  ListTodo, 
  Settings2,
  Sparkles,
  Loader2,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mlStudioApi, type TaskType, type Algorithm } from "@/services/mlstudio.service";
import { datasetApi } from "@/services/dataset.service";
import { datalabApi } from "@/services/datalab.service";
import { type Dataset } from "@/types/dataset";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Data Source", icon: Database },
  { id: 2, label: "Model Type", icon: BrainCircuit },
  { id: 3, label: "Configuration", icon: Target },
  { id: 4, label: "Training", icon: Sparkles },
];

export default function MLStudioTrainPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  // Form State
  const [name, setName] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [taskType, setTaskType] = useState<TaskType>("regression");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (taskType) {
      loadAlgorithms(taskType);
    }
  }, [taskType]);

  useEffect(() => {
    if (selectedDatasetId) {
      loadColumns(Number(selectedDatasetId));
    }
  }, [selectedDatasetId]);

  async function loadInitialData() {
    try {
      const response = await datasetApi.listDatasets();
      setDatasets(response.results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load datasets");
    }
  }

  async function loadAlgorithms(type: TaskType) {
    try {
      const data = await mlStudioApi.getAlgorithms(type);
      setAlgorithms(data);
      if (data.length > 0) setSelectedAlgorithm(data[0].id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load algorithms");
    }
  }

  async function loadColumns(datasetId: number) {
    try {
      const data = await datalabApi.preview(datasetId, 1);
      setColumns(data.columns);
    } catch (err) {
      console.error("Column loading failed", err);
      toast.error("Failed to load column information");
    }
  }

  const selectedDataset = datasets.find(d => d.id.toString() === selectedDatasetId);

  async function handleTrain() {
    if (!name || !selectedDatasetId || !selectedAlgorithm) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const model = await mlStudioApi.train({
        name,
        dataset: Number(selectedDatasetId),
        task_type: taskType,
        algorithm: selectedAlgorithm,
        target_column: taskType === "clustering" ? undefined : targetColumn,
        feature_columns: selectedFeatures,
        hyperparameters: {}
      });
      toast.success("Training started successfully");
      router.push(`/mlstudio/${model.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Training failed to start");
    } finally {
      setLoading(false);
    }
  }

  const toggleFeature = (col: string) => {
    setSelectedFeatures(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const isStepValid = () => {
    if (currentStep === 1) return name && selectedDatasetId;
    if (currentStep === 2) return selectedAlgorithm;
    if (currentStep === 3) {
      const hasFeatures = selectedFeatures.length > 0;
      if (taskType === 'clustering') return hasFeatures;
      return targetColumn && hasFeatures;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.push("/mlstudio")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-[1px] bg-border/60 mx-2" />
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Train New Model</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Step {currentStep} of {STEPS.length} • {STEPS[currentStep-1].label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {currentStep < 4 ? (
             <Button 
               className="rounded-xl h-10 px-6 font-bold gap-2"
               disabled={!isStepValid()}
               onClick={() => setCurrentStep(prev => prev + 1)}
             >
               Next Step <ChevronRight className="h-4 w-4" />
             </Button>
           ) : (
             <Button 
               className="rounded-xl h-10 px-8 font-bold gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
               disabled={loading}
               onClick={handleTrain}
             >
               {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
               Start Training
             </Button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Stepper Visual */}
          <div className="flex items-center justify-between relative px-10">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0" />
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              
              let stepStyle = "bg-background border-muted text-muted-foreground";
              if (isCompleted) stepStyle = "bg-primary border-primary text-primary-foreground";
              else if (isActive) stepStyle = "bg-background border-primary text-primary shadow-lg shadow-primary/20 scale-110";

              let labelStyle = "text-muted-foreground/40";
              if (isActive || isCompleted) labelStyle = "text-foreground";

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                    stepStyle
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.1em] transition-colors duration-500",
                    labelStyle
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-8">
            {/* Step 1: Data Source */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-xl font-black tracking-tight">Name your model</Label>
                  <Input 
                    placeholder="e.g. Sales Forecast Model 2026" 
                    className="h-14 text-lg font-bold rounded-2xl bg-muted/20 border-border/60"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-xl font-black tracking-tight">Select training dataset</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {datasets.map((ds) => (
                      <Card 
                        key={ds.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-300 rounded-3xl border-2 hover:border-primary/40",
                          selectedDatasetId === ds.id.toString() ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-border/40 bg-background/50"
                        )}
                        onClick={() => setSelectedDatasetId(ds.id.toString())}
                      >
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", selectedDatasetId === ds.id.toString() ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground")}>
                            <Database className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-sm">{ds.file_name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ds.file_format.toUpperCase()}</p>
                          </div>
                          {selectedDatasetId === ds.id.toString() && <Check className="text-primary h-5 w-5" />}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Model Type */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="space-y-6">
                  <Label className="text-xl font-black tracking-tight">What is your goal?</Label>
                  <div className="grid grid-cols-3 gap-6">
                    {(['regression', 'classification', 'clustering'] as TaskType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTaskType(type)}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                          taskType === type ? "border-primary bg-primary/5 text-primary scale-105 shadow-xl shadow-primary/10" : "border-border/40 hover:border-border text-muted-foreground hover:bg-muted/10"
                        )}
                      >
                        <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center transition-all", taskType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                           {type === 'regression' && <Activity className="h-8 w-8" />}
                           {type === 'classification' && <ListTodo className="h-8 w-8" />}
                           {type === 'clustering' && <Sparkles className="h-8 w-8" />}
                        </div>
                        <span className="font-black uppercase tracking-[0.15em] text-xs">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-black tracking-tight">Choose an algorithm</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/60 font-bold text-lg">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {algorithms.map((algo) => (
                        <SelectItem key={algo.id} value={algo.id} className="rounded-xl font-medium">
                          {algo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Configuration */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                {taskType !== 'clustering' && (
                  <div className="space-y-4">
                    <Label className="text-xl font-black tracking-tight flex items-center gap-2">
                       <Target className="h-5 w-5 text-primary" /> Select Target Column (Label)
                    </Label>
                    <Select value={targetColumn} onValueChange={setTargetColumn}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/60 font-bold text-lg">
                        <SelectValue placeholder="Which column to predict?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="rounded-xl font-medium">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-xl font-black tracking-tight flex items-center gap-2">
                     <ListTodo className="h-5 w-5 text-primary" /> Select Features (Inputs)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {columns.filter(c => c !== targetColumn).map((col) => (
                      <button 
                        key={col}
                        type="button"
                        onClick={() => toggleFeature(col)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all flex items-center justify-between outline-none focus:ring-2 ring-primary/20 text-left",
                          selectedFeatures.includes(col) ? "border-primary bg-primary/5 text-primary font-bold" : "border-border/40 hover:bg-muted/10 text-muted-foreground"
                        )}
                      >
                        <span className="text-sm truncate">{col}</span>
                        {selectedFeatures.includes(col) && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest" onClick={() => setSelectedFeatures(columns.filter(c => c !== targetColumn))}>Select All</Button>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-destructive" onClick={() => setSelectedFeatures([])}>Clear All</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Training Summary */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary animate-pulse">
                    <Sparkles className="h-12 w-12" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Ready to launch training?</h2>
                  <p className="text-muted-foreground font-medium">Review your model configuration before starting.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                       <Settings2 className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-[0.1em]">General Info</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Model Name</span>
                          <span className="font-bold">{name}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dataset</span>
                          <span className="font-bold">{selectedDataset?.file_name}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                       <BrainCircuit className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-[0.1em]">Architecture</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Task</span>
                          <Badge className="font-bold uppercase tracking-widest text-[9px]">{taskType}</Badge>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Algorithm</span>
                          <span className="font-bold">{algorithms.find(a => a.id === selectedAlgorithm)?.name}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                         <Target className="h-4 w-4" />
                         <span className="text-[10px] font-black uppercase tracking-[0.1em]">Target & Features</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{selectedFeatures.length} features selected</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {taskType !== 'clustering' && (
                        <Badge variant="default" className="rounded-lg bg-primary text-[10px] py-1 px-3">Target: {targetColumn}</Badge>
                      )}
                      {selectedFeatures.slice(0, 8).map(f => (
                        <Badge key={f} variant="outline" className="rounded-lg border-border/60 text-[10px] py-1 px-3 text-muted-foreground">{f}</Badge>
                      ))}
                      {selectedFeatures.length > 8 && <span className="text-[10px] text-muted-foreground font-bold">+{selectedFeatures.length - 8} more</span>}
                   </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-12 border-t border-border/10">
             {currentStep > 1 ? (
               <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => setCurrentStep(prev => prev - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
               </Button>
             ) : <div />}
             
             {currentStep < 4 && (
               <Button 
                variant="outline" 
                className="rounded-xl h-12 px-8 font-bold gap-2"
                onClick={() => setCurrentStep(prev => prev + 1)}
               >
                 Continue <ChevronRight className="h-4 w-4" />
               </Button>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
