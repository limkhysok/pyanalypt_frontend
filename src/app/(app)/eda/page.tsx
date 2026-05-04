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
    MoreHorizontal,
    LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEda } from "./use-eda";
import { CorrelationTab } from "./_components/CorrelationTab";
import { DistributionTab } from "./_components/DistributionTab";
import { ValueCountsTab } from "./_components/ValueCountsTab";
import { CrosstabTab } from "./_components/CrosstabTab";
import { OutlierSummaryTab } from "./_components/OutlierSummaryTab";
import { MissingHeatmapTab } from "./_components/MissingHeatmapTab";
import { PairwiseTab } from "./_components/PairwiseTab";
import { AssociationTab } from "./_components/AssociationTab";

const PRIMARY_TABS = [
    { value: "correlation",  icon: Grid3X3,      label: "Correlation" },
    { value: "association",  icon: LayoutGrid,   label: "Association" },
    { value: "distribution", icon: BarChart2,     label: "Distribution" },
    { value: "value-counts", icon: List,          label: "Value Counts" },
    { value: "crosstab",     icon: Table2,        label: "Cross-tab" },
] as const;

const MORE_TABS = [
    { value: "outlier-summary",  icon: AlertTriangle, label: "Outliers" },
    { value: "missing-heatmap",  icon: Layers,        label: "Missing" },
    { value: "pairwise",         icon: ScatterChart,  label: "Scatter" },
] as const;

export default function EDAPage() {
    const {
        datasets,
        selectedId,
        setSelectedId,
        activeTab,
        setActiveTab,
        loadingDatasets,
        loadingTabId,
        setLoadingTabId,
        allColumns,
        numericColumns,
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
        association,
        setAssociation,
        selectedName,
    } = useEda();

    const [isPending, startTransition] = React.useTransition();

    function handleTabChange(val: string) {
        startTransition(() => setActiveTab(val));
    }

    function tabLoading(tabId: string) { return loadingTabId === tabId; }
    function setTabLoading(tabId: string) { return (v: boolean) => setLoadingTabId(v ? tabId : null); }

    const isLoading = tabLoading(activeTab) || isPending;
    const moreIsActive = MORE_TABS.some((t) => t.value === activeTab);
    const activeMore = MORE_TABS.find((t) => t.value === activeTab);

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

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

                {/* ── Action bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-stretch border-b border-border mb-4">
                    <div className="flex items-stretch min-w-0 overflow-x-auto">

                        {/* Primary tabs */}
                        {PRIMARY_TABS.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleTabChange(value)}
                                className={cn(
                                    "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                    activeTab === value
                                        ? "text-blue-600 font-bold border-blue-600 bg-blue-50/60"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-slate-50 border-transparent"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}

                        <div aria-hidden className="hidden sm:flex items-center px-1.5">
                            <span className="h-4 w-px bg-border/60 shrink-0" />
                        </div>

                        {/* More dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                        moreIsActive
                                            ? "text-blue-600 font-bold border-blue-600 bg-blue-50/60"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-slate-50 border-transparent"
                                    )}
                                >
                                    {moreIsActive && activeMore
                                        ? <activeMore.icon className="h-3.5 w-3.5 shrink-0" />
                                        : <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
                                    }
                                    {activeMore?.label ?? "More"}
                                    <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-none w-48 shadow-md">
                                {MORE_TABS.map(({ value, icon: Icon, label }) => (
                                    <DropdownMenuItem
                                        key={value}
                                        onClick={() => handleTabChange(value)}
                                        className={cn(
                                            "rounded-none gap-2 text-xs cursor-pointer",
                                            activeTab === value && "text-blue-600 font-bold bg-blue-50/60"
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

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
                                        : datasets.map((d) => (
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
                    <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {/* ── Loading state (active tab only) ── */}
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
                                ? <CorrelationTab datasetId={Number(selectedId)} data={correlation} onUpdate={setCorrelation} loading={tabLoading("correlation")} setLoading={setTabLoading("correlation")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="association">
                            {association
                                ? <AssociationTab datasetId={Number(selectedId)} data={association} onUpdate={setAssociation} loading={tabLoading("association")} setLoading={setTabLoading("association")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="distribution">
                            {distribution
                                ? <DistributionTab datasetId={Number(selectedId)} data={distribution} onUpdate={setDistribution} loading={tabLoading("distribution")} setLoading={setTabLoading("distribution")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No numeric columns found.</div>
                            }
                        </TabsContent>

                        <TabsContent value="value-counts">
                            {valueCounts
                                ? <ValueCountsTab datasetId={Number(selectedId)} data={valueCounts} onUpdate={setValueCounts} loading={tabLoading("value-counts")} setLoading={setTabLoading("value-counts")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="crosstab">
                            <CrosstabTab datasetId={Number(selectedId)} columns={allColumns} loading={tabLoading("crosstab")} setLoading={setTabLoading("crosstab")} />
                        </TabsContent>

                        <TabsContent value="outlier-summary">
                            {outlierSummary
                                ? <OutlierSummaryTab datasetId={Number(selectedId)} data={outlierSummary} onUpdate={setOutlierSummary} loading={tabLoading("outlier-summary")} setLoading={setTabLoading("outlier-summary")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No numeric columns found.</div>
                            }
                        </TabsContent>

                        <TabsContent value="missing-heatmap">
                            {missingHeatmap
                                ? <MissingHeatmapTab datasetId={Number(selectedId)} data={missingHeatmap} onUpdate={setMissingHeatmap} loading={tabLoading("missing-heatmap")} setLoading={setTabLoading("missing-heatmap")} />
                                : <div className="border bg-muted/5 h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
                            }
                        </TabsContent>

                        <TabsContent value="pairwise">
                            <PairwiseTab datasetId={Number(selectedId)} numericColumns={numericColumns} loading={tabLoading("pairwise")} setLoading={setTabLoading("pairwise")} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
