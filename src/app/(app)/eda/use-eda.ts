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

    // Per-tab cached data — only fetched once per dataset (user can re-run via controls)
    const [correlation, setCorrelation] = React.useState<CorrelationResponse | null>(null);
    const [distribution, setDistribution] = React.useState<DistributionResponse | null>(null);
    const [valueCounts, setValueCounts] = React.useState<ValueCountsResponse | null>(null);
    const [outlierSummary, setOutlierSummary] = React.useState<OutlierSummaryResponse | null>(null);
    const [missingHeatmap, setMissingHeatmap] = React.useState<MissingHeatmapResponse | null>(null);

    function selectDataset(id: string) {
        setCorrelation(null);
        setDistribution(null);
        setValueCounts(null);
        setOutlierSummary(null);
        setMissingHeatmap(null);
        setAllColumns([]);
        setSelectedId(id);
    }

    // Sync URL params
    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) params.set("dataset", selectedId); else params.delete("dataset");
        if (activeTab && activeTab !== DEFAULT_TAB) params.set("tab", activeTab); else params.delete("tab");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedId, activeTab]);

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
            .then((res) => setAllColumns(res.info.columns.map((c) => c.column)))
            .catch(() => { /* non-critical — CrosstabTab will show empty picker */ });
    }, [selectedId]);

    // Auto-fetch when tab + dataset change for simple tabs (no required params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        if (!selectedId) return;
        const id = Number(selectedId);

        if (activeTab === "correlation" && !correlation) {
            setLoadingTabId("correlation");
            edaApi.correlation(id)
                .then(setCorrelation)
                .catch(() => toast.error("Failed to load correlation data."))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "distribution" && !distribution) {
            setLoadingTabId("distribution");
            edaApi.distribution(id)
                .then(setDistribution)
                .catch(() => toast.error("Failed to load distribution data."))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "value-counts" && !valueCounts) {
            setLoadingTabId("value-counts");
            edaApi.valueCounts(id)
                .then(setValueCounts)
                .catch(() => toast.error("Failed to load value counts."))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "outlier-summary" && !outlierSummary) {
            setLoadingTabId("outlier-summary");
            edaApi.outlierSummary(id)
                .then(setOutlierSummary)
                .catch(() => toast.error("Failed to load outlier summary."))
                .finally(() => setLoadingTabId(null));
        }
        if (activeTab === "missing-heatmap" && !missingHeatmap) {
            setLoadingTabId("missing-heatmap");
            edaApi.missingHeatmap(id)
                .then(setMissingHeatmap)
                .catch(() => toast.error("Failed to load missing value data."))
                .finally(() => setLoadingTabId(null));
        }
        // crosstab and pairwise require user-selected columns, so they are fetched on demand
    }, [selectedId, activeTab]);

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;
    const numericColumns = correlation?.columns ?? [];

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
        selectedName,
    };
}
