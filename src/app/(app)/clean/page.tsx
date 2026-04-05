"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, RotateCcw, PlusCircle } from "lucide-react";
import { cleaningApi, CleaningOperation } from "@/services/cleaning.service";
import { datasetApi } from "@/services/dataset.service";
import { Dataset } from "@/types/dataset";

export default function CleanPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
    const [operations, setOperations] = useState<CleaningOperation[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNewOp, setShowNewOp] = useState(false);

    useEffect(() => {
        datasetApi.listDatasets().then(setDatasets);
    }, []);

    useEffect(() => {
        if (selectedDataset) {
            setLoading(true);
            cleaningApi.list(selectedDataset)
                .then(setOperations)
                .catch(() => setOperations([]))
                .finally(() => setLoading(false));
        }
    }, [selectedDataset]);

    const handleRevert = async (id: number) => {
        await cleaningApi.revert(id);
        if (selectedDataset) {
            const ops = await cleaningApi.list(selectedDataset);
            setOperations(ops);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Data Cleaning</h1>
            </div>
            <p className="text-muted-foreground">
                Clean and preprocess your datasets for analysis.
            </p>
            <div className="flex items-center gap-3 mt-4">
                <select
                    className="border rounded px-3 py-2"
                    value={selectedDataset ?? ""}
                    onChange={e => setSelectedDataset(Number(e.target.value))}
                >
                    <option value="" disabled>Select dataset</option>
                    {datasets.map(ds => (
                        <option key={ds.id} value={ds.id}>{ds.file_name}</option>
                    ))}
                </select>
                <button
                    className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded hover:bg-primary/80"
                    onClick={() => setShowNewOp(true)}
                    disabled={!selectedDataset}
                >
                    <PlusCircle className="h-4 w-4" /> New Operation
                </button>
            </div>
            {loading ? (
                <div>Loading operations...</div>
            ) : (
                selectedDataset && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Cleaning Operations</h2>
                        {operations.length === 0 ? (
                            <div className="text-muted-foreground">No cleaning operations found.</div>
                        ) : (
                            <table className="w-full border text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Column</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Rows</th>
                                        <th className="p-2">Applied</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {operations.map(op => (
                                        <tr key={op.id} className="border-t">
                                            <td className="p-2">{op.id}</td>
                                            <td className="p-2">{op.operation_type}</td>
                                            <td className="p-2">{op.column_name}</td>
                                            <td className="p-2">{op.status}</td>
                                            <td className="p-2">{op.rows_affected ?? '-'}</td>
                                            <td className="p-2">{op.applied_at ? new Date(op.applied_at).toLocaleString() : '-'}</td>
                                            <td className="p-2">
                                                <button
                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    onClick={() => handleRevert(op.id)}
                                                    disabled={op.status !== "APPLIED"}
                                                >
                                                    <RotateCcw className="h-4 w-4" /> Revert
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )
            )}
            {/* Modal for new operation (to be implemented) */}
            {showNewOp && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 min-w-[320px] shadow-lg">
                        <h3 className="font-bold mb-2">Apply Cleaning Operation</h3>
                        <div className="text-muted-foreground text-xs mb-4">(Form coming soon)</div>
                        <button className="mt-2 px-4 py-2 bg-muted rounded" onClick={() => setShowNewOp(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
