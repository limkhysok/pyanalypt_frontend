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

export interface PasteDatasetRequest {
  file_name: string;
  raw_data: string;
  format: 'csv' | 'json';
}

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
  column_name?: string;
  issue_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  row_index?: number;
  suggested_fix?: string;
  is_resolved: boolean;
  detected_date: string;
}
