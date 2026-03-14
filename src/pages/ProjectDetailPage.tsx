"use client";

import React from "react";
import {
    ArrowLeft,
    FileUp,
    Table,
    Code,
    Settings,
    Database,
    Clock,
    ExternalLink,
    Loader2,
    Calendar,
    ChevronRight,
    Search,
    Filter,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    Info,
    PieChart,
    BarChart3,
    Columns,
    Settings2,
    Wand2,
    Eraser,
    X,
    Plus,
    RefreshCw,
    Scissors,
    Edit3,
    Hash,
    Type,
    Sliders,
    Target,
    MoreVertical,
    Layers,
    CaseLower,
    Variable,
    Trash,
    BrainCircuit,
    Presentation,
    LineChart,
    Upload,
    PieChart as PieChartIcon,
    AreaChart,
    Activity,
    BoxSelect,
    Radar,
    LayoutGrid,
    Grid3X3,
    TrendingUp,
    CircleDot,
    Cpu,
    Circle,
    Hexagon,
    GitBranch,
    Workflow,
    Spline,
    Waves,
    Sun,
    Maximize,
    Network,
    Share2,
    Share,
    SquareStack,
    GanttChartSquare,
    Library,
    Package,
    CircleDot as CircleDotIcon,
    ChevronDown as ChevronDownIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { projectApi } from "@/services/api";
import { Project, DatasetPreview, DatasetAnalysis, TrainModelRequest, TrainModelResponse, VisualizeRequest, VisualizeResponse } from "@/types/project";
import { useAuth } from "@/context/auth-context";
import { VISUALIZATIONS_CATALOG, SCENARIOS } from "@/lib/visualizations-data";
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';

export function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Dataset State
    const [rawData, setRawData] = React.useState("");
    const [rawDataName, setRawDataName] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedDatasetId, setSelectedDatasetId] = React.useState<number | string | null>(null);
    const [previewData, setPreviewData] = React.useState<DatasetPreview | null>(null);
    const [cleanedPreviewData, setCleanedPreviewData] = React.useState<DatasetPreview | null>(null);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [isCleaningOpen, setIsCleaningOpen] = React.useState(false);
    const [rowCount, setRowCount] = React.useState<number>(10);
    const [analysisResult, setAnalysisResult] = React.useState<DatasetAnalysis | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("Overview");

    // Cleaning Workbench State
    const [cleaningNACol, setCleaningNACol] = React.useState<string>("all");
    const [cleaningNAStrategy, setCleaningNAStrategy] = React.useState<string>("fill_mean");
    const [isDeduplicationEnabled, setIsDeduplicationEnabled] = React.useState(false);
    const [castingCol, setCastingCol] = React.useState<string>("");
    const [castingType, setCastingType] = React.useState<string>("integer");
    const [isCleaningActive, setIsCleaningActive] = React.useState(false);

    // Advanced Cleaning State
    const [dropCols, setDropCols] = React.useState<string[]>([]);
    const [renameMapping, setRenameMapping] = React.useState<Record<string, string>>({});
    const [trimCols, setTrimCols] = React.useState<string>("none"); // none, all, or specific
    const [caseCols, setCaseCols] = React.useState<string[]>([]);
    const [caseType, setCaseType] = React.useState<string>("lower");
    const [replaceCol, setReplaceCol] = React.useState<string>("");
    const [replaceOld, setReplaceOld] = React.useState<string>("");
    const [replaceNew, setReplaceNew] = React.useState<string>("");
    const [outlierCols, setOutlierCols] = React.useState<string[]>([]);
    const [outlierLower, setOutlierLower] = React.useState<number>(0.05);
    const [outlierUpper, setOutlierUpper] = React.useState<number>(0.95);
    const [roundCols, setRoundCols] = React.useState<string[]>([]);
    const [roundDecimals, setRoundDecimals] = React.useState<number>(2);

    // Model Training State
    const [modelType, setModelType] = React.useState<'kmeans' | 'linear_regression'>('kmeans');
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
    const [targetVariable, setTargetVariable] = React.useState<string>("");
    const [numClusters, setNumClusters] = React.useState<number>(3);
    const [isTraining, setIsTraining] = React.useState(false);
    const [trainingResult, setTrainingResult] = React.useState<TrainModelResponse | null>(null);

    // Visualization State
    const [chartType, setChartType] = React.useState<string>('scatter');
    const [selectedScenario, setSelectedScenario] = React.useState<string>("All Scenarios");
    const [vXAxis, setVXAxis] = React.useState("");
    const [vYAxis, setVYAxis] = React.useState("");
    const [vZAxis, setVZAxis] = React.useState("");
    const [vCategoryCol, setVCategoryCol] = React.useState("");
    const [chartData, setChartData] = React.useState<VisualizeResponse | null>(null);
    const [isVisualizing, setIsVisualizing] = React.useState(false);
    const [visualizationKey, setVisualizationKey] = React.useState(0);
    const [isAnalyzeOpen, setIsAnalyzeOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    // SYNC with Sidebar/URL Parameter
    React.useEffect(() => {
        const tab = searchParams?.get('tab');
        const chart = searchParams?.get('chart');
        
        if (tab === 'Visualizations' || tab === 'Analyze') {
            setActiveTab('Analyze');
        } else if (tab) {
            setActiveTab(tab);
        }
        
        if (chart) {
            setChartType(chart);
            setChartData(null); // Reset when switching
        }
    }, [searchParams]);

    const activeChartData = VISUALIZATIONS_CATALOG.find(c => c.id === chartType) || VISUALIZATIONS_CATALOG[2];

    const filteredCatalog = VISUALIZATIONS_CATALOG.filter((c: any) => 
        (selectedScenario === "All Scenarios" || (c.scenarios && c.scenarios.includes(selectedScenario))) &&
        (c.label.toLowerCase().includes(searchTerm.toLowerCase()) || c.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const workbenchRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !projectId) return;
        setIsProcessing(true);
        try {
            await projectApi.uploadDataset({ project: projectId, file });
            toast.success("Dataset uploaded successfully!");
            fetchProjectDetails();
        } catch {
            toast.error("Failed to upload dataset.");
        } finally {
            setIsProcessing(false);
        }
    };

    const projectId = params?.id as string;

    const fetchProjectDetails = React.useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const data = await projectApi.getById(projectId);
            setProject(data);
        } catch (err: any) {
            console.error("Failed to fetch project details:", err);
            setError("Could not load project details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchProjectDetails();
        }
    }, [authLoading, isAuthenticated, router, fetchProjectDetails]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !projectId) return;

        setIsProcessing(true);
        try {
            await projectApi.uploadDataset({
                project: projectId,
                file: file
            });
            // Reset and refresh
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success("Dataset uploaded successfully!");
            fetchProjectDetails();
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Failed to upload dataset.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRawDataPaste = async () => {
        if (!rawData.trim() || !projectId) return;

        setIsProcessing(true);
        try {
            await projectApi.pasteDataset({
                project: projectId,
                raw_data: rawData,
                name: rawDataName.trim() || `Manual Entry ${new Date().toLocaleTimeString()}`,
                format: "csv"
            });
            setRawData("");
            setRawDataName("");
            toast.success("Data processed successfully!");
            fetchProjectDetails();
        } catch (err) {
            console.error("Paste failed:", err);
            toast.error("Failed to process raw data.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteDataset = async (datasetId: number | string) => {
        if (!confirm("Are you sure you want to delete this dataset?")) return;

        try {
            await projectApi.deleteDataset(datasetId);
            toast.success("Dataset deleted successfully!");
            if (selectedDatasetId === datasetId) {
                setSelectedDatasetId(null);
                setPreviewData(null);
            }
            fetchProjectDetails();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete dataset.");
        }
    };

    const handleAnalyzeDataset = async (datasetId: number | string) => {
        setIsAnalysisLoading(true);
        try {
            const data = await projectApi.analyzeDataset(datasetId);
            setAnalysisResult(data);
        } catch (err) {
            console.error("Analysis failed:", err);
            // Don't toast error here as it might be secondary to preview
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleViewPreview = async (datasetId: number | string, limit: number = rowCount) => {
        setSelectedDatasetId(datasetId);
        setIsPreviewLoading(true);
        setCleanedPreviewData(null); // Reset result when viewing new dataset
        setAnalysisResult(null); // Reset analysis when viewing new dataset
        try {
            const data = await projectApi.getDatasetPreview(datasetId, limit);
            setPreviewData(data);
            // If it's a new dataset or columns haven't been set, initialize visible columns
            if (data.columns) {
                setVisibleColumns(data.columns);
                if (!castingCol && data.columns.length > 0) setCastingCol(data.columns[0]);
            }
            // Fetch smart insights
            handleAnalyzeDataset(datasetId);
        } catch (err) {
            console.error("Failed to fetch preview:", err);
            toast.error("Failed to load data preview.");
            setPreviewData(null);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleRunCleanup = async () => {
        if (!selectedDatasetId) return;

        setIsCleaningActive(true);
        const pipeline = [];

        // 1. Missing Values
        if (cleaningNAStrategy) {
            pipeline.push({
                operation: "handle_na",
                params: {
                    columns: cleaningNACol === "all" ? "all" : [cleaningNACol],
                    strategy: cleaningNAStrategy
                }
            });
        }

        // 2. Deduplication
        if (isDeduplicationEnabled) {
            pipeline.push({
                operation: "drop_duplicates",
                params: { columns: "all" }
            });
        }

        // 3. Type Casting
        if (castingCol && castingType) {
            pipeline.push({
                operation: "astype",
                params: {
                    column: castingCol,
                    target_type: castingType
                }
            });
        }

        // 4. Drop Columns
        if (dropCols.length > 0) {
            pipeline.push({
                operation: "drop_columns",
                params: { columns: dropCols }
            });
        }

        // 5. Rename Columns
        if (Object.keys(renameMapping).length > 0) {
            pipeline.push({
                operation: "rename_columns",
                params: { mapping: renameMapping }
            });
        }

        // 6. Trim Strings
        if (trimCols !== "none") {
            pipeline.push({
                operation: "trim_strings",
                params: { columns: trimCols === "all" ? "all" : [trimCols] }
            });
        }

        // 7. Case Convert
        if (caseCols.length > 0) {
            pipeline.push({
                operation: "case_convert",
                params: { columns: caseCols, case: caseType }
            });
        }

        // 8. Replace Value
        if (replaceCol && (replaceOld !== "" || replaceNew !== "")) {
            pipeline.push({
                operation: "replace_value",
                params: {
                    column: replaceCol,
                    old_value: replaceOld,
                    new_value: replaceNew
                }
            });
        }

        // 9. Outlier Clip
        if (outlierCols.length > 0) {
            pipeline.push({
                operation: "outlier_clip",
                params: {
                    columns: outlierCols,
                    lower_quantile: outlierLower,
                    upper_quantile: outlierUpper
                }
            });
        }

        // 10. Round Numeric
        if (roundCols.length > 0) {
            pipeline.push({
                operation: "round_numeric",
                params: {
                    columns: roundCols,
                    decimals: roundDecimals
                }
            });
        }

        if (pipeline.length === 0) {
            toast.error("Please configure at least one cleaning operation.");
            setIsCleaningActive(false);
            return;
        }

        console.log("[handleRunCleanup] Executing Pipeline:", pipeline);
        try {
            const response = await projectApi.cleanDataset(selectedDatasetId, { pipeline });
            toast.success("Cleanup pipeline executed successfully!");

            // The response returns a new cleaned dataset preview
            setCleanedPreviewData(response);

            // If the response contains the new dataset_id, we should refresh the project to see it in the list
            if (response.dataset_id) {
                fetchProjectDetails();
            }

            // Reset complex states that depend on specific columns as they might have changed
            setDropCols([]);
            setRenameMapping({});
            setCaseCols([]);
            setOutlierCols([]);
            setRoundCols([]);
        } catch (err: any) {
            console.error("[handleRunCleanup] Error:", err);

            let errorMessage = "Cleaning operation failed.";
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error || data.message || data.detail) {
                    errorMessage = data.error || data.message || data.detail;
                } else if (typeof data === 'object') {
                    // Handle DRF field errors or nested pipeline errors
                    errorMessage = Object.entries(data)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
                        .join(" | ");
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsCleaningActive(false);
        }
    };

    const handleTrainModel = async () => {
        if (!selectedDatasetId) {
            toast.error("No dataset selected.");
            return;
        }
        if (selectedFeatures.length === 0) {
            toast.error("Please select at least one feature.");
            return;
        }
        if (modelType === 'linear_regression' && !targetVariable) {
            toast.error("Please select a target variable for regression.");
            return;
        }

        const isNumeric = (col: string) => {
            const dtype = previewData?.metadata?.dtypes?.[col]?.toLowerCase() || "";
            return dtype.includes("int") || dtype.includes("float") || dtype.includes("number");
        };

        const nonNumericFeatures = selectedFeatures.filter(f => !isNumeric(f));
        if (nonNumericFeatures.length > 0) {
            toast.warning(`Warning: ${nonNumericFeatures.join(", ")} appear to be non-numeric. Models like KMeans and Linear Regression generally require numeric inputs.`);
        }

        setIsTraining(true);
        setTrainingResult(null); // Clear previous results

        try {
            // Construct request payload strictly as per API spec
            const request: any = {
                model_type: modelType,
                features: selectedFeatures
            };

            if (modelType === 'kmeans') {
                request.params = { n_clusters: numClusters };
            } else if (modelType === 'linear_regression') {
                request.target = targetVariable;
            }

            console.log("[handleTrainModel] Sending Payload:", request);
            const response = await projectApi.trainModel(selectedDatasetId, request);

            setTrainingResult(response);
            toast.success(`${response.evaluation.model} training complete!`);

            if (response.new_dataset?.dataset_id) {
                fetchProjectDetails();
            }
        } catch (err: any) {
            console.error("[handleTrainModel] Failed:", err);

            let errorMessage = "Model training failed.";
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error || data.message || data.detail) {
                    errorMessage = data.error || data.message || data.detail;
                } else if (typeof data === 'object') {
                    // Handle DRF field errors like { features: ["msg"], target: ["msg"] }
                    errorMessage = Object.entries(data)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
                        .join(" | ");
                }
            }

            toast.error(errorMessage || "Ensure all selected features are numeric and contain no null values.");
        } finally {
            setIsTraining(false);
        }
    };

    const handleVisualize = async () => {
        if (!selectedDatasetId || !vXAxis || !vYAxis) {
            toast.error("X and Y axes are required for visualization.");
            return;
        }

        const isNumeric = (col: string) => {
            if (!previewData?.metadata?.dtypes) return false;
            const dtype = (previewData.metadata.dtypes[col] || "").toLowerCase();
            return dtype.includes("int") ||
                dtype.includes("float") ||
                dtype.includes("num") ||
                dtype.includes("double") ||
                dtype.includes("dec") ||
                dtype.includes("real");
        };

        if (chartType === 'scatter3D' && !vZAxis) {
            toast.error("Z-Axis dimension is required for 3D visualization.");
            return;
        }

        // Allow categorical X-axis for comparison/trend charts
        const categoricalFriendly = ['bar', 'line', 'area', 'pie', 'radar', 'heatmap', 'box'];
        const needsStrictNumeric = ['scatter', 'scatter3D'];

        if (needsStrictNumeric.includes(chartType)) {
            if (!isNumeric(vXAxis) || !isNumeric(vYAxis) || (chartType === 'scatter3D' && vZAxis && !isNumeric(vZAxis))) {
                toast.error("Scatter architectures require strictly numeric dimensions.");
                return;
            }
        } else {
            // Even for categorical charts, the Y-axis (magnitude) usually needs to be numeric
            if (!isNumeric(vYAxis) && chartType !== 'heatmap' && chartType !== 'radar') {
                toast.error("Magnitude (Y-Axis) must be a numeric dimension for this chart type.");
                return;
            }
        }

        setIsVisualizing(true);
        setChartData(null);

        try {
            // Lowercase snake_case chart type for backend consistency (Common in Python/DRF)
            let backendChartType: string = chartType;
            if (chartType === 'scatter3D') backendChartType = 'scatter_3d';

            const payload: any = {
                chart_type: backendChartType,
                x_axis: vXAxis,
                y_axis: vYAxis
            };

            // Only send z_axis if we are in 3D mode
            if (chartType === 'scatter3D') {
                payload.z_axis = vZAxis;
            }

            if (vCategoryCol) {
                payload.category_col = vCategoryCol;
            }

            console.log("[handleVisualize] Synchronizing Pipeline Asset:", selectedDatasetId, "Payload:", payload);

            const data = await projectApi.visualizeDataset(selectedDatasetId, payload);

            setChartData(data);
            setVisualizationKey(prev => prev + 1); // Force clean remount of ECharts instance
            toast.success("Tensor graph synchronized.");
        } catch (err: any) {
            console.error("[handleVisualize] Response Error:", err);

            let errorMessage = "Failed to synchronize visualization stream.";
            const data = err.response?.data;

            if (data) {
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error || data.message || data.detail) {
                    errorMessage = data.error || data.message || data.detail;
                } else if (typeof data === 'object') {
                    // Check for field-specific errors (common in 400 Bad Request)
                    errorMessage = Object.entries(data)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                        .join(" | ");
                }
            }

            if (err.response?.status === 400 && errorMessage.toLowerCase().includes("chart type")) {
                toast.error(`Architecture Reject: ${errorMessage}`);
                errorMessage = "The backend analytical engine currently rejects this specific chart architecture.";
            }

            toast.error(errorMessage);
        } finally {
            setIsVisualizing(false);
        }
    };

    const getExampleChartOption = (type: string) => {
        const isPie = ['pie', 'circle_packing', 'sunburst', 'treemap'].includes(type);
        const isRadar = type === 'radar';
        const is3D = type.includes('3d');

        const exampleData: any = {
            series: [{
                name: 'Example Stream',
                data: isPie 
                    ? [['Alpha', 40], ['Beta', 25], ['Gamma', 20], ['Delta', 15]]
                    : isRadar
                        ? [[80, 70, 90, 60, 85]]
                        : Array.from({ length: 15 }, (_, i) => [i, Math.sin(i / 2) * 10 + 20])
            }]
        };

        const xType = 'category';
        const yType = 'value';

        const option: any = {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { show: false },
            grid: (is3D || isPie || isRadar) ? undefined : {
                left: '10%', right: '10%', bottom: '15%', top: '15%', containLabel: true
            },
            xAxis: (is3D || isPie || isRadar) ? undefined : {
                type: xType,
                splitLine: { show: false },
                axisLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 9 }
            },
            yAxis: (is3D || isPie || isRadar) ? undefined : {
                type: yType,
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 9 }
            },
            series: exampleData.series.map((s: any) => {
                let sType = type;
                if (type === 'box') sType = 'boxplot';
                else if (['area', 'horizon'].includes(type)) sType = 'line';
                else if (['calendar', 'matrix'].includes(type)) sType = 'heatmap';
                else if (['circle_packing', 'sunburst'].includes(type)) sType = 'sunburst';

                const base: any = {
                    type: sType,
                    data: isPie ? s.data.map((p: any) => ({ name: p[0], value: p[1] })) : s.data,
                    smooth: true,
                    itemStyle: { color: '#6366f1' }
                };
                if (isPie) base.radius = ['40%', '70%'];
                return base;
            })
        };

        if (isRadar) {
            option.radar = {
                indicator: [
                    { name: 'Metric A', max: 100 },
                    { name: 'Metric B', max: 100 },
                    { name: 'Metric C', max: 100 },
                    { name: 'Metric D', max: 100 },
                    { name: 'Metric E', max: 100 }
                ],
                splitArea: { show: false },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
            };
        }

        return option;
    };

    const getChartOption = () => {
        if (!chartData) return {};

        const is3D = chartType === 'scatter3D';
        const isPie = chartType === 'pie';
        const isRadar = chartType === 'radar';

        const isNumeric = (col: string) => {
            if (!previewData?.metadata?.dtypes) return false;
            const dtype = (previewData.metadata.dtypes[col] || "").toLowerCase();
            return dtype.includes("int") || dtype.includes("float") || dtype.includes("num") || dtype.includes("double") || dtype.includes("dec") || dtype.includes("real");
        };

        const xType = isNumeric(vXAxis) ? 'value' : 'category';
        const yType = isNumeric(vYAxis) ? 'value' : 'category';

        const option: any = {
            backgroundColor: 'transparent',
            animationDuration: 1500,
            tooltip: {
                trigger: is3D || isPie ? 'item' : (xType === 'category' || yType === 'category' ? 'axis' : 'item'),
                backgroundColor: 'rgba(0,0,0,0.85)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                textStyle: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
                padding: [12, 16],
                borderRadius: 12,
                backdropFilter: 'blur(8px)'
            },
            legend: {
                show: !!vCategoryCol || isPie,
                top: 0,
                textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold' },
                itemWidth: 10,
                itemHeight: 10
            },
            grid: (is3D || isPie || isRadar) ? undefined : {
                left: '6%',
                right: '4%',
                bottom: '12%',
                top: '12%',
                containLabel: true
            },
            xAxis: (is3D || isPie || isRadar) ? undefined : {
                type: xType,
                name: vXAxis,
                nameLocation: 'middle',
                nameGap: 35,
                scale: xType === 'value',
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
                axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
            },
            yAxis: (is3D || isPie || isRadar) ? undefined : {
                type: yType,
                name: vYAxis,
                scale: yType === 'value',
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
                axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
            },
            series: (chartData?.series as any[])?.map(s => {
                let sType: string = chartType;
                
                // Map internal IDs to ECharts chart types
                if (chartType === 'box') sType = 'boxplot';
                else if (chartType === 'area') sType = 'line';
                else if (chartType === 'calendar' || chartType === 'matrix') sType = 'heatmap';
                else if (chartType === 'circle_packing' || chartType === 'sunburst') sType = 'sunburst';
                else if (chartType === 'multi_bar' || chartType === 'stacked_bar') sType = 'bar';
                else if (chartType === 'horizon') sType = 'line';

                // Data transformation for specific chart types
                let seriesData = s.data;
                if (isPie || chartType === 'sunburst' || chartType === 'treemap') {
                    seriesData = s.data.map((point: any) => {
                        if (Array.isArray(point)) {
                            return { name: String(point[0]), value: point[1] };
                        }
                        return point;
                    });
                } else if (isRadar) {
                    // Radar data usually needs a nested value array
                    seriesData = [{ value: s.data.map((p: any) => Array.isArray(p) ? p[1] : p), name: s.name }];
                }

                const baseSeries: any = {
                    name: s.name,
                    type: sType,
                    data: seriesData,
                    emphasis: { focus: 'series' }
                };

                // Type-specific styling
                if (chartType === 'area') {
                    const echarts = (window as any).echarts;
                    if (echarts) {
                        baseSeries.areaStyle = {
                            opacity: 0.3,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
                                { offset: 1, color: 'rgba(99, 102, 241, 0)' }
                            ])
                        };
                    }
                    baseSeries.smooth = true;
                }

                if (isPie) {
                    baseSeries.radius = ['40%', '75%'];
                    baseSeries.itemStyle = { borderRadius: 12, borderColor: '#fff', borderWidth: 2 };
                    baseSeries.label = { show: true, fontSize: 10, fontWeight: 'bold' };
                }

                if (chartType === 'scatter' || chartType === 'bubble') {
                    baseSeries.symbolSize = (val: any) => {
                        if (chartType === 'bubble' && Array.isArray(val) && val[2]) return Math.sqrt(val[2]) * 2;
                        return 10;
                    };
                }

                if (chartType === 'stacked_bar') {
                    baseSeries.stack = 'total';
                }

                if (sType === 'heatmap') {
                    baseSeries.label = { show: true, fontSize: 8 };
                }

                if (chartType === 'line') baseSeries.smooth = true;

                return baseSeries;
            }) || []
        };

        if (is3D) {
            option.xAxis3D = { type: 'value', name: vXAxis };
            option.yAxis3D = { type: 'value', name: vYAxis };
            option.zAxis3D = { type: 'value', name: vZAxis };
            option.grid3D = {
                viewControl: { autoRotate: true },
                postEffect: { enable: true },
                light: { main: { intensity: 1.2 } }
            };
        }

        return option;
    };

    const handleExport = async (format: string) => {
        if (!selectedDatasetId) return;
        try {
            await projectApi.exportDataset(selectedDatasetId, format);
            toast.success(`Exporting as ${format.toUpperCase()}...`);
        } catch (err: any) {
            console.error("Export failed:", err);
            let errorMessage = "Export failed.";
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') errorMessage = data;
                else if (data.error || data.message || data.detail) errorMessage = data.error || data.message || data.detail;
            }
            toast.error(errorMessage);
        }
    };

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
                {/* Unified Header & Navigation */}
                <div className="space-y-8">
                    <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-muted-foreground/60 hover:text-primary transition-colors no-underline uppercase tracking-widest text-[10px] font-black"
                            onClick={() => router.push("/project")}
                        >
                            Projects
                        </Button>
                        <ChevronRight className="h-3 w-3 text-black dark:text-white opacity-40" />
                        <span className="text-primary font-black tracking-widest">{project.name}</span>
                    </nav>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_1.5fr] items-stretch min-h-[128px]">

                            {/* Category Panel — white bg with primary left accent */}
                            <div className="relative flex flex-col justify-center px-7 py-7 bg-background border-b md:border-b-0 md:border-r border-border overflow-hidden">
                                {/* Bold primary left accent bar */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <span className="relative text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                                    Category
                                </span>
                                <span className="relative text-sm font-black uppercase tracking-widest text-foreground">
                                    {project.category || "General"}
                                </span>
                                <div className="relative mt-3">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                        project.status === 'completed'
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                            : project.status === 'archived'
                                                ? "bg-muted text-muted-foreground border-border"
                                                : "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {project.status ?? 'active'}
                                    </span>
                                </div>
                            </div>

                            {/* Project Name */}
                            <div className="flex flex-col justify-center px-8 py-6 border-b md:border-b-0 md:border-r border-border">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">Project</span>
                                <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">
                                    {project.name}
                                </h1>
                                <p className="text-[10px] text-muted-foreground/40 font-mono mt-2 tracking-wider">
                                    #{project.id?.slice(0, 8)}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col justify-center px-8 py-6 bg-muted/20">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">Objective</span>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-lg">
                                    {project.description || "No description provided for this analytical workspace."}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Database className="h-3 w-3" />
                                        {project.datasets?.length ?? 0} datasets
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tab Bar */}
                        <div className="flex items-center border-t border-border bg-muted/30 overflow-x-auto scrollbar-none">
                            {[
                                { name: 'Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
                                { name: 'Import', icon: <Upload className="h-3.5 w-3.5" /> },
                                { name: 'Dataset', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
                                { name: 'Analyze', icon: <Sliders className="h-3.5 w-3.5" /> },
                                { name: 'Models', icon: <BrainCircuit className="h-3.5 w-3.5" /> },
                                { name: 'Activities', icon: <Clock className="h-3.5 w-3.5" /> },
                            ].map(({ name, icon }) => (
                                <button
                                    key={name}
                                    onClick={() => setActiveTab(name)}
                                    className={cn(
                                        "flex items-center gap-2 shrink-0 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all relative border-r border-border/60 last:border-r-0",
                                        activeTab === name
                                            ? "text-primary bg-background"
                                            : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <span className={cn("transition-colors", activeTab === name ? "text-primary" : "text-muted-foreground/40")}>
                                        {icon}
                                    </span>
                                    {name}
                                    {activeTab === name && (
                                        <motion.div
                                            layoutId="activeTabAccent"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Step-by-Step Workflow */}
                <div className="space-y-24 w-full">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Overview' && (
                            <motion.div
                                key="overview-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                {/* Overview: Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Datasets',
                                            value: project.datasets?.length ?? 0,
                                            icon: <FileSpreadsheet className="h-5 w-5" />,
                                            accent: 'text-primary',
                                            bg: 'bg-primary/5 border-primary/20',
                                        },
                                        {
                                            label: 'Total Rows',
                                            value: (project.datasets ?? []).reduce((s, d) => s + (d.row_count || 0), 0).toLocaleString(),
                                            icon: <Hash className="h-5 w-5" />,
                                            accent: 'text-emerald-500',
                                            bg: 'bg-emerald-500/5 border-emerald-500/20',
                                        },
                                        {
                                            label: 'Total Columns',
                                            value: (project.datasets ?? []).reduce((s, d) => s + (d.column_count || 0), 0).toLocaleString(),
                                            icon: <Columns className="h-5 w-5" />,
                                            accent: 'text-violet-500',
                                            bg: 'bg-violet-500/5 border-violet-500/20',
                                        },
                                        {
                                            label: 'Status',
                                            value: project.status ?? 'active',
                                            icon: <CheckCircle2 className="h-5 w-5" />,
                                            accent: project.status === 'completed' ? 'text-emerald-500' : project.status === 'archived' ? 'text-muted-foreground' : 'text-amber-500',
                                            bg: project.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' : project.status === 'archived' ? 'bg-muted/40 border-border/40' : 'bg-amber-500/5 border-amber-500/20',
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
                            </motion.div>
                        )}

                        {activeTab === 'Import' && (
                            <motion.div
                                key="task-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                {/* Step 1: Ingestion Zone */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                                            STEP 1
                                        </Badge>
                                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                            Import Your Data
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-2xl">
                                            Upload your dataset files or paste raw data directly. Supported formats: <span className="font-semibold text-foreground/70">.csv</span>, <span className="font-semibold text-foreground/70">.xlsx</span>, <span className="font-semibold text-foreground/70">.parquet</span>, and <span className="font-semibold text-foreground/70">.json</span>.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative">

                                        {/* Panel 1: File Upload (Drag & Drop) */}
                                        <Card
                                            className={cn(
                                                "border-2 border-dashed transition-all shadow-sm overflow-hidden group cursor-pointer",
                                                isDragging
                                                    ? "border-primary bg-primary/5 scale-[1.01] shadow-primary/20 shadow-lg"
                                                    : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
                                            )}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv,.xlsx,.xls,.parquet,.json"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={isProcessing}
                                            />
                                            <CardContent className="flex flex-col items-center justify-center text-center py-16 px-8 gap-6">
                                                <div className={cn(
                                                    "p-6 rounded-3xl transition-all",
                                                    isDragging ? "bg-primary/20" : "bg-muted/40 group-hover:bg-primary/10"
                                                )}>
                                                    {isProcessing ? (
                                                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                    ) : (
                                                        <FileUp className={cn("h-10 w-10 transition-all", isDragging ? "text-primary scale-110" : "text-muted-foreground/50 group-hover:text-primary")} />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className={cn("text-base font-black tracking-tight transition-colors", isDragging ? "text-primary" : "text-foreground/70 group-hover:text-foreground")}>
                                                        {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground/50 font-medium">
                                                        Supports CSV, Excel, Parquet &amp; JSON
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.CSV</Badge>
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.XLSX</Badge>
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.PARQUET</Badge>
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-border/40">.JSON</Badge>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    className="h-10 px-6 font-bold text-xs rounded-xl shadow-sm pointer-events-none"
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</> : <>Browse Files</>}
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* OR Divider */}
                                        <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 z-10 pointer-events-none">
                                            <div className="w-px h-16 bg-gradient-to-b from-transparent to-border/60" />
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border/60 shadow-md">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">or</span>
                                            </div>
                                            <div className="w-px h-16 bg-gradient-to-t from-transparent to-border/60" />
                                        </div>

                                        {/* Mobile OR divider */}
                                        <div className="flex xl:hidden items-center gap-3 px-2">
                                            <div className="flex-1 h-px bg-border/50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">or</span>
                                            <div className="flex-1 h-px bg-border/50" />
                                        </div>

                                        {/* Panel 2: Raw CSV Paste */}
                                        <Card className="border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors shadow-sm overflow-hidden">
                                            <CardHeader className="pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Code className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base font-bold">Raw Stream Injection</CardTitle>
                                                        <CardDescription className="text-xs">Directly paste text streams or CSV fragments.</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Dataset Name</Label>
                                                    <Input
                                                        placeholder="e.g. Sales Data Q1 2025"
                                                        value={rawDataName}
                                                        onChange={(e) => setRawDataName(e.target.value)}
                                                        disabled={isProcessing}
                                                        className="h-9 text-xs bg-background border-border/60 rounded-lg"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Raw CSV Data</Label>
                                                    <textarea
                                                        className="w-full h-[128px] bg-background border border-border/60 rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/30 transition-all"
                                                        placeholder={`col1,col2,col3\nval1,val2,val3`}
                                                        value={rawData}
                                                        onChange={(e) => setRawData(e.target.value)}
                                                        disabled={isProcessing}
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full h-11 font-bold rounded-lg shadow-sm"
                                                    variant="secondary"
                                                    onClick={handleRawDataPaste}
                                                    disabled={isProcessing || !rawData.trim()}
                                                >
                                                    {isProcessing ? <Loader2 className="mr-2.5 h-4 w-4 animate-spin" /> : <Plus className="mr-2.5 h-4 w-4 text-primary" />}
                                                    Initialize From Stream
                                                </Button>
                                            </CardContent>
                                        </Card>

                                    </div>
                                </div>

                            </motion.div>
                        )}

                        {activeTab === 'Dataset' && (
                            <motion.div
                                key="dataset-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                <div className="space-y-8 pt-0">
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                        <div className="space-y-1.5">
                                            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                                                STEP 2
                                            </Badge>
                                            <h2 className="text-3xl font-black tracking-tight">Your Datasets</h2>
                                            <p className="text-muted-foreground text-sm max-w-2xl">
                                                Click <strong className="text-foreground/70">Inspect</strong> on any row to load a live preview below.
                                            </p>
                                        </div>
                                        {project.datasets && project.datasets.length > 0 && (
                                            <Badge className="shrink-0 text-xs font-black px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
                                                {project.datasets.length} {project.datasets.length === 1 ? 'file' : 'files'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
                                    {/* Card header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Dataset Files</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:bg-primary/5 gap-1.5"
                                            onClick={() => setActiveTab('Import')}
                                        >
                                            <Upload className="h-3 w-3" /> Add Dataset
                                        </Button>
                                    </div>

                                    {project.datasets && project.datasets.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="bg-muted/30 text-muted-foreground/60 font-black uppercase tracking-widest text-[9px] border-b border-border/40">
                                                        <th className="px-5 py-3.5 font-black">Name</th>
                                                        <th className="px-5 py-3.5 font-black">Format</th>
                                                        <th className="px-5 py-3.5 font-black">Rows</th>
                                                        <th className="px-5 py-3.5 font-black">Columns</th>
                                                        <th className="px-5 py-3.5 text-right font-black">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {project.datasets.map((ds) => (
                                                        <tr key={ds.id} className={cn(
                                                            "hover:bg-primary/5 transition-colors group cursor-default border-b border-border/10 last:border-0",
                                                            selectedDatasetId === ds.id && "bg-primary/5"
                                                        )}>
                                                            <td className="px-5 py-3.5 font-bold text-foreground/80">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "p-2 rounded-lg transition-colors",
                                                                        selectedDatasetId === ds.id
                                                                            ? "bg-primary/15 text-primary"
                                                                            : "bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground/60"
                                                                    )}>
                                                                        <FileSpreadsheet className="h-3.5 w-3.5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="truncate max-w-[200px] text-xs font-bold" title={ds.name}>{ds.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground/40 font-medium">
                                                                            {new Date(ds.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-muted/30 border-border/40 text-muted-foreground">
                                                                    {ds.file_format || "CSV"}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-5 py-3.5 font-mono text-[11px] text-foreground/60 font-bold">
                                                                {ds.row_count?.toLocaleString() || "—"}
                                                            </td>
                                                            <td className="px-5 py-3.5 font-mono text-[11px] text-foreground/60 font-bold">
                                                                {ds.column_count?.toLocaleString() || "—"}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right">
                                                                <div className="flex justify-end gap-1.5">
                                                                    <Button
                                                                        variant={selectedDatasetId === ds.id ? "default" : "ghost"}
                                                                        size="sm"
                                                                        className={cn(
                                                                            "h-7 px-3 text-[10px] font-bold uppercase tracking-widest",
                                                                            selectedDatasetId !== ds.id && "hover:text-primary hover:bg-primary/5"
                                                                        )}
                                                                        onClick={() => handleViewPreview(ds.id, rowCount)}
                                                                    >
                                                                        <Eye className="h-3 w-3 mr-1.5" />
                                                                        {selectedDatasetId === ds.id ? 'Active' : 'Inspect'}
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-40 hover:opacity-100 transition-opacity">
                                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-52">
                                                                            <DropdownMenuItem onClick={() => handleViewPreview(ds.id, rowCount)} className="gap-2 text-xs">
                                                                                <Eye className="h-3.5 w-3.5" /> Inspect Dataset
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 py-2">Export As</DropdownMenuLabel>
                                                                            <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 text-xs">
                                                                                <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 text-xs">
                                                                                <Table className="h-3.5 w-3.5" /> Excel
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2 text-xs">
                                                                                <Code className="h-3.5 w-3.5" /> JSON
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDeleteDataset(ds.id)}
                                                                                className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="p-5 bg-muted/30 rounded-2xl text-muted-foreground/30">
                                                <Layers className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-foreground/50">No datasets yet</p>
                                                <p className="text-xs text-muted-foreground/50 max-w-xs font-medium">Head to the Import tab to upload a file or paste raw data.</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold gap-2" onClick={() => setActiveTab('Import')}>
                                                <Upload className="h-3.5 w-3.5" /> Import Data
                                            </Button>
                                        </div>
                                    )}
                                </Card>

                                {/* Dataframe Preview Section */}
                                <div className="space-y-5 pt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                                                <Table className="h-4 w-4 text-primary" />
                                                Data Preview
                                                {selectedDatasetId && (
                                                    <span className="text-xs font-bold text-muted-foreground/50 normal-case tracking-normal">
                                                        — {project.datasets?.find(d => d.id === selectedDatasetId)?.name}
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-muted-foreground/60 font-medium">
                                                {selectedDatasetId ? 'Showing a live row sample from the selected dataset.' : 'Click Inspect on a dataset above to load its preview here.'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Column Selector */}
                                            {previewData && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                                            <Columns className="h-3.5 w-3.5 text-primary" />
                                                            Schema ({visibleColumns.length})
                                                            <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                                                        <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Column Visibility</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {previewData.columns.map((col) => (
                                                            <DropdownMenuCheckboxItem
                                                                key={col}
                                                                checked={visibleColumns.includes(col)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setVisibleColumns([...visibleColumns, col]);
                                                                    } else {
                                                                        setVisibleColumns(visibleColumns.filter(c => c !== col));
                                                                    }
                                                                }}
                                                                onSelect={(e) => e.preventDefault()}
                                                                className="text-xs font-medium py-2"
                                                            >
                                                                {col}
                                                            </DropdownMenuCheckboxItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}

                                            {/* Dataset Selector */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                                        <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                                                        <span className="max-w-[120px] truncate">
                                                            {selectedDatasetId ? (project.datasets?.find(d => d.id === selectedDatasetId)?.name) : "Source"}
                                                        </span>
                                                        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64 max-h-[300px] overflow-y-auto">
                                                    <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Select Active Source</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {project.datasets && project.datasets.length > 0 ? (
                                                        project.datasets.map((ds) => (
                                                            <DropdownMenuItem
                                                                key={ds.id}
                                                                onClick={() => handleViewPreview(ds.id, rowCount)}
                                                                className={cn("text-xs font-medium py-2.5 gap-3", selectedDatasetId === ds.id && "bg-primary/5 text-primary")}
                                                            >
                                                                <FileSpreadsheet className="h-4 w-4 opacity-40" />
                                                                <span className="truncate flex-1">{ds.name}</span>
                                                                {selectedDatasetId === ds.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                                            </DropdownMenuItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">Repository is currently empty.</div>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {/* Rows Selector */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-9 w-24 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2 justify-between">
                                                        <span>{rowCount} items</span>
                                                        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-24">
                                                    {[10, 25, 50, 100].map((count) => (
                                                        <DropdownMenuItem
                                                            key={count}
                                                            onClick={() => {
                                                                setRowCount(count);
                                                                if (selectedDatasetId) handleViewPreview(selectedDatasetId, count);
                                                            }}
                                                            className={cn("text-xs font-medium py-2 justify-center", rowCount === count && "bg-primary/5 text-primary")}
                                                        >
                                                            {count}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {/* Export Button */}
                                            {selectedDatasetId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-9 px-4 bg-background border-border/60 hover:bg-secondary/50 rounded-lg shadow-sm text-xs font-bold gap-2">
                                                            <FileUp className="h-3.5 w-3.5 text-primary rotate-180" />
                                                            Export
                                                            <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 p-3">Format</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-3">
                                                            <FileSpreadsheet className="h-4 w-4 opacity-40" /> Export CSV
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-3">
                                                            <Table className="h-4 w-4 opacity-40" /> Export Excel
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-3">
                                                            <Code className="h-4 w-4 opacity-40" /> Export JSON
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>

                                    <Card className="border-border/60 shadow-sm overflow-hidden bg-background/50 relative min-h-[400px]">
                                        {isPreviewLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] z-50">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="h-9 w-9 text-primary animate-spin" />
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground animate-pulse">Loading preview…</p>
                                                </div>
                                            </div>
                                        )}

                                        {previewData ? (
                                            <div className="space-y-0">
                                                <div className="overflow-x-auto max-h-[600px] border-b border-border/40 custom-scrollbar">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="sticky top-0 z-10">
                                                            <tr className="bg-muted/60 backdrop-blur-md border-b border-border/60 shadow-sm">
                                                                {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                                    <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 border-r border-border/20 last:border-0 min-w-[150px]">
                                                                        <div className="flex items-center justify-between">
                                                                            {col}
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                                                                        </div>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/20">
                                                            {previewData.rows?.map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                                    {previewData.columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                                        <td key={col} className="px-6 py-3.5 whitespace-nowrap border-r border-border/20 last:border-0 font-mono text-[11px] text-foreground/70 group-hover:text-foreground">
                                                                            {String(row[col] ?? "")}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="px-6 py-3 text-[10px] font-bold text-muted-foreground/60 flex justify-between items-center bg-muted/20 border-t border-border/30">
                                                    <div className="flex items-center gap-5">
                                                        <span>
                                                            <span className="text-muted-foreground/40 mr-1">Showing</span>
                                                            <span className="text-primary font-black">{previewData.rows?.length || 0}</span>
                                                            <span className="text-muted-foreground/40 ml-1">rows</span>
                                                        </span>
                                                        {previewData.metadata?.shape && (
                                                            <span>
                                                                <span className="text-muted-foreground/40 mr-1">Shape</span>
                                                                <span className="font-mono font-bold text-foreground/60">{previewData.metadata.shape[0]} × {previewData.metadata.shape[1]}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground/40">Total</span>
                                                        <span className="text-foreground/80 px-2 py-0.5 bg-background border border-border/60 rounded-md font-bold shadow-sm">{previewData.total_rows_hint.toLocaleString()} rows</span>
                                                    </div>
                                                </div>

                                                {/* Statistical Snapshots */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 border-t border-border/40">
                                                    {/* Data Types */}
                                                    {previewData.metadata?.dtypes && (
                                                        <div className="p-8 space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                                    <Info className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-tight">Column Types</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {Object.entries(previewData.metadata.dtypes).map(([col, type]) => (
                                                                    <div key={col} className="p-3 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all group">
                                                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1 truncate" title={col}>{col}</p>
                                                                        <p className="font-mono text-[11px] font-bold text-primary group-hover:scale-105 transition-transform origin-left">{String(type)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Descriptive Summary */}
                                                    {previewData.summary && Object.keys(previewData.summary).length > 0 && (
                                                        <div className="p-8 space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                                    <BarChart3 className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-tight">Statistical Summary</h4>
                                                            </div>
                                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {Object.entries(previewData.summary).map(([col, stats]) => (
                                                                    <div key={col} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10">
                                                                        <div className="bg-muted/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 border-b border-border/40 truncate">
                                                                            {col}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-px bg-border/20">
                                                                            {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                                <div key={stat} className="flex justify-between items-center bg-background p-3 text-[11px] font-medium">
                                                                                    <span className="text-muted-foreground/60 capitalize">{stat}</span>
                                                                                    <span className="font-mono font-bold text-foreground/80">
                                                                                        {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : String(val)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 opacity-40">
                                                <div className="p-7 bg-muted/40 rounded-3xl text-muted-foreground">
                                                    <Table className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-base font-black tracking-tight">No dataset selected</p>
                                                    <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Click <strong>Inspect</strong> on any dataset above to load a preview here.</p>
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Data Clean Workbench (EDA) */}
                                    {previewData && (
                                        <div className="space-y-6 pt-16" ref={workbenchRef}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-0.5">
                                                    <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                                                        <Wand2 className="h-5 w-5 text-primary" />
                                                        Data Cleaning
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Apply transformations to clean and reshape your dataset before analysis.</p>
                                                </div>
                                            </div>

                                            <Card className="border-border/60 bg-muted/20 backdrop-blur-md overflow-hidden shadow-xl rounded-3xl">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-border/40">
                                                    {/* Tier 1: Core Integrity */}
                                                    <div className="p-8 space-y-12">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <AlertCircle className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Null Management</h4>
                                                            </div>
                                                            <div className="space-y-4 pl-1">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Target Column</Label>
                                                                    <select
                                                                        value={cleaningNACol}
                                                                        onChange={(e) => setCleaningNACol(e.target.value)}
                                                                        className="w-full bg-background border border-border/60 rounded-xl h-10 text-xs px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                                                    >
                                                                        <option value="all">All Columns</option>
                                                                        {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Execution Strategy</Label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {[
                                                                            { id: "drop", label: "Drop Rows" },
                                                                            { id: "fill_zero", label: "Fill Zero" },
                                                                            { id: "fill_mean", label: "Fill Mean" },
                                                                            { id: "fill_median", label: "Fill Median" }
                                                                        ].map(strategy => (
                                                                            <Button
                                                                                key={strategy.id}
                                                                                variant={cleaningNAStrategy === strategy.id ? "default" : "secondary"}
                                                                                size="sm"
                                                                                className={cn(
                                                                                    "text-[10px] h-9 font-bold rounded-lg shadow-sm transition-all",
                                                                                    cleaningNAStrategy === strategy.id ? "bg-primary text-white" : "hover:bg-primary/5"
                                                                                )}
                                                                                onClick={() => setCleaningNAStrategy(strategy.id)}
                                                                            >
                                                                                {strategy.label}
                                                                            </Button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <RefreshCw className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Deduplication</h4>
                                                            </div>
                                                            <Button
                                                                variant={isDeduplicationEnabled ? "default" : "secondary"}
                                                                className={cn(
                                                                    "w-full h-12 gap-3 transition-all text-xs font-black tracking-widest uppercase rounded-xl",
                                                                    isDeduplicationEnabled ? "bg-primary/90" : "bg-background/40 hover:bg-primary/5"
                                                                )}
                                                                onClick={() => setIsDeduplicationEnabled(!isDeduplicationEnabled)}
                                                            >
                                                                {isDeduplicationEnabled ? "Deduplication ON" : "Enable Deduplication"}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Tier 2: Vector Schema */}
                                                    <div className="p-8 space-y-12">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <Type className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Type Casting</h4>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black tracking-widest text-muted-foreground/60">Source</Label>
                                                                    <select
                                                                        value={castingCol}
                                                                        onChange={(e) => setCastingCol(e.target.value)}
                                                                        className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-3 font-bold outline-none"
                                                                    >
                                                                        {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-[10px] font-black tracking-widest text-muted-foreground/60">Target</Label>
                                                                    <select
                                                                        value={castingType}
                                                                        onChange={(e) => setCastingType(e.target.value)}
                                                                        className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-3 font-bold outline-none"
                                                                    >
                                                                        {["integer", "float", "string", "datetime"].map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <Trash className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Dimension Purge</h4>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {previewData.columns.map(c => (
                                                                    <Badge
                                                                        key={c}
                                                                        variant={dropCols.includes(c) ? "destructive" : "outline"}
                                                                        className="cursor-pointer text-[10px] font-bold h-7 px-3 rounded-lg transition-all"
                                                                        onClick={() => {
                                                                            if (dropCols.includes(c)) setDropCols(dropCols.filter(x => x !== c));
                                                                            else setDropCols([...dropCols, c]);
                                                                        }}
                                                                    >
                                                                        {c}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tier 3: Value Dynamics */}
                                                    <div className="p-8 space-y-12">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <Target className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Value Mapping</h4>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <select value={replaceCol} onChange={(e) => setReplaceCol(e.target.value)} className="w-full bg-background border border-border/60 rounded-xl h-11 text-xs px-4 font-bold outline-none">
                                                                    <option value="">Select Reference Column...</option>
                                                                    {previewData.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <Input placeholder="Search" className="h-11 rounded-xl text-xs font-bold" value={replaceOld} onChange={(e) => setReplaceOld(e.target.value)} />
                                                                    <Input placeholder="Replace" className="h-11 rounded-xl text-xs font-bold" value={replaceNew} onChange={(e) => setReplaceNew(e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                                                    <Sliders className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <h4 className="text-sm font-black tracking-widest uppercase">Outlier Clamping</h4>
                                                            </div>
                                                            <div className="flex items-center gap-3 mb-4 bg-background/40 p-3 rounded-xl border border-border/40">
                                                                <Input type="number" step="0.01" value={outlierLower} onChange={e => setOutlierLower(Number(e.target.value))} className="h-8 w-20 text-[10px] font-black text-center" />
                                                                <span className="text-[10px] font-black text-muted-foreground">⇄</span>
                                                                <Input type="number" step="0.01" value={outlierUpper} onChange={e => setOutlierUpper(Number(e.target.value))} className="h-8 w-20 text-[10px] font-black text-center" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {previewData.columns.map(c => (
                                                                    <Badge key={c} variant={outlierCols.includes(c) ? "default" : "outline"} className="cursor-pointer text-[10px] font-bold h-7 px-3 rounded-lg" onClick={() => {
                                                                        if (outlierCols.includes(c)) setOutlierCols(outlierCols.filter(x => x !== c));
                                                                        else setOutlierCols([...outlierCols, c]);
                                                                    }}>{c}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Command Center Bottom Bar */}
                                                <div className="p-8 bg-muted/40 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
                                                    <div className="space-y-1 text-center md:text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Pipeline manifest</p>
                                                        <p className="text-sm font-bold text-foreground/80">
                                                            {[
                                                                cleaningNAStrategy,
                                                                isDeduplicationEnabled,
                                                                castingCol && castingType,
                                                                dropCols.length > 0,
                                                                Object.keys(renameMapping).length > 0,
                                                                trimCols !== "none",
                                                                caseCols.length > 0,
                                                                replaceCol && (replaceOld !== "" || replaceNew !== ""),
                                                                outlierCols.length > 0,
                                                                roundCols.length > 0
                                                            ].filter(Boolean).length} operations staged for execution
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <Button
                                                            variant="ghost"
                                                            className="h-12 px-8 font-black text-[11px] uppercase tracking-widest hover:text-destructive transition-colors shrink-0"
                                                            onClick={() => {
                                                                setCleaningNAStrategy("fill_mean");
                                                                setIsDeduplicationEnabled(false);
                                                                setDropCols([]);
                                                                setRenameMapping({});
                                                                setTrimCols("none");
                                                                setCaseCols([]);
                                                                setReplaceCol("");
                                                                setReplaceOld("");
                                                                setReplaceNew("");
                                                                setOutlierCols([]);
                                                                setRoundCols([]);
                                                            }}
                                                        >
                                                            Resync System
                                                        </Button>
                                                        <Button
                                                            className="h-12 px-10 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex-1 md:flex-none rounded-2xl"
                                                            onClick={handleRunCleanup}
                                                            disabled={isCleaningActive || !previewData}
                                                        >
                                                            {isCleaningActive ? (
                                                                <><Loader2 className="h-4 w-4 mr-3 animate-spin" /> Processing...</>
                                                            ) : (
                                                                "Execute pipeline"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Data Cleaning Result Preview Section */}
                                            {cleanedPreviewData && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mt-16 space-y-8 pb-20"
                                                >
                                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                                                        <div className="flex items-center gap-5">
                                                            <div className="p-4 bg-emerald-500/20 rounded-2xl shadow-inner">
                                                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className="text-2xl font-black tracking-tighter text-emerald-700">Cleaned dataset Ready</h3>
                                                                <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Operation success • Vector integrity verified</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className="bg-emerald-600 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                                                                {cleanedPreviewData.name || "Cleaned Result"}
                                                            </Badge>
                                                            {cleanedPreviewData.dataset_id && (
                                                                <Badge className="bg-background border-emerald-600/20 text-emerald-700 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase shadow-sm">
                                                                    Persistent Asset No. {cleanedPreviewData.dataset_id}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Card className="border-border/60 shadow-2xl rounded-3xl overflow-hidden bg-background/50">
                                                        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                                                            <table className="w-full text-left border-collapse">
                                                                <thead className="sticky top-0 z-10">
                                                                    <tr className="bg-muted border-b border-border/60">
                                                                        {cleanedPreviewData.columns.map(col => (
                                                                            <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border/10 last:border-0 min-w-[150px]">
                                                                                {col}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-border/20">
                                                                    {cleanedPreviewData.rows?.map((row, idx) => (
                                                                        <tr key={idx} className="hover:bg-emerald-500/5 transition-colors group">
                                                                            {cleanedPreviewData.columns.map((col) => (
                                                                                <td key={col} className="px-6 py-3.5 whitespace-nowrap border-r border-border/10 last:border-0 font-mono text-[11px] text-foreground/60 group-hover:text-foreground">
                                                                                    {String(row[col] ?? "")}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="px-8 py-4 text-[10px] font-black text-muted-foreground flex justify-between items-center bg-emerald-500/5">
                                                            <div className="flex items-center gap-6">
                                                                <span className="text-emerald-700">Preview: {cleanedPreviewData.rows?.length || 0} samples</span>
                                                                {cleanedPreviewData.metadata?.shape && (
                                                                    <span className="opacity-40 italic">
                                                                        Physical Architecture: ({cleanedPreviewData.metadata.shape[0]} × {cleanedPreviewData.metadata.shape[1]})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-emerald-700 tracking-[0.2em]">TOTAL_ROWS_INDEX: {cleanedPreviewData.total_rows_hint}</span>
                                                        </div>

                                                        {/* Results Deep Dive */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border/40 border-t border-border/40">
                                                            {cleanedPreviewData.metadata?.dtypes && (
                                                                <div className="p-8 space-y-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                            <Info className="h-5 w-5 text-emerald-600" />
                                                                        </div>
                                                                        <h4 className="text-base font-black tracking-tight text-emerald-700">Refined Schema</h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                        {Object.entries(cleanedPreviewData.metadata.dtypes).map(([col, type]) => (
                                                                            <div key={col} className="p-3 bg-emerald-500/[0.03] rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                                                                <p className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 mb-1 truncate" title={col}>{col}</p>
                                                                                <p className="font-mono text-[11px] font-bold text-emerald-700">{String(type)}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {cleanedPreviewData.summary && Object.keys(cleanedPreviewData.summary).length > 0 && (
                                                                <div className="p-8 space-y-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                                                                        </div>
                                                                        <h4 className="text-base font-black tracking-tight text-emerald-700">Statistical Delta</h4>
                                                                    </div>
                                                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                        {Object.entries(cleanedPreviewData.summary).map(([col, stats]) => (
                                                                            <div key={col} className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02]">
                                                                                <div className="bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-500/10 truncate">
                                                                                    {col}
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-px bg-emerald-500/10">
                                                                                    {Object.entries(stats as Record<string, any>).map(([stat, val]) => (
                                                                                        <div key={stat} className="flex justify-between items-center bg-background p-3 text-[11px]">
                                                                                            <span className="text-muted-foreground capitalize">{stat}</span>
                                                                                            <span className="font-mono font-bold text-emerald-700">{val}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                        )}



                        {activeTab === 'Analyze' && (
                            <motion.div
                                key="analyze-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                {/* Header: Analysis Forge */}
                                <div className="px-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-500 tracking-widest text-[10px] font-black uppercase">
                                                ANALYTICAL WORKFLOW ACTIVE
                                            </Badge>
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent uppercase text-shadow">
                                            The Forge
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-xl font-medium leading-relaxed">
                                            Phase 2: Fine-tune vector mapping and synchronize the graphical output stream.
                                        </p>
                                    </div>
                                </div>

                                <Card className="border-border/40 shadow-3xl rounded-[3.5rem] overflow-hidden bg-background/20 backdrop-blur-2xl p-0 border-dashed">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[850px] divide-x divide-border/10">
                                        
                                        {/* Parameter Side (Col-Span-4) */}
                                        <div className="lg:col-span-4 flex flex-col bg-muted/5 p-10 space-y-12 overflow-y-auto custom-scrollbar">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                                        <Settings2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">Configure Tensors</h3>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-[9px] font-black border border-primary/10 text-primary hover:bg-primary/5 rounded-full px-4" 
                                                    onClick={() => router.push('/templates')}
                                                >
                                                    <Library className="h-3 w-3 mr-2" />
                                                    Visual Discovery Lab
                                                </Button>
                                            </div>

                                            {/* Architecture Selector */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 ml-2">
                                                    <LayoutGrid className="h-3 w-3 text-primary/50" />
                                                    <Label className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">Selected Architecture</Label>
                                                </div>
                                                <div className="relative group">
                                                    <select
                                                        value={chartType}
                                                        onChange={e => { setChartType(e.target.value); setChartData(null); }}
                                                        className="w-full bg-primary/5 border border-primary/20 rounded-[2rem] h-20 text-[10px] px-16 font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer hover:bg-primary/10 shadow-xl text-primary uppercase tracking-widest"
                                                    >
                                                        {VISUALIZATIONS_CATALOG.map(c => <option key={c.id} value={c.id} className="text-foreground bg-popover font-bold py-4">{c.label}</option>)}
                                                    </select>
                                                    <activeChartData.icon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 pointer-events-none" />
                                                    <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-40 group-hover:translate-y-px transition-transform" />
                                                </div>
                                            </div>

                                            {/* Input Tensors */}
                                            <div className="space-y-8 flex-1">
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <Hash className="h-3 w-3 text-primary/40" />
                                                            <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50">X-Axis Domain</Label>
                                                        </div>
                                                        <select
                                                            value={vXAxis}
                                                            onChange={e => setVXAxis(e.target.value)}
                                                            className="w-full bg-background/60 border border-border/40 rounded-2xl h-14 text-[10px] px-6 font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:border-primary/30 shadow-sm"
                                                        >
                                                            <option value="">Select Column...</option>
                                                            {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <TrendingUp className="h-3 w-3 text-primary/40" />
                                                            <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50">Y-Axis Magnitude</Label>
                                                        </div>
                                                        <select
                                                            value={vYAxis}
                                                            onChange={e => setVYAxis(e.target.value)}
                                                            className="w-full bg-background/60 border border-border/40 rounded-2xl h-14 text-[10px] px-6 font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:border-primary/30 shadow-sm"
                                                        >
                                                            <option value="">Select Column...</option>
                                                            {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <PieChartIcon className="h-3 w-3 text-primary/40" />
                                                            <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/50">Categorical Pivot</Label>
                                                        </div>
                                                        <select
                                                            value={vCategoryCol}
                                                            onChange={e => setVCategoryCol(e.target.value)}
                                                            className="w-full bg-background/60 border border-border/40 rounded-2xl h-14 text-[10px] px-6 font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:border-primary/30 shadow-sm"
                                                        >
                                                            <option value="">No Pivot (Monochrome)</option>
                                                            {previewData?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 relative">
                                                <Button
                                                    className="w-full h-20 rounded-3xl shadow-2xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.4em] group bg-primary hover:bg-primary/90 transition-all text-white border-0"
                                                    onClick={handleVisualize}
                                                    disabled={isVisualizing || !vXAxis || !vYAxis}
                                                >
                                                    {isVisualizing ? (
                                                        <><Loader2 className="mr-4 h-6 w-6 animate-spin" /> Syncing Pipeline...</>
                                                    ) : (
                                                        <><RefreshCw className="mr-4 h-6 w-6 group-hover:rotate-180 transition-all duration-700" /> Execute Tensor Plot</>
                                                    )}
                                                </Button>
                                                <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                                                    <div className="h-px flex-1 bg-border/20" />
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Tensor-Ready</span>
                                                    </div>
                                                    <div className="h-px flex-1 bg-border/20" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Viewport Side (Col-Span-8) */}
                                        <div className="lg:col-span-8 flex flex-col bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_50%)]">
                                            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-background/5 backdrop-blur-3xl">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                                        <Presentation className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black tracking-[0.2em] uppercase">Visual Viewport</h4>
                                                        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1">High-Fidelity Graphical Sink</p>
                                                    </div>
                                                </div>
                                                
                                                {chartData && (
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right border-r border-border/10 pr-6 mr-6">
                                                            <p className="text-[9px] font-black text-foreground/70 uppercase tracking-widest">{chartData.series?.[0]?.data?.length || 0} Data Points</p>
                                                            <p className="text-[7px] font-bold text-emerald-500/60 uppercase tracking-tight">Latency: 0.002s</p>
                                                        </div>
                                                        <Button variant="outline" size="sm" className="h-10 rounded-xl border-border/40 hover:bg-primary/5 transition-all text-[9px] font-black uppercase tracking-widest px-4">
                                                            <Upload className="h-3 w-3 mr-2" /> Export
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
                                                {isVisualizing && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-3xl z-50">
                                                        <div className="flex flex-col items-center gap-6 text-center">
                                                            <div className="relative h-24 w-24">
                                                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                                <div className="absolute inset-4 rounded-full border-4 border-emerald-500/10 border-b-emerald-500 animate-[spin_1.5s_linear_infinite]" />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black tracking-[0.6em] text-primary animate-pulse">Synchronizing Neural Plot</p>
                                                                <p className="text-[7px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">Transforming high-dimensional vectors...</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {chartData ? (
                                                    <div className="w-full h-full p-8 bg-background/30 rounded-[3rem] border border-border/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.1)] relative">
                                                        <div className="absolute top-10 left-10 p-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 animate-pulse z-10">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        </div>
                                                        <ReactECharts
                                                            key={visualizationKey}
                                                            option={getChartOption()}
                                                            style={{ height: '650px', width: '100%' }}
                                                            opts={{ renderer: 'canvas' }}
                                                            theme="dark"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-center group cursor-default p-20 max-w-lg">
                                                        <div className="relative inline-block mb-10 translate-y-4">
                                                            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-150 animate-pulse" />
                                                            <div className="p-20 bg-muted/10 rounded-[4rem] border border-border/20 relative backdrop-blur-3xl shadow-3xl group-hover:bg-muted/20 transition-all duration-700 hover:rotate-2">
                                                                <activeChartData.icon className="h-24 w-24 text-muted-foreground/10 group-hover:scale-110 group-hover:text-primary transition-all duration-1000" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6 pt-10">
                                                            <h3 className="text-3xl font-black tracking-tighter text-foreground/30 uppercase tracking-[0.1em]">Awaiting Tensor Map</h3>
                                                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/40 leading-relaxed">
                                                                Bind dataset columns to the <span className="text-primary/60">{activeChartData.label}</span> neural core to begin rendering.
                                                            </p>
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.3em] border-emerald-500/20 text-emerald-500/40 px-8 py-2.5 rounded-full bg-emerald-500/5 border-dashed">ENGINE_READY_FOR_DATA</Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-8 border-t border-border/10 bg-muted/10 flex items-center justify-between backdrop-blur-xl">
                                                <div className="flex gap-16">
                                                    <div className="flex flex-col gap-1.5 px-6 border-l border-border/20">
                                                        <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Compute Node</span>
                                                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">ECharts Canvas v5.4</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 px-6 border-l border-border/20">
                                                        <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Buffer Status</span>
                                                        <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
                                                            Optimized <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] pr-8">
                                                    <div className="h-px w-12 bg-border/20" />
                                                    PYANALYPT WORKBENCH CORE
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}


                        {activeTab === 'Models' && (
                            <motion.div
                                key="models-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-16"
                            >
                                {/* Step 4: Model Training & Evaluation */}
                                <div className="space-y-8 pt-0">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                                            STEP 4
                                        </Badge>
                                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                            Train Intelligence Models
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-2xl">
                                            Execute machine learning algorithms to uncover predictive patterns and behavioral clusters.
                                        </p>
                                    </div>

                                    <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden bg-muted/20 backdrop-blur-md">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-border/40">
                                            <div className="p-10 space-y-10">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                                            <BrainCircuit className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <h3 className="text-xl font-black tracking-tight">Algorithm Selection</h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'kmeans', label: 'Unsupervised: KMeans', desc: 'Behavioral Clustering' },
                                                            { id: 'linear_regression', label: 'Supervised: Linear Regression', desc: 'Trend Prediction' }
                                                        ].map(algo => (
                                                            <button
                                                                key={algo.id}
                                                                onClick={() => setModelType(algo.id as any)}
                                                                className={cn(
                                                                    "p-5 rounded-2xl text-left border-2 transition-all group",
                                                                    modelType === algo.id
                                                                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                                                                        : "bg-background border-border/40 hover:border-primary/20"
                                                                )}
                                                            >
                                                                <p className="font-black text-sm mb-1">{algo.label}</p>
                                                                <p className={cn("text-[10px] font-medium uppercase tracking-widest", modelType === algo.id ? "text-white/60" : "text-muted-foreground/60")}>{algo.desc}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {previewData && (
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Feature Space (X)</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {previewData.columns.map(c => {
                                                                    const dtype = previewData.metadata?.dtypes?.[c]?.toLowerCase() || "";
                                                                    const isNum = dtype.includes("int") || dtype.includes("float") || dtype.includes("number");
                                                                    return (
                                                                        <Badge
                                                                            key={c}
                                                                            variant={selectedFeatures.includes(c) ? "default" : "outline"}
                                                                            className={cn(
                                                                                "cursor-pointer h-8 px-4 font-bold rounded-lg transition-all border-dashed",
                                                                                selectedFeatures.includes(c) && !isNum && "bg-amber-500 hover:bg-amber-600 border-none",
                                                                                !selectedFeatures.includes(c) && isNum && "border-primary/40 text-primary/60"
                                                                            )}
                                                                            onClick={() => {
                                                                                if (selectedFeatures.includes(c)) setSelectedFeatures(selectedFeatures.filter(f => f !== c));
                                                                                else setSelectedFeatures([...selectedFeatures, c]);
                                                                            }}
                                                                        >
                                                                            {c}
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {modelType === 'linear_regression' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Target Objective (y)</Label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {previewData.columns.map(c => (
                                                                        <Badge
                                                                            key={c}
                                                                            variant={targetVariable === c ? "default" : "outline"}
                                                                            className={cn("cursor-pointer h-8 px-4 font-bold rounded-lg transition-all", targetVariable === c && "bg-emerald-500 hover:bg-emerald-600 border-none")}
                                                                            onClick={() => setTargetVariable(c)}
                                                                        >
                                                                            {c}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {modelType === 'kmeans' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Cluster Centroids (k)</Label>
                                                                <div className="flex items-center gap-4">
                                                                    <Input type="range" min="2" max="10" step="1" value={numClusters} onChange={e => setNumClusters(Number(e.target.value))} className="h-6 accent-primary" />
                                                                    <span className="text-xl font-black text-primary">{numClusters}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Button size="lg" className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl shadow-primary/20" onClick={handleTrainModel} disabled={isTraining || !previewData}>
                                                    {isTraining ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Intelligence Forge"}
                                                </Button>
                                            </div>

                                            <div className="p-10 bg-background/40 flex flex-col">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Evaluation Analytics</h4>
                                                    {trainingResult && <span className="text-[10px] font-black uppercase text-emerald-500 animate-pulse">Synced</span>}
                                                </div>

                                                {trainingResult ? (
                                                    <div className="space-y-8 flex-1">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {Object.entries(trainingResult.evaluation).map(([k, v]) => (
                                                                k !== 'model' && (
                                                                    <div key={k} className="p-6 bg-background border border-border/40 rounded-3xl shadow-sm">
                                                                        <p className="text-[9px] uppercase font-black text-muted-foreground/60 mb-2 truncate" title={k}>{k.replace(/_/g, ' ')}</p>
                                                                        <p className="text-2xl font-black text-foreground">{typeof v === 'number' ? v.toFixed(4) : String(v)}</p>
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>

                                                        {trainingResult.evaluation.coefficients && (
                                                            <div className="space-y-4 pt-4">
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Feature Influence Rankings</h5>
                                                                <div className="space-y-2">
                                                                    {Object.entries(trainingResult.evaluation.coefficients).map(([feat, coef]) => (
                                                                        <div key={feat} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/20">
                                                                            <span className="text-sm font-bold">{feat}</span>
                                                                            <Badge variant="secondary" className={cn("font-mono font-bold", (coef as number) > 0 ? "text-emerald-600" : "text-rose-600")}>{(coef as number).toFixed(6)}</Badge>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {trainingResult.new_dataset && (
                                                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 mt-auto">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-3 bg-primary/20 rounded-xl">
                                                                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-black">Clustered Dataset Ready</p>
                                                                        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/60">Persistent Asset No. {trainingResult.new_dataset.dataset_id}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                                        <div className="p-8 bg-muted border rounded-full">
                                                            <BrainCircuit className="h-12 w-12" />
                                                        </div>
                                                        <p className="text-sm font-bold uppercase tracking-[0.2em]">Idle Engine</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Activities' && (
                            <motion.div
                                key="activities-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-16"
                            >
                                {/* Step 5: Historian & Logs */}
                                <div className="space-y-8 pt-0">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary tracking-wide text-[12px] font-black uppercase backdrop-blur-md">
                                            STEP 5
                                        </Badge>
                                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                            Project Historian Logs
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-2xl">
                                            System-wide event tracking and timeline for this specific workspace.
                                        </p>
                                    </div>
                                    <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden bg-muted/20 backdrop-blur-md">
                                        <CardHeader className="p-8 border-b border-border/40 bg-muted/30">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary/10 rounded-2xl">
                                                    <Clock className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black tracking-tight">Project Historian</CardTitle>
                                                    <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">System-wide event tracking</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-white/5">
                                                {[
                                                    {
                                                        event: "Project Deployment Initialized",
                                                        date: new Date(project.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                                        icon: <Database />
                                                    },
                                                    {
                                                        event: "Analytical Asset Registry Sync",
                                                        date: new Date(project.updated_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                                        icon: <Settings />
                                                    }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-6 p-8 hover:bg-primary/5 transition-colors group">
                                                        <div className="h-12 w-12 rounded-2xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                                                            {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { className: "h-5 w-5" }) : null}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-black text-foreground/80">{item.event}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.date}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
