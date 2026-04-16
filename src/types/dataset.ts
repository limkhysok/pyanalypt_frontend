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

export interface RenameDatasetRequest {
  file_name: string;
}

export interface DuplicateDatasetRequest {
  new_file_name?: string;
  format?: DatasetExportFormat;
}

export type DatasetExportFormat = 'csv' | 'json' | 'xlsx' | 'parquet' | 'sql';

export interface DatasetActivityLog {
  id: number;
  user: number;
  dataset: number | null;
  dataset_name_snap: string;
  action: 'UPLOAD' | 'RENAME' | 'DELETE' | 'DUPLICATE' | 'EXPORT';
  details: Record<string, any>;
  timestamp: string;
}

