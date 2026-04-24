"use client";

import { Database, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatasets } from "./use-datasets";
import { DatasetHeader } from "./_components/DatasetHeader";
import { DatasetStats } from "./_components/DatasetStats";
import { DatasetControls } from "./_components/DatasetControls";
import { DatasetTable } from "./_components/DatasetTable";
import { DatasetLogs } from "./_components/DatasetLogs";
import { RenameDialog } from "./_components/RenameDialog";
import { DeleteDialog } from "./_components/DeleteDialog";

export default function DatasetsPage() {
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
        <main className="flex flex-col gap-6 p-8">

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

            <Tabs defaultValue="artifacts" className="w-full">
                <TabsList className="rounded-none">
                    <TabsTrigger value="artifacts" className="gap-2 rounded-none">
                        <Database className="h-3.5 w-3.5" /> Datasets
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2 rounded-none">
                        <Activity className="h-3.5 w-3.5" /> Activity Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="artifacts" className="space-y-6 pt-6 outline-none">
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

                <TabsContent value="logs" className="pt-6 outline-none">
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
