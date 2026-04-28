"use client";

import React from "react";
import {
    TrendingUp,
    Database,
    ChevronDown,
    Grid3X3,
    BarChart2,
    List,
    Table2,
    AlertTriangle,
    Layers,
    ScatterChart,
    DatabaseZap,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEda } from "./use-eda";
import { CorrelationTab } from "./_components/CorrelationTab";
import { DistributionTab } from "./_components/DistributionTab";
import { ValueCountsTab } from "./_components/ValueCountsTab";
import { CrosstabTab } from "./_components/CrosstabTab";
import { OutlierSummaryTab } from "./_components/OutlierSummaryTab";
import { MissingHeatmapTab } from "./_components/MissingHeatmapTab";
import { PairwiseTab } from "./_components/PairwiseTab";

export default function EDAPage() {
    const {
        datasets,
        selectedId,
        setSelectedId,
        activeTab,
        setActiveTab,
        loadingDatasets,
        loading,
        setLoading,
        correlation,
        setCorrelation,
        distribution,
        setDistribution,
        valueCounts,
        setValueCounts,
        outlierSummary,
        setOutlierSummary,
        missingHeatmap,
        setMissingHeatmap,
        selectedName,
    } = useEda();

    const [isPending, startTransition] = React.useTransition();

    function handleTabChange(val: string) {
        startTransition(() => setActiveTab(val));
    }

    const isLoading = loading || isPending;

    // Derive numeric columns from correlation response (they share the same set)
    const numericColumns = correlation?.columns ?? [];
    // All columns — we don't have a separate inspect call here, so fall back to numeric
    const allColumns = numericColumns;

    return (
        <div className="flex flex-col gap-6 p-8">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-mono">EDA</h1>
                    <p className="text-sm text-muted-foreground mt-1">Exploratory Data Analysis — visualise distributions, correlations, and more</p>
                </div>
            </div>

            {/* ── Content ── */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <TabsList className="rounded-none flex-wrap h-auto gap-0">
                        <TabsTrigger value="correlation" className="gap-1.5 rounded-none text-xs">
                            <Grid3X3 className="h-3 w-3" /> Correlation
                        </TabsTrigger>
                        <TabsTrigger value="distribution" className="gap-1.5 rounded-none text-xs">
                            <BarChart2 className="h-3 w-3" /> Distribution
                        </TabsTrigger>
                        <TabsTrigger value="value-counts" className="gap-1.5 rounded-none text-xs">
                            <List className="h-3 w-3" /> Value Counts
                        </TabsTrigger>
                        <TabsTrigger value="crosstab" className="gap-1.5 rounded-none text-xs">
                            <Table2 className="h-3 w-3" /> Cross-tab
                        </TabsTrigger>
                        <TabsTrigger value="outlier-summary" className="gap-1.5 rounded-none text-xs">
                            <AlertTriangle className="h-3 w-3" /> Outliers
                        </TabsTrigger>
                        <TabsTrigger value="missing-heatmap" className="gap-1.5 rounded-none text-xs">
                            <Layers className="h-3 w-3" /> Missing
                        </TabsTrigger>
                        <TabsTrigger value="pairwise" className="gap-1.5 rounded-none text-xs">
                            <ScatterChart className="h-3 w-3" /> Scatter
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
                                    : datasets.map((d) => (
                                        <DropdownMenuRadioItem key={d.id} value={String(d.id)} className="text-sm truncate cursor-pointer">
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))
                                }
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ── Empty state — no dataset ── */}
                {!selectedId && (
                    <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {/* ── Loading state ── */}
                {selectedId && isLoading && (
                    <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin opacity-40" />
                        <p className="text-sm">Loading…</p>
                    </div>
                )}

                {/* ── Tab content ── */}
                {selectedId && !isLoading && (
                    <>
                        <TabsContent value="correlation">
                            {correlation
                                ? <CorrelationTab datasetId={Number(selectedId)} data={correlation} onUpdate={setCorrelation} loading={loading} setLoading={setLoading} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="distribution">
                            {distribution
                                ? <DistributionTab datasetId={Number(selectedId)} data={distribution} onUpdate={setDistribution} loading={loading} setLoading={setLoading} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No numeric columns found.</div>
                            }
                        </TabsContent>

                        <TabsContent value="value-counts">
                            {valueCounts
                                ? <ValueCountsTab datasetId={Number(selectedId)} data={valueCounts} onUpdate={setValueCounts} loading={loading} setLoading={setLoading} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="crosstab">
                            <CrosstabTab datasetId={Number(selectedId)} columns={allColumns} loading={loading} setLoading={setLoading} />
                        </TabsContent>

                        <TabsContent value="outlier-summary">
                            {outlierSummary
                                ? <OutlierSummaryTab datasetId={Number(selectedId)} data={outlierSummary} onUpdate={setOutlierSummary} loading={loading} setLoading={setLoading} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No numeric columns found.</div>
                            }
                        </TabsContent>

                        <TabsContent value="missing-heatmap">
                            {missingHeatmap
                                ? <MissingHeatmapTab datasetId={Number(selectedId)} data={missingHeatmap} onUpdate={setMissingHeatmap} loading={loading} setLoading={setLoading} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="pairwise">
                            <PairwiseTab datasetId={Number(selectedId)} numericColumns={numericColumns} loading={loading} setLoading={setLoading} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
