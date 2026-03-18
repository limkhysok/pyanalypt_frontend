export interface Dataset {
  id: number;
  user: number;
  file: string;
  file_name: string;
  file_format: string;
  file_size: number;
  uploaded_date: string;
  updated_date: string;
}

export interface DatasetDetail extends Dataset {
  data_preview: any[];
}

export interface UpdateCellRequest {
  row_index: number;
  column_name: string;
  value: any;
}

export interface UpdateCellResponse {
  detail: string;
  row_index: number;
  column_name: string;
  new_value: any;
}

export interface RenameDatasetRequest {
  file_name: string;
}

export type DatasetExportFormat = 'csv' | 'json' | 'xlsx' | 'parquet';

export interface CleaningPipelineOperation {
  operation: string;
  params: Record<string, any>;
}

export interface CleanDatasetRequest {
  pipeline: CleaningPipelineOperation[];
}

export interface VisualizeDatasetRequest {
  // Add fields based on ECharts data required if known, 
  // but the user description was brief: "Generate ECharts data for scatter/bar/line/pie"
  type: 'scatter' | 'bar' | 'line' | 'pie';
  x_axis?: string;
  y_axis?: string;
  options?: Record<string, any>;
}

export interface Issue {
  id: number;
  dataset: number;
  issue_type:
    | 'MISSING_VALUE'
    | 'DUPLICATE'
    | 'OUTLIER'
    | 'SEMANTIC_ERROR'
    | 'DATA_TYPE'
    | 'INCONSISTENT_FORMATTING'
    | 'INVALID_VALUE'
    | 'WHITESPACE_ISSUE'
    | 'SPECIAL_CHAR_ENCODING'
    | 'INCONSISTENT_NAMING'
    | 'LOGICAL_INCONSISTENCY'
    | string;
  column_name: string;
  row_index: number | null;
  affected_rows: number | null;
  description: string;
  suggested_fix: string;
  detected_at: string;
}

export interface DiagnoseColumnInfo {
  dtype: string;
  non_null_count: number;
  null_count: number;
}

export interface DiagnoseOverview {
  shape: { rows: number; columns: number };
  duplicate_rows: number;
  total_missing: number;
  columns: Record<string, DiagnoseColumnInfo>;
  numeric_summary: Record<string, Record<string, number>>;
}

export interface DiagnoseResponse {
  dataset_id: number;
  overview: DiagnoseOverview;
  total_issues: number;
  issues_by_column: Record<string, Issue[]>;
}

export interface UpdateIssueRequest {
  issue_type?: string;
  column_name?: string;
  row_index?: number | null;
  affected_rows?: number | null;
  description?: string;
  suggested_fix?: string;
}

export interface IssueSummaryResponse {
  dataset_id: number;
  total_issues: number;
  by_type: Record<string, number>;
  by_column: Record<string, number>;
  dataset_level_issues: number;
}
