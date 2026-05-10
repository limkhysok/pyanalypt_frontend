"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardsApi, type ChartType } from "@/services/dashboards.service";
import { datasetApi, type Dataset } from "@/services/dataset.service";
import { reportsApi, type Report } from "@/services/reports.service";
import { datalabApi } from "@/services/datalab.service";
import { toast } from "sonner";
import { BarChart2, LineChart, ScatterChart, BarChartHorizontal, FileText, Type, PieChart, Box, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWidgetDialogProps {
  dashboardId: number;
  datasetId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const CHART_TYPES: { value: ChartType; label: string; icon: React.ReactNode; category: 'chart' | 'special' }[] = [
  { value: "bar", label: "bar chart", icon: <BarChart2 className="h-4 w-4" />, category: 'chart' },
  { value: "line", label: "line chart", icon: <LineChart className="h-4 w-4" />, category: 'chart' },
  { value: "pie", label: "pie chart", icon: <PieChart className="h-4 w-4" />, category: 'chart' },
  { value: "scatter", label: "scatter plot", icon: <ScatterChart className="h-4 w-4" />, category: 'chart' },
  { value: "histogram", label: "histogram", icon: <BarChartHorizontal className="h-4 w-4" />, category: 'chart' },
  { value: "treemap", label: "treemap", icon: <Box className="h-4 w-4" />, category: 'chart' },
  { value: "kpi", label: "KPI metric", icon: <Activity className="h-4 w-4" />, category: 'special' },
  { value: "report", label: "report", icon: <FileText className="h-4 w-4" />, category: 'special' },
  { value: "text", label: "text block", icon: <Type className="h-4 w-4" />, category: 'special' },
];

function isNumericDtype(dtype: string) {
  return /int|float/i.test(dtype);
}

export function AddWidgetDialog({ dashboardId, datasetId: initialDatasetId, isOpen, onClose, onRefresh }: Readonly<AddWidgetDialogProps>) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [datasetId, setDatasetId] = useState<string>("");
  const [reportId, setReportId] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [agg, setAgg] = useState("sum");

  const needsDataset = ['bar', 'line', 'scatter', 'histogram', 'pie', 'treemap', 'kpi'].includes(chartType);
  const needsY = ['bar', 'line', 'scatter', 'pie', 'treemap', 'kpi'].includes(chartType);
  const numericXRequired = ['scatter', 'histogram'].includes(chartType);
  const xColOptions = numericXRequired ? numericColumns : columns;
  const showAgg = ['bar', 'pie', 'treemap', 'kpi'].includes(chartType);

  useEffect(() => {
    if (!isOpen) return;
    setDatasetId(initialDatasetId);
    
    if (needsDataset) {
      setLoadingDatasets(true);
      datasetApi.listDatasets()
        .then((res) => setDatasets(res.results))
        .catch(() => toast.error("Failed to load datasets"))
        .finally(() => setLoadingDatasets(false));
    }

    if (chartType === 'report') {
      setLoadingReports(true);
      reportsApi.list()
        .then((res) => setReports(res))
        .catch(() => toast.error("Failed to load reports"))
        .finally(() => setLoadingReports(false));
    }
  }, [isOpen, chartType, needsDataset, initialDatasetId]);

  useEffect(() => {
    if (!datasetId || !needsDataset) { setColumns([]); setNumericColumns([]); return; }
    setLoadingColumns(true);
    setXCol("");
    setYCol("");
    datalabApi.inspect(Number(datasetId))
      .then((res) => {
        const cols = res.info.columns;
        setColumns(cols.map((c) => c.column));
        setNumericColumns(cols.filter((c) => isNumericDtype(c.dtype)).map((c) => c.column));
      })
      .catch(() => toast.error("Failed to load dataset columns"))
      .finally(() => setLoadingColumns(false));
  }, [datasetId, needsDataset]);

  // Clear column selections when chart type changes to avoid stale non-numeric picks.
  useEffect(() => { setXCol(""); setYCol(""); }, [chartType]);

  function reset() {
    setTitle("");
    setChartType("bar");
    setDatasetId("");
    setReportId("");
    setTextContent("");
    setXCol("");
    setYCol("");
    setColumns([]);
    setNumericColumns([]);
  }

  const validate = () => {
    if (!title.trim()) { toast.error("Widget title is required"); return false; }
    if (needsDataset) {
      if (!datasetId) { toast.error("Please select a dataset"); return false; }
      if (!xCol) { toast.error("Please select an X column"); return false; }
      if (needsY && !yCol) { toast.error("Please select a Y column"); return false; }
    }
    if (chartType === 'report' && !reportId) {
      toast.error("Please select a report");
      return false;
    }
    return true;
  };

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    let gridWidth = 4;
    let gridHeight = 4;
    if (chartType === 'report') {
      gridWidth = 6;
      gridHeight = 6;
    } else if (chartType === 'kpi') {
      gridWidth = 3;
      gridHeight = 2;
    }

    try {
      await dashboardsApi.addWidget(dashboardId, {
        title: title.trim(),
        chart_type: chartType,
        report_id: chartType === 'report' ? Number(reportId) : undefined,
        chart_params: chartType === 'report' || chartType === 'text' ? {} : {
          dataset_id: Number(datasetId),
          x_col: xCol,
          ...(needsY ? { y_col: yCol, agg: agg } : {}),
        },
        text_content: chartType === 'text' ? textContent : undefined,
        grid_col: 0,
        grid_row: 0,
        grid_width: gridWidth,
        grid_height: gridHeight
      });

      toast.success("Widget added to dashboard");
      onRefresh();
      onClose();
      reset();
    } catch {
      toast.error("Failed to add widget");
    } finally {
      setSubmitting(false);
    }
  }
  
  const renderDatasetConfig = () => {
    if (!needsDataset) return null;
    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">dataset</Label>
          <Select value={datasetId} onValueChange={setDatasetId} disabled={loadingDatasets}>
            <SelectTrigger className="rounded-none border-foreground/20 h-10">
              <SelectValue placeholder={loadingDatasets ? "loading..." : "choose a dataset..."} />
            </SelectTrigger>
            <SelectContent className="rounded-none border-foreground">
              {datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id.toString()} className="rounded-none text-xs lowercase">
                  {ds.file_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {columns.length > 0 && (
          <div className={cn("grid gap-4", needsY ? "grid-cols-2" : "grid-cols-1")}>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">x axis</Label>
              <Select value={xCol} onValueChange={setXCol} disabled={loadingColumns}>
                <SelectTrigger className="rounded-none border-foreground/20 h-10">
                  <SelectValue placeholder="select..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-foreground">
                  {xColOptions.map((col) => <SelectItem key={col} value={col} className="rounded-none text-xs">{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {needsY && (
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">y axis</Label>
                <Select value={yCol} onValueChange={setYCol} disabled={loadingColumns}>
                  <SelectTrigger className="rounded-none border-foreground/20 h-10">
                    <SelectValue placeholder="select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-foreground">
                    {numericColumns.map((col) => <SelectItem key={col} value={col} className="rounded-none text-xs">{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        {showAgg && columns.length > 0 && (
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">aggregation</Label>
            <Select value={agg} onValueChange={setAgg}>
              <SelectTrigger className="rounded-none border-foreground/20 h-10">
                <SelectValue placeholder="sum" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-foreground">
                <SelectItem value="sum" className="rounded-none text-xs">Sum</SelectItem>
                <SelectItem value="mean" className="rounded-none text-xs">Average</SelectItem>
                <SelectItem value="count" className="rounded-none text-xs">Count</SelectItem>
                <SelectItem value="min" className="rounded-none text-xs">Min</SelectItem>
                <SelectItem value="max" className="rounded-none text-xs">Max</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-none border-2 border-foreground p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-6 border-b-2 border-foreground bg-muted/30">
            <DialogTitle className="text-[12px] font-bold uppercase tracking-[0.2em]">Add Component</DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-wider font-medium opacity-60">
              Select a visualization type and configure your data.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] p-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CHART_TYPES.map((ct) => (
                    <button 
                      key={ct.value} 
                      type="button" 
                      onClick={() => setChartType(ct.value)} 
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 border-2 text-[10px] font-bold transition-all", 
                        chartType === ct.value ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                      )}
                    >
                      {ct.icon} {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="widget-title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">title</Label>
                <Input id="widget-title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Title" className="rounded-none border-foreground/20 h-10" />
              </div>

              {renderDatasetConfig()}

              {chartType === 'report' && (
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">report</Label>
                  <Select value={reportId} onValueChange={setReportId} disabled={loadingReports}>
                    <SelectTrigger className="rounded-none border-foreground/20 h-10"><SelectValue placeholder="choose report..." /></SelectTrigger>
                    <SelectContent className="rounded-none border-foreground">
                      {reports.map((r) => <SelectItem key={r.id} value={r.id.toString()} className="rounded-none text-xs">{r.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {chartType === 'text' && (
                <div className="grid gap-2">
                  <Label htmlFor="text-content" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">content</Label>
                  <textarea id="text-content" value={textContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextContent(e.target.value)} placeholder="Notes..." className="flex min-h-20 w-full rounded-none border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t-2 border-foreground bg-muted/10 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-widest px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="rounded-none bg-foreground text-background font-bold uppercase text-[10px] tracking-widest flex-1 h-11"
            >
              {submitting ? "adding..." : "add widget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
