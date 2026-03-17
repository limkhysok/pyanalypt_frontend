"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { datasetApi } from "@/services/api";
import { DatasetDetail } from "@/types/dataset";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function DatasetPreviewPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [dataset, setDataset] = useState<DatasetDetail | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadPreview = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch full dataset detail including the data_preview field as per updated API specs
                const detail = await datasetApi.getDataset(Number(id));
                setDataset(detail);

                console.log("[Preview] Raw detail response:", detail);

                let rawData: any = detail.data_preview;

                // If it's a string, it might be stringified JSON from the backend
                if (typeof rawData === 'string' && rawData.trim().startsWith('[')) {
                    try {
                        rawData = JSON.parse(rawData);
                        console.log("[Preview] Parsed data_preview string into array");
                    } catch (e) {
                        console.error("[Preview] Failed to parse data_preview string", e);
                    }
                }

                let data = Array.isArray(rawData) ? rawData : [];

                // If data is still missing, try the dedicated preview endpoint
                if (data.length === 0) {
                    console.log("[Preview] No data in detail view, attempting fallback to preview endpoint...");
                    let fallbackData: any = await datasetApi.previewDataset(Number(id));

                    if (typeof fallbackData === 'string' && fallbackData.trim().startsWith('[')) {
                        try {
                            fallbackData = JSON.parse(fallbackData);
                            console.log("[Preview] Parsed fallbackData string into array");
                        } catch (e) {
                            console.error("[Preview] Failed to parse fallbackData string", e);
                        }
                    }
                    data = Array.isArray(fallbackData) ? fallbackData : [];
                }

                console.log("[Preview] Final processed data array (len):", data.length);
                setPreviewData(data);
            } catch (error) {
                console.error("[Preview] Load failure:", error);
                // Last resort fallback
                try {
                    let fallbackData: any = await datasetApi.previewDataset(Number(id));
                    if (typeof fallbackData === 'string' && fallbackData.trim().startsWith('[')) {
                        try { fallbackData = JSON.parse(fallbackData); } catch (e) { }
                    }
                    setPreviewData(Array.isArray(fallbackData) ? fallbackData : []);
                } catch (secondaryError) {
                    console.error("[Preview] System-wide preview failure:", secondaryError);
                    setPreviewData([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadPreview();
    }, [id]);

    const columns = useMemo(() => {
        if (!Array.isArray(previewData) || previewData.length === 0 || !previewData[0]) return [];
        // Extract headers from the first record
        return Object.keys(previewData[0]);
    }, [previewData]);

    const filteredData = useMemo(() => {
        if (!Array.isArray(previewData)) return [];

        const query = searchTerm.trim().toLowerCase();
        if (!query) return previewData; // Bypass filtering if search is empty

        return previewData.filter(row => {
            if (!row || typeof row !== 'object') return false;
            return Object.values(row).some(val => {
                if (val === null || val === undefined) return false;
                let searchStr = "";
                if (typeof val === 'string') searchStr = val;
                else if (typeof val === 'number' || typeof val === 'boolean') searchStr = String(val);
                else searchStr = JSON.stringify(val);
                return searchStr.toLowerCase().includes(query);
            });
        });
    }, [previewData, searchTerm]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="space-y-4 text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Materializing Data...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative">
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />
                <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-12 w-12 hover:bg-muted"
                            onClick={() => router.push('/datasets')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight">{dataset?.file_name || 'Dataset Preview'}</h1>
                                <Badge variant="outline" className="font-black uppercase text-[10px] py-1 px-3 rounded-md bg-secondary border-none">
                                    {dataset?.file_format || 'RAW'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">
                                Visualizing the first {previewData.length} entries of your intelligence artifact.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="secondary" className="h-11 px-6 rounded-xl font-bold bg-secondary/50">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <Button
                            className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background hover:ambient-glow-mono shadow-xl shadow-primary/10 transition-all active:scale-95"
                            onClick={() => router.push(`/datasets/${id}/clean`)}
                        >
                            <Sparkles className="mr-2 h-4 w-4" /> Start Cleaning
                        </Button>
                    </div>
                </div>

                {/* Search & Stats Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-xl border border-border/40 p-4 rounded-2xl shadow-sm">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Filter local segment..."
                            className="pl-12 h-11 bg-background/50 border-border/20 rounded-xl font-bold text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Rows</span>
                            <span className="text-sm font-black">{dataset?.row_count.toLocaleString() || previewData.length}</span>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dimensions</span>
                            <span className="text-sm font-black">{columns.length} Cols</span>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="rounded-[2.5rem] border border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border/40">
                                    {columns.map((col: string) => (
                                        <th key={col} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredData.map((row, rowIdx) => (
                                        <motion.tr
                                            key={`row-stable-${rowIdx}-${id}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: rowIdx * 0.01 }}
                                            className="border-b border-border/10 hover:bg-primary/5 transition-colors group"
                                        >
                                            {columns.map((col: string) => (
                                                <td key={`${rowIdx}-${col}`} className="px-6 py-4 text-xs font-bold font-mono text-foreground/80 group-hover:text-primary transition-colors">
                                                    {String(row[col])}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto opacity-50">
                                <Search className="h-8 w-8" />
                            </div>
                            <p className="text-muted-foreground font-bold">No results matching your filter segments.</p>
                        </div>
                    )}

                    {/* Pagination Placeholder */}
                    <div className="p-6 bg-muted/20 border-t border-border/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Showing segment 1 of 1</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-lg">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-lg">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
