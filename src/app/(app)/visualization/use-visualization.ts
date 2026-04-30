"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { datasetApi, datalabApi } from "@/services/api";
import type { Dataset } from "@/types/dataset";
import { toast } from "sonner";

const NUMERIC_DTYPES = new Set([
    'int8', 'int16', 'int32', 'int64',
    'uint8', 'uint16', 'uint32', 'uint64',
    'float16', 'float32', 'float64',
    'Int8', 'Int16', 'Int32', 'Int64',
    'Float32', 'Float64',
]);

export type ChartType = 'bar' | 'line' | 'scatter' | 'histogram';

export function useVisualization() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedId, setSelectedId] = React.useState<string>(searchParams.get("dataset") ?? "");
    const [chartType, setChartType] = React.useState<ChartType>((searchParams.get("chart") as ChartType) ?? "bar");
    const [loadingDatasets, setLoadingDatasets] = React.useState(true);
    const [loadingInspect, setLoadingInspect] = React.useState(false);
    const [numericColumns, setNumericColumns] = React.useState<string[]>([]);
    const [categoricalColumns, setCategoricalColumns] = React.useState<string[]>([]);
    const [allColumns, setAllColumns] = React.useState<string[]>([]);

    const selectedName = React.useMemo(
        () => datasets.find(d => String(d.id) === selectedId)?.file_name ?? null,
        [datasets, selectedId]
    );

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) params.set("dataset", selectedId); else params.delete("dataset");
        if (chartType !== "bar") params.set("chart", chartType); else params.delete("chart");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [selectedId, chartType]);

    React.useEffect(() => {
        datasetApi.listDatasets()
            .then(res => {
                const list: Dataset[] = (res as { results?: Dataset[] }).results ?? (res as unknown as Dataset[]);
                setDatasets(list);
            })
            .catch(() => toast.error("Failed to load datasets."))
            .finally(() => setLoadingDatasets(false));
    }, []);

    React.useEffect(() => {
        if (!selectedId) return;
        setNumericColumns([]);
        setCategoricalColumns([]);
        setAllColumns([]);
        setLoadingInspect(true);
        datalabApi.inspect(Number(selectedId))
            .then(data => {
                const cols = data.info.columns;
                setAllColumns(cols.map(c => c.column));
                setNumericColumns(cols.filter(c => NUMERIC_DTYPES.has(c.dtype)).map(c => c.column));
                setCategoricalColumns(cols.filter(c => !NUMERIC_DTYPES.has(c.dtype)).map(c => c.column));
            })
            .catch(() => toast.error("Failed to load column info."))
            .finally(() => setLoadingInspect(false));
    }, [selectedId]);

    return {
        datasets,
        selectedId,
        setSelectedId,
        selectedName,
        chartType,
        setChartType,
        loadingDatasets,
        loadingInspect,
        numericColumns,
        categoricalColumns,
        allColumns,
    };
}
