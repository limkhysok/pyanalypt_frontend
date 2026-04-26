"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { datasetApi, datalabApi } from "@/services/api";
import type { DataLabPreview, DataLabInspect } from "@/services/api";
import { Dataset } from "@/types/dataset";
import { toast } from "sonner";

export function useDatalab() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedId, setSelectedId] = React.useState<string>(searchParams.get("dataset") ?? "");
    const [activeTab, setActiveTab] = React.useState<string>(searchParams.get("tab") ?? "preview");
    const [preview, setPreview] = React.useState<DataLabPreview | null>(null);
    const [inspect, setInspect] = React.useState<DataLabInspect | null>(null);
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);
    const [loadingData, setLoadingData] = React.useState(false);
    const [page, setPage] = React.useState(1);

    function handleSetSelectedId(id: string) {
        setPage(1);
        setSelectedId(id);
    }

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) {
            params.set("dataset", selectedId);
        } else {
            params.delete("dataset");
        }
        if (activeTab && activeTab !== "preview") {
            params.set("tab", activeTab);
        } else {
            params.delete("tab");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedId, activeTab]);

    React.useEffect(() => {
        datasetApi.listDatasets()
            .then((res) => {
                const list: Dataset[] = (res as { results?: Dataset[] }).results ?? (res as unknown as Dataset[]);
                setDatasets(list);
            })
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    React.useEffect(() => {
        if (!selectedId) return;
        const id = Number(selectedId);
        setPreview(null);
        setLoadingData(true);
        datalabApi.preview(id, page)
            .then(setPreview)
            .catch(() => toast.error("Failed to load dataset."))
            .finally(() => setLoadingData(false));
    }, [selectedId, page]);

    React.useEffect(() => {
        if (!selectedId) return;
        setInspect(null);
        datalabApi.inspect(Number(selectedId))
            .then(setInspect)
            .catch(() => toast.error("Failed to load dataset."));
    }, [selectedId]);

    function refetchInspect() {
        if (!selectedId) return;
        datalabApi.inspect(Number(selectedId))
            .then(setInspect)
            .catch(() => toast.error("Failed to refresh inspect data."));
    }

    function refetchAll() {
        if (!selectedId) return;
        const id = Number(selectedId);
        Promise.all([datalabApi.preview(id, page), datalabApi.inspect(id)])
            .then(([previewData, inspectData]) => {
                setPreview(previewData);
                setInspect(inspectData);
            })
            .catch(() => toast.error("Failed to refresh dataset."));
    }

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;

    return {
        datasets,
        selectedId,
        setSelectedId: handleSetSelectedId,
        activeTab,
        setActiveTab,
        preview,
        inspect,
        loadingDatasets,
        loadingData,
        refetchInspect,
        refetchAll,
        selectedName,
        page,
        setPage,
    };
}
