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
import { AddWidgetDialog } from "../_components/AddWidgetDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);


  const loadDashboard = React.useCallback(async () => {
    try {
      const data = await dashboardsApi.get(Number(id));
      setDashboard(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard details");
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    if (id) {
      loadDashboard();
    }
  }, [id, loadDashboard]);

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
      <div className="h-[calc(100vh-(--spacing(12)))] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground font-mono">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return <div>Dashboard not found.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Detail Header */}
      <header className="h-14 border-b-2 border-foreground bg-background px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-none hover:bg-muted/80" onClick={() => router.push("/dashboards")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 w-0.5 bg-foreground/10 mx-1" />
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none font-mono lowercase">{dashboard.title}</h1>
            <p className="text-[9px] font-bold text-muted-foreground/60 capitalize tracking-widest mt-1.5">Dashboard Viewer • {dashboard.widgets.length} components</p>
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
              "h-8 px-4 rounded-none gap-2 text-xs font-bold transition-all border-2",
              isEditMode 
                ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" 
                : "border-slate-200 hover:border-foreground"
            )}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Save className="h-3.5 w-3.5" /> save layout
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" /> edit mode
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none border-2 border-slate-200 hover:border-foreground hover:bg-slate-50 transition-all"
            onClick={handleGlobalRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-2 border-slate-200 hover:border-foreground hover:bg-slate-50 transition-all">
             <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-400 mx-auto">
           {dashboard.widgets.length === 0 ? (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
               <div className="h-20 w-20 rounded-none bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                 <Layout className="h-10 w-10 text-slate-400" />
               </div>
               <div className="space-y-3">
                 <h2 className="text-xl font-bold tracking-tight lowercase">empty dashboard</h2>
                 <p className="text-muted-foreground text-[13px] max-w-sm mx-auto lowercase">
                   this dashboard doesn&apos;t have any widgets yet. add your visualizations from the datalab or eda modules.
                 </p>
               </div>
               <Button onClick={() => setIsAddWidgetOpen(true)} className="rounded-none px-8 h-10 font-bold bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-foreground/90 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lowercase">add component</Button>
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
          className="fixed bottom-8 right-8 h-12 w-12 rounded-none border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-foreground hover:bg-foreground text-background group transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          onClick={() => setIsAddWidgetOpen(true)}
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
        </Button>
      )}

      <AddWidgetDialog
        dashboardId={dashboard.id}
        open={isAddWidgetOpen}
        onOpenChange={setIsAddWidgetOpen}
        onAdded={loadDashboard}
      />
    </div>
  );
}
