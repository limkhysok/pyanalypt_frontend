"use client";

import React from "react";
import { Database, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDatasets } from "./use-datasets";
import { DatasetHeader } from "./_components/DatasetHeader";
import { DatasetStats } from "./_components/DatasetStats";
import { DatasetControls } from "./_components/DatasetControls";
import { DatasetTable } from "./_components/DatasetTable";
import { DatasetLogs } from "./_components/DatasetLogs";
import { RenameDialog } from "./_components/RenameDialog";
import { DeleteDialog } from "./_components/DeleteDialog";

const DATASET_TABS = [
    { value: "artifacts", icon: Database, label: "Datasets" },
    { value: "logs",      icon: Activity, label: "Activity Logs" },
] as const;

export default function DatasetsPage() {
    const [activeTab, setActiveTab] = React.useState("artifacts");

    const {
        datasets,
        activityLogs,
        filteredDatasets,
        stats,

        isLoading,
        logsLoading,
        uploadLoading,
        exportingDatasetId,
        isDeleting,

        searchQuery,     setSearchQuery,
        sortBy,          setSortBy,
        filterType,      setFilterType,

        usagePct,
        usageLabel,
        countLabel,

        isRenameOpen,    setIsRenameOpen,
        isDeleteOpen,    setIsDeleteOpen,
        selectedDataset,
        newName,         setNewName,

        fileInputRef,
        importAccept,

        handleFileUpload,
        handleImportFormatSelect,
        handleRename,
        handleExport,
        handleDuplicate,
        handleRenameOpen,
        handleRemoveOpen,
        handleRemove,
    } = useDatasets();

    return (
        <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            <DatasetHeader
                uploadLoading={uploadLoading}
                onFormatSelect={handleImportFormatSelect}
            />

            {datasets.length > 0 && (
                <DatasetStats
                    total={stats.total}
                    formats={stats.formats}
                    totalSize={stats.totalSize}
                    usagePct={usagePct}
                    usageLabel={usageLabel}
                />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                {/* ── Tab bar ── */}
                <div className="flex items-stretch border-b border-border mb-4">
                    {DATASET_TABS.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setActiveTab(value)}
                            className={cn(
                                "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                activeTab === value
                                    ? "text-blue-600 font-bold border-blue-600 bg-blue-50/60"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-slate-50 border-transparent"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {label}
                        </button>
                    ))}
                </div>

                <TabsContent value="artifacts" className="space-y-6 outline-none">
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

                <TabsContent value="logs" className="outline-none">
                    <DatasetLogs logs={activityLogs} isLoading={logsLoading} />
                </TabsContent>
            </Tabs>

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
