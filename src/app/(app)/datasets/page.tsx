"use client";

import React from "react";
import { Database, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDatasets } from "./use-datasets";
import { DatasetHeader } from "./_components/DatasetHeader";
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

        isLoading,
        logsLoading,
        uploadLoading,
        exportingDatasetId,
        isDeleting,

        searchQuery,     setSearchQuery,
        sortBy,          setSortBy,
        filterType,      setFilterType,

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
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            <DatasetHeader
                uploadLoading={uploadLoading}
                onFormatSelect={handleImportFormatSelect}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                {/* ── Tab bar — mirrors Datalab page style ── */}
                <div className="flex items-stretch border-b border-border mb-4">
                    {DATASET_TABS.map(({ value, icon: Icon, label }) => {
                        const isActive = activeTab === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setActiveTab(value)}
                                className={cn(
                                    "px-3 h-10 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none",
                                    isActive
                                        ? "text-primary font-bold border-primary bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                <TabsContent value="artifacts" className="space-y-4 outline-none mt-0">
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
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

                <TabsContent value="logs" className="outline-none mt-0">
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
        </div>
    );
}
