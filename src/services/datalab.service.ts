import apiClient from '@/lib/axios';

export interface DataLabPreview {
  dataset_id: number;
  file_name: string;
  file_format: string;
  dataset_size: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface DataLabInspectColumn {
  column: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  null_pct: number;
  unique_count: number;
  is_unique: boolean;
}

export interface DataLabInspect {
  info: {
    columns: DataLabInspectColumn[];
    memory_usage_bytes: number;
  };
}

export interface CastColumnResult {
  column: string;
  from_dtype: string;
  to_dtype: string;
  status: string;
  validation?: { status: string; message: string };
}

export interface CastWarning {
  column: string;
  warning: string;
}

export interface CastResponse {
  updated_columns: CastColumnResult[];
}

export interface CastWarningResponse {
  detail: string;
  warnings: CastWarning[];
  errors: string[];
}

export type DropDuplicatesMode = "all_first" | "all_last" | "subset_keep" | "drop_all";

export interface DropDuplicatesRequest {
  mode: DropDuplicatesMode;
  subset?: string[];
  keep?: "first" | "last";
}

export interface DropDuplicatesResponse {
  rows_before: number;
  rows_after: number;
  rows_dropped: number;
  detail?: string;
}

export interface RenameColumnRequest {
  old_name: string;
  new_name: string;
}

export interface RenameColumnResponse {
  old_name: string;
  new_name: string;
  columns: string[];
}

export interface UpdateCellRequest {
  row_index: number;
  column: string;
  value: unknown;
}

export interface UpdateCellResponse {
  row_index: number;
  column: string;
  value: unknown;
}

export const datalabApi = {
  async preview(datasetId: number): Promise<DataLabPreview> {
    const res = await apiClient.get<DataLabPreview>(`datalab/preview/${datasetId}/`);
    return res.data;
  },

  async inspect(datasetId: number): Promise<DataLabInspect> {
    const res = await apiClient.get<DataLabInspect>(`datalab/inspect/${datasetId}/`);
    return res.data;
  },

  async cast(datasetId: number, casts: Record<string, string>, force = false): Promise<CastResponse> {
    const body: Record<string, unknown> = { casts };
    if (force) body.force = true;
    const res = await apiClient.post<CastResponse>(`datalab/cast/${datasetId}/`, body);
    return res.data;
  },

  async dropDuplicates(datasetId: number, body: DropDuplicatesRequest): Promise<DropDuplicatesResponse> {
    const res = await apiClient.post<DropDuplicatesResponse>(`datalab/drop-duplicates/${datasetId}/`, body);
    return res.data;
  },

  async renameColumn(datasetId: number, body: RenameColumnRequest): Promise<RenameColumnResponse> {
    const res = await apiClient.post<RenameColumnResponse>(`datalab/rename-column/${datasetId}/`, body);
    return res.data;
  },

  async updateCell(datasetId: number, body: UpdateCellRequest): Promise<UpdateCellResponse> {
    const res = await apiClient.patch<UpdateCellResponse>(`datalab/update-cell/${datasetId}/`, body);
    return res.data;
  },
};
