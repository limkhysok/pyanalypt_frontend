import apiClient from '@/lib/axios';

export interface DataLabPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows: number;
  total_columns: number;
}

export interface DataLabInspectColumn {
  column: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
}

export interface DataLabInspect {
  shape: { rows: number; columns: number };
  dtypes: Record<string, string>;
  info: {
    text: string;
    columns: DataLabInspectColumn[];
    memory_usage_bytes: number;
  };
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
};
