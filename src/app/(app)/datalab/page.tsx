"use client";

import { FlaskConical, Database, ChevronDown, Loader2, Table2, Info } from "lucide-react";
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

export default function DataLabPage() {
    const {
        datasets,
        selectedId,
        setSelectedId,
        preview,
        inspect,
        loadingDatasets,
        loadingData,
        refetchInspect,
        selectedName,
    } = useDatalab();

    return (
        <div className="flex flex-col gap-6 p-8">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <FlaskConical className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight leading-none font-mono">DataLab</h1>
                    <p className="text-xs text-muted-foreground mt-1">Inspect and preview your datasets</p>
                </div>
            </div>

            {/* ── Content ── */}
            <Tabs defaultValue="preview" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="rounded-none">
                        <TabsTrigger value="preview" className="gap-2 rounded-none">
                            <Table2 className="h-3.5 w-3.5" /> Data Preview
                        </TabsTrigger>
                        <TabsTrigger value="inspect" className="gap-2 rounded-none">
                            <Info className="h-3.5 w-3.5" /> Inspect
                        </TabsTrigger>
                    </TabsList>

                    {/* Dataset picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 min-w-44 justify-between text-xs rounded-none" disabled={loadingDatasets}>
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
                            <DropdownMenuLabel className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                                Dataset
                            </DropdownMenuLabel>
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

                {/* ── Preview tab ── */}
                <TabsContent value="preview">
                    {!selectedId && <div className="border bg-muted/5 h-105" />}
                    {selectedId && loadingData && (
                        <div className="flex items-center justify-center border bg-muted/5 h-105">
                            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                        </div>
                    )}
                    {selectedId && !loadingData && preview && <PreviewTab data={preview} />}
                    {selectedId && !loadingData && !preview && <div className="border bg-muted/5 h-105" />}
                </TabsContent>

                {/* ── Inspect tab ── */}
                <TabsContent value="inspect">
                    {!selectedId && <div className="border bg-muted/5 h-105" />}
                    {selectedId && loadingData && (
                        <div className="flex items-center justify-center border bg-muted/5 h-105">
                            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground/40" />
                        </div>
                    )}
                    {selectedId && !loadingData && inspect && preview && (
                        <InspectTab data={inspect} preview={preview} datasetId={Number(selectedId)} onRefetchInspect={refetchInspect} />
                    )}
                    {selectedId && !loadingData && !inspect && <div className="border bg-muted/5 h-105" />}
                </TabsContent>
            </Tabs>

        </div>
    );
}
