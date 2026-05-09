export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Dataset {
  id: number;
  user: number;
  file: string;
  file_name: string;
  file_format: string;
  file_size: number;
  uploaded_date: string;
  updated_date: string;
  datalab_issues?: Issue[];
  wrangle_ops?: WrangleOperation[];
}

export interface Issue {
  id: number;
  issue_type: string;
  column_name: string | null;
  affected_rows: number | null;
  description: string;
  suggested_fix?: string;
}

export interface DiagnoseOverview {
  shape: { rows: number; columns: number };
  duplicate_rows: number;
  total_missing: number;
  columns?: Record<string, { dtype: string; null_count: number }>;
  numeric_summary?: Record<string, { mean: number; std: number; min: number; max: number }>;
}

export interface DiagnoseResponse {
  dataset_id: number;
  overview: DiagnoseOverview;
  total_issues: number;
  issues: Issue[];
}

export interface IssueSummaryResponse {
  total_issues: number;
  dataset_level_issues: number;
  by_column: Record<string, number>;
  by_type: Record<string, number>;
}

export interface WrangleOperation {
  id: number;
  dataset: number;
  issue: number | null;
  operation_type: string;
  column_name: string;
  parameters: Record<string, unknown>;
  rows_affected: number | null;
  status: "PENDING" | "APPLIED" | "FAILED" | "REVERTED";
  applied_at: string | null;
  created_at: string;
}

export interface RenameDatasetRequest {
  file_name: string;
}

export interface DuplicateDatasetRequest {
  new_file_name?: string;
  format?: DatasetExportFormat;
}

export type DatasetExportFormat = 'csv' | 'json' | 'xlsx' | 'parquet';

export interface DatasetActivityLog {
  id: number;
  user: number;
  dataset: number | null;
  dataset_name_snap: string;
  action: 'UPLOAD' | 'RENAME' | 'DELETE' | 'DUPLICATE' | 'EXPORT'
    | 'CAST' | 'RENAME_COLUMN' | 'DROP_DUPLICATES' | 'REPLACE_VALUES'
    | 'DROP_NULLS' | 'FILL_NULLS' | 'FILL_DERIVED' | 'FIX_FORMULA'
    | 'TRIM_OUTLIERS' | 'IMPUTE_OUTLIERS' | 'CAP_OUTLIERS' | 'TRANSFORM_COLUMN'
    | 'DROP_COLUMNS' | 'ADD_COLUMN' | 'FILTER_ROWS' | 'CLEAN_STRING'
    | 'SCALE_COLUMNS' | 'EXTRACT_DATETIME' | 'ENCODE_COLUMNS' | 'NORMALIZE_COLUMN_NAMES'
    | 'AI_ANALYSIS';
  details: Record<string, unknown>;
  timestamp: string;
}

export interface DatasetFrame {
    id: number;
    dataset: number;
    prompt_snap: string;
    model_used: string;
    result: string;
    response_json: unknown;
    created_at: string;
}

export type DataOperation = 'handle_na' | 'drop_duplicates' | 'astype';

export interface WrangleDatasetRequest {
    pipeline: {
        operation: DataOperation;
        params: Record<string, unknown>;
    }[];
}

export interface VisualizeDatasetRequest {
    chart_type: 'scatter' | 'line' | 'bar' | 'scatter3D' | 'pie' | 'stacked_bar';
    x_axis: string;
    y_axis: string;
    z_axis?: string;
    category_col?: string;
}

export interface UpdateCellResponse {
    success: boolean;
    row_index: number;
    column_name: string;
    new_value: unknown;
}


export interface WorkspaceSummaryStat {
  value: string;
  trend: string;
  trend_up: boolean;
  /** Only present on the storage_used stat. */
  label?: string;
  /** Only present on the storage_used stat (0–100). */
  pct?: number;
}

export interface WorkspaceSummaryDataset {
  id: number;
  name: string;
  status: string;
  updated: string;
  rows?: number;
}

export interface WorkspaceSummaryActivity {
  action: DatasetActivityLog['action'];
  label: string;
  sub: string;
  time: string;
}

export interface WorkspaceSummary {
  stats: {
    total_datasets: WorkspaceSummaryStat;
    total_analyses: WorkspaceSummaryStat;
    total_insights: WorkspaceSummaryStat;
    storage_used: WorkspaceSummaryStat;
  };
  recent_datasets: WorkspaceSummaryDataset[];
  activity_feed: WorkspaceSummaryActivity[];
  chart_data: {
    days: string[];
    analyses: number[];
    datasets: number[];
  };
}
