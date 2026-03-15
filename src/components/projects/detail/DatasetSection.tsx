import React from 'react';
import { 
    FileSpreadsheet, 
    Upload, 
    Eye, 
    MoreVertical, 
    Trash2, 
    FileUp, 
    Table, 
    Code, 
    Layers, 
    Columns, 
    ChevronDown, 
    Info, 
    BarChart3,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Project, DatasetPreview } from "@/types/project";

interface DatasetSectionProps {
    project: Project;
    selectedDatasetId: number | string | null;
    previewData: DatasetPreview | null;
    visibleColumns: string[];
    setVisibleColumns: (cols: string[]) => void;
    isPreviewLoading: boolean;
    rowCount: number;
    setRowCount: (count: number) => void;
    handleViewPreview: (id: number | string, count: number) => void;
    handleDeleteDataset: (id: number | string) => void;
    handleExport: (format: string) => void;
    setActiveTab: (tab: string) => void;
}

export const DatasetSection: React.FC<DatasetSectionProps> = ({
    project,
    selectedDatasetId,
    previewData,
    visibleColumns,
    setVisibleColumns,
    isPreviewLoading,
    rowCount,
    setRowCount,
    handleViewPreview,
    handleDeleteDataset,
    handleExport,
    setActiveTab
}) => {
    return (
        <div className="space-y-12">
            <div className="space-y-8 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1.5">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                            STEP 2
                        </Badge>
                        <h2 className="text-3xl font-black tracking-tight">Your Datasets</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            Click <strong className="text-foreground/70">Inspect</strong> on any row to load a live preview below.
                        </p>
                    </div>
                    {project.datasets && project.datasets.length > 0 && (
                        <Badge className="shrink-0 text-xs font-black px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                            {project.datasets.length} {project.datasets.length === 1 ? 'file' : 'files'}
                        </Badge>
                    )}
                </div>
            </div>

            <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Dataset Files</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:bg-primary/5 gap-1.5"
                        onClick={() => setActiveTab('Import')}
                    >
                        <Upload className="h-3 w-3" /> Add Dataset
                    </Button>
                </div>

                {project.datasets && project.datasets.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="bg-muted/30 text-muted-foreground/60 font-black uppercase tracking-widest text-[9px] border-b border-border/40">
                                    <th className="px-5 py-3.5 font-black">Name</th>
                                    <th className="px-5 py-3.5 font-black">Format</th>
                                    <th className="px-5 py-3.5 font-black">Rows</th>
                                    <th className="px-5 py-3.5 font-black">Columns</th>
                                    <th className="px-5 py-3.5 text-right font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {project.datasets.map((ds) => (
                                    <tr key={ds.id} className={cn(
                                        "hover:bg-primary/5 transition-colors group cursor-default border-b border-border/10 last:border-0",
                                        selectedDatasetId === ds.id && "bg-primary/5"
                                    )}>
                                        <td className="px-5 py-3.5 font-bold text-foreground/80">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    selectedDatasetId === ds.id
                                                        ? "bg-primary/15 text-primary"
                                                        : "bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground/60"
                                                )}>
                                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <p className="truncate max-w-[200px] text-xs font-bold" title={ds.name}>{ds.name}</p>
                                                    <p className="text-[10px] text-muted-foreground/40 font-medium">
                                                        {new Date(ds.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-muted/30 border-border/40 text-muted-foreground">
                                                {ds.file_format || "CSV"}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-foreground/60 font-bold">
                                            {ds.row_count?.toLocaleString() || "—"}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-foreground/60 font-bold">
                                            {ds.column_count?.toLocaleString() || "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant={selectedDatasetId === ds.id ? "default" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "h-7 px-3 text-[10px] font-bold uppercase tracking-widest",
                                                        selectedDatasetId !== ds.id && "hover:text-primary hover:bg-primary/5"
                                                    )}
                                                    onClick={() => handleViewPreview(ds.id, rowCount)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1.5" />
                                                    {selectedDatasetId === ds.id ? 'Active' : 'Inspect'}
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-40 hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem onClick={() => handleViewPreview(ds.id, rowCount)} className="gap-2 text-xs">
                                                            <Eye className="h-3.5 w-3.5" /> Inspect Dataset
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 py-2">Export As</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 text-xs">
                                                            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 text-xs">
                                                            <Table className="h-3.5 w-3.5" /> Excel
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2 text-xs">
                                                            <Code className="h-3.5 w-3.5" /> JSON
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteDataset(ds.id)}
                                                            className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-5 bg-muted/30 rounded-2xl text-muted-foreground/30">
                            <Layers className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/50">No datasets yet</p>
                            <p className="text-xs text-muted-foreground/50 max-w-xs font-medium">Head to the Import tab to upload a file or paste raw data.</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-bold gap-2" onClick={() => setActiveTab('Import')}>
                            <Upload className="h-3.5 w-3.5" /> Import Data
                        </Button>
                    </div>
                )}
            </Card>

            {/* Dataframe Preview Section */}
            <div className="space-y-5 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                            <Table className="h-4 w-4 text-primary" />
                            Data Preview
                            {selectedDatasetId && (
                                <span className="text-xs font-bold text-muted-foreground/50 normal-case tracking-normal">
                                    — {project.datasets?.find(d => d.id === selectedDatasetId)?.name}
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 font-medium">
                            {selectedDatasetId ? 'Showing a live row sample from the selected dataset.' : 'Click Inspect on a dataset above to load its preview here.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {previewData && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                        <Columns className="h-3.5 w-3.5 text-primary" />
                                        Schema ({visibleColumns.length})
                                        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Column Visibility</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {previewData.columns.map((col) => (
                                        <DropdownMenuCheckboxItem
                                            key={col}
                                            checked={visibleColumns.includes(col)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setVisibleColumns([...visibleColumns, col]);
                                                else setVisibleColumns(visibleColumns.filter(c => c !== col));
                                            }}
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-xs font-medium py-2"
                                        >
                                            {col}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 w-24 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2 justify-between">
                                    <span>{rowCount} items</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-24">
                                {[10, 25, 50, 100].map((count) => (
                                    <DropdownMenuItem
                                        key={count}
                                        onClick={() => {
                                            setRowCount(count);
                                            if (selectedDatasetId) handleViewPreview(selectedDatasetId, count);
                                        }}
                                        className={cn("text-xs font-medium py-2 justify-center", rowCount === count && "bg-primary/5 text-primary")}
                                    >
                                        {count}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedDatasetId && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                        <FileUp className="h-3.5 w-3.5 text-primary rotate-180" />
                                        Export
                                        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Format</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-3">
                                        <FileSpreadsheet className="h-4 w-4 opacity-40" /> Export CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-3">
                                        <Table className="h-4 w-4 opacity-40" /> Export Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('json')} className="gap-3">
                                        <Code className="h-4 w-4 opacity-40" /> Export JSON
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <Card className="border-border/60 shadow-sm overflow-hidden bg-background/50 relative min-h-[400px]">
                    {isPreviewLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] z-50">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-9 w-9 text-primary animate-spin" />
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground animate-pulse">Loading preview…</p>
                            </div>
                        </div>
                    )}

                    {previewData ? (
                        <div className="space-y-0">
                            <div className="overflow-x-auto max-h-[600px] border-b border-border/40 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-muted/60 backdrop-blur-md border-b border-border/60 shadow-sm">
                                            {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 border-r border-border/20 last:border-0 min-w-[150px]">
                                                    <div className="flex items-center justify-between">
                                                        {col}
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {previewData.rows?.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                    <td key={col} className="px-6 py-3.5 whitespace-nowrap border-r border-border/20 last:border-0 font-mono text-[11px] text-foreground/70 group-hover:text-foreground">
                                                        {String(row[col] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-3 text-[10px] font-bold text-muted-foreground/60 flex justify-between items-center bg-muted/20 border-t border-border/30">
                                <div className="flex items-center gap-5">
                                    <span>
                                        <span className="text-muted-foreground/40 mr-1">Showing</span>
                                        <span className="text-primary font-black">{previewData.rows?.length || 0}</span>
                                        <span className="text-muted-foreground/40 ml-1">rows</span>
                                    </span>
                                    {previewData.metadata?.shape && (
                                        <span>
                                            <span className="text-muted-foreground/40 mr-1">Shape</span>
                                            <span className="font-mono font-bold text-foreground/60">{previewData.metadata.shape[0]} × {previewData.metadata.shape[1]}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground/40">Total</span>
                                    <span className="text-foreground/80 px-2 py-0.5 bg-background border border-border/60 rounded-md font-bold shadow-sm">{previewData.total_rows_hint.toLocaleString()} rows</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 border-t border-border/40">
                                {previewData.metadata?.dtypes && (
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Info className="h-4 w-4 text-primary" />
                                            </div>
                                            <h4 className="text-sm font-black tracking-tight">Column Types</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(previewData.metadata.dtypes).map(([col, type]) => (
                                                <div key={col} className="p-3 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all group">
                                                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1 truncate" title={col}>{col}</p>
                                                    <p className="font-mono text-[11px] font-bold text-primary group-hover:scale-105 transition-transform origin-left">{String(type)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewData.summary && Object.keys(previewData.summary).length > 0 && (
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <BarChart3 className="h-4 w-4 text-primary" />
                                            </div>
                                            <h4 className="text-sm font-black tracking-tight">Statistical Summary</h4>
                                        </div>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {Object.entries(previewData.summary).map(([col, stats]) => (
                                                <div key={col} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10">
                                                    <div className="bg-muted/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 border-b border-border/40">
                                                        {col}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-px bg-border/20">
                                                        {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                            <div key={stat} className="flex justify-between items-center bg-background p-3 text-[11px] font-medium">
                                                                <span className="text-muted-foreground/60 capitalize">{stat}</span>
                                                                <span className="font-mono font-bold text-foreground/80">{typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(val)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="p-4 bg-muted/40 rounded-full text-muted-foreground/30">
                                <Table className="h-10 w-10" />
                            </div>
                            <p className="text-sm font-bold text-foreground/50">No preview active</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
