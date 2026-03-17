"use client";

import React from "react";
import {
    AlertCircle,
    Search,
    Loader2,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Filter,
    Database,
    ChevronDown,
    RotateCcw,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Issue, Dataset } from "@/types/dataset";
import { toast } from "sonner";

export function IssuesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [issues, setIssues] = React.useState<Issue[]>([]);
    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [severityFilter, setSeverityFilter] = React.useState<string>("all");
    const [statusFilter, setStatusFilter] = React.useState<string>("unresolved");
    const [selectedDataset, setSelectedDataset] = React.useState<string>("all");

    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const [issuesData, datasetsData] = await Promise.all([
                datasetApi.listIssues(),
                datasetApi.listDatasets()
            ]);
            setIssues(issuesData);
            setDatasets(datasetsData);
        } catch (error) {
            console.error("Failed to fetch issues data:", error);
            toast.error("Cloud synchronisation failed.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchData();
        }
    }, [authLoading, isAuthenticated, router, fetchData]);

    const handleResolve = async (id: number) => {
        try {
            await datasetApi.updateIssue(id, { is_resolved: true });
            setIssues(prev => prev.map(issue => 
                issue.id === id ? { ...issue, is_resolved: true } : issue
            ));
            toast.success("Anomaly neutralized.");
        } catch (error) {
            console.error("handleResolve error:", error);
            toast.error("Command execution failed.");
        }
    };

    const filteredIssues = React.useMemo(() => {
        return issues.filter(issue => {
            const matchesSearch = issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 issue.column_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
            
            let matchesStatus = true;
            if (statusFilter !== "all") {
                matchesStatus = statusFilter === "resolved" ? issue.is_resolved : !issue.is_resolved;
            }

            const matchesDataset = selectedDataset === "all" || issue.dataset === Number.parseInt(selectedDataset);
            
            return matchesSearch && matchesSeverity && matchesStatus && matchesDataset;
        });
    }, [issues, searchQuery, severityFilter, statusFilter, selectedDataset]);

    const stats = React.useMemo(() => {
        const total = issues.length;
        const critical = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
        const resolved = issues.filter(i => i.is_resolved).length;
        const pending = total - resolved;
        return { total, critical, resolved, pending };
    }, [issues]);

    const renderIssuesContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 rounded-[2rem] bg-muted/20 animate-pulse border border-border/40" />
                    ))}
                </div>
            );
        }

        if (filteredIssues.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredIssues.map((issue, idx) => (
                            <motion.div
                                key={issue.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: idx * 0.02 }}
                            >
                                <Card className={cn(
                                    "group relative overflow-hidden h-full bg-background/40 hover:bg-background/80 backdrop-blur-md border transition-all duration-300 rounded-[2rem] shadow-sm flex flex-col",
                                    getIssueStyles(issue)
                                )}>
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                getIconStyles(issue)
                                            )}>
                                                {issue.is_resolved ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className={cn(
                                                    "w-fit text-[8px] font-black uppercase tracking-tighter rounded-md h-5 px-2",
                                                    getBadgeStyles(issue)
                                                )}>
                                                    {issue.severity}
                                                </Badge>
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                                    {new Date(issue.detected_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <CardTitle className="text-base font-black tracking-tight line-clamp-2 leading-tight">
                                            {issue.description}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="px-6 py-4 flex-grow space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70">
                                            <Database size={12} />
                                            <span className="truncate">{datasets.find(d => d.id === issue.dataset)?.file_name || 'Artifact Unknown'}</span>
                                        </div>
                                        {issue.column_name && (
                                            <div className="bg-muted/30 p-3 rounded-xl border border-border/5">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impacted Sector</p>
                                                <p className="text-xs font-black tracking-tight text-primary uppercase">{issue.column_name}</p>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-6 pt-2">
                                        {issue.is_resolved ? (
                                            <div className="w-full h-10 flex items-center justify-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                <CheckCircle2 size={14} /> Neutralized
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 w-full">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-none font-black text-[9px] uppercase tracking-widest transition-all"
                                                    onClick={() => handleResolve(issue.id)}
                                                >
                                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-10 rounded-xl bg-primary/10 hover:bg-primary hover:text-white border-none font-black text-[9px] uppercase tracking-widest transition-all"
                                                    onClick={() => router.push(`/datasets/${issue.dataset}/preview`)}
                                                >
                                                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Fix Row
                                                </Button>
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-muted/5 rounded-[3.5rem] border border-dashed border-border/60">
                <div className="p-10 rounded-[3rem] bg-emerald-500/10 text-emerald-500/30 shadow-inner">
                    <ShieldAlert className="h-20 w-20" />
                </div>
                <div className="max-w-md space-y-3">
                    <h3 className="text-3xl font-black tracking-tight text-emerald-500">System Nominal</h3>
                    <p className="text-muted-foreground font-medium text-lg italic font-bold">
                        No active intelligence discrepancies detected. Your data pipelines are operating within optimal parameters.
                    </p>
                </div>
            </div>
        );
    };

    const getIssueStyles = (issue: Issue) => {
        if (issue.is_resolved) return "border-emerald-500/20";
        if (issue.severity === 'critical' || issue.severity === 'high') return "border-red-500/20";
        return "border-border/40";
    };

    const getIconStyles = (issue: Issue) => {
        if (issue.is_resolved) return "bg-emerald-500/10 text-emerald-500";
        if (issue.severity === 'critical') return "bg-red-500/10 text-red-500";
        if (issue.severity === 'high') return "bg-orange-500/10 text-orange-500";
        return "bg-amber-500/10 text-amber-500";
    };

    const getBadgeStyles = (issue: Issue) => {
        if (issue.is_resolved) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (issue.severity === 'critical') return "bg-red-500/10 text-red-500 border-red-500/20";
        if (issue.severity === 'high') return "bg-orange-500/10 text-orange-500 border-orange-500/20";
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 pb-12 px-6 md:px-12 bg-zinc-50/50 dark:bg-zinc-950/50 relative z-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-[0%] right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-red-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] tracking-[0.3em] uppercase">
                            <AlertCircle size={14} className="text-red-500" /> Data Integrity Unit
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]">Incident Ledger</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl leading-relaxed italic font-medium">
                            Synthesized reports of data discrepancies, semantic errors, and structural anomalies within your vault.
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap gap-3">
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Criticality</p>
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={14} className="text-red-500" />
                                <span className="text-xl font-black">{stats.critical}</span>
                            </div>
                        </Card>
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Neutralized</p>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-xl font-black">{stats.resolved}</span>
                            </div>
                        </Card>
                        <Card className="flex-1 min-w-[140px] bg-background/40 backdrop-blur-md border border-border/40 p-3 rounded-2xl shadow-sm">
                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">In Queue</p>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-amber-500" />
                                <span className="text-xl font-black">{stats.pending}</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative group/search flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/search:text-red-500 transition-colors" />
                        <Input
                            placeholder="Search anomaly fingerprints..."
                            className="pl-12 h-12 bg-background/50 border-border/40 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 rounded-2xl text-xs font-bold transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-12 px-5 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm font-bold text-xs gap-3 hover:bg-background/80 transition-all min-w-[140px] justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-primary/70" />
                                        <span>{severityFilter === 'all' ? 'All Severity' : severityFilter.toUpperCase()}</span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50 px-3 py-2">Filter Severity</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={severityFilter} onValueChange={setSeverityFilter}>
                                    <DropdownMenuRadioItem value="all" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 transition-colors">All Levels</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="critical" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-red-500/10 focus:text-red-500">Critical</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="high" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-orange-500/10 focus:text-orange-500">High</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="medium" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-amber-500/10 focus:text-amber-500">Medium</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="low" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-500">Low</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-12 px-5 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm font-bold text-xs gap-3 hover:bg-background/80 transition-all min-w-[140px] justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-3.5 w-3.5 text-primary/70" />
                                        <span className="max-w-[100px] truncate">
                                            {selectedDataset === 'all' ? 'All Vaults' : datasets.find(d => d.id === Number.parseInt(selectedDataset))?.file_name || 'All Vaults'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50 px-3 py-2">Select Dataset</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 my-1" />
                                <DropdownMenuRadioGroup value={selectedDataset} onValueChange={setSelectedDataset}>
                                    <DropdownMenuRadioItem value="all" className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 transition-colors">All Vaults</DropdownMenuRadioItem>
                                    {datasets.map(d => (
                                        <DropdownMenuRadioItem key={d.id} value={d.id.toString()} className="rounded-lg py-2.5 font-bold text-xs cursor-pointer focus:bg-primary/10 transition-colors truncate">
                                            {d.file_name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                            variant={statusFilter === 'unresolved' ? 'default' : 'outline'}
                            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => setStatusFilter(statusFilter === 'unresolved' ? 'all' : 'unresolved')}
                        >
                            {statusFilter === 'unresolved' ? <AlertCircle className="mr-2 h-4 w-4" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                            {statusFilter === 'unresolved' ? 'Active Only' : 'Show All'}
                        </Button>
                    </div>
                </div>

                {/* Issues List */}
                {renderIssuesContent()}
            </div>
        </main>
    );
}
