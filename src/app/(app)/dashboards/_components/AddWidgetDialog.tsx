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
import { BarChart2, LineChart, ScatterChart, BarChartHorizontal, FileText, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWidgetDialogProps {
  dashboardId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

const CHART_TYPES: { value: ChartType; label: string; icon: React.ReactNode; category: 'chart' | 'special' }[] = [
  { value: "bar", label: "bar chart", icon: <BarChart2 className="h-4 w-4" />, category: 'chart' },
  { value: "line", label: "line chart", icon: <LineChart className="h-4 w-4" />, category: 'chart' },
  { value: "scatter", label: "scatter plot", icon: <ScatterChart className="h-4 w-4" />, category: 'chart' },
  { value: "histogram", label: "histogram", icon: <BarChartHorizontal className="h-4 w-4" />, category: 'chart' },
  { value: "report", label: "report", icon: <FileText className="h-4 w-4" />, category: 'special' },
  { value: "text", label: "text block", icon: <Type className="h-4 w-4" />, category: 'special' },
];

export function AddWidgetDialog({ dashboardId, open, onOpenChange, onAdded }: Readonly<AddWidgetDialogProps>) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
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

  const needsDataset = ['bar', 'line', 'scatter', 'histogram'].includes(chartType);
  const needsY = ['bar', 'line', 'scatter'].includes(chartType);

  useEffect(() => {
    if (!open) return;
    
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
  }, [open, chartType, needsDataset]);

  useEffect(() => {
    if (!datasetId || !needsDataset) { setColumns([]); return; }
    setLoadingColumns(true);
    setXCol("");
    setYCol("");
    datalabApi.preview(Number(datasetId), 1)
      .then((res) => setColumns(res.columns))
      .catch(() => toast.error("Failed to load dataset columns"))
      .finally(() => setLoadingColumns(false));
  }, [datasetId, needsDataset]);

  function reset() {
    setTitle("");
    setChartType("bar");
    setDatasetId("");
    setReportId("");
    setTextContent("");
    setXCol("");
    setYCol("");
    setColumns([]);
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
    try {
      await dashboardsApi.addWidget(dashboardId, {
        title: title.trim(),
        chart_type: chartType,
        report_id: chartType === 'report' ? Number(reportId) : undefined,
        chart_params: chartType === 'report' || chartType === 'text' ? {} : {
          x_col: xCol,
          y_col: yCol,
          agg: agg
        },
        text_content: chartType === 'text' ? textContent : undefined,
        grid_col: 0,
        grid_row: 0,
        grid_width: chartType === 'report' ? 6 : 4,
        grid_height: chartType === 'report' ? 6 : 4,
      });
      toast.success("Widget added to dashboard");
      onOpenChange(false);
      reset();
      onAdded();
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
                  {columns.map((col) => <SelectItem key={col} value={col} className="rounded-none text-xs">{col}</SelectItem>)}
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
                    {columns.map((col) => <SelectItem key={col} value={col} className="rounded-none text-xs">{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        {chartType === 'bar' && columns.length > 0 && (
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
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-140 rounded-none border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-mono lowercase">add component</DialogTitle>
          <DialogDescription className="text-xs lowercase">configure your widget.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">type</Label>
            <div className="grid grid-cols-3 gap-2">
              {CHART_TYPES.map((ct) => (
                <button key={ct.value} type="button" onClick={() => setChartType(ct.value)} className={cn("flex flex-col items-center gap-2 p-3 border-2 text-[10px] font-bold transition-all", chartType === ct.value ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>
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
              <textarea id="text-content" value={textContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextContent(e.target.value)} placeholder="Notes..." className="flex min-h-[80px] w-full rounded-none border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-32" />
            </div>
          )}

          <DialogFooter><Button type="submit" disabled={submitting} className="rounded-none w-full bg-foreground text-background font-bold h-12 uppercase text-xs">{submitting ? "adding..." : "add widget"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
