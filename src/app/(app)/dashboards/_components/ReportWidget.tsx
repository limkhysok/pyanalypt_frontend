"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { reportsApi, type ReportDetail, type ReportItem } from "@/services/reports.service";
import { RefreshCw, FileText } from "lucide-react";
import EChart from "@/components/ui/EChart";

interface ReportWidgetProps {
  reportId: number;
}

export function ReportWidget({ reportId }: Readonly<ReportWidgetProps>) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await reportsApi.get(reportId);
        setReport(data);
      } catch (err) {
        console.error("Failed to load report for widget", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-muted/5">
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Loading Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/5">
        <p className="text-[10px] font-bold capitalize">Report not found</p>
      </div>
    );
  }

  const renderItemContent = (item: ReportItem) => {
    if (item.chart_image) {
      const src = item.chart_image.startsWith('data:') 
        ? item.chart_image 
        : `data:image/png;base64,${item.chart_image}`;
      
      return (
        <div className="relative w-full h-[400px]">
          <Image 
            src={src} 
            alt={item.chart_type}
            fill
            className="object-contain p-4"
            unoptimized
          />
        </div>
      );
    }

    if (item.chart_params) {
      return (
        <div className="h-[400px] w-full">
          <EChart 
            option={item.chart_params as echarts.EChartsOption} 
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      );
    }

    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p className="text-[8px] text-muted-foreground uppercase">No Data</p>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 bg-muted/20 flex items-center gap-2">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-tight truncate">{report.title}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-foreground/20">
        <div className="space-y-6">
          {report.items.map((item, idx) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted-foreground/60">#{idx + 1}</span>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>
              <div className="w-full border border-border/40 rounded-sm overflow-hidden bg-muted/5">
                {renderItemContent(item)}
              </div>
              {item.annotation && (
                <p className="text-[9px] italic text-muted-foreground leading-tight px-1">
                  {item.annotation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
