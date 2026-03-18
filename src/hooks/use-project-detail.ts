import React from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { projectApi } from "@/services/api";
import { 
    Project, 
    DatasetPreview, 
    TrainModelResponse, 
    VisualizeResponse,
    ModelType,
    ChartType
} from "@/types/project";
import { useAuth } from "@/context/auth-context";

export const useProjectDetail = () => {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoading: authLoading } = useAuth();

    // Core Data State
    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Dataset Management State
    const [isDragging, setIsDragging] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [rawData, setRawData] = React.useState("");
    const [rawDataName, setRawDataName] = React.useState("");
    const [selectedDatasetId, setSelectedDatasetId] = React.useState<number | string | null>(null);
    const [previewData, setPreviewData] = React.useState<DatasetPreview | null>(null);
    const [cleanedPreviewData, setCleanedPreviewData] = React.useState<DatasetPreview | null>(null);
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
    const [rowCount, setRowCount] = React.useState<number>(10);
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
    const [trimCols, setTrimCols] = React.useState<string>("none");
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
    const [modelType, setModelType] = React.useState<ModelType>('kmeans');
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
    const [targetVariable, setTargetVariable] = React.useState<string>("");
    const [numClusters, setNumClusters] = React.useState<number>(3);
    const [isTraining, setIsTraining] = React.useState(false);
    const [trainingResult, setTrainingResult] = React.useState<TrainModelResponse | null>(null);

    // Visualization State
    const [chartType, setChartType] = React.useState<ChartType>('scatter');
    const [selectedScenario, setSelectedScenario] = React.useState<string>("All Scenarios");
    const [vXAxis, setVXAxis] = React.useState("");
    const [vYAxis, setVYAxis] = React.useState("");
    const [vZAxis, setVZAxis] = React.useState("");
    const [vCategoryCol, setVCategoryCol] = React.useState("");
    const [chartData, setChartData] = React.useState<VisualizeResponse | null>(null);
    const [isVisualizing, setIsVisualizing] = React.useState(false);
    const [visualizationKey, setVisualizationKey] = React.useState(0);
    const [searchTerm, setSearchTerm] = React.useState("");

    const fetchProjectDetail = React.useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await projectApi.getById(id as string);
            setProject(data);
            setError(null);
        } catch (err: any) {
            console.error("Fetch project detail error:", err);
            setError("Failed to load project details.");
            toast.error("Failed to fetch project.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchProjectDetail();
    }, [fetchProjectDetail]);

    React.useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const uploadFile = async (file: File) => {
        setIsProcessing(true);
        try {
            await projectApi.uploadDataset({
                project: id as string,
                file: file,
                name: file.name
            });
            toast.success("Dataset uploaded successfully!");
            fetchProjectDetail();
        } catch (err: any) {
            console.error("File upload error:", err);
            toast.error(err.response?.data?.error || "Upload failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        await uploadFile(file);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) await uploadFile(file);
    };

    const handleRawDataPaste = async () => {
        if (!rawData.trim() || !id) return;
        setIsProcessing(true);
        try {
            await projectApi.pasteDataset({
                project: id as string,
                raw_data: rawData,
                name: rawDataName || `Pasted Data ${new Date().toLocaleTimeString()}`
            });
            toast.success("Data initialized successfully!");
            setRawData("");
            setRawDataName("");
            fetchProjectDetail();
        } catch (err: any) {
            console.error("Raw data paste error:", err);
            toast.error(err.response?.data?.error || "Failed to initialize data.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewPreview = async (datasetId: number | string, rows: number = 10) => {
        try {
            setIsPreviewLoading(true);
            setSelectedDatasetId(datasetId);
            const data = await projectApi.getDatasetPreview(datasetId, rows);
            setPreviewData(data);
            setCleanedPreviewData(null);
            setVisibleColumns(data.columns);
        } catch (err: any) {
            console.error("View preview error:", err);
            toast.error("Failed to load preview.");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleDeleteDataset = async (datasetId: number | string) => {
        if (!confirm("Are you sure you want to delete this dataset?")) return;
        try {
            await projectApi.deleteDataset(datasetId);
            toast.success("Dataset deleted.");
            if (selectedDatasetId === datasetId) {
                setSelectedDatasetId(null);
                setPreviewData(null);
            }
            fetchProjectDetail();
        } catch (err: any) {
            console.error("Delete dataset error:", err);
            toast.error("Deletion failed.");
        }
    };

    const handleRunCleanup = async () => {
        if (!selectedDatasetId) {
            toast.error("Select a dataset first.");
            return;
        }

        setIsCleaningActive(true);
        try {
            const response = await projectApi.cleanDataset(selectedDatasetId, {
                pipeline: [
                    { 
                        operation: 'handle_na', 
                        params: { 
                            columns: cleaningNACol === "all" ? (previewData?.columns || []) : [cleaningNACol], 
                            strategy: cleaningNAStrategy 
                        } 
                    },
                    { 
                        operation: 'drop_duplicates', 
                        params: { 
                            enabled: isDeduplicationEnabled 
                        } 
                    },
                    ...(castingCol ? [{ 
                        operation: 'astype', 
                        params: { 
                            [castingCol]: castingType 
                        } 
                    }] : [])
                ]
            });
            setCleanedPreviewData(response);
            toast.success("Cleaning operations completed!");
            fetchProjectDetail();
        } catch (err: any) {
            console.error("Run cleanup error:", err);
            toast.error(err.response?.data?.error || "Cleaning failed.");
        } finally {
            setIsCleaningActive(false);
        }
    };

    const handleTrainModel = async () => {
        if (!selectedDatasetId || selectedFeatures.length === 0) {
            toast.error("Select a dataset and features.");
            return;
        }

        setIsTraining(true);
        try {
            const response = await projectApi.trainModel(selectedDatasetId, {
                model_type: modelType,
                features: selectedFeatures,
                target: modelType === 'linear_regression' ? targetVariable : undefined,
                params: modelType === 'kmeans' ? { n_clusters: numClusters } : {}
            });
            setTrainingResult(response);
            toast.success("Model trained successfully!");
        } catch (err: any) {
            console.error("Train model error:", err);
            toast.error(err.response?.data?.error || "Training failed.");
        } finally {
            setIsTraining(false);
        }
    };

    const handleVisualize = async () => {
        if (!selectedDatasetId || !vXAxis || (!vYAxis && chartType !== 'pie')) {
            toast.error("Select axes and dataset first.");
            return;
        }

        setIsVisualizing(true);
        try {
            const response = await projectApi.visualizeDataset(selectedDatasetId, {
                chart_type: chartType,
                x_axis: vXAxis,
                y_axis: vYAxis,
                category_col: vCategoryCol || undefined
            });
            setChartData(response);
            setVisualizationKey(prev => prev + 1);
            toast.success("Visualization generated!");
        } catch (err: any) {
            console.error("Visualize error:", err);
            toast.error("Visualization failed.");
        } finally {
            setIsVisualizing(false);
        }
    };

    const handleExport = async (format: string) => {
        if (!selectedDatasetId) return;
        try {
            await projectApi.exportDataset(selectedDatasetId, format);
            toast.success(`Exporting as ${format.toUpperCase()}...`);
        } catch (err: any) {
            console.error("Export error:", err);
            toast.error("Export failed.");
        }
    };

    return {
        // State
        project,
        isLoading,
        error,
        authLoading,
        activeTab,
        setActiveTab,
        
        // Selection & Preview
        selectedDatasetId,
        previewData,
        cleanedPreviewData,
        visibleColumns,
        setVisibleColumns,
        isPreviewLoading,
        rowCount,
        setRowCount,
        isDragging,
        setIsDragging,
        isProcessing,
        
        // Data Handling
        rawData,
        setRawData,
        rawDataName,
        setRawDataName,
        
        // Cleaning
        cleaningNACol,
        setCleaningNACol,
        cleaningNAStrategy,
        setCleaningNAStrategy,
        isDeduplicationEnabled,
        setIsDeduplicationEnabled,
        castingCol,
        setCastingCol,
        castingType,
        setCastingType,
        isCleaningActive,
        dropCols,
        setDropCols,
        renameMapping,
        setRenameMapping,
        trimCols,
        setTrimCols,
        caseCols,
        setCaseCols,
        caseType,
        setCaseType,
        replaceCol,
        setReplaceCol,
        replaceOld,
        setReplaceOld,
        replaceNew,
        setReplaceNew,
        outlierCols,
        setOutlierCols,
        outlierLower,
        setOutlierLower,
        outlierUpper,
        setOutlierUpper,
        roundCols,
        setRoundCols,
        roundDecimals,
        setRoundDecimals,
        
        // Training
        modelType,
        setModelType,
        selectedFeatures,
        setSelectedFeatures,
        targetVariable,
        setTargetVariable,
        numClusters,
        setNumClusters,
        isTraining,
        trainingResult,
        
        // Visualization
        chartType,
        setChartType,
        selectedScenario,
        setSelectedScenario,
        vXAxis,
        setVXAxis,
        vYAxis,
        setVYAxis,
        vZAxis,
        setVZAxis,
        vCategoryCol,
        setVCategoryCol,
        chartData,
        isVisualizing,
        visualizationKey,
        searchTerm,
        setSearchTerm,
        
        // Handlers
        handleFileUpload,
        handleDrop,
        handleRawDataPaste,
        handleViewPreview,
        handleDeleteDataset,
        handleRunCleanup,
        handleTrainModel,
        handleVisualize,
        handleExport,
        fetchProjectDetail,
        router
    };
};
