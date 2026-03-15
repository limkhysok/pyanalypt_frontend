"use client";

import React from 'react';
import { 
    Loader2, 
    ArrowLeft, 
    Database, 
    BarChart3, 
    Hash, 
    Columns, 
    CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectDetail } from "@/hooks/use-project-detail";

// Sub-components
import { ProjectHeader } from "@/components/projects/detail/ProjectHeader";
import { ImportSection } from "@/components/projects/detail/ImportSection";
import { DatasetSection } from "@/components/projects/detail/DatasetSection";
import { CleaningWorkbench } from "@/components/projects/detail/CleaningWorkbench";
import { VisualizationForge } from "@/components/projects/detail/VisualizationForge";
import { ModelTrainingSection } from "@/components/projects/detail/ModelTrainingSection";

const getStatusAccent = (status: string | undefined) => {
    if (status === 'completed') return 'text-emerald-500';
    if (status === 'archived') return 'text-muted-foreground';
    return 'text-amber-500';
};

const getStatusBg = (status: string | undefined) => {
    if (status === 'completed') return 'bg-emerald-500/5 border-emerald-500/20';
    if (status === 'archived') return 'bg-muted/40 border-border/40';
    return 'bg-amber-500/5 border-amber-500/20';
};

export default function ProjectDetailPage() {
    const hook = useProjectDetail();
    const {
        project,
        isLoading,
        error,
        authLoading,
        activeTab,
        setActiveTab,
        router
    } = hook;

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
                    <Database className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground max-w-md">{error || "Project not found"}</p>
                <Button onClick={() => router.push("/project")} className="mt-6" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Button>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto py-8 px-6 md:px-12 space-y-10">
                
                <ProjectHeader 
                    project={project} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                />

                <div className="space-y-24 w-full">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Datasets',
                                            value: project.datasets?.length ?? 0,
                                            icon: <BarChart3 className="h-5 w-5" />,
                                            accent: 'text-primary',
                                            bg: 'bg-primary/5 border-primary/20',
                                        },
                                        {
                                            label: 'Total Rows',
                                            value: (project.datasets ?? []).reduce((acc: number, ds) => acc + (ds.row_count || 0), 0).toLocaleString(),
                                            icon: <Hash className="h-5 w-5" />,
                                            accent: 'text-emerald-500',
                                            bg: 'bg-emerald-500/5 border-emerald-500/20',
                                        },
                                        {
                                            label: 'Total Columns',
                                            value: (project.datasets ?? []).reduce((acc: number, ds) => acc + (ds.column_count || 0), 0).toLocaleString(),
                                            icon: <Columns className="h-5 w-5" />,
                                            accent: 'text-violet-500',
                                            bg: 'bg-violet-500/5 border-violet-500/20',
                                        },
                                        {
                                            label: 'Status',
                                            value: project.status ?? 'active',
                                            icon: <CheckCircle2 className="h-5 w-5" />,
                                            accent: getStatusAccent(project.status),
                                            bg: getStatusBg(project.status),
                                        },
                                    ].map((stat) => (
                                        <Card key={stat.label} className={`border ${stat.bg} shadow-sm rounded-2xl overflow-hidden`}>
                                            <CardContent className="p-6 flex flex-col gap-3">
                                                <div className={`${stat.accent} opacity-70`}>{stat.icon}</div>
                                                <div>
                                                    <p className={`text-2xl font-black leading-none ${stat.accent} capitalize`}>{stat.value}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <CleaningWorkbench {...hook} />
                            </motion.div>
                        )}

                        {activeTab === 'Import' && (
                            <motion.div
                                key="import"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ImportSection {...hook} />
                            </motion.div>
                        )}

                        {activeTab === 'Dataset' && (
                            <motion.div
                                key="dataset"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <DatasetSection {...hook} project={project} />
                            </motion.div>
                        )}

                        {activeTab === 'Analyze' && (
                            <motion.div
                                key="analyze"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <VisualizationForge {...hook} />
                            </motion.div>
                        )}

                        {activeTab === 'Models' && (
                            <motion.div
                                key="models"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ModelTrainingSection {...hook} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
