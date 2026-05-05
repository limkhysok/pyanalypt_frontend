"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
    FlaskConical, Database, ChevronDown, Table2, Info, BarChart2, DatabaseZap,
    Trash2, Eraser, Activity, Columns2, Filter, ShieldCheck, Wand2, MoreHorizontal,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDatalab } from "./use-datalab";
import { PreviewTab } from "./_components/PreviewTab";
import { InspectTab } from "./_components/InspectTab";
import { DescribeTab } from "./_components/DescribeTab";
import { PreviewTabSkeleton } from "./_components/PreviewTabSkeleton";
import { InspectTabSkeleton } from "./_components/InspectTabSkeleton";
import { DescribeTabSkeleton } from "./_components/DescribeTabSkeleton";
import { DropDuplicatesDialog } from "./_components/DropDuplicatesDialog";
import { NullHandlingDialog } from "./_components/NullHandlingDialog";
import { ValidateFormulaDialog } from "./_components/ValidateFormulaDialog";
import { OutlierDialog } from "./_components/OutlierDialog";
import { ColumnToolsDialog } from "./_components/ColumnToolsDialog";
import { CleanFilterDialog } from "./_components/CleanFilterDialog";
import { TransformDialog } from "./_components/TransformDialog";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabDef = { value: string; icon: LucideIcon; label: string };

const EXPLORE_TABS: TabDef[] = [
    { value: "preview",  icon: Table2,    label: "Data Preview" },
    { value: "inspect",  icon: Info,      label: "Inspect" },
    { value: "describe", icon: BarChart2, label: "Describe" },
];

const CLEAN_TABS: TabDef[] = [
    { value: "drop-dups", icon: Trash2,   label: "Drop Duplicates" },
    { value: "nulls",     icon: Eraser,   label: "Handle Nulls" },
    { value: "outliers",  icon: Activity, label: "Handle Outliers" },
];

