"use client";

import React from "react";
import {
    BookOpen,
    Play,
    Search,
    CheckCircle,
    Clock,
    Users,
    Trophy,
    Zap,
    TrendingUp,
    Github,
    Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

const tutorials = [
    {
        id: "1",
        title: "Introduction to Data Cleaning with Python",
        description: "Learn essential techniques to handle missing data, duplicates, and outliers in your datasets.",
        difficulty: "Beginner",
        duration: "45 mins",
        students: "1.2k",
        rating: 4.8,
        progress: 85,
        type: "Course",
        instructors: ["Sarah Chen"],
        color: "bg-blue-500"
    },
    {
        id: "2",
        title: "Advanced Machine Learning Pipelines",
        description: "Master feature engineering and model evaluation using Scikit-learn and PyTorch.",
        difficulty: "Intermediate",
        duration: "2.5 hours",
        students: "850",
        rating: 4.9,
        progress: 30,
        type: "Specialization",
        instructors: ["Marcus Thorne"],
        color: "bg-purple-500"
    },
    {
        id: "3",
        title: "Visualizing Geospatial Data in R",
        description: "Explore mapping techniques using ggplot2 and leaflet for spatial analysis.",
        difficulty: "Advanced",
        duration: "1.5 hours",
        students: "420",
        rating: 4.7,
        progress: 0,
        type: "Hands-on Lab",
        instructors: ["Elena Rodriguez"],
        color: "bg-amber-500"
    },
    {
        id: "4",
        title: "Optimizing SQL Queries for Large Datasets",
        description: "Deep dive into indexing, query execution plans, and performance tuning for BigQuery.",
        difficulty: "Intermediate",
        duration: "1 hour",
        students: "2.1k",
        rating: 4.9,
        progress: 0,
        type: "Workshop",
        instructors: ["James Wilson"],
        color: "bg-emerald-500"
    }
];

export function TutorialsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Tutorial Library</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Expand your skills with curated courses, workshops, and hands-on labs designed by industry experts.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search tutorials..." className="pl-9 bg-card/60 border-primary/10" />
                        </div>
                    </div>
                </div>

                {/* Hero Feature */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden group">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="p-8 space-y-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 transition-all">Featured Workshop</Badge>
                            <h2 className="text-3xl font-bold tracking-tight">AI Deployment with Docker & Kubernetes</h2>
                            <p className="text-muted-foreground">Learn how to containerize your ML models and deploy them at scale with modern orchestration tools.</p>
                            <div className="flex items-center gap-6 text-sm text-foreground/70 font-medium">
                                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 4 Hours</span>
                                <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Professional Cert</span>
                                <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Hands-on Lab</span>
                            </div>
                            <Button size="lg" className="mt-4 bg-primary px-8 hover:scale-105 transition-transform duration-300">
                                <Play className="mr-2 h-4 w-4" /> Start Learning Now
                            </Button>
                        </div>
                        <div className="hidden md:flex h-full items-center justify-center p-8 bg-primary/5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative p-8 rounded-3xl bg-card border border-primary/20 shadow-2xl rotate-3 translate-x-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-primary/10"><Code className="h-6 w-6 text-primary" /></div>
                                        <div className="space-y-1">
                                            <div className="h-2 w-32 bg-primary/10 rounded-full" />
                                            <div className="h-2 w-24 bg-primary/20 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-primary/40" />
                                                <div className="h-1.5 w-48 bg-secondary rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { name: "Python", icon: Code, count: 24 },
                        { name: "Data Viz", icon: TrendingUp, count: 18 },
                        { name: "ML/AI", icon: Zap, count: 12 },
                        { name: "Databases", icon: Github, count: 9 }
                    ].map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-2xl bg-card/40 border border-border/40 hover:border-primary/40 text-center space-y-3 cursor-pointer transition-all"
                        >
                            <div className="mx-auto p-3 rounded-xl bg-secondary w-fit">
                                <cat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">{cat.name}</h3>
                            <p className="text-xs text-muted-foreground">{cat.count} tutorials</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tutorial Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Popular Courses</h2>
                        <Button variant="ghost" className="text-primary">See All Resources</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tutorials.map((tutorial, i) => (
                            <motion.div
                                key={tutorial.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full border-border/40 bg-card/30 backdrop-blur-md overflow-hidden hover:border-primary/30 transition-all flex flex-col group">
                                    <div className={`h-2 ${tutorial.color} w-full`} />
                                    <CardHeader className="p-5 flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{tutorial.difficulty}</Badge>
                                            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                                <Star fill="currentColor" className="h-3.5 w-3.5" />
                                                {tutorial.rating}
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{tutorial.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                            {tutorial.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-5">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {tutorial.duration}</span>
                                            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {tutorial.students}</span>
                                        </div>
                                        {tutorial.progress > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                                                    <span>Progression</span>
                                                    <span>{tutorial.progress}%</span>
                                                </div>
                                                <Progress value={tutorial.progress} className="h-1.5 bg-secondary" />
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="px-5 pb-5 pt-0 mt-auto">
                                        <Button className="w-full text-xs font-bold py-5 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">
                                            {tutorial.progress > 0 ? 'Continue' : 'Enroll Now'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
