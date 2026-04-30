"use client";

import React from "react";
import { TrendingUp, Database, ChevronDown, BarChart2, LineChart, ScatterChart, DatabaseZap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useVisualization } from "./use-visualization";
import { BarChartPanel } from "./_components/BarChartPanel";
import { LineChartPanel } from "./_components/LineChartPanel";
import { ScatterChartPanel } from "./_components/ScatterChartPanel";
import { HistogramPanel } from "./_components/HistogramPanel";

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
        <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-mono">Visualization</h1>
                    <p className="text-sm text-muted-foreground mt-1">Build charts from your cleaned datasets</p>
                </div>
            </div>

            <Tabs value={chartType} onValueChange={v => setChartType(v as typeof chartType)} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="rounded-none h-auto">
                        <TabsTrigger value="bar" className="gap-2 rounded-none">
                            <BarChart2 className="h-3.5 w-3.5" /> Bar
                        </TabsTrigger>
                        <TabsTrigger value="line" className="gap-2 rounded-none">
                            <LineChart className="h-3.5 w-3.5" /> Line
                        </TabsTrigger>
                        <TabsTrigger value="scatter" className="gap-2 rounded-none">
                            <ScatterChart className="h-3.5 w-3.5" /> Scatter
                        </TabsTrigger>
                        <TabsTrigger value="histogram" className="gap-2 rounded-none">
                            <BarChart2 className="h-3.5 w-3.5" /> Histogram
                        </TabsTrigger>
                    </TabsList>

                    {/* Dataset picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 min-w-44 justify-between text-sm rounded-none" disabled={loadingDatasets}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-36">
                                        {loadingDatasets ? "Loading…" : selectedName ?? "Select dataset"}
                                    </span>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-none">
                            <DropdownMenuLabel className="text-[13px] font-semibold text-muted-foreground">Dataset</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={selectedId} onValueChange={setSelectedId}>
                                {datasets.length === 0
                                    ? <DropdownMenuRadioItem value="" disabled className="text-sm opacity-50">No datasets found</DropdownMenuRadioItem>
                                    : datasets.map(d => (
                                        <DropdownMenuRadioItem key={d.id} value={String(d.id)} className="text-sm truncate cursor-pointer">
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))
                                }
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Empty state — no dataset selected */}
                {!selectedId && (
                    <div className="border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {/* Loading inspect */}
                {selectedId && isLoading && (
                    <div className="border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                        <p className="text-sm">Loading column info…</p>
                    </div>
                )}

                {/* Chart panels */}
                {selectedId && !isLoading && hasColumns && (
                    <>
                        <TabsContent value="bar">
                            <BarChartPanel
                                datasetId={datasetId}
                                numericColumns={numericColumns}
                                categoricalColumns={categoricalColumns}
                            />
                        </TabsContent>
                        <TabsContent value="line">
                            <LineChartPanel
                                datasetId={datasetId}
                                numericColumns={numericColumns}
                                allColumns={allColumns}
                            />
                        </TabsContent>
                        <TabsContent value="scatter">
                            <ScatterChartPanel
                                datasetId={datasetId}
                                numericColumns={numericColumns}
                                categoricalColumns={categoricalColumns}
                            />
                        </TabsContent>
                        <TabsContent value="histogram">
                            <HistogramPanel
                                datasetId={datasetId}
                                numericColumns={numericColumns}
                            />
                        </TabsContent>
                    </>
                )}

                {/* No numeric columns */}
                {selectedId && !isLoading && !hasColumns && (
                    <div className="border bg-muted/5 h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <p className="text-sm font-medium">No columns found</p>
                        <p className="text-xs opacity-70">This dataset may be empty or failed to load.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
}
