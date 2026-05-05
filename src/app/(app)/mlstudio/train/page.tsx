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
  const [loadingAlgorithms, setLoadingAlgorithms] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [taskType, setTaskType] = useState<TaskType>("regression");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [hyperparameters, setHyperparameters] = useState<Record<string, string | number>>({});

  const loadInitialData = React.useCallback(async () => {
    try {
      const response = await datasetApi.listDatasets();
      setDatasets(response.results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load datasets");
    }
  }, []);

  const loadAlgorithms = React.useCallback(async (type: TaskType) => {
    setLoadingAlgorithms(true);
    try {
      const data = await mlStudioApi.getAlgorithms(type);
      setAlgorithms(data);
      if (data && data.length > 0) {
        setSelectedAlgorithm(String(data[0].id));
      } else {
        setSelectedAlgorithm("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load algorithms");
    } finally {
      setLoadingAlgorithms(false);
    }
  }, []);

  const loadColumns = React.useCallback(async (datasetId: number) => {
    try {
      const data = await datalabApi.preview(datasetId, 1);
      setColumns(data.columns);
    } catch (err) {
      console.error("Column loading failed", err);
      toast.error("Failed to load column information");
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    if (taskType) {
      loadAlgorithms(taskType);
    }
  }, [taskType, loadAlgorithms]);

  useEffect(() => {
    const algo = algorithms.find(a => a.id === selectedAlgorithm);
    if (algo) {
      // Initialize with empty object or defaults if you prefer
      setHyperparameters({});
    }
  }, [selectedAlgorithm, algorithms]);

  useEffect(() => {
    if (selectedDatasetId) {
      loadColumns(Number(selectedDatasetId));
    }
  }, [selectedDatasetId, loadColumns]);

  const selectedDataset = datasets.find(d => d.id.toString() === selectedDatasetId);

  async function handleTrain() {
    if (!name.trim()) {
      toast.error("Please provide a name for your model");
      return;
    }
    if (!selectedDatasetId) {
      toast.error("Please select a dataset");
      return;
    }
    if (!selectedAlgorithm) {
      toast.error("Please select an algorithm");
      return;
    }
    if (taskType !== 'clustering' && !targetColumn) {
      toast.error("Please select a target column to predict");
      return;
    }
    if (selectedFeatures.length === 0) {
      toast.error("Please select at least one feature column");
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
        hyperparameters: hyperparameters
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


  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) return toast.error("Please provide a name for your model");
      if (!selectedDatasetId) return toast.error("Please select a dataset");
    }
    if (currentStep === 2) {
      if (!selectedAlgorithm) return toast.error("Please select an algorithm");
    }
    if (currentStep === 3) {
      if (taskType !== 'clustering' && !targetColumn) return toast.error("Please select a target column");
      if (selectedFeatures.length === 0) return toast.error("Please select at least one feature");
    }
    setCurrentStep(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-none hover:bg-muted/80" onClick={() => router.push("/mlstudio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-[1px] bg-border/60 mx-2" />
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Train New Model</h1>
            <p className="text-[10px] font-bold text-muted-foreground capitalize tracking-widest mt-1">
              Step {currentStep} of {STEPS.length} • {STEPS[currentStep-1].label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {currentStep < 4 ? (
              <Button 
                className="rounded-none h-10 px-6 font-bold gap-2 bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-foreground/90 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lowercase"
                onClick={handleNext}
              >
                next step <ChevronRight className="h-4 w-4" />
              </Button>
           ) : (
              <Button 
                className="rounded-none h-10 px-8 font-bold gap-2 bg-foreground text-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-foreground/90 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lowercase"
                disabled={loading}
                onClick={handleTrain}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                start training
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
                    "h-10 w-10 rounded-none flex items-center justify-center transition-all duration-500 border-2",
                    stepStyle
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black capitalize tracking-[0.1em] transition-colors duration-500",
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
                    className="h-14 text-lg font-bold rounded-none bg-slate-50 border-2 border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground transition-all"
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
                          "cursor-pointer transition-all duration-300 rounded-none border-2 hover:border-foreground/40",
                          selectedDatasetId === ds.id.toString() ? "border-foreground bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]" : "border-slate-200 bg-background"
                        )}
                        onClick={() => setSelectedDatasetId(ds.id.toString())}
                      >
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className={cn("h-12 w-12 rounded-none flex items-center justify-center border-2", selectedDatasetId === ds.id.toString() ? "bg-foreground text-background border-foreground" : "bg-slate-50 text-slate-400 border-slate-200")}>
                            <Database className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-sm">{ds.file_name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground capitalize tracking-widest">{ds.file_format.toUpperCase()}</p>
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
                          "flex flex-col items-center gap-4 p-8 rounded-none border-2 transition-all duration-300",
                          taskType === type ? "border-foreground bg-slate-50 text-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] scale-105" : "border-slate-200 hover:border-slate-300 text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn("h-16 w-16 rounded-none flex items-center justify-center transition-all border-2", taskType === type ? "bg-foreground text-background border-foreground" : "bg-slate-50 text-slate-400 border-slate-100")}>
                           {type === 'regression' && <Activity className="h-8 w-8" />}
                           {type === 'classification' && <ListTodo className="h-8 w-8" />}
                           {type === 'clustering' && <Sparkles className="h-8 w-8" />}
                        </div>
                        <span className="font-bold capitalize tracking-[0.15em] text-xs font-mono">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xl font-black tracking-tight">Choose an algorithm</Label>
                    {loadingAlgorithms && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} disabled={loadingAlgorithms}>
                    <SelectTrigger className="h-14 rounded-none bg-slate-50 border-2 border-foreground/20 font-bold text-lg focus:ring-0 focus:border-foreground">
                      <SelectValue placeholder={loadingAlgorithms ? "Loading..." : "Select algorithm"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                      {algorithms.length === 0 ? (
                        <div className="p-4 text-xs text-muted-foreground font-mono text-center">no algorithms found for this task type</div>
                      ) : (
                        algorithms.map((algo) => (
                          <SelectItem key={algo.id} value={String(algo.id)} className="rounded-none font-medium text-sm">
                            {algo.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAlgorithm && algorithms.find(a => a.id === selectedAlgorithm)?.hyperparams && Object.keys(algorithms.find(a => a.id === selectedAlgorithm)!.hyperparams).length > 0 && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <Label className="text-xl font-black tracking-tight flex items-center gap-2">
                       <Settings2 className="h-5 w-5 text-primary" /> Fine-tune Parameters
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(algorithms.find(a => a.id === selectedAlgorithm)!.hyperparams).map(([key, type]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{key.replaceAll('_', ' ')}</Label>
                          <Input 
                            type={type === 'int' || type === 'float' ? 'number' : 'text'}
                            step={type === 'float' ? '0.01' : '1'}
                            placeholder={`Enter ${key}`}
                            className="h-12 rounded-none bg-slate-50 border-2 border-foreground/10 font-bold focus:border-foreground"
                            value={hyperparameters[key] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              let parsedVal: string | number = val;
                              if (type === "int") parsedVal = Number.parseInt(val, 10);
                              else if (type === "float") parsedVal = Number.parseFloat(val);
                              
                              setHyperparameters(prev => ({
                                ...prev,
                                [key]: parsedVal
                              }));
                            }}
                          />
                          <p className="text-[10px] font-medium text-slate-400 italic">Expected type: {type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      <SelectTrigger className="h-14 rounded-none bg-slate-50 border-2 border-foreground/20 font-bold text-lg focus:ring-0 focus:border-foreground">
                        <SelectValue placeholder="Which column to predict?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="rounded-none font-medium">
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
                          "p-4 rounded-none border-2 transition-all flex items-center justify-between outline-none focus:ring-0 text-left",
                          selectedFeatures.includes(col) ? "border-foreground bg-slate-50 text-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "border-slate-200 hover:bg-slate-50 text-slate-400"
                        )}
                      >
                        <span className="text-sm truncate lowercase font-mono">{col}</span>
                        {selectedFeatures.includes(col) && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold capitalize tracking-widest" onClick={() => setSelectedFeatures(columns.filter(c => c !== targetColumn))}>Select All</Button>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold capitalize tracking-widest text-destructive" onClick={() => setSelectedFeatures([])}>Clear All</Button>
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
                  <div className="p-6 rounded-none bg-slate-50 border-2 border-foreground space-y-4">
                    <div className="flex items-center gap-2 text-foreground">
                       <Settings2 className="h-4 w-4" />
                       <span className="text-[10px] font-black capitalize tracking-[0.1em] font-mono">General Info</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs lowercase font-mono">
                          <span className="text-muted-foreground/60">model name</span>
                          <span className="font-bold">{name}</span>
                       </div>
                       <div className="flex justify-between text-xs lowercase font-mono">
                          <span className="text-muted-foreground/60">dataset</span>
                          <span className="font-bold">{selectedDataset?.file_name}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-none bg-slate-50 border-2 border-foreground space-y-4">
                    <div className="flex items-center gap-2 text-foreground">
                       <BrainCircuit className="h-4 w-4" />
                       <span className="text-[10px] font-black capitalize tracking-[0.1em] font-mono">Architecture</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs lowercase font-mono">
                          <span className="text-muted-foreground/60">task</span>
                          <Badge className="font-bold capitalize tracking-widest text-[9px] rounded-none border-foreground bg-foreground text-background">{taskType}</Badge>
                       </div>
                       <div className="flex justify-between text-xs lowercase font-mono">
                          <span className="text-muted-foreground/60">algorithm</span>
                          <span className="font-bold">{algorithms.find(a => a.id === selectedAlgorithm)?.name}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-none bg-slate-50 border-2 border-foreground space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                         <Target className="h-4 w-4" />
                         <span className="text-[10px] font-black capitalize tracking-[0.1em] font-mono">Target & Features</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60 lowercase">{selectedFeatures.length} features selected</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {taskType !== 'clustering' && (
                        <Badge variant="default" className="rounded-none border-2 border-foreground bg-foreground text-background text-[10px] py-1 px-3 lowercase font-mono">Target: {targetColumn}</Badge>
                      )}
                      {selectedFeatures.slice(0, 12).map(f => (
                        <Badge key={f} variant="outline" className="rounded-none border-2 border-slate-200 text-[10px] py-1 px-3 text-slate-400 lowercase font-mono">{f}</Badge>
                      ))}
                      {selectedFeatures.length > 12 && <span className="text-[10px] text-slate-400 font-bold lowercase">+{selectedFeatures.length - 12} more</span>}
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
                className="rounded-none h-12 px-8 font-bold gap-2 border-2 border-foreground hover:bg-slate-50 transition-all"
                onClick={handleNext}
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
