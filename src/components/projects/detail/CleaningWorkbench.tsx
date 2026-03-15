import React from 'react';
import { 
    Database, 
    Settings2, 
    Wand2, 
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatasetPreview } from "@/types/project";

interface CleaningWorkbenchProps {
    selectedDatasetId: number | string | null;
    previewData: DatasetPreview | null;
    handleRunCleanup: () => void;
    isCleaningActive: boolean;
    
    // State & Setters
    cleaningNACol: string;
    setCleaningNACol: React.Dispatch<React.SetStateAction<string>>;
    cleaningNAStrategy: string;
    setCleaningNAStrategy: React.Dispatch<React.SetStateAction<string>>;
    isDeduplicationEnabled: boolean;
    setIsDeduplicationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    castingCol: string;
    setCastingCol: React.Dispatch<React.SetStateAction<string>>;
    castingType: string;
    setCastingType: React.Dispatch<React.SetStateAction<string>>;
}

export const CleaningWorkbench: React.FC<CleaningWorkbenchProps> = (props) => {
    const {
        selectedDatasetId,
        previewData,
        handleRunCleanup,
        isCleaningActive,
        cleaningNACol,
        setCleaningNACol,
        cleaningNAStrategy,
        setCleaningNAStrategy,
        isDeduplicationEnabled,
        setIsDeduplicationEnabled,
        castingCol,
        setCastingCol,
        castingType,
        setCastingType
    } = props;

    if (!selectedDatasetId) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <Database className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-bold text-foreground/50">Select a dataset to use the Cleaning Workbench</p>
            </div>
        );
    }

    return (
        <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Cleaning Strategy</CardTitle>
                            <CardDescription className="text-xs">Configure how to handle missing values, duplicates, and type casting.</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                         <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Missing Values (NaN)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-muted-foreground/40">Select Column</Label>
                                    <select 
                                        value={cleaningNACol} 
                                        onChange={(e) => setCleaningNACol(e.target.value)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="all">All Columns</option>
                                        {previewData?.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-muted-foreground/40">Strategy</Label>
                                    <select 
                                        value={cleaningNAStrategy} 
                                        onChange={(e) => setCleaningNAStrategy(e.target.value)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="fill_mean">Fill Mean</option>
                                        <option value="fill_median">Fill Median</option>
                                        <option value="fill_mode">Fill Mode</option>
                                        <option value="drop">Drop Rows</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/40">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Deduplicate Data</Label>
                                <p className="text-[10px] text-muted-foreground/50">Remove identical rows from the dataset.</p>
                            </div>
                            <input 
                                type="checkbox"
                                checked={isDeduplicationEnabled}
                                onChange={(e) => setIsDeduplicationEnabled(e.target.checked)}
                                className="h-4 w-4 rounded border-border/40 text-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Type Casting</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-muted-foreground/40">Target Column</Label>
                                    <select 
                                        value={castingCol} 
                                        onChange={(e) => setCastingCol(e.target.value)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="none">None</option>
                                        {previewData?.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-muted-foreground/40">Cast To</Label>
                                    <select 
                                        value={castingType} 
                                        onChange={(e) => setCastingType(e.target.value)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-border/40 bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="integer">Integer</option>
                                        <option value="float">Float</option>
                                        <option value="string">String</option>
                                        <option value="datetime">DateTime</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border/40">
                    <Button 
                        className="w-full h-12 text-sm font-black uppercase tracking-widest gap-3 shadow-md"
                        onClick={handleRunCleanup}
                        disabled={isCleaningActive}
                    >
                        {isCleaningActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        Execute Transformation
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
