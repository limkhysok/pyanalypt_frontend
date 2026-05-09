"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { datasetApi, datalabApi } from "@/services/api";
import { edaApi } from "@/services/eda.service";
import type {
    CorrelationResponse,
    DistributionResponse,
    ValueCountsResponse,
    OutlierSummaryResponse,
    MissingHeatmapResponse,
    AssociationResponse,
} from "@/services/eda.service";
import type { Dataset } from "@/types/dataset";
import { toast } from "sonner";

const DEFAULT_TAB = "correlation";

export function useEda() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedId, setSelectedId] = React.useState<string>(searchParams.get("dataset") ?? "");
    const [activeTab, setActiveTab] = React.useState<string>(searchParams.get("tab") ?? DEFAULT_TAB);
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);

    // Per-tab loading: stores the tab id that is currently loading, null when idle
    const [loadingTabId, setLoadingTabId] = React.useState<string | null>(null);

    // All column names for the selected dataset (used by CrosstabTab / PairwiseTab)
    const [allColumns, setAllColumns] = React.useState<string[]>([]);
    const [numericColumnNames, setNumericColumnNames] = React.useState<string[]>([]);

    // Per-tab cached data — only fetched once per dataset (user can re-run via controls)
    const [correlation, setCorrelation] = React.useState<CorrelationResponse | null>(null);
    const [distribution, setDistribution] = React.useState<DistributionResponse | null>(null);
    const [valueCounts, setValueCounts] = React.useState<ValueCountsResponse | null>(null);
    const [outlierSummary, setOutlierSummary] = React.useState<OutlierSummaryResponse | null>(null);
    const [missingHeatmap, setMissingHeatmap] = React.useState<MissingHeatmapResponse | null>(null);
    const [association, setAssociation] = React.useState<AssociationResponse | null>(null);

    function selectDataset(id: string) {
        setCorrelation(null);
        setDistribution(null);
        setValueCounts(null);
        setOutlierSummary(null);
        setMissingHeatmap(null);
        setAssociation(null);
        setAllColumns([]);
        setNumericColumnNames([]);
        setSelectedId(id);
    }

    // Sync URL params
    React.useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        const targetParams = new URLSearchParams(searchParams.toString());
        
        if (selectedId) targetParams.set("dataset", selectedId); else targetParams.delete("dataset");
        if (activeTab && activeTab !== DEFAULT_TAB) targetParams.set("tab", activeTab); else targetParams.delete("tab");

        if (currentParams.toString() !== targetParams.toString()) {
            router.replace(`${pathname}?${targetParams.toString()}`, { scroll: false });
        }
    }, [selectedId, activeTab, pathname, router, searchParams]);

    // Load dataset list
    React.useEffect(() => {
        datasetApi.listDatasets()
            .then((res) => {
                const list: Dataset[] = (res as { results?: Dataset[] }).results ?? (res as unknown as Dataset[]);
                setDatasets(list);
            })
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    // Fetch all column names whenever the dataset changes
    React.useEffect(() => {
        if (!selectedId) return;
        datalabApi.inspect(Number(selectedId))
            .then((res) => {
                setAllColumns(res.info.columns.map((c) => c.column));
                setNumericColumnNames(
                    res.info.columns
                        .filter((c) => c.dtype.toLowerCase().includes("int") || c.dtype.toLowerCase().includes("float"))
                        .map((c) => c.column)
                );
            })
            .catch(() => toast.error("Failed to load column metadata — cross-tabulation and scatter may be unavailable."));
    }, [selectedId]);

    // Auto-fetch when tab + dataset change for simple tabs (no required params)
    React.useEffect(() => {
        if (!selectedId) return;
        const id = Number(selectedId);

        function edaErrMsg(err: unknown, fallback: string) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            return status === 500 ? "Analysis failed. Try again or contact support." : fallback;
        }

        if (activeTab === "correlation" && !correlation) {
            setLoadingTabId("correlation");
            edaApi.correlation(id)
                .then(setCorrelation)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load correlation data.")))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "distribution" && !distribution) {
            setLoadingTabId("distribution");
            edaApi.distribution(id)
                .then(setDistribution)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load distribution data.")))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "value-counts" && !valueCounts) {
            setLoadingTabId("value-counts");
            edaApi.valueCounts(id)
                .then(setValueCounts)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load value counts.")))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "outlier-summary" && !outlierSummary) {
            setLoadingTabId("outlier-summary");
            edaApi.outlierSummary(id)
                .then(setOutlierSummary)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load outlier summary.")))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "missing-heatmap" && !missingHeatmap) {
            setLoadingTabId("missing-heatmap");
            edaApi.missingHeatmap(id)
                .then(setMissingHeatmap)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load missing value data.")))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "association" && !association) {
            setLoadingTabId("association");
            edaApi.association(id)
                .then(setAssociation)
                .catch((err: unknown) => toast.error(edaErrMsg(err, "Failed to load association data.")))
                .finally(() => setLoadingTabId(null));
        }
        // crosstab and pairwise require user-selected columns, so they are fetched on demand
    }, [
        selectedId,
        activeTab,
        association,
        correlation,
        distribution,
        missingHeatmap,
        outlierSummary,
        valueCounts
    ]);

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;
    const numericColumns = numericColumnNames.length > 0 ? numericColumnNames : (correlation?.columns ?? []);

    return {
        datasets,
        selectedId,
        setSelectedId: selectDataset,
        activeTab,
        setActiveTab,
        loadingDatasets,
        loadingTabId,
        setLoadingTabId,
        allColumns,
        numericColumns,
        correlation,
        setCorrelation,
        distribution,
        setDistribution,
        valueCounts,
        setValueCounts,
        outlierSummary,
        setOutlierSummary,
        missingHeatmap,
        setMissingHeatmap,
        association,
        setAssociation,
        selectedName,
    };
}
