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
        <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

            <DatasetHeader
                uploadLoading={uploadLoading}
                onFormatSelect={handleImportFormatSelect}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* ── Tab bar ── */}
                <div className="flex items-center justify-between border-b border-border/60 mb-6 px-1">
                    <div className="flex items-stretch gap-1">
                        {DATASET_TABS.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setActiveTab(value)}
                                className={cn(
                                    "relative px-4 py-3 flex items-center gap-2.5 text-[11px] font-bold capitalize tracking-widest transition-all focus-visible:outline-none group",
                                    activeTab === value
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-3.5 w-3.5 transition-transform duration-300",
                                    activeTab === value ? "scale-110" : "group-hover:scale-110"
                                )} />
                                {label}
                                {activeTab === value && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 capitalize tracking-tighter">
                        <Activity className="h-3 w-3" />
                        <span>Live Workspace Status</span>
                    </div>
                </div>

                <TabsContent value="artifacts" className="space-y-8 outline-none mt-0">
                    <div className="space-y-6">
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
                            transition={{ duration: 0.4, delay: 0.2 }}
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
                    </div>
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
        </main>
    );
}
