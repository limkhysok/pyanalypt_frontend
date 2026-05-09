"use client";

import React, { useEffect, useState } from "react";
import { reportsApi, type Report } from "@/services/reports.service";
import { FileText, GripVertical, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ReportSidebar() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.list().then(res => {
      setReports(res);
      setLoading(false);
    });
  }, []);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (e: React.DragEvent, report: Report) => {
    const dragData = JSON.stringify({
      type: "report",
      id: report.id,
      title: report.title
    });
    e.dataTransfer.setData("application/json", dragData);
    e.dataTransfer.setData("text/plain", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-[10px] p-4 text-center animate-pulse">Loading reports...</p>;
    }
    
    if (filteredReports.length === 0) {
      return <p className="text-[10px] p-4 text-center text-muted-foreground">No reports found</p>;
    }

    return (
      <ul className="space-y-1">
        {filteredReports.map(report => (
          <li key={report.id}>
            <button
              draggable
              onDragStart={(e) => onDragStart(e, report)}
              type="button"
              className="w-full flex items-center gap-2 p-2 bg-background border border-border/40 hover:border-foreground cursor-grab active:cursor-grabbing transition-all group outline-none focus-visible:ring-1 focus-visible:ring-foreground text-left"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-foreground/60" />
              <FileText className="h-3.5 w-3.5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold truncate lowercase">{report.title}</p>
                <p className="text-[9px] text-muted-foreground truncate capitalize">{report.dataset_name || 'No dataset'}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-64 border-r-2 border-foreground bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b-2 border-foreground/10 bg-background">
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">Available Reports</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input 
            placeholder="Search reports..." 
            className="pl-8 h-8 text-xs rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderContent()}
        </div>
      </ScrollArea>
      <div className="p-3 bg-foreground text-background">
        <p className="text-[9px] font-bold uppercase tracking-tighter text-center">Drag to dashboard</p>
      </div>
    </div>
  );
}
