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
  issue_type: 'MISSING_VALUE' | 'DUPLICATE' | 'OUTLIER' | 'TYPE_MISMATCH' | 'SEMANTIC_ERROR' | string;
  column_name: string;
  row_index: number | null;
  affected_rows: number | null;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  suggested_fix: string;
  detected_by: 'PANDAS' | 'GEMINI' | 'MANUAL' | string;
  is_user_modified: boolean;
  is_resolved: boolean;
  detected_at: string;
}

export type DiagnoseMethod = 'pandas' | 'gemini' | 'both';

export interface DiagnoseResponse {
  dataset_id: number;
  method: DiagnoseMethod;
  total_issues: number;
  issues_by_column: Record<string, Issue[]>;
}

export interface UpdateIssueRequest {
  issue_type?: string;
  column_name?: string;
  row_index?: number | null;
  affected_rows?: number | null;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  suggested_fix?: string;
  detected_by?: string;
  is_resolved?: boolean;
}
