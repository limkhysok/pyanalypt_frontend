"use client";

import React, { useState } from "react";
import { Responsive, useContainerWidth, type Layout, type LayoutItem, type ResponsiveProps } from "react-grid-layout";
import { 
  DashboardWidget, 
  dashboardsApi, 
} from "@/services/dashboards.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReportWidget } from "./ReportWidget";
import { ChartWidget } from "./ChartWidget";

import { motion } from "framer-motion";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardGridProps {
  dashboardId: number;
  widgets: DashboardWidget[];
  onRefresh: () => void;
  isEditMode: boolean;
}

const ResponsiveGridLayout = Responsive as unknown as React.ComponentType<ResponsiveProps>;

export function DashboardGrid({ dashboardId, widgets, onRefresh, isEditMode }: Readonly<DashboardGridProps>) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<LayoutItem[]>(() => 
    widgets.map(w => ({
      i: w.id.toString(),
      x: w.grid_col,
      y: w.grid_row,
      w: w.grid_width,
      h: w.grid_height
    })) as LayoutItem[]
  );

  const lastSyncedWidgetsRef = React.useRef<string>("");

  React.useEffect(() => {
    const widgetsJson = JSON.stringify(widgets);
    if (widgetsJson !== lastSyncedWidgetsRef.current) {
      lastSyncedWidgetsRef.current = widgetsJson;
      setLayout(widgets.map(w => ({
        i: w.id.toString(),
        x: w.grid_col,
        y: w.grid_row,
        w: w.grid_width,
        h: w.grid_height
      })) as LayoutItem[]);
    }
  }, [widgets]);

  const handleLayoutUpdate = async (newLayout: Layout) => {
    if (!isEditMode) return;
    
    // Update local state
    setLayout(newLayout as LayoutItem[]);

    // Save layout changes to backend
    for (const item of newLayout) {
      const widget = widgets.find(w => w.id.toString() === item.i);
      if (widget) {
        if (
          widget.grid_col !== item.x ||
          widget.grid_row !== item.y ||
          widget.grid_width !== item.w ||
          widget.grid_height !== item.h
        ) {
          try {
            await dashboardsApi.updateWidget(dashboardId, widget.id, {
              grid_col: item.x,
              grid_row: item.y,
              grid_width: item.w,
              grid_height: item.h
            });
          } catch (err) {
            console.error("Failed to save widget layout", err);
          }
        }
      }
    }
  };

  const handleDeleteWidget = async (widgetId: number) => {
    try {
      await dashboardsApi.deleteWidget(dashboardId, widgetId);
      toast.success("Widget removed");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove widget");
    }
  };

  const onDrop = (layout: Layout, item: LayoutItem | undefined, e: Event) => {
    // This is called when an external element is dropped
    try {
      if (!item) return;
      // The dropped data should contain the report ID
      const dragEvent = e as DragEvent;
      const jsonStr = dragEvent.dataTransfer?.getData("application/json");
      const textStr = dragEvent.dataTransfer?.getData("text/plain");
      
      const dragData = jsonStr || textStr;
      if (!dragData) return;

      let data;
      try {
        data = JSON.parse(dragData);
      } catch (parseErr) {
        console.warn("Dropped data is not valid JSON, skipping...", parseErr);
        return;
      }

      const { type, id, title } = data;
      
      if (type === 'report') {
        dashboardsApi.addWidget(dashboardId, {
          title: title || `Report: ${id}`,
          chart_type: 'report',
          report_id: id,
          grid_col: item.x,
          grid_row: item.y,
          grid_width: item.w,
          grid_height: item.h
        }).then(() => {
          toast.success("Report added to dashboard");
          onRefresh();
        }).catch(err => {
          console.error("Failed to add dropped widget", err);
          toast.error("Failed to add report");
        });
      }
    } catch (err) {
      console.error("Error parsing drop data", err);
    }
  };

  const renderWidgetContent = (widget: DashboardWidget) => {
    if (widget.chart_type === 'report' && widget.report) {
      return <ReportWidget reportId={widget.report} />;
    }
    
    if (widget.chart_type === 'text') {
      return (
        <div className="p-4 h-full w-full bg-muted/5 font-mono text-[11px] leading-relaxed">
           {widget.text_content}
        </div>
      );
    }
    
    if (['bar', 'line', 'scatter', 'histogram', 'pie', 'treemap', 'kpi'].includes(widget.chart_type)) {
      return <ChartWidget chartType={widget.chart_type} chartParams={widget.chart_params} />;
    }

    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/5">
        <p className="text-[10px] font-bold capitalize tracking-widest">No content</p>
      </div>
    );
  };

  const renderAnnotationOverlay = (widget: DashboardWidget) => {
    // Only show for non-report/text widgets with valid ID
    if (widget.chart_type === 'report' || widget.chart_type === 'text' || widget.id <= 0) {
      return null;
    }

    return (
      <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
         <p className="text-[10px] italic line-clamp-2">Widget Metadata</p>
      </div>
    );
  };

  const renderWidgetHeader = (widget: DashboardWidget) => {
    let Icon = null;
    if (widget.chart_type === 'report') Icon = FileText;
    else if (widget.chart_type === 'text') Icon = Type;

    return (
      <CardHeader className={cn(
        "p-3 flex flex-row items-center justify-between border-t-2 border-border/60",
        isEditMode && "drag-handle cursor-move bg-muted/30"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-3 w-3 text-primary shrink-0" />}
          <CardTitle className="text-[11px] font-bold truncate pr-4 lowercase font-mono">
            {widget.title}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
           {isEditMode && (
             <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none text-rose-600 hover:bg-rose-500/10" onClick={() => handleDeleteWidget(widget.id)}>
               <Trash2 className="h-3 w-3" />
             </Button>
           )}
        </div>
      </CardHeader>
    );
  };

  return (
    <section 
      ref={containerRef} 
      className="w-full h-full min-h-125"
      onDragOver={(e) => e.preventDefault()}
      aria-label="Dashboard interactive grid"
    >
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          // v2 style config
          dragConfig={{ enabled: isEditMode, handle: ".drag-handle", threshold: 5 }}
          resizeConfig={{ enabled: isEditMode }}
          dropConfig={{ enabled: isEditMode }}
          onDrop={onDrop}
          onLayoutChange={() => {
            /* Handled by onDragStop/onResizeStop to avoid loops */
          }}
          onDragStop={(layout) => handleLayoutUpdate(layout)}
          onResizeStop={(layout) => handleLayoutUpdate(layout)}
          droppingItem={{ i: "__dropping__", w: 4, h: 4, x: 0, y: 0, moved: false }}
        >
          {widgets.map((widget, i) => (
            <div key={widget.id} className="relative group">
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: i * 0.05,
                  type: "spring",
                  damping: 20,
                  stiffness: 100
                }}
                whileHover={isEditMode ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="h-full w-full"
              >
                <Card className={cn(
                  "text-card-foreground h-full w-full bg-background border-2 border-border shadow-none overflow-hidden flex flex-col rounded-none transition-colors",
                  !isEditMode && "hover:border-primary/50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]",
                  isEditMode ? "group-hover:border-foreground/40" : ""
                )}>
                  <CardContent className="flex-1 p-0 relative min-h-0 overflow-hidden">
                     {renderWidgetContent(widget)}
                     {renderAnnotationOverlay(widget)}
                  </CardContent>
                  {renderWidgetHeader(widget)}
                </Card>
              </motion.div>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </section>
  );
}
