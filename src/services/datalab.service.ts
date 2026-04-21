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
}

export interface CastResponse {
  updated_columns: CastColumnResult[];
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

  async cast(datasetId: number, casts: Record<string, string>): Promise<CastResponse> {
    const res = await apiClient.post<CastResponse>(`datalab/cast/${datasetId}/`, { casts });
    return res.data;
  },
};
