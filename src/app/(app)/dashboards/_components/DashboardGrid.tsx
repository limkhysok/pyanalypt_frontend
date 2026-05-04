"use client";

import React, { useState } from "react";
import { Responsive, Layout, useContainerWidth } from "react-grid-layout";
import { 
  DashboardWidget, 
  dashboardsApi, 
} from "@/services/dashboards.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import EChart from "@/components/ui/EChart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardGridProps {
  dashboardId: number;
  widgets: DashboardWidget[];
  onRefresh: () => void;
  isEditMode: boolean;
}

export function DashboardGrid({ dashboardId, widgets, onRefresh, isEditMode }: Readonly<DashboardGridProps>) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<Layout>(() => 
    widgets.map(w => ({
      i: w.id.toString(),
      x: w.grid_x,
      y: w.grid_y,
      w: w.grid_w,
      h: w.grid_h
    }))
  );

  // Synchronize state with props during render to avoid useEffect cascading renders
  const [prevWidgets, setPrevWidgets] = useState(widgets);
  if (widgets !== prevWidgets) {
    setPrevWidgets(widgets);
    setLayout(widgets.map(w => ({
      i: w.id.toString(),
      x: w.grid_x,
      y: w.grid_y,
      w: w.grid_w,
      h: w.grid_h
    })));
  }

  const handleLayoutChange = async (newLayout: Layout) => {
    if (!isEditMode) return;
    
    // Save layout changes to backend
    for (const item of newLayout) {
      const widget = widgets.find(w => w.id.toString() === item.i);
      if (widget) {
        if (
          widget.grid_x !== item.x ||
          widget.grid_y !== item.y ||
          widget.grid_w !== item.w ||
          widget.grid_h !== item.h
        ) {
          try {
            await dashboardsApi.updateWidget(dashboardId, widget.id, {
              grid_x: item.x,
              grid_y: item.y,
              grid_w: item.w,
              grid_h: item.h
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

  const handleRefreshWidget = async (widgetId: number) => {
    try {
      await dashboardsApi.refreshWidget(dashboardId, widgetId);
      toast.success("Widget refreshed");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh widget");
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px]">
      {mounted && (
        <Responsive
          width={width}
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          dragConfig={{ 
            enabled: isEditMode, 
            handle: ".drag-handle" 
          }}
          resizeConfig={{ 
            enabled: isEditMode 
          }}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="relative group">
              <Card className="h-full w-full bg-background/80 backdrop-blur-md border-border/40 shadow-sm overflow-hidden flex flex-col rounded-2xl">
                <CardHeader className={cn(
                  "p-3 flex flex-row items-center justify-between border-b border-border/20",
                  isEditMode && "drag-handle cursor-move bg-muted/20"
                )}>
                  <CardTitle className="text-xs font-bold truncate pr-4">
                    {widget.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRefreshWidget(widget.id)}>
                       <RefreshCw className="h-3 w-3" />
                     </Button>
                     {isEditMode && (
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteWidget(widget.id)}>
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative min-h-0 overflow-hidden">
                   {widget.chart_params ? (
                     <EChart 
                       option={widget.chart_params} 
                       style={{ height: '100%', width: '100%' }}
                     />
                   ) : (
                     <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/5">
                       <p className="text-[10px] font-bold uppercase tracking-widest">No chart data</p>
                     </div>
                   )}
                   {widget.annotation && (
                     <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] italic line-clamp-2">{widget.annotation}</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            </div>
          ))}
        </Responsive>
      )}
    </div>
  );
}
