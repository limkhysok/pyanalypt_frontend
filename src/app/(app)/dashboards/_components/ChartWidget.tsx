"use client";

import React, { useState, useEffect } from "react";
import {
  vizApi,
  type VizBarResponse,
  type VizLineResponse,
  type VizScatterResponse,
  type VizHistogramResponse,
} from "@/services/viz.service";
import type { ChartType } from "@/services/dashboards.service";
import EChart from "@/components/ui/EChart";
import * as echarts from "echarts";

interface ChartWidgetProps {
  chartType: ChartType;
  chartParams: Record<string, unknown>;
}

const GRID = { containLabel: true, left: 20, right: 20, top: 20, bottom: 20 };

function buildBarOption(res: VizBarResponse): echarts.EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    xAxis: res.xAxis,
    yAxis: res.yAxis,
    series: res.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildLineOption(res: VizLineResponse): echarts.EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    xAxis: res.xAxis,
    yAxis: res.yAxis,
    series: res.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildScatterOption(res: VizScatterResponse): echarts.EChartsOption {
  return {
    tooltip: { trigger: "item" },
    xAxis: { type: "value", name: res.xAxis.name },
    yAxis: { type: "value", name: res.yAxis.name },
    series: res.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

function buildHistogramOption(res: VizHistogramResponse): echarts.EChartsOption {
  const col = Object.values(res)[0];
  if (!col) return {};
  return {
    tooltip: { trigger: "axis" },
    xAxis: col.xAxis,
    yAxis: col.yAxis,
    series: col.series as echarts.SeriesOption[],
    grid: GRID,
  };
}

export function ChartWidget({ chartType, chartParams }: Readonly<ChartWidgetProps>) {
  const [option, setOption] = useState<echarts.EChartsOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const datasetId = Number(chartParams.dataset_id);
  const xCol = String(chartParams.x_col ?? "");
  const yCol = String(chartParams.y_col ?? "");
  const agg = String(chartParams.agg ?? "sum");

  useEffect(() => {
    if (!datasetId || !xCol) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const load = async () => {
      try {
        let opt: echarts.EChartsOption;

        if (chartType === "bar") {
          const res = await vizApi.bar(datasetId, { x_col: xCol, y_col: yCol, agg });
          opt = buildBarOption(res);
        } else if (chartType === "line") {
          const res = await vizApi.line(datasetId, { x_col: xCol, y_cols: [yCol] });
          opt = buildLineOption(res);
        } else if (chartType === "scatter") {
          const res = await vizApi.scatter(datasetId, { col_x: xCol, col_y: yCol });
          opt = buildScatterOption(res);
        } else if (chartType === "histogram") {
          const res = await vizApi.histogram(datasetId, { columns: [xCol] });
          opt = buildHistogramOption(res);
        } else {
          setLoading(false);
          return;
        }

        setOption(opt);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [chartType, datasetId, xCol, yCol, agg]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/5">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground animate-pulse">loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/5">
        <p className="text-[10px] font-bold tracking-widest text-destructive">failed to load chart</p>
      </div>
    );
  }

  if (!option) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/5">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground capitalize">No content</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[300px] p-4">
      <EChart option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
