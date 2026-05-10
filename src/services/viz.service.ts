import apiClient from '@/lib/axios';

export interface VizSeries {
  name: string;
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'treemap';
  data: (number | [number, number])[];
}

export interface VizAxis {
  type: 'category' | 'value' | 'time' | 'log';
  name: string;
  data?: string[];
}

export interface VizBarResponse {
  chart_type: 'bar';
  xAxis: VizAxis;
  yAxis: VizAxis;
  series: VizSeries[];
}

export interface VizLineResponse {
  chart_type: 'line';
  xAxis: VizAxis;
  yAxis: VizAxis;
  series: VizSeries[];
}

export interface VizScatterResponse {
  chart_type: 'scatter';
  xAxis: VizAxis;
  yAxis: VizAxis;
  pearson_r: number | null;
  series: VizSeries[];
}

export interface VizHistogramStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
}

export interface VizHistogramColumn {
  chart_type: 'histogram';
  xAxis: VizAxis;
  yAxis: VizAxis;
  series: VizSeries[];
  stats: VizHistogramStats;
}

export interface VizPieResponse {
  chart_type: 'pie';
  series: { name: string; value: number }[];
}

export interface VizTreemapResponse {
  chart_type: 'treemap';
  series: { name: string; value: number }[]; // Simpler flat treemap for now
}

export interface VizKPIMetrics {
  label: string;
  value: number;
  formatted_value: string;
  unit?: string;
  trend?: number; // percentage change
}

export interface VizKPIResponse {
  chart_type: 'kpi';
  metrics: VizKPIMetrics;
}

export type VizHistogramResponse = Record<string, VizHistogramColumn>;

export const vizApi = {
  async bar(datasetId: number, params: {
    x_col: string;
    y_col: string;
    agg?: string;
    group_by?: string;
    limit?: number;
  }): Promise<VizBarResponse> {
    const q = new URLSearchParams({ x_col: params.x_col, y_col: params.y_col });
    if (params.agg) q.set('agg', params.agg);
    if (params.group_by) q.set('group_by', params.group_by);
    if (params.limit !== undefined) q.set('limit', String(params.limit));
    const res = await apiClient.get(`viz/bar/${datasetId}/?${q}`);
    return res.data;
  },

  async line(datasetId: number, params: {
    x_col: string;
    y_cols: string[];
    sort?: boolean;
  }): Promise<VizLineResponse> {
    const q = new URLSearchParams({ x_col: params.x_col });
    params.y_cols.forEach(c => q.append('y_cols', c));
    if (params.sort !== undefined) q.set('sort', params.sort ? 'true' : 'false');
    const res = await apiClient.get(`viz/line/${datasetId}/?${q}`);
    return res.data;
  },

  async scatter(datasetId: number, params: {
    col_x: string;
    col_y: string;
    color_by?: string;
    sample?: number;
  }): Promise<VizScatterResponse> {
    const q = new URLSearchParams({ col_x: params.col_x, col_y: params.col_y });
    if (params.color_by) q.set('color_by', params.color_by);
    if (params.sample !== undefined) q.set('sample', String(params.sample));
    const res = await apiClient.get(`viz/scatter/${datasetId}/?${q}`);
    return res.data;
  },

  async histogram(datasetId: number, params: {
    columns?: string[];
    bins?: number;
  }): Promise<VizHistogramResponse> {
    const q = new URLSearchParams();
    params.columns?.forEach(c => q.append('columns', c));
    if (params.bins !== undefined) q.set('bins', String(params.bins));
    const qs = q.toString();
    const queryPart = qs ? `?${qs}` : '';
    const res = await apiClient.get(`viz/histogram/${datasetId}/${queryPart}`);
    return res.data;
  },

  async pie(datasetId: number, params: {
    name_col: string;
    value_col: string;
    agg?: string;
    limit?: number;
  }): Promise<VizPieResponse> {
    const q = new URLSearchParams({ name_col: params.name_col, value_col: params.value_col });
    if (params.agg) q.set('agg', params.agg);
    if (params.limit) q.set('limit', String(params.limit));
    const res = await apiClient.get(`viz/pie/${datasetId}/?${q}`);
    return res.data;
  },

  async treemap(datasetId: number, params: {
    name_col: string;
    value_col: string;
    agg?: string;
  }): Promise<VizTreemapResponse> {
    const q = new URLSearchParams({ name_col: params.name_col, value_col: params.value_col });
    if (params.agg) q.set('agg', params.agg);
    const res = await apiClient.get(`viz/treemap/${datasetId}/?${q}`);
    return res.data;
  },

  async kpi(datasetId: number, params: {
    value_col: string;
    agg?: string;
    label?: string;
  }): Promise<VizKPIResponse> {
    const q = new URLSearchParams({ value_col: params.value_col });
    if (params.agg) q.set('agg', params.agg);
    if (params.label) q.set('label', params.label);
    const res = await apiClient.get(`viz/kpi/${datasetId}/?${q}`);
    return res.data;
  },
};
