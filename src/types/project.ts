export interface Project {
    id: string; // UUID
    name: string;
    slug: string;
    description: string;
    category: string;
    status: 'active' | 'archived' | 'completed';
    color_code: string;
    thumbnail: string | null;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    settings: Record<string, any>;
    datasets?: Dataset[];
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    category?: string;
    color_code?: string;
    status?: string;
    is_favorite?: boolean;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> { }

export interface Dataset {
    id: number | string;
    project: string;
    file: string | null;
    name: string;
    file_format: string;
    uploaded_at: string;
}

export interface UploadDatasetRequest {
    project: string;
    file: File;
    name?: string;
}

export interface PasteDatasetRequest {
    project: string;
    raw_data: string;
    name?: string;
    format?: string;
}

export interface DatasetPreview {
    columns: string[];
    rows: Record<string, any>[];
    metadata: {
        dtypes: Record<string, string>;
        shape: [number, number];
    };
    summary?: Record<string, any>;
    total_rows_hint: number;
    dataset_id?: number | string; // Returned in cleaning response
    name?: string;               // Returned in cleaning response
}

export type DataOperation = 'handle_na' | 'drop_duplicates' | 'astype';

export interface CleanDatasetRequest {
    pipeline: {
        operation: DataOperation;
        params: Record<string, any>;
    }[];
}
export interface DatasetAnalysis {
    correlations: Record<string, Record<string, number>>;
    missing_values: Record<string, { count: number; percentage: number }>;
    outlier_summary: Record<string, number>;
    metadata: {
        numeric_cols_count: number;
    };
}

export type ModelType = 'kmeans' | 'linear_regression';

export interface TrainModelRequest {
    model_type: ModelType;
    features: string[];
    target?: string;
    params?: Record<string, any>;
}

export interface TrainModelResponse {
    evaluation: {
        model: string;
        [key: string]: any;
    };
    metrics?: Record<string, any>;
    summary?: any;
    new_dataset?: DatasetPreview;
}

export type ChartType = 'scatter' | 'line' | 'bar' | 'scatter3D' | 'pie' | 'stacked_bar';

export interface VisualizeRequest {
    chart_type: ChartType;
    x_axis: string;
    y_axis: string;
    z_axis?: string;
    category_col?: string;
}

export interface VisualizeResponse {
    series?: any[];
    xAxis?: string[];
}
