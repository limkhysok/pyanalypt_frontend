"use client";

import { motion } from "motion/react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { useDatasets } from "./use-datasets";
import { DatasetHeader } from "./DatasetHeader";
import { DatasetStats } from "./DatasetStats";
import { DatasetControls } from "./DatasetControls";
import { DatasetTable } from "./DatasetTable";
import { DatasetLogs } from "./DatasetLogs";
import { RenameDialog } from "./RenameDialog";
import { DeleteDialog } from "./DeleteDialog";

export default function DatasetPage() {
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
        <main className="min-h-screen pb-24 px-6 md:px-10 bg-background relative z-0">

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[44px_44px] opacity-100" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10 pt-10 md:pt-16">

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
