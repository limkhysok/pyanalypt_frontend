"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Dataset, DatasetExportFormat, DatasetActivityLog } from "@/types/dataset";
import { toast } from "sonner";

import {
    STORAGE_LIMIT,
    getUsageLabel,
    getCountLabel,
    compareDatasets,
    getImportAccept,
    exportDataset,
} from "./_lib";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { DatasetHeader } from "./DatasetHeader";
import { DatasetStats } from "./DatasetStats";
import { DatasetControls } from "./DatasetControls";
import { DatasetTable } from "./DatasetTable";
import { DatasetLogs } from "./DatasetLogs";
import { RenameDialog } from "./RenameDialog";
import { DeleteDialog } from "./DeleteDialog";

// ─────────────────────────────────────────────
// DatasetPage
// ─────────────────────────────────────────────

export default function DatasetPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // ── State ──────────────────────────────────────────────────────────────────

    const [datasets, setDatasets]                         = useState<Dataset[]>([]);
    const [activityLogs, setActivityLogs]                 = useState<DatasetActivityLog[]>([]);
    const [isLoading, setIsLoading]                       = useState(true);
    const [logsLoading, setLogsLoading]                   = useState(false);
    const [searchQuery, setSearchQuery]                   = useState("");
    const [sortBy, setSortBy]                             = useState("newest");
    const [filterType, setFilterType]                     = useState("all");
    const [uploadLoading, setUploadLoading]               = useState(false);
    const [exportingDatasetId, setExportingDatasetId]     = useState<number | null>(null);

    // Dialog state
    const [selectedImportFormat, setSelectedImportFormat] = useState<DatasetExportFormat | null>(null);
    const [isRenameOpen, setIsRenameOpen]                 = useState(false);
    const [isDeleteOpen, setIsDeleteOpen]                 = useState(false);
    const [isDeleting, setIsDeleting]                     = useState(false);
    const [selectedDataset, setSelectedDataset]           = useState<Dataset | null>(null);
    const [newName, setNewName]                           = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchDatasets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await datasetApi.listDatasets();
            setDatasets(data.results);
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const data = await datasetApi.listActivityLogs();
            setActivityLogs(data.results);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        fetchDatasets();
        fetchLogs();
    }, [authLoading, isAuthenticated, fetchDatasets, fetchLogs, router]);

    // ── Upload / import ────────────────────────────────────────────────────────

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadLoading(true);
        try {
            await datasetApi.uploadDataset(file);
            toast.success("Dataset uploaded successfully");
            fetchDatasets();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed");
        } finally {
            setUploadLoading(false);
            e.target.value = "";
            setSelectedImportFormat(null);
        }
    };

    const openFilePicker = (format?: DatasetExportFormat) => {
        if (uploadLoading) return;
        if (format) setSelectedImportFormat(format);
        fileInputRef.current?.click();
    };

    const handleImportFormatSelect = (format: DatasetExportFormat) => {
        setSelectedImportFormat(format);
        globalThis.setTimeout(() => openFilePicker(format), 30);
    };

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleRename = async () => {
        if (!selectedDataset || !newName.trim()) return;
        
        const ext = selectedDataset.file_name.split('.').pop();
        const finalName = ext ? `${newName.trim()}.${ext}` : newName.trim();

        try {
            await datasetApi.renameDataset(selectedDataset.id, { file_name: finalName });
            toast.success("Artifact renamed.");
            setIsRenameOpen(false);
            setSelectedDataset(null);
            setNewName("");
            fetchDatasets();
        } catch (error) {
            console.error("Rename failed", error);
            toast.error("Failed to rename artifact.");
        }
    };

    const handleExport = async (dataset: Dataset, format?: DatasetExportFormat) => {
        if (exportingDatasetId === dataset.id) return;
        setExportingDatasetId(dataset.id);
        try {
            await exportDataset(dataset, format);
        } finally {
            setExportingDatasetId(null);
        }
    };

    const handleDuplicate = async (dataset: Dataset, format?: DatasetExportFormat) => {
        const id = toast.loading(`Duplicating ${dataset.file_name}...`);
        try {
            await datasetApi.duplicateDataset(dataset.id, {
                format: format,
                new_file_name: `${dataset.file_name.replace(/\.[^.]+$/, "")}_copy`
            });
            toast.success("Artifact duplicated.", { id });
            fetchDatasets();
        } catch (error) {
            console.error("Duplication failed", error);
            toast.error("Failed to duplicate artifact.", { id });
        }
    };

    const handleRenameOpen = (dataset: Dataset) => {
        setSelectedDataset(dataset);
        const baseName = dataset.file_name.replace(/\.[^/.]+$/, "");
        setNewName(baseName);
        setIsRenameOpen(true);
    };
    
    const handleRemoveOpen = (dataset: Dataset) => {
        setSelectedDataset(dataset);
        setIsDeleteOpen(true);
    };

    const handleRemove = async () => {
        if (!selectedDataset) return;
        setIsDeleting(true);
        try {
            await datasetApi.deleteDataset(selectedDataset.id);
            toast.success("Artifact erased.");
            setIsDeleteOpen(false);
            fetchDatasets();
            fetchLogs();
        } catch (error) {
            console.error("Deletion failed", error);
            toast.error("Failed to erase artifact.");
        } finally {
            setIsDeleting(false);
            setSelectedDataset(null);
        }
    };

    // ── Derived values ─────────────────────────────────────────────────────────

    const filteredDatasets = useMemo(() => {
        let result = datasets.filter((d) =>
            d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filterType !== "all") {
            result = result.filter(
                (d) => d.file_format.toLowerCase() === filterType.toLowerCase()
            );
        }
        result.sort((a, b) => compareDatasets(a, b, sortBy));
        return result;
    }, [datasets, searchQuery, sortBy, filterType]);

    const stats = useMemo(() => ({
        total:     datasets.length,
        totalSize: datasets.reduce((sum, d) => sum + d.file_size, 0),
        formats:   new Set(datasets.map((d) => d.file_format.toLowerCase())).size,
    }), [datasets]);

    const isFiltering       = searchQuery !== "" || filterType !== "all";
    const usagePct          = Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100);
    const usageLabel        = getUsageLabel(usagePct);
    const countLabel        = getCountLabel(isFiltering, filteredDatasets.length, datasets.length);
    const importAccept = getImportAccept(selectedImportFormat);

    // ── Auth loading ───────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <div className="relative flex flex-col items-center gap-8">
                    {/* Pulsing core */}
                    <div className="relative">
                        <div className="h-20 w-20 border-t-2 border-r-2 border-foreground rounded-full animate-spin" />
                        <div className="absolute inset-0 h-20 w-20 border-b-2 border-l-2 border-foreground/20 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-xs font-bold lowercase tracking-widest text-foreground/40 animate-pulse">
                            preparing_datasets
                        </span>
                        <h2 className="text-base font-bold tracking-tight text-foreground/80">
                            setting up your workspace...
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen pb-24 px-6 md:px-10 bg-background relative z-0">

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[44px_44px] opacity-100" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10 pt-10 md:pt-16">

                {/* Header Section */}
                <DatasetHeader uploadLoading={uploadLoading} onFormatSelect={handleImportFormatSelect} />

                {/* Stats (Global Overview) */}
                {datasets.length > 0 && (
                    <DatasetStats
                        total={stats.total}
                        formats={stats.formats}
                        totalSize={stats.totalSize}
                        usagePct={usagePct}
                        usageLabel={usageLabel}
                    />
                )}

                <Tabs defaultValue="artifacts" className="w-full">
                    <TabsList className="rounded-none bg-muted/40 border border-border/40 p-0.5 h-12 w-full sm:w-auto">
                        <TabsTrigger
                            value="artifacts"
                            className="rounded-none h-full px-10 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground transition-all text-sm font-bold lowercase tracking-tight flex-1 sm:flex-none"
                        >
                            datasets
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="rounded-none h-full px-10 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground transition-all text-sm font-bold lowercase tracking-tight flex-1 sm:flex-none"
                        >
                            activity logs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="artifacts" className="space-y-8 pt-8 outline-none">
                        {/* Controls */}
                        <DatasetControls
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            filterType={filterType}
                            onFilterChange={setFilterType}
                            countLabel={countLabel}
                            showCount={datasets.length > 0}
                        />

                        {/* Table Visualization */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.18 }}
                        >
                            <DatasetTable
                                datasets={datasets}
                                filteredDatasets={filteredDatasets}
                                isLoading={isLoading}
                                exportingDatasetId={exportingDatasetId}
                                onFormatSelect={handleImportFormatSelect}
                                onRename={handleRenameOpen}
                                onExport={handleExport}
                                onDuplicate={handleDuplicate}
                                onDelete={handleRemoveOpen}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="logs" className="pt-8 outline-none">
                        <DatasetLogs logs={activityLogs} isLoading={logsLoading} />
                    </TabsContent>
                </Tabs>

            </div>


            <RenameDialog
                open={isRenameOpen}
                onOpenChange={setIsRenameOpen}
                value={newName}
                onChange={setNewName}
                onConfirm={handleRename}
            />

            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                fileName={selectedDataset?.file_name}
                isLoading={isDeleting}
                onConfirm={handleRemove}
            />

            {/* Hidden Input Protocol */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept={importAccept}
                disabled={uploadLoading}
            />
        </main>
    );
}

