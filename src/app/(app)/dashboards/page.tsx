"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Layout, 
  Clock, 
  Trash2, 
  Search,
  MoreVertical,
  BarChart3,
  LayoutDashboard,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardsApi, type Dashboard } from "@/services/dashboards.service";
import { datasetApi, type Dataset } from "@/services/dataset.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardsListPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [dashData, datasetData] = await Promise.all([
        dashboardsApi.list(),
        datasetApi.listDatasets()
      ]);
      setDashboards(dashData);
      setDatasets(datasetData.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this dashboard?")) return;
    try {
      await dashboardsApi.delete(id);
      setDashboards(dashboards.filter(d => d.id !== id));
      toast.success("Dashboard deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete dashboard");
    }
  }

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a dashboard title");
      return;
    }

    if (!selectedDatasetId) {
      toast.error("Please select a dataset");
      return;
    }
    
    setIsCreating(true);
    try {
      const newDash = await dashboardsApi.create({ 
        title: newTitle,
        description: newDescription,
        dataset_id: Number.parseInt(selectedDatasetId)
      });
      setDashboards([newDash, ...dashboards]);
      toast.success("Dashboard created");
      setIsCreateDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setSelectedDatasetId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create dashboard");
    } finally {
      setIsCreating(false);
    }
  }

  const filteredDashboards = dashboards.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function renderDashboardGrid() {
    if (loading) {
      return [1, 2, 3].map(i => (
        <Card key={i} className="h-48 rounded-none border-slate-200 animate-pulse bg-slate-50/50" />
      ));
    }
    if (filteredDashboards.length === 0) {
      return (
        <div className="col-span-full py-20 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-muted-foreground/60 lowercase">no boards found in this view</p>
        </div>
      );
    }
    return filteredDashboards.map((dash, i) => (
      <motion.div
        key={dash.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <Card className="group bg-background border border-slate-200 rounded-none shadow-none hover:border-slate-400 transition-all">
          <CardContent className="p-0">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className="h-10 w-10 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none border-border shadow-none p-1.5">
                    <DropdownMenuItem className="rounded-none text-sm font-semibold cursor-pointer">rename</DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600 rounded-none text-sm font-semibold cursor-pointer" onClick={() => handleDelete(dash.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-base font-bold tracking-tight lowercase truncate">{dash.title}</h3>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 lowercase line-clamp-1 h-4">
                {dash.description || "no description provided"}
              </p>
            </div>

            <div className="p-5 bg-slate-50 group-hover:bg-white transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground/40 capitalize tracking-widest mb-1">widgets</span>
                  <span className="text-xs font-bold lowercase">{dash.widget_count || 0} items</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground/40 capitalize tracking-widest mb-1">updated</span>
                  <span className="text-xs font-bold lowercase text-muted-foreground">{format(new Date(dash.updated_at), "MMM d")}</span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-none h-8 px-4 text-xs font-bold lowercase border-slate-200 hover:border-slate-800 transition-all">
                <Link href={`/dashboards/${dash.id}`}>
                  view board
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  }

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary shrink-0" />
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight font-mono leading-none">Dashboards</h1>
            <span className="text-sm text-muted-foreground leading-none">/ Organize insights into interactive boards</span>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-2 text-xs rounded-none capitalize bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-0">
              <Plus className="h-3.5 w-3.5" /> New dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-none border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-mono lowercase">Create New Dashboard</DialogTitle>
              <DialogDescription className="text-xs lowercase">
                Enter a title and description for your new visualization board.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dataset" className="text-xs font-bold lowercase">Select Dataset</Label>
                <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                  <SelectTrigger id="dataset" className="rounded-none border-foreground/20 focus:ring-0 focus:border-foreground">
                    <SelectValue placeholder="choose a dataset..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-foreground">
                    {datasets.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">No datasets found. Upload one first!</div>
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
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold lowercase">Dashboard Title</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sales Performance Q2"
                  className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold lowercase">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly describe what this board tracks..."
                  className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>
              <DialogFooter className="mt-4">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="rounded-none w-full bg-foreground text-background hover:bg-foreground/90 font-bold lowercase"
                >
                  {isCreating ? "Creating..." : "Create Dashboard"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <Layout className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">{dashboards.length}</p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">boards</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Total visualizations created</p>
                </div>
            </CardContent>
         </Card>
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <BarChart3 className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">
                        {dashboards.reduce((acc, d) => acc + (d.widget_count || 0), 0)}
                      </p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">widgets</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Individual chart components</p>
                </div>
            </CardContent>
         </Card>
         <Card className="bg-background border border-slate-200 rounded-none shadow-none overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-5">
                <div className="h-11 w-11 border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white">
                    <Clock className="h-5 w-5 text-muted-foreground/80" />
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tabular-nums">
                        {dashboards.filter(d => {
                           const updated = new Date(d.updated_at);
                           const today = new Date();
                           return updated.toDateString() === today.toDateString();
                        }).length}
                      </p>
                      <span className="text-xs font-semibold text-muted-foreground/40 lowercase">today</span>
                   </div>
                   <p className="text-xs font-medium text-muted-foreground mt-1 lowercase">Dashboards updated in last 24h</p>
                </div>
            </CardContent>
         </Card>
      </div>

      {/* ── Tabs & Content ── */}
      <div className="w-full">
        <div className="flex items-stretch border-b border-border mb-6">
          {[
            { value: "all", label: "My Boards", icon: BarChart3 },
            { value: "shared", label: "Shared with me", icon: ExternalLink },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-2.5 inline-flex items-center gap-1.5 text-xs rounded-none transition-all whitespace-nowrap border-b-2 focus-visible:outline-none lowercase",
                activeTab === tab.value
                  ? "text-primary font-bold border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
              )}
            >
              <tab.icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 p-3 border border-slate-200 rounded-none">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="search boards..." 
                className="pl-9 h-9 bg-background border-slate-200 rounded-none text-xs lowercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-muted-foreground/40 lowercase mr-2">{filteredDashboards.length} boards found</span>
               <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-slate-200" onClick={loadInitialData}>
                 <RefreshCw className="h-3.5 w-3.5" />
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderDashboardGrid()}
          </div>
        </div>
      </div>
    </main>
  );
}
