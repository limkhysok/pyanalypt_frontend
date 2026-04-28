"use client";

import React from "react";
import { FlaskConical, Database, ChevronDown, Table2, Info, BarChart2, DatabaseZap } from "lucide-react";
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
import { useDatalab } from "./use-datalab";
import { PreviewTab } from "./_components/PreviewTab";
import { InspectTab } from "./_components/InspectTab";
import { DescribeTab } from "./_components/DescribeTab";
import { PreviewTabSkeleton } from "./_components/PreviewTabSkeleton";
import { InspectTabSkeleton } from "./_components/InspectTabSkeleton";
import { DescribeTabSkeleton } from "./_components/DescribeTabSkeleton";

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
        selectedName,
        setLimit,
    } = useDatalab();

    const [isPending, startTransition] = React.useTransition();
    const pendingTabRef = React.useRef(activeTab);

    function handleTabChange(val: string) {
        pendingTabRef.current = val;
        startTransition(() => setActiveTab(val));
    }

    const isLoading = loadingData || isPending;
    const skeletonTab = isPending ? pendingTabRef.current : activeTab;

    return (
        <div className="flex flex-col gap-6 p-8">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <FlaskConical className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-mono">DataLab</h1>
                    <p className="text-sm text-muted-foreground mt-1">Inspect and preview your datasets</p>
                </div>
            </div>

            {/* ── Content ── */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="rounded-none">
                        <TabsTrigger value="preview" className="gap-2 rounded-none">
                            <Table2 className="h-3.5 w-3.5" /> Data Preview
                        </TabsTrigger>
                        <TabsTrigger value="inspect" className="gap-2 rounded-none">
                            <Info className="h-3.5 w-3.5" /> Inspect
                        </TabsTrigger>
                        <TabsTrigger value="describe" className="gap-2 rounded-none">
                            <BarChart2 className="h-3.5 w-3.5" /> Describe
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
                            <DropdownMenuLabel className="text-[13px] font-semibold text-muted-foreground">
                                Dataset
                            </DropdownMenuLabel>
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

                {/* ── Skeleton (dataset load or tab switch) ── */}
                {selectedId && isLoading && (() => {
                    if (skeletonTab === "inspect") return <InspectTabSkeleton />;
                    if (skeletonTab === "describe") return <DescribeTabSkeleton />;
                    return <PreviewTabSkeleton />;
                })()}

                {/* ── Empty state ── */}
                {!selectedId && (
                    <div className="border bg-muted/5 h-105 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <DatabaseZap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No dataset selected</p>
                        <p className="text-xs opacity-70">Select a dataset from the dropdown above to get started</p>
                    </div>
                )}

                {/* ── Tab content ── */}
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
                                ? <InspectTab data={inspect} preview={preview} datasetId={Number(selectedId)} onRefetchInspect={refetchInspect} onRefetchAll={refetchAll} />
                                : <div className="border bg-muted/5 h-105" />
                            }
                        </TabsContent>
                        <TabsContent value="describe">
                            {describe && preview
                                ? <DescribeTab data={describe} preview={preview} />
                                : <div className="border bg-muted/5 h-105" />
                            }
                        </TabsContent>
                    </>
                )}
            </Tabs>

        </div>
    );
}
