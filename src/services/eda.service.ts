import apiClient from '@/lib/axios';

// ─── Correlation ──────────────────────────────────────────────────────────────

export interface CorrelationRow {
  column: string;
  values: Record<string, number>;
}

export interface CorrelationResponse {
  columns: string[];
  method: string;
  matrix: CorrelationRow[];
}

// ─── Distribution ─────────────────────────────────────────────────────────────

export interface DistributionBin {
  range_start: number;
  range_end: number;
  count: number;
}

export interface DistributionColumnStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  bins: DistributionBin[];
}

export type DistributionResponse = Record<string, DistributionColumnStats>;

// ─── Value Counts ─────────────────────────────────────────────────────────────

export interface ValueCountEntry {
  value: string | number | null;
  count: number;
  pct: number;
}

export interface ValueCountsColumnStats {
  total_rows: number;
  null_count: number;
  unique_count: number;
  top_values: ValueCountEntry[];
}

export type ValueCountsResponse = Record<string, ValueCountsColumnStats>;

// ─── Cross-tabulation ─────────────────────────────────────────────────────────

export type CrosstabRow = Record<string, string | number>;

export interface CrosstabResponse {
  gender?: string[];
  department?: string[];
  normalize: boolean;
  table: CrosstabRow[];
  col_a?: string;
  col_b?: string;
}

// ─── Outlier Summary ──────────────────────────────────────────────────────────

export interface OutlierSummaryColumn {
  outlier_count: number;
  outlier_pct: number;
  lower_bound: number;
  upper_bound: number;
  mean: number;
  std: number;
}

export interface OutlierSummaryResponse {
  method: string;
  threshold: number;
  total_rows: number;
  numeric_columns_checked: number;
  columns_with_outliers: number;
  total_outlier_cells: number;
  per_column: Record<string, OutlierSummaryColumn>;
}

// ─── Missing Heatmap ──────────────────────────────────────────────────────────

export interface MissingColumnStat {
  null_count: number;
  null_pct: number;
}

export interface MissingWorstRow {
  row_index: number;
  null_count: number;
}

export interface MissingHeatmapResponse {
  total_rows: number;
  total_columns: number;
  columns_with_nulls: number;
  per_column: Record<string, MissingColumnStat>;
  worst_rows: MissingWorstRow[];
  co_null_pairs: Record<string, number>;
}

// ─── Pairwise Scatter ─────────────────────────────────────────────────────────

export interface ScatterPoint {
  x: number;
  y: number;
}

export interface PairwiseResponse {
  col_x: string;
  col_y: string;
  total_valid_rows: number;
  sampled: number;
  pearson_r: number;
  points: ScatterPoint[];
}

// ─── Association ──────────────────────────────────────────────────────────────

export interface AssociationRow {
  column: string;
  values: Record<string, number>;
}

export interface AssociationResponse {
  columns: string[];
  method: string;
  matrix: AssociationRow[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const edaApi = {
  async correlation(
    datasetId: number,
    params?: { columns?: string[]; method?: 'pearson' | 'spearman' | 'kendall' }
  ): Promise<CorrelationResponse> {
    const query = new URLSearchParams();
    params?.columns?.forEach((c) => query.append('columns', c));
    if (params?.method) query.set('method', params.method);
    const qs = query.toString();
    const res = await apiClient.get(`/eda/correlation/${datasetId}/${qs ? '?' + qs : ''}`);
    return res.data;
  },

  async distribution(
    datasetId: number,
    params?: { columns?: string[]; bins?: number }
  ): Promise<DistributionResponse> {
    const query = new URLSearchParams();
    params?.columns?.forEach((c) => query.append('columns', c));
    if (params?.bins !== undefined) query.set('bins', String(params.bins));
    const qs = query.toString();
    const res = await apiClient.get(`/eda/distribution/${datasetId}/${qs ? '?' + qs : ''}`);
    return res.data;
  },

  async valueCounts(
    datasetId: number,
    params?: { columns?: string[]; top_n?: number }
  ): Promise<ValueCountsResponse> {
    const query = new URLSearchParams();
    params?.columns?.forEach((c) => query.append('columns', c));
    if (params?.top_n !== undefined) query.set('top_n', String(params.top_n));
    const qs = query.toString();
    const res = await apiClient.get(`/eda/value-counts/${datasetId}/${qs ? '?' + qs : ''}`);
    return res.data;
  },

  async crosstab(
    datasetId: number,
    params: { col_a: string; col_b: string; normalize?: boolean }
  ): Promise<CrosstabResponse> {
    const query = new URLSearchParams({ col_a: params.col_a, col_b: params.col_b });
    query.set('normalize', params.normalize ? 'true' : 'false');
    const res = await apiClient.get(`/eda/crosstab/${datasetId}/?${query.toString()}`);
    return res.data;
  },

  async outlierSummary(
    datasetId: number,
    params?: { method?: 'iqr' | 'zscore'; threshold?: number }
  ): Promise<OutlierSummaryResponse> {
    const query = new URLSearchParams();
    if (params?.method) query.set('method', params.method);
    if (params?.threshold !== undefined) query.set('threshold', String(params.threshold));
    const qs = query.toString();
    const res = await apiClient.get(`/eda/outlier-summary/${datasetId}/${qs ? '?' + qs : ''}`);
    return res.data;
  },

  async missingHeatmap(datasetId: number): Promise<MissingHeatmapResponse> {
    const res = await apiClient.get(`/eda/missing-heatmap/${datasetId}/`);
    return res.data;
  },

  async pairwise(
    datasetId: number,
    params: { col_x: string; col_y: string; sample?: number }
  ): Promise<PairwiseResponse> {
    const query = new URLSearchParams({ col_x: params.col_x, col_y: params.col_y });
    if (params.sample !== undefined) query.set('sample', String(params.sample));
    const res = await apiClient.get(`/eda/pairwise/${datasetId}/?${query.toString()}`);
    return res.data;
  },

  async association(
    datasetId: number,
    params?: { columns?: string[] }
  ): Promise<AssociationResponse> {
    const query = new URLSearchParams();
    params?.columns?.forEach((c) => query.append('columns', c));
    const qs = query.toString();
    const res = await apiClient.get(`/eda/association/${datasetId}/${qs ? '?' + qs : ''}`);
    return res.data;
  },
};
