"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Settings, 
  Plus, 
  Save, 
  Edit3, 
  Layout, 
  RefreshCw,
  Download,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardsApi, type DashboardDetail } from "@/services/dashboards.service";
import { DashboardGrid } from "../_components/DashboardGrid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      loadDashboard();
    }
  }, [id]);

  async function loadDashboard() {
    try {
      const data = await dashboardsApi.get(Number(id));
      setDashboard(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard details");
    } finally {
      setLoading(false);
    }
  }

  async function handleGlobalRefresh() {
    if (!dashboard) return;
    try {
      const updated = await dashboardsApi.refresh(dashboard.id);
      setDashboard(updated);
      toast.success("Dashboard data refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh dashboard");
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-theme(spacing.12))] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return <div>Dashboard not found.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Detail Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.push("/dashboards")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-[1px] bg-border/60 mx-2" />
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">{dashboard.title}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Dashboard Viewer • {dashboard.widgets.length} components</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4">
             <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl gap-2 text-xs font-bold">
               <Share2 className="h-3.5 w-3.5" /> Share
             </Button>
             <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl gap-2 text-xs font-bold">
               <Download className="h-3.5 w-3.5" /> Export
             </Button>
          </div>

          <Button 
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-9 px-4 rounded-xl gap-2 text-xs font-bold transition-all",
              isEditMode ? "bg-primary shadow-lg shadow-primary/20" : "border-border/60 hover:bg-muted/50"
            )}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Save className="h-3.5 w-3.5" /> Save Changes
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" /> Edit Layout
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/50"
            onClick={handleGlobalRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/50">
             <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
           {dashboard.widgets.length === 0 ? (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
               <div className="h-20 w-20 rounded-3xl bg-muted/20 border border-border/40 flex items-center justify-center">
                 <Layout className="h-10 w-10 text-muted-foreground" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">Empty Dashboard</h2>
                 <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                   This dashboard doesn't have any widgets yet. Add your visualizations from the DataLab or EDA modules.
                 </p>
               </div>
               <Button className="rounded-xl px-8 font-bold">Add Widget</Button>
             </div>
           ) : (
             <DashboardGrid 
               dashboardId={dashboard.id}
               widgets={dashboard.widgets} 
               onRefresh={loadDashboard}
               isEditMode={isEditMode}
             />
           )}
        </div>
      </main>

      {/* Floating Action Button for adding widgets in edit mode */}
      {isEditMode && (
        <Button 
          className="fixed bottom-8 right-8 h-14 w-14 rounded-2xl shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground group transition-all hover:scale-105 active:scale-95"
          onClick={() => toast.info("Select a visualization from Datalab to add to dashboard")}
        >
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
        </Button>
      )}
    </div>
  );
}
