import apiClient from '@/lib/axios';

export type ChartType = 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'treemap' | 'kpi' | 'text';

export interface Report {
  id: number;
  title: string;
  description: string | null;
  dataset: number | null;
  dataset_name?: string | null;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportItem {
  id: number;
  order: number;
  chart_type: ChartType;
  chart_params: Record<string, unknown> | null;
  chart_image: string | null;
  annotation: string;
}

export interface ReportDetail extends Omit<Report, 'item_count'> {
  items: ReportItem[];
}

export interface CreateReportPayload {
  title: string;
  description?: string;
  dataset?: number;
}

export interface CreateItemPayload {
  order?: number;
  chart_type: ChartType;
  chart_params?: Record<string, unknown>;
  chart_image?: string;
  annotation?: string;
}

export interface UpdateItemPayload {
  order?: number;
  chart_type?: ChartType;
  chart_params?: Record<string, unknown>;
  chart_image?: string;
  annotation?: string;
}

export const reportsApi = {
  async list(): Promise<Report[]> {
    const res = await apiClient.get('reports/');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async create(payload: CreateReportPayload): Promise<Report> {
    const res = await apiClient.post('reports/', payload);
    return res.data;
  },

  async get(id: number): Promise<ReportDetail> {
    const res = await apiClient.get(`reports/${id}/`);
    return res.data;
  },

  async update(id: number, payload: { title?: string; description?: string }): Promise<Report> {
    const res = await apiClient.patch(`reports/${id}/`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`reports/${id}/`);
  },

  async addItem(reportId: number, payload: CreateItemPayload): Promise<ReportItem> {
    const res = await apiClient.post(`reports/${reportId}/items/`, payload);
    return res.data;
  },

  async updateItem(reportId: number, itemId: number, payload: UpdateItemPayload): Promise<ReportItem> {
    const res = await apiClient.patch(`reports/${reportId}/items/${itemId}/`, payload);
    return res.data;
  },

  async deleteItem(reportId: number, itemId: number): Promise<void> {
    await apiClient.delete(`reports/${reportId}/items/${itemId}/`);
  },

  async exportPdf(reportId: number): Promise<{ blob: Blob; filename: string }> {
    const res = await apiClient.get(`reports/${reportId}/export/`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const match = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const filename = match?.[1] || match?.[2] || `report_${reportId}.pdf`;
    return { blob: res.data, filename };
  },
};
