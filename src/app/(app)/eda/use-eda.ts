"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { datasetApi } from "@/services/api";
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
    const [loading, setLoading] = React.useState(false);

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

    // Auto-fetch when tab + dataset change for simple tabs (no required params)
    React.useEffect(() => {
        if (!selectedId) return;
        const id = Number(selectedId);

        if (activeTab === "correlation" && !correlation) {
            setLoading(true);
            edaApi.correlation(id)
                .then(setCorrelation)
                .catch(() => toast.error("Failed to load correlation data."))
                .finally(() => setLoading(false));
        }
        if (activeTab === "distribution" && !distribution) {
            setLoading(true);
            edaApi.distribution(id)
                .then(setDistribution)
                .catch(() => toast.error("Failed to load distribution data."))
                .finally(() => setLoading(false));
        }
        if (activeTab === "value-counts" && !valueCounts) {
            setLoading(true);
            edaApi.valueCounts(id)
                .then(setValueCounts)
                .catch(() => toast.error("Failed to load value counts."))
                .finally(() => setLoading(false));
        }
        if (activeTab === "outlier-summary" && !outlierSummary) {
            setLoading(true);
            edaApi.outlierSummary(id)
                .then(setOutlierSummary)
                .catch(() => toast.error("Failed to load outlier summary."))
                .finally(() => setLoading(false));
        }
        if (activeTab === "missing-heatmap" && !missingHeatmap) {
            setLoading(true);
            edaApi.missingHeatmap(id)
                .then(setMissingHeatmap)
                .catch(() => toast.error("Failed to load missing value data."))
                .finally(() => setLoading(false));
        }
        // crosstab and pairwise require user-selected columns, so they are fetched on demand
    }, [selectedId, activeTab]);

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;

    return {
        datasets,
        selectedId,
        setSelectedId: selectDataset,
        activeTab,
        setActiveTab,
        loadingDatasets,
        loading,
        setLoading,
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
