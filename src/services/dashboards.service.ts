import apiClient from '@/lib/axios';

export type WidgetType = 'bar' | 'line' | 'scatter' | 'histogram' | 'text' | '';

export interface DashboardWidget {
  id: number;
  dashboard: number;
  title: string;
  widget_type: WidgetType;
  dataset: number | null;
  dataset_name?: string | null;
  chart_params: Record<string, any> | null;
  chart_image: string | null;
  annotation: string;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: number;
  user: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  widget_count: number;
}

export interface DashboardDetail extends Dashboard {
  widgets: DashboardWidget[];
}

export interface CreateDashboardPayload {
  title: string;
  description?: string;
}

export interface CreateWidgetPayload {
  title: string;
  widget_type: WidgetType;
  dataset?: number;
  chart_params?: Record<string, any>;
  grid_x?: number;
  grid_y?: number;
  grid_w?: number;
  grid_h?: number;
}

export interface UpdateWidgetPayload {
  title?: string;
  widget_type?: WidgetType;
  chart_params?: Record<string, any>;
  grid_x?: number;
  grid_y?: number;
  grid_w?: number;
  grid_h?: number;
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

  async get(id: number): Promise<DashboardDetail> {
    const res = await apiClient.get(`dashboards/${id}/`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`dashboards/${id}/`);
  },

  async refresh(id: number): Promise<DashboardDetail> {
    const res = await apiClient.post(`dashboards/${id}/refresh/`);
    return res.data;
  },

  async addWidget(dashboardId: number, payload: CreateWidgetPayload): Promise<DashboardWidget> {
    const res = await apiClient.post(`dashboards/${dashboardId}/widgets/`, payload);
    return res.data;
  },

  async updateWidget(dashboardId: number, widgetId: number, payload: UpdateWidgetPayload): Promise<DashboardWidget> {
    const res = await apiClient.patch(`dashboards/${dashboardId}/widgets/${widgetId}/`, payload);
    return res.data;
  },

  async refreshWidget(dashboardId: number, widgetId: number): Promise<DashboardWidget> {
    const res = await apiClient.post(`dashboards/${dashboardId}/widgets/${widgetId}/refresh/`);
    return res.data;
  },

  async deleteWidget(dashboardId: number, widgetId: number): Promise<void> {
    await apiClient.delete(`dashboards/${dashboardId}/widgets/${widgetId}/`);
  },
};
