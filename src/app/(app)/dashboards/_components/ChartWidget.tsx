"use client";

import React, { useState, useEffect } from "react";
import {
  vizApi,
  type VizBarResponse,
  type VizLineResponse,
  type VizScatterResponse,
  type VizHistogramResponse,
  type VizPieResponse,
  type VizTreemapResponse,
  type VizKPIMetrics,
} from "@/services/viz.service";
import type { ChartType } from "@/services/dashboards.service";
import EChart from "@/components/ui/EChart";
import * as echarts from "echarts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
  chartType: ChartType;
  chartParams: Record<string, unknown>;
}

const GRID = { containLabel: true, left: 20, right: 20, top: 25, bottom: 40 };

function buildBasicOption(res: VizBarResponse | VizLineResponse, xName: string, yName: string): echarts.EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    xAxis: { ...res.xAxis, name: xName, nameLocation: 'middle', nameGap: 25 },
    yAxis: { ...res.yAxis, name: yName, nameLocation: 'middle', nameGap: 40 },
    series: res.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildScatterOption(res: VizScatterResponse, xName: string, yName: string): echarts.EChartsOption {
  return {
    tooltip: { trigger: "item" },
    xAxis: { type: "value", name: xName, nameLocation: 'middle', nameGap: 25 },
    yAxis: { type: "value", name: yName, nameLocation: 'middle', nameGap: 40 },
    series: res.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildHistogramOption(res: VizHistogramResponse, xName: string): echarts.EChartsOption {
  const col = Object.values(res)[0];
  if (!col) return {};
  return {
    tooltip: { trigger: "axis" },
    xAxis: { ...col.xAxis, name: xName, nameLocation: 'middle', nameGap: 25 },
    yAxis: { ...col.yAxis, name: 'frequency', nameLocation: 'middle', nameGap: 40 },
    series: col.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildPieOption(res: VizPieResponse): echarts.EChartsOption {
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, icon: 'circle', textStyle: { fontSize: 10 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
      data: res.series
    }]
  };
}

function buildTreemapOption(res: VizTreemapResponse): echarts.EChartsOption {
  return {
    tooltip: { trigger: "item" },
    series: [{
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: { show: true, formatter: "{b}\n{c}" },
      data: res.series
    }]
  };
}

/** Helper to fetch and format chart data based on type */
async function fetchChartData(
  chartType: string,
  datasetId: number,
  xCol: string,
  yCol: string,
  agg: string
): Promise<{ option: echarts.EChartsOption | null; kpiData: VizKPIMetrics | null }> {
  if (chartType === "kpi") {
    const res = await vizApi.kpi(datasetId, { value_col: yCol, agg, label: xCol });
    return { option: null, kpiData: res.metrics };
  }

  const handlers: Record<string, () => Promise<echarts.EChartsOption>> = {
    bar: async () => buildBasicOption(await vizApi.bar(datasetId, { x_col: xCol, y_col: yCol, agg }), xCol, yCol),
    line: async () => buildBasicOption(await vizApi.line(datasetId, { x_col: xCol, y_cols: [yCol] }), xCol, yCol),
    scatter: async () => buildScatterOption(await vizApi.scatter(datasetId, { col_x: xCol, col_y: yCol }), xCol, yCol),
    histogram: async () => buildHistogramOption(await vizApi.histogram(datasetId, { columns: [xCol] }), xCol),
    pie: async () => buildPieOption(await vizApi.pie(datasetId, { name_col: xCol, value_col: yCol, agg })),
    treemap: async () => buildTreemapOption(await vizApi.treemap(datasetId, { name_col: xCol, value_col: yCol, agg })),
  };

  if (handlers[chartType]) {
    const opt = await handlers[chartType]();
    return { option: opt, kpiData: null };
  }

  return { option: null, kpiData: null };
}

/** Specialized UI for different widget states to reduce complexity */
const LoadingState = () => (
  <div className="h-full w-full flex items-center justify-center bg-muted/5">
    <div className="flex flex-col items-center gap-2">
      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">loading...</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="h-full w-full flex items-center justify-center bg-rose-50/50">
    <div className="text-center p-4">
      <p className="text-[10px] font-bold tracking-widest text-rose-600 uppercase mb-1">Rendering Error</p>
      <p className="text-[9px] text-muted-foreground lowercase">check parameters or dataset</p>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full w-full flex items-center justify-center bg-muted/5">
    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{message}</p>
  </div>
);

const KpiDisplay = ({ data }: { data: VizKPIMetrics }) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">{data.label}</p>
    <div className="flex items-baseline gap-1">
      <h2 className="text-4xl font-black tracking-tighter font-mono">{data.formatted_value}</h2>
      {data.unit && <span className="text-xs font-bold text-muted-foreground lowercase">{data.unit}</span>}
    </div>
    {data.trend !== undefined && (
      <div className={cn(
        "flex items-center gap-1 mt-3 px-2 py-0.5 text-[10px] font-bold font-mono",
        data.trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
      )}>
        {data.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(data.trend).toFixed(1)}%
      </div>
    )}
  </div>
);

export function ChartWidget({ chartType, chartParams }: Readonly<ChartWidgetProps>) {
  const [option, setOption] = useState<echarts.EChartsOption | null>(null);
  const [kpiData, setKpiData] = useState<VizKPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const datasetId = Number(chartParams.dataset_id);
  const xCol = typeof chartParams.x_col === 'string' ? chartParams.x_col : "";
  const yCol = typeof chartParams.y_col === 'string' ? chartParams.y_col : "";
  const agg = typeof chartParams.agg === 'string' ? chartParams.agg : "sum";

  useEffect(() => {
    if (!datasetId || (!xCol && chartType !== 'text' && chartType !== 'report')) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const { option: opt, kpiData: kpi } = await fetchChartData(chartType, datasetId, xCol, yCol, agg);
        setOption(opt);
        setKpiData(kpi);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [chartType, datasetId, xCol, yCol, agg]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!datasetId) return <EmptyState message="Missing Dataset ID" />;
  if (!xCol && chartType !== 'text' && chartType !== 'report') return <EmptyState message="Missing Configuration" />;
  if (!option && !kpiData) return <EmptyState message="No Data Returned" />;
  if (chartType === "kpi" && kpiData) return <KpiDisplay data={kpiData} />;

  return (
    <div className="h-full w-full p-2 overflow-hidden">
      <EChart option={option!} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
