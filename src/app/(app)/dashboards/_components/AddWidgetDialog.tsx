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
import { dashboardsApi, type WidgetType } from "@/services/dashboards.service";
import { datasetApi, type Dataset } from "@/services/dataset.service";
import { datalabApi } from "@/services/datalab.service";
import { toast } from "sonner";
import { BarChart2, LineChart, ScatterChart, BarChartHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWidgetDialogProps {
  dashboardId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

const CHART_TYPES: { value: WidgetType; label: string; icon: React.ReactNode; needsY: boolean }[] = [
  { value: "bar", label: "bar chart", icon: <BarChart2 className="h-5 w-5" />, needsY: true },
  { value: "line", label: "line chart", icon: <LineChart className="h-5 w-5" />, needsY: true },
  { value: "scatter", label: "scatter plot", icon: <ScatterChart className="h-5 w-5" />, needsY: true },
  { value: "histogram", label: "histogram", icon: <BarChartHorizontal className="h-5 w-5" />, needsY: false },
];

export function AddWidgetDialog({ dashboardId, open, onOpenChange, onAdded }: AddWidgetDialogProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [widgetType, setWidgetType] = useState<WidgetType>("bar");
  const [datasetId, setDatasetId] = useState<string>("");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");

  const selectedChartType = CHART_TYPES.find((c) => c.value === widgetType);
  const needsY = selectedChartType?.needsY ?? true;

  useEffect(() => {
    if (!open) return;
    setLoadingDatasets(true);
    datasetApi.listDatasets()
      .then((res) => setDatasets(res.results))
      .catch(() => toast.error("Failed to load datasets"))
      .finally(() => setLoadingDatasets(false));
  }, [open]);

  useEffect(() => {
    if (!datasetId) { setColumns([]); return; }
    setLoadingColumns(true);
    setXCol("");
    setYCol("");
    datalabApi.preview(Number(datasetId), 1)
      .then((res) => setColumns(res.columns))
      .catch(() => toast.error("Failed to load dataset columns"))
      .finally(() => setLoadingColumns(false));
  }, [datasetId]);

  function reset() {
    setTitle("");
    setWidgetType("bar");
    setDatasetId("");
    setXCol("");
    setYCol("");
    setColumns([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Widget title is required"); return; }
    if (!datasetId) { toast.error("Please select a dataset"); return; }
    if (!xCol) { toast.error("Please select an X column"); return; }
    if (needsY && !yCol) { toast.error("Please select a Y column"); return; }

    setSubmitting(true);
    try {
      await dashboardsApi.addWidget(dashboardId, {
        title: title.trim(),
        widget_type: widgetType,
        dataset: Number(datasetId),
        chart_params: needsY ? { x_col: xCol, y_col: yCol } : { x_col: xCol },
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

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[480px] rounded-none border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-mono lowercase">add component</DialogTitle>
          <DialogDescription className="text-xs lowercase">
            choose a dataset and configure your visualization widget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Chart type picker */}
          <div className="grid gap-2">
            <Label className="text-xs font-bold lowercase">chart type</Label>
            <div className="grid grid-cols-4 gap-2">
              {CHART_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setWidgetType(ct.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 border-2 text-xs font-bold lowercase transition-all",
                    widgetType === ct.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-slate-200 hover:border-foreground bg-background text-foreground"
                  )}
                >
                  {ct.icon}
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="widget-title" className="text-xs font-bold lowercase">widget title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Revenue"
              className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          {/* Dataset */}
          <div className="grid gap-2">
            <Label className="text-xs font-bold lowercase">dataset</Label>
            <Select value={datasetId} onValueChange={setDatasetId} disabled={loadingDatasets}>
              <SelectTrigger className="rounded-none border-foreground/20 focus:ring-0 focus:border-foreground">
                <SelectValue placeholder={loadingDatasets ? "loading..." : "choose a dataset..."} />
              </SelectTrigger>
              <SelectContent className="rounded-none border-foreground">
                {datasets.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">No datasets found.</div>
                ) : (
                  datasets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id.toString()} className="rounded-none text-xs lowercase">
                      {ds.file_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Column pickers — only show once dataset selected */}
          {columns.length > 0 && (
            <div className={cn("grid gap-4", needsY ? "grid-cols-2" : "grid-cols-1")}>
              <div className="grid gap-2">
                <Label className="text-xs font-bold lowercase">x column</Label>
                <Select value={xCol} onValueChange={setXCol} disabled={loadingColumns}>
                  <SelectTrigger className="rounded-none border-foreground/20 focus:ring-0 focus:border-foreground">
                    <SelectValue placeholder="select column..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-foreground">
                    {columns.map((col) => (
                      <SelectItem key={col} value={col} className="rounded-none text-xs">
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsY && (
                <div className="grid gap-2">
                  <Label className="text-xs font-bold lowercase">y column</Label>
                  <Select value={yCol} onValueChange={setYCol} disabled={loadingColumns}>
                    <SelectTrigger className="rounded-none border-foreground/20 focus:ring-0 focus:border-foreground">
                      <SelectValue placeholder="select column..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-foreground">
                      {columns.map((col) => (
                        <SelectItem key={col} value={col} className="rounded-none text-xs">
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {loadingColumns && (
            <p className="text-xs text-muted-foreground lowercase">loading columns...</p>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-none w-full bg-foreground text-background hover:bg-foreground/90 font-bold lowercase"
            >
              {submitting ? "adding..." : "add widget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