const ADVANCED_TABS: TabDef[] = [
    { value: "col-tools", icon: Columns2,    label: "Column Tools" },
    { value: "clean",     icon: Filter,      label: "Clean & Filter" },
    { value: "formula",   icon: ShieldCheck, label: "Formula Audit" },
    { value: "transform", icon: Wand2,       label: "Transform" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

type Dataset = { id: number; file_name: string };

function ActionBar({ activeTab, onTabChange, datasets, selectedId, onSelectDataset, loadingDatasets, selectedName, onUndo }: Readonly<{
    activeTab: string;
    onTabChange: (val: string) => void;
    datasets: Dataset[];
    selectedId: string;
    onSelectDataset: (id: string) => void;
    loadingDatasets: boolean;
    selectedName: string | null | undefined;
    onUndo: () => void;
}>) {
    const cleanIsActive = CLEAN_TABS.some((t) => t.value === activeTab);
    const activeClean = CLEAN_TABS.find((t) => t.value === activeTab);
    const advancedIsActive = ADVANCED_TABS.some((t) => t.value === activeTab);
    const activeAdvanced = ADVANCED_TABS.find((t) => t.value === activeTab);

    return (
        <div className="flex flex-col sm:flex-row sm:items-stretch border-b border-border mb-4">

            <div className="flex items-stretch min-w-0 overflow-x-auto">

                {/* Group A — Exploration */}
                {EXPLORE_TABS.map(({ value, icon: Icon, label }) => {
                    const isActive = activeTab === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onTabChange(value)}
                            className={cn(
                                "px-3 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                isActive
                                    ? "text-primary font-bold border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                })}

                <div aria-hidden className="hidden sm:flex items-center px-1.5">
                    <span className="h-4 w-px bg-border/60 shrink-0" />
                </div>

                {/* Group B — Cleaning (dropdown) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "px-3 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                cleanIsActive
                                    ? "text-orange-600 dark:text-orange-400 font-bold border-orange-500 bg-orange-50/40 dark:bg-orange-950/20"
                                    : "text-orange-500/60 dark:text-orange-400/50 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 border-transparent"
                            )}
                        >
                            {cleanIsActive && activeClean
                                ? <activeClean.icon className="h-3.5 w-3.5 shrink-0" />
                                : <Eraser className="h-3.5 w-3.5 shrink-0" />
                            }
                            {activeClean?.label ?? "Cleaning"}
                            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none w-48 shadow-md">
                        {CLEAN_TABS.map(({ value, icon: Icon, label }) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => onTabChange(value)}
                                className={cn(
                                    "rounded-none gap-2 text-xs cursor-pointer",
                                    activeTab === value && "text-orange-600 dark:text-orange-400 font-bold bg-orange-50/60 dark:bg-orange-950/20"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div aria-hidden className="hidden sm:flex items-center px-1.5">
                    <span className="h-4 w-px bg-border/60 shrink-0" />
                </div>

                {/* Group C — Advanced (always dropdown) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "px-3 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                advancedIsActive
                                    ? "text-primary font-bold border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                            )}
                        >
                            {advancedIsActive && activeAdvanced
                                ? <activeAdvanced.icon className="h-3.5 w-3.5 shrink-0" />
                                : <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
                            }
                            {activeAdvanced?.label ?? "Advanced"}
                            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none w-48 shadow-md">
                        {ADVANCED_TABS.map(({ value, icon: Icon, label }) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => onTabChange(value)}
                                className={cn(
                                    "rounded-none gap-2 text-xs cursor-pointer",
                                    activeTab === value && "text-primary font-bold bg-primary/5"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div aria-hidden className="hidden sm:flex items-center px-1.5">
                    <span className="h-4 w-px bg-border/60 shrink-0" />
                </div>

                {/* Undo Button */}
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={!selectedId}
                    className="px-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 border-b-2 border-transparent transition-all whitespace-nowrap focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo last action"
                >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden lg:inline">Undo</span>
                </button>

            </div>

            {/* Dataset picker */}
            <div className="sm:ml-auto flex items-center py-2 sm:py-1.5 sm:pl-4 border-t sm:border-t-0 border-border/40 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 w-full sm:w-auto sm:min-w-44 min-w-0 justify-between text-xs rounded-none" disabled={loadingDatasets}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-36">
                                    {loadingDatasets ? "Loading…" : (selectedName ?? "Select dataset")}
                                </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-none shadow-md">
                        <DropdownMenuLabel className="text-[13px] font-semibold text-muted-foreground">
                            Dataset
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={selectedId} onValueChange={onSelectDataset}>
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

        </div>
    );
}

function SkeletonFor({ tab }: Readonly<{ tab: string }>) {
    if (tab === "inspect") return <InspectTabSkeleton />;
    if (tab === "describe") return <DescribeTabSkeleton />;
    return <PreviewTabSkeleton />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DataLabPage() {
    const {
        datasets,
        selectedId,
        setSelectedId,
        activeTab,
        setActiveTab,
        preview,
        inspect,
        describe,
        loadingDatasets,
        loadingData,
        refetchInspect,
        refetchAll,
        revertDataset,
        selectedName,
        setLimit,
    } = useDatalab();

    const [isPending, startTransition] = React.useTransition();
    const [nextTab, setNextTab] = React.useState<string | null>(null);

    function handleTabChange(val: string) {
        setNextTab(val);
        startTransition(() => setActiveTab(val));
    }

    const isLoading = loadingData || isPending;
    const skeletonTab = (isPending && nextTab) ? nextTab : activeTab;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FlaskConical className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">DataLab</h1>
                        <span className="text-sm text-muted-foreground leading-none">/ Inspect and preview your datasets</span>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                <ActionBar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    datasets={datasets}
                    selectedId={selectedId}
                    onSelectDataset={setSelectedId}
                    loadingDatasets={loadingDatasets}
                    selectedName={selectedName}
                    onUndo={() => revertDataset({ undo: true })}
                />

                {selectedId && isLoading && <SkeletonFor tab={skeletonTab} />}

                {!selectedId && (
                    <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {selectedId && !isLoading && (
                    <>
                        <TabsContent value="preview">
                            {preview
                                ? <PreviewTab data={preview} datasetId={Number(selectedId)} inspect={inspect ?? undefined} onRefetchAll={refetchAll} onLimitChange={setLimit} />
                                : <div className="border bg-muted/5 h-105" />
                            }
                        </TabsContent>
                        <TabsContent value="inspect">
                            {inspect && preview
                                ? <InspectTab data={inspect} preview={preview} datasetId={Number(selectedId)} onRefetchAll={refetchAll} />
                                : <div className="border bg-muted/5 h-105" />
                            }
                        </TabsContent>
                        <TabsContent value="describe">
                            {describe && preview
                                ? <DescribeTab data={describe} preview={preview} />
                                : <div className="border bg-muted/5 h-105" />
                            }
                        </TabsContent>
                        <TabsContent value="drop-dups">
                            {inspect ? <DropDuplicatesDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns.map(c => ({ column: c.column, is_unique: c.is_unique }))} onSuccess={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="nulls">
                            {inspect ? <NullHandlingDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onRefetchInspect={refetchInspect} onRefetchAll={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="formula">
                            {inspect ? <ValidateFormulaDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onSuccess={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="outliers">
                            {inspect ? <OutlierDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onRefetchAll={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="col-tools">
                            {inspect ? <ColumnToolsDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onRefetchAll={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="clean">
                            {inspect ? <CleanFilterDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onRefetchAll={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                        <TabsContent value="transform">
                            {inspect ? <TransformDialog asPanel datasetId={Number(selectedId)} columns={inspect.info.columns} onRefetchAll={refetchAll} /> : <div className="border bg-muted/5 h-105" />}
                        </TabsContent>
                    </>
                )}
            </Tabs>

        </div>
    );
}
