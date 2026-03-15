import React from 'react';
import { 
    BrainCircuit, 
    Target, 
    Loader2,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatasetPreview, TrainModelResponse, ModelType } from "@/types/project";

interface ModelTrainingSectionProps {
    selectedDatasetId: number | string | null;
    previewData: DatasetPreview | null;
    isTraining: boolean;
    trainingResult: TrainModelResponse | null;
    handleTrainModel: () => void;
    
    // State & Setters
    modelType: ModelType;
    setModelType: React.Dispatch<React.SetStateAction<ModelType>>;
    selectedFeatures: string[];
    setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
    targetVariable: string;
    setTargetVariable: React.Dispatch<React.SetStateAction<string>>;
    numClusters: number;
    setNumClusters: React.Dispatch<React.SetStateAction<number>>;
}

const formatMetricValue = (val: any) => {
    if (typeof val === 'number') return val.toFixed(4);
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return String(val);
};

export const ModelTrainingSection: React.FC<ModelTrainingSectionProps> = (props) => {
    const {
        selectedDatasetId,
        previewData,
        isTraining,
        trainingResult,
        handleTrainModel,
        modelType,
        setModelType,
        selectedFeatures,
        setSelectedFeatures,
        targetVariable,
        setTargetVariable,
        numClusters,
        setNumClusters
    } = props;

    if (!selectedDatasetId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <BrainCircuit className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-bold text-foreground/50">Select a dataset to begin training</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-10">
            {/* Control Panel */}
            <Card className="border-border/60 shadow-sm overflow-hidden h-fit">
                <CardHeader className="bg-muted/20 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BrainCircuit className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-bold">Model Architect</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Algorithm</Label>
                        <select 
                            value={modelType} 
                            onChange={(e) => setModelType(e.target.value as ModelType)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="kmeans">K-Means Clustering</option>
                            <option value="linear_regression">Linear Regression</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Features (X)</Label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {previewData?.columns.map(col => (
                                <div key={col} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                                    <input 
                                        type="checkbox"
                                        id={`feat-${col}`}
                                        checked={selectedFeatures.includes(col)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedFeatures([...selectedFeatures, col]);
                                            else setSelectedFeatures(selectedFeatures.filter(c => c !== col));
                                        }}
                                        className="h-4 w-4 rounded border-border/40 text-primary focus:ring-primary/20"
                                    />
                                    <Label htmlFor={`feat-${col}`} className="text-xs font-medium cursor-pointer truncate">{col}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {modelType === 'linear_regression' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Target Variable (Y)</Label>
                            <select 
                                value={targetVariable} 
                                onChange={(e) => setTargetVariable(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Select target</option>
                                {previewData?.columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {modelType === 'kmeans' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Cluster Count (K)</Label>
                            <Input 
                                type="number" 
                                min={2} 
                                max={10} 
                                value={numClusters} 
                                onChange={(e) => setNumClusters(Number.parseInt(e.target.value))}
                                className="h-10 text-xs bg-background border-border/40"
                            />
                        </div>
                    )}

                    <Button 
                        className="w-full h-11 font-black uppercase tracking-widest gap-3 shadow-md"
                        onClick={handleTrainModel}
                        disabled={isTraining || selectedFeatures.length === 0}
                    >
                        {isTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                        Initialize Training
                    </Button>
                </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border-border/60 shadow-sm overflow-hidden bg-background/50 relative">
                {isTraining && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Running Compute Instance…</p>
                        </div>
                    </div>
                )}

                {trainingResult ? (
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tight">{modelType.replace('_', ' ').toUpperCase()} Results</h3>
                                <p className="text-xs text-muted-foreground/60">Training completed</p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase">Success</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {trainingResult.metrics && Object.entries(trainingResult.metrics).map(([name, val]) => (
                                <Card key={name} className="bg-primary/5 border-primary/20 shadow-none rounded-2xl overflow-hidden">
                                    <div className="p-4 space-y-3">
                                        <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                            <Target className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-primary">
                                                {formatMetricValue(val)}
                                            </p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{name.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {trainingResult.summary && (
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Model Summary</Label>
                                <div className="bg-muted/30 border border-border/40 rounded-2xl p-6 overflow-x-auto">
                                    <pre className="text-xs font-mono text-foreground/80 leading-relaxed">
                                        {JSON.stringify(trainingResult.summary, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-4">
                        <div className="p-6 bg-muted/40 rounded-3xl text-muted-foreground/30 border border-border/40">
                            <BrainCircuit className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/60">Engine Standby</p>
                            <p className="text-xs text-muted-foreground/40 max-w-xs mx-auto">Select features and click Initialize Training to see model metrics and performance results.</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
