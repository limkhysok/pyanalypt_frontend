import apiClient from '@/lib/axios';

export type ChartType = 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'treemap' | 'kpi' | 'text' | 'report' | '';

export interface DashboardWidget {
  id: number;
  title: string;
  report: number | null; // ID of the embedded report
  chart_type: ChartType;
  chart_params: Record<string, unknown>;
  chart_config: Record<string, unknown> | null;
  text_content: string;
  grid_col: number;
  grid_row: number;
  grid_width: number;
  grid_height: number;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: number;
  title: string;
  description: string;
  dataset: number;
  dataset_name: string;
  is_public: boolean;
  share_token: string; // UUID
  widget_count: number;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export interface CreateDashboardPayload {
  title: string;
  description?: string;
  dataset_id: number;
}

export const dashboardsApi = {
  async list(): Promise<Dashboard[]> {
    const res = await apiClient.get('dashboards/');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async create(payload: CreateDashboardPayload): Promise<Dashboard> {
    const res = await apiClient.post('dashboards/', payload);
    return res.data;
  },

  async get(id: number): Promise<Dashboard> {
    const res = await apiClient.get(`dashboards/${id}/`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`dashboards/${id}/`);
  },

  async refresh(id: number): Promise<Dashboard> {
    const res = await apiClient.post(`dashboards/${id}/refresh/`);
    return res.data;
  },

  async addWidget(dashboardId: number, payload: {
    title: string;
    chart_type: ChartType;
    report_id?: number | null;
    chart_params?: Record<string, unknown>;
    text_content?: string;
    grid_col?: number;
    grid_row?: number;
    grid_width?: number;
    grid_height?: number;
  }): Promise<DashboardWidget> {
    const res = await apiClient.post(`dashboards/${dashboardId}/widgets/`, payload);
    return res.data;
  },

  async updateWidget(dashboardId: number, widgetId: number, payload: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const res = await apiClient.patch(`dashboards/${dashboardId}/widgets/${widgetId}/`, payload);
    return res.data;
  },

  async deleteWidget(dashboardId: number, widgetId: number): Promise<void> {
    await apiClient.delete(`dashboards/${dashboardId}/widgets/${widgetId}/`);
  },

  // Toggle public sharing
  async share(id: number, isPublic?: boolean): Promise<{is_public: boolean, share_token: string}> {
    const res = await apiClient.post(`dashboards/${id}/share/`, { is_public: isPublic });
    return res.data;
  },

  // Fetch a public dashboard (no auth required)
  async getPublic(token: string): Promise<Dashboard> {
    const res = await apiClient.get(`dashboards/public/${token}/`);
    return res.data;
  },
};
