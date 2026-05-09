"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, Layout, BarChart3 } from "lucide-react";
import { dashboardsApi, type Dashboard } from "@/services/dashboards.service";
import { DashboardGrid } from "@/app/(app)/dashboards/_components/DashboardGrid";
import { Logo } from "@/components/ui/Logo";

export default function PublicDashboardPage() {
  const { token } = useParams();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicDashboard() {
      try {
        if (typeof token !== 'string') return;
        const data = await dashboardsApi.getPublic(token);
        setDashboard(data);
      } catch (err) {
        console.error(err);
        setError("Dashboard not found or no longer public.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-bold capitalize tracking-widest text-muted-foreground font-mono">Loading Public Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-16 w-16 bg-muted/20 flex items-center justify-center mb-6 border-2 border-dashed border-border">
          <Layout className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold font-mono lowercase mb-2">Access Denied</h1>
        <p className="text-xs text-muted-foreground max-w-xs">{error || "This dashboard is private or does not exist."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Public Header */}
      <header className="h-16 border-b-2 border-foreground bg-background px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-foreground flex items-center justify-center">
            <Logo className="h-5 w-5 text-background" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none font-mono lowercase">{dashboard.title}</h1>
            <p className="text-[9px] font-bold text-muted-foreground/60 capitalize tracking-widest mt-1.5 flex items-center gap-2">
              <BarChart3 className="h-2.5 w-2.5" /> Public View • {dashboard.widgets.length} components
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold font-mono text-muted-foreground/40 hidden md:inline">POWERED BY PYANALYPT</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 bg-muted/5">
        <div className="max-w-[1600px] mx-auto">
          {dashboard.widgets.length === 0 ? (
            <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
              <p className="text-xs font-bold lowercase">No widgets to display.</p>
            </div>
          ) : (
            <DashboardGrid 
              dashboardId={dashboard.id}
              widgets={dashboard.widgets} 
              onRefresh={() => {}} // Read-only
              isEditMode={false}
            />
          )}
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-8 border-t border-border/40 bg-background text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-3 w-3 opacity-40" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/40 uppercase">Analypt Analytics Platform</span>
        </div>
        <p className="text-[9px] text-muted-foreground/40">© 2026 PyAnalypt Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
