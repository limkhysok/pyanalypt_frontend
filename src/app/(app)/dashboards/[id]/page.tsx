"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit3,
  Layout,
  RefreshCw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardsApi, type Dashboard } from "@/services/dashboards.service";
import { DashboardGrid } from "../_components/DashboardGrid";
import { AddWidgetDialog } from "../_components/AddWidgetDialog";
import { ReportSidebar } from "../_components/ReportSidebar";
import { DashboardSettings } from "../_components/DashboardSettings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


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
            <p className="text-[9px] font-bold text-muted-foreground/60 capitalize tracking-widest mt-1.5">{isEditMode ? 'Edit Mode' : 'Viewer'} • {dashboard.widgets.length} components</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 px-4 rounded-none gap-2 text-xs font-bold transition-all border-2",
              isEditMode 
                ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" 
                : "border-border hover:border-foreground"
            )}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <X className="h-3.5 w-3.5" /> exit edit
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
            className="h-8 w-8 rounded-none border-2 border-border hover:border-foreground hover:bg-muted/50 transition-all"
            onClick={handleGlobalRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none border-2 border-border hover:border-foreground hover:bg-muted/50 transition-all"
            onClick={() => setIsSettingsOpen(true)}
          >
             <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Optional Sidebar for Reports in Edit Mode */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="hidden lg:block border-r-2 border-foreground/10"
            >
              <ReportSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/5">
          <motion.div 
            layout
            className="max-w-400 mx-auto"
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
          >
             {dashboard.widgets.length === 0 && !isEditMode ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
               >
                 <div className="h-20 w-20 rounded-none bg-muted/30 border-2 border-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                   <Layout className="h-10 w-10 text-muted-foreground" />
                 </div>
                 <div className="space-y-3">
                   <h2 className="text-xl font-bold tracking-tight lowercase">empty dashboard</h2>
                   <p className="text-muted-foreground text-[13px] max-w-sm mx-auto lowercase">
                     this dashboard doesn&apos;t have any widgets yet. click &quot;add component&quot; to add charts, reports, or text blocks.
                   </p>
                 </div>
                 <Button onClick={() => setIsAddWidgetOpen(true)} className="rounded-none px-8 h-10 font-bold bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-foreground/90 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lowercase">add component</Button>
               </motion.div>
             ) : (
               <DashboardGrid 
                 dashboardId={dashboard.id}
                 widgets={dashboard.widgets} 
                 onRefresh={loadDashboard}
                 isEditMode={isEditMode}
               />
             )}
          </motion.div>
        </main>
      </div>

      {/* Floating Action Button for adding widgets in edit mode */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              className="h-14 w-14 rounded-none border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-foreground hover:bg-foreground text-background group transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              onClick={() => setIsAddWidgetOpen(true)}
            >
              <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddWidgetDialog
        dashboardId={dashboard.id}
        open={isAddWidgetOpen}
        onOpenChange={setIsAddWidgetOpen}
        onAdded={loadDashboard}
      />

      <DashboardSettings
        dashboard={dashboard}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onUpdated={loadDashboard}
      />
    </div>
  );
}
