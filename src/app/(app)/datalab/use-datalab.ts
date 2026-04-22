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
    const [preview, setPreview] = React.useState<DataLabPreview | null>(null);
    const [inspect, setInspect] = React.useState<DataLabInspect | null>(null);
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);
    const [loadingData, setLoadingData] = React.useState(false);

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) {
            params.set("dataset", selectedId);
        } else {
            params.delete("dataset");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedId]);

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
        setInspect(null);
        setLoadingData(true);

        Promise.all([
            datalabApi.preview(id),
            datalabApi.inspect(id),
        ])
            .then(([previewData, inspectData]) => {
                setPreview(previewData);
                setInspect(inspectData);
            })
            .catch(() => toast.error("Failed to load dataset."))
            .finally(() => setLoadingData(false));
    }, [selectedId]);

    function refetchInspect() {
        if (!selectedId) return;
        datalabApi.inspect(Number(selectedId))
            .then(setInspect)
            .catch(() => toast.error("Failed to refresh inspect data."));
    }

    const selectedName = datasets.find((d) => String(d.id) === selectedId)?.file_name;

    return {
        datasets,
        selectedId,
        setSelectedId,
        preview,
        inspect,
        loadingDatasets,
        loadingData,
        refetchInspect,
        selectedName,
    };
}
