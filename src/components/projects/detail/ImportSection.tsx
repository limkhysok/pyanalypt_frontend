import React from 'react';
import { 
    FileUp, 
    Code, 
    Plus, 
    Loader2, 
    Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImportSectionProps {
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleRawDataPaste: () => void;
    isDragging: boolean;
    setIsDragging: (v: boolean) => void;
    isProcessing: boolean;
    rawData: string;
    setRawData: (v: string) => void;
    rawDataName: string;
    setRawDataName: (v: string) => void;
}

export const ImportSection: React.FC<ImportSectionProps> = (props) => {
    const {
        handleFileUpload,
        handleDrop,
        handleRawDataPaste,
        isDragging,
        setIsDragging,
        isProcessing,
        rawData,
        setRawData,
        rawDataName,
        setRawDataName
    } = props;

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-12">
            <div className="space-y-8">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                        STEP 1
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Import Your Data
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Upload your dataset files or paste raw data directly. Supported formats: <span className="font-semibold text-foreground/70">.csv</span>, <span className="font-semibold text-foreground/70">.xlsx</span>, <span className="font-semibold text-foreground/70">.parquet</span>, and <span className="font-semibold text-foreground/70">.json</span>.
                    </p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative">
                    {/* Panel 1: File Upload */}
                    <Card
                        className={cn(
                            "border-2 border-dashed transition-all shadow-sm overflow-hidden group cursor-pointer",
                            isDragging
                                ? "border-primary bg-primary/5 scale-[1.01] shadow-primary/20 shadow-lg"
                                : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls,.parquet,.json"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isProcessing}
                        />
                        <CardContent className="flex flex-col items-center justify-center text-center py-16 px-8 gap-6">
                            <div className={cn(
                                "p-6 rounded-3xl transition-all",
                                isDragging ? "bg-primary/20" : "bg-muted/40 group-hover:bg-primary/10"
                            )}>
                                {isProcessing ? (
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                ) : (
                                    <FileUp className={cn("h-10 w-10 transition-all", isDragging ? "text-primary scale-110" : "text-muted-foreground/50 group-hover:text-primary")} />
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className={cn("text-base font-black tracking-tight transition-colors", isDragging ? "text-primary" : "text-foreground/70 group-hover:text-foreground")}>
                                    {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                                </p>
                                <p className="text-[11px] text-muted-foreground/50 font-medium">
                                    Supports CSV, Excel, Parquet &amp; JSON
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.CSV</Badge>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.XLSX</Badge>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.PARQUET</Badge>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.JSON</Badge>
                            </div>
                            <Button
                                variant="secondary"
                                className="h-10 px-6 font-bold text-xs rounded-xl shadow-sm pointer-events-none"
                                disabled={isProcessing}
                            >
                                {isProcessing ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</> : <>Browse Files</>}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* OR Divider */}
                    <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 z-10 pointer-events-none">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent to-border/60" />
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border/60 shadow-md">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">or</span>
                        </div>
                        <div className="w-px h-16 bg-gradient-to-t from-transparent to-border/60" />
                    </div>

                    {/* Panel 2: Raw Paste */}
                    <Card className="border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors shadow-sm overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Code className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Raw Stream Injection</CardTitle>
                                    <CardDescription className="text-xs">Directly paste text streams or CSV fragments.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Dataset Name</Label>
                                <Input
                                    placeholder="e.g. Sales Data Q1 2025"
                                    value={rawDataName}
                                    onChange={(e) => setRawDataName(e.target.value)}
                                    disabled={isProcessing}
                                    className="h-9 text-xs bg-background border-border/60 rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Raw CSV Data</Label>
                                <textarea
                                    className="w-full h-[128px] bg-background border border-border/60 rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/30 transition-all"
                                    placeholder={`col1,col2,col3\nval1,val2,val3`}
                                    value={rawData}
                                    onChange={(e) => setRawData(e.target.value)}
                                    disabled={isProcessing}
                                />
                            </div>
                            <Button
                                className="w-full h-11 font-bold rounded-lg shadow-sm"
                                variant="secondary"
                                onClick={handleRawDataPaste}
                                disabled={isProcessing || !rawData.trim()}
                            >
                                {isProcessing ? <Loader2 className="mr-2.5 h-4 w-4 animate-spin" /> : <Plus className="mr-2.5 h-4 w-4 text-primary" />}
                                Initialize From Stream
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
