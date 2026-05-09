"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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

export function useDatasets() {
    const [datasets, setDatasets]                         = useState<Dataset[]>([]);
    const [activityLogs, setActivityLogs]                 = useState<DatasetActivityLog[]>([]);
    const [isLoading, setIsLoading]                       = useState(true);
    const [logsLoading, setLogsLoading]                   = useState(false);
    const [searchQuery, setSearchQuery]                   = useState("");
    const [sortBy, setSortBy]                             = useState("newest");
    const [filterType, setFilterType]                     = useState("all");
    const [uploadLoading, setUploadLoading]               = useState(false);
    const [exportingDatasetId, setExportingDatasetId]     = useState<number | null>(null);

    const [selectedImportFormat, setSelectedImportFormat] = useState<DatasetExportFormat | null>(null);
    const [isRenameOpen, setIsRenameOpen]                 = useState(false);
    const [isDeleteOpen, setIsDeleteOpen]                 = useState(false);
    const [isDeleting, setIsDeleting]                     = useState(false);
    const [selectedDataset, setSelectedDataset]           = useState<Dataset | null>(null);
    const [newName, setNewName]                           = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchDatasets();
        fetchLogs();
    }, [fetchDatasets, fetchLogs]);

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

    const handleRename = async () => {
        if (!selectedDataset || !newName.trim()) return;

        const fileName = selectedDataset.file_name;
        const lastDotIndex = fileName.lastIndexOf('.');
        
        let finalName = newName.trim();
        
        // Only attempt to append extension if the original file had one
        if (lastDotIndex !== -1 && lastDotIndex !== 0) {
            const ext = fileName.slice(lastDotIndex + 1);
            // Don't append if the user already typed it (case-insensitive)
            if (!finalName.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
                finalName = `${finalName}.${ext}`;
            }
        }

        try {
            await datasetApi.renameDataset(selectedDataset.id, { file_name: finalName });
            toast.info("Artifact renamed.");
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
            toast.info("Artifact duplicated.", { id });
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

    const isFiltering    = searchQuery !== "" || filterType !== "all";
    const usagePct       = Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100);
    const usageLabel     = getUsageLabel(usagePct);
    const countLabel     = getCountLabel(isFiltering, filteredDatasets.length, datasets.length);
    const importAccept   = getImportAccept(selectedImportFormat);

    return {
        // Data
        datasets,
        activityLogs,
        filteredDatasets,
        stats,

        // Loading states
        isLoading,
        logsLoading,
        uploadLoading,
        exportingDatasetId,
        isDeleting,

        // Filter / sort / search
        searchQuery,     setSearchQuery,
        sortBy,          setSortBy,
        filterType,      setFilterType,

        // Derived
        usagePct,
        usageLabel,
        countLabel,
        importAccept,

        // Dialog state
        isRenameOpen,    setIsRenameOpen,
        isDeleteOpen,    setIsDeleteOpen,
        selectedDataset,
        newName,         setNewName,

        // Refs
        fileInputRef,

        // Handlers
        handleFileUpload,
        handleImportFormatSelect,
        handleRename,
        handleExport,
        handleDuplicate,
        handleRenameOpen,
        handleRemoveOpen,
        handleRemove,
    };
}
