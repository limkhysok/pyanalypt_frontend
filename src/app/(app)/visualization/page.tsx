"use client";

import React from "react";
import { BarChart2, LineChart, ScatterChart, Database, ChevronDown, DatabaseZap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuRadioGroup, DropdownMenuRadioItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVisualization } from "./use-visualization";
import { BarChartPanel } from "./_components/BarChartPanel";
import { LineChartPanel } from "./_components/LineChartPanel";
import { ScatterChartPanel } from "./_components/ScatterChartPanel";
import { HistogramPanel } from "./_components/HistogramPanel";

const CHART_TABS = [
    { value: "bar",       icon: BarChart2,    label: "Bar" },
    { value: "line",      icon: LineChart,    label: "Line" },
    { value: "scatter",   icon: ScatterChart, label: "Scatter" },
    { value: "histogram", icon: BarChart2,    label: "Histogram" },
] as const;

export default function VisualizationPage() {
    const {
        datasets,
        selectedId,
        setSelectedId,
        selectedName,
        chartType,
        setChartType,
        loadingDatasets,
        loadingInspect,
        numericColumns,
        categoricalColumns,
        allColumns,
    } = useVisualization();

    const datasetId = Number(selectedId);
    const hasColumns = allColumns.length > 0;
    const isLoading = loadingInspect;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BarChart2 className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">Visualization</h1>
                        <span className="text-sm text-muted-foreground leading-none">/ Build charts from your cleaned datasets</span>
                    </div>
                </div>
            </div>

            <Tabs value={chartType} onValueChange={v => setChartType(v as typeof chartType)} className="w-full">

                {/* ── Action bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-stretch border-b border-border mb-4">
                    <div className="flex items-stretch min-w-0 overflow-x-auto">
                        {CHART_TABS.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setChartType(value as typeof chartType)}
                                className={cn(
                                    "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                    chartType === value
                                        ? "text-primary font-bold border-primary bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dataset picker */}
                    <div className="sm:ml-auto flex items-center py-2 sm:py-1.5 sm:pl-4 border-t sm:border-t-0 border-border/40 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2 w-full sm:w-auto sm:min-w-44 min-w-0 justify-between text-xs rounded-none" disabled={loadingDatasets}>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate max-w-36">
                                            {loadingDatasets ? "Loading…" : selectedName ?? "Select dataset"}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-none shadow-md">
                                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Dataset</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={selectedId} onValueChange={setSelectedId}>
                                    {datasets.length === 0
                                        ? <DropdownMenuRadioItem value="" disabled className="text-xs opacity-50">No datasets found</DropdownMenuRadioItem>
                                        : datasets.map(d => (
                                            <DropdownMenuRadioItem key={d.id} value={String(d.id)} className="text-xs truncate cursor-pointer">
                                                {d.file_name}
                                            </DropdownMenuRadioItem>
                                        ))
                                    }
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ── Empty state — no dataset ── */}
                {!selectedId && (
                    <div className="border border-border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {/* ── Loading ── */}
                {selectedId && isLoading && (
                    <div className="border border-border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                        <p className="text-sm">Loading column info…</p>
                    </div>
                )}

                {/* ── Chart panels ── */}
                {selectedId && !isLoading && hasColumns && (
                    <>
                        <TabsContent value="bar">
                            <BarChartPanel key={datasetId} datasetId={datasetId} numericColumns={numericColumns} allColumns={allColumns} />
                        </TabsContent>
                        <TabsContent value="line">
                            <LineChartPanel key={datasetId} datasetId={datasetId} numericColumns={numericColumns} allColumns={allColumns} />
                        </TabsContent>
                        <TabsContent value="scatter">
                            <ScatterChartPanel key={datasetId} datasetId={datasetId} numericColumns={numericColumns} categoricalColumns={categoricalColumns} />
                        </TabsContent>
                        <TabsContent value="histogram">
                            <HistogramPanel key={datasetId} datasetId={datasetId} numericColumns={numericColumns} />
                        </TabsContent>
                    </>
                )}

                {/* ── No columns ── */}
                {selectedId && !isLoading && !hasColumns && (
                    <div className="border border-slate-200 bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <p className="text-sm font-medium">No columns found</p>
                        <p className="text-xs opacity-70">This dataset may be empty or failed to load.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
}
