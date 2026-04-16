"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi, framingApi } from "@/services/api";
import { Dataset, DatasetExportFormat } from "@/types/dataset";
import { toast } from "sonner";

import {
    STORAGE_LIMIT,
    storageBarColor,
    getUsageLabel,
    getCountLabel,
    compareDatasets,
    getImportAccept,
    exportDataset,
} from "./_lib";
import { DatasetHeader } from "./DatasetHeader";
import { DatasetStats } from "./DatasetStats";
import { DatasetControls } from "./DatasetControls";
import { DatasetTable } from "./DatasetTable";
import { RenameDialog } from "./RenameDialog";
import { DeleteDialog } from "./DeleteDialog";
import { AIAnalysisDialog } from "./AIAnalysisDialog";

// ─────────────────────────────────────────────
// DatasetPage
// ─────────────────────────────────────────────

export default function DatasetPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // ── State ──────────────────────────────────────────────────────────────────

    const [datasets, setDatasets]                         = useState<Dataset[]>([]);
    const [isLoading, setIsLoading]                       = useState(true);
    const [searchQuery, setSearchQuery]                   = useState("");
    const [sortBy, setSortBy]                             = useState("newest");
    const [filterType, setFilterType]                     = useState("all");
    const [uploadLoading, setUploadLoading]               = useState(false);
    const [issueLoading, setIssueLoading]                 = useState<number | null>(null);
    const [exportingDatasetId, setExportingDatasetId]     = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading]               = useState(false);
    const [aiAnalysisLoading, setAiAnalysisLoading]       = useState<number | null>(null);

    // Dialog state
    const [selectedImportFormat, setSelectedImportFormat] = useState<DatasetExportFormat | null>(null);
    const [isRenameOpen, setIsRenameOpen]                 = useState(false);
    const [isDeleteOpen, setIsDeleteOpen]                 = useState(false);
    const [selectedDataset, setSelectedDataset]           = useState<Dataset | null>(null);
    const [deleteTarget, setDeleteTarget]                 = useState<Dataset | null>(null);
    const [newName, setNewName]                           = useState("");
    const [aiAnalysisResult, setAiAnalysisResult]         = useState<{ fileName: string; statements: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchDatasets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await datasetApi.listDatasets();
            setDatasets(data);
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        fetchDatasets();
    }, [authLoading, isAuthenticated, fetchDatasets, router]);

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

    const handleDiagnose = async (id: number) => {
        try {
            setIssueLoading(id);
            toast.info("Processing issue detection...");
            await datasetApi.diagnoseDataset(id);
            toast.success("Issue detection complete. Issues logged.");
            router.push(`/issues?dataset=${id}`);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Diagnose endpoint not found")) {
                toast.warning("Issue scan endpoint is unavailable. Opening issues page.");
                router.push("/issues");
            } else {
                console.error("Issue detection error:", error);
                toast.error("Issue detection failed.");
            }
        } finally {
            setIssueLoading(null);
        }
    };

    const handleAIAnalysis = async (dataset: { id: number; file_name: string }) => {
        setAiAnalysisLoading(dataset.id);
        setAiAnalysisResult({ fileName: dataset.file_name, statements: "" });
        try {
            await framingApi.stream(
                dataset.id,
                (token) =>
                    setAiAnalysisResult((prev) =>
                        prev ? { ...prev, statements: prev.statements + token } : null
                    ),
                () => setAiAnalysisLoading(null),
                (err) => {
                    console.error("Problem Framing stream error", err);
                    toast.error("Problem Framing failed. Make sure Ollama is running.");
                    setAiAnalysisLoading(null);
                }
            );
        } catch (error) {
            console.error("Problem Framing failed", error);
            toast.error("Problem Framing failed. Make sure Ollama is running.");
            setAiAnalysisLoading(null);
        }
    };

    const handleRename = async () => {
        if (!selectedDataset || !newName.trim()) return;
        try {
            await datasetApi.renameDataset(selectedDataset.id, { file_name: newName });
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

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await datasetApi.deleteDataset(deleteTarget.id);
            toast.success("Dataset deleted.");
            setIsDeleteOpen(false);
            setDeleteTarget(null);
            fetchDatasets();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete dataset.");
        } finally {
            setDeleteLoading(false);
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

    // Table row callbacks
    const handleRenameOpen = (dataset: Dataset) => {
        setSelectedDataset(dataset);
        setNewName(dataset.file_name);
        setIsRenameOpen(true);
    };

    const handleDeleteOpen = (dataset: Dataset) => {
        setDeleteTarget(dataset);
        setIsDeleteOpen(true);
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
    const storageColorClass = storageBarColor(usagePct);
    const usageLabel        = getUsageLabel(usagePct);
    const countLabel        = getCountLabel(isFiltering, filteredDatasets.length, datasets.length);
    const importAccept = getImportAccept(selectedImportFormat);

    // ── Auth loading ───────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-foreground border-t-transparent animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Initializing workspace…</p>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen pb-10 px-4 md:px-6 bg-background relative z-0">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-5 pt-5">

                {/* Header */}
                <DatasetHeader uploadLoading={uploadLoading} onFormatSelect={handleImportFormatSelect} />

                {/* Stats */}
                {datasets.length > 0 && (
                    <DatasetStats
                        total={stats.total}
                        formats={stats.formats}
                        totalSize={stats.totalSize}
                        usagePct={usagePct}
                        storageColorClass={storageColorClass}
                        usageLabel={usageLabel}
                    />
                )}

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

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.18 }}
                >
                    <DatasetTable
                        datasets={datasets}
                        filteredDatasets={filteredDatasets}
                        isLoading={isLoading}
                        issueLoading={issueLoading}
                        aiAnalysisLoading={aiAnalysisLoading}
                        exportingDatasetId={exportingDatasetId}
                        onFormatSelect={handleImportFormatSelect}
                        onRename={handleRenameOpen}
                        onDelete={handleDeleteOpen}
                        onExport={handleExport}
                        onDuplicate={handleDuplicate}
                        onDiagnose={handleDiagnose}
                        onAIAnalysis={handleAIAnalysis}
                    />
                </motion.div>

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
                fileName={deleteTarget?.file_name}
                isLoading={deleteLoading}
                onConfirm={handleDelete}
            />

            <AIAnalysisDialog
                result={aiAnalysisResult}
                isStreaming={aiAnalysisLoading !== null}
                onClose={() => setAiAnalysisResult(null)}
            />

            {/* Hidden file input */}
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
