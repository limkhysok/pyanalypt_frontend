import apiClient from '@/lib/axios';
import {
  Dataset,
  DatasetDetail,
  PasteDatasetRequest,
  CleanDatasetRequest,
  VisualizeDatasetRequest,
  UpdateCellRequest,
  Issue
} from '@/types/dataset';

export const datasetApi = {
  /**
   * Retrieves a list of all datasets owned by the authenticated user.
   */
  async listDatasets(): Promise<Dataset[]> {
    const response = await apiClient.get<Dataset[]>('datasets/');
    return response.data;
  },

  /**
   * Retrieves a single dataset with detailed model fields and a data preview.
   */
  async getDataset(id: number): Promise<DatasetDetail> {
    const response = await apiClient.get<DatasetDetail>(`datasets/${id}/`);
    return response.data;
  },

  /**
   * Update dataset metadata (e.g., renamed file_name).
   */
  async updateDataset(id: number, data: Partial<Dataset>): Promise<Dataset> {
    const response = await apiClient.patch<Dataset>(`datasets/${id}/`, data);
    return response.data;
  },

  /**
   * Permanently delete a dataset and its physical file.
   */
  async deleteDataset(id: number): Promise<void> {
    await apiClient.delete(`datasets/${id}/`);
  },

  /**
   * Manual edit of a specific cell in the dataset.
   */
  async updateCell(id: number, data: UpdateCellRequest): Promise<any> {
    const response = await apiClient.patch(`datasets/${id}/update_cell/`, data);
    return response.data;
  },

  /**
   * Standard multipart/form-data upload using your system's file picker.
   */
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Dataset>('datasets/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Create a dataset by pasting raw CSV/JSON text directly from your clipboard.
   */
  async pasteDataset(data: PasteDatasetRequest): Promise<Dataset> {
    const response = await apiClient.post<Dataset>('datasets/paste/', data);
    return response.data;
  },

  /**
   * Apply cleaning operations. Each operation creates a new version (a child dataset).
   */
  async cleanDataset(id: number, data: CleanDatasetRequest): Promise<Dataset> {
    const response = await apiClient.post<Dataset>(`datasets/${id}/clean/`, data);
    return response.data;
  },

  /**
   * Get stats and chart-ready data for the frontend.
   * Get correlations and missing value reports.
   */
  async analyzeDataset(id: number): Promise<any> {
    const response = await apiClient.get(`datasets/${id}/analyze/`);
    return response.data;
  },

  /**
   * Generate ECharts data for scatter/bar/line/pie.
   */
  async visualizeDataset(id: number, data: VisualizeDatasetRequest): Promise<any> {
    const response = await apiClient.post(`datasets/${id}/visualize/`, data);
    return response.data;
  },

  /**
   * Get the first 10-100 rows for the table view.
   */
  async previewDataset(id: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`datasets/${id}/preview/`);
    return response.data;
  },

  /**
   * Run Pandas + Google Gemini AI diagnosis on the dataset.
   */
  async diagnoseDataset(id: number): Promise<any> {
    const response = await apiClient.get(`datasets/${id}/diagnose/`);
    return response.data;
  },

  /**
   * Search and filter dataset manually for issues.
   */
  async queryDataset(id: number, params: { column?: string; operator?: string; value?: any }): Promise<any[]> {
    const response = await apiClient.get<any[]>(`datasets/${id}/query/`, { params });
    return response.data;
  },

  /**
   * Retrieve all dirty data issues.
   */
  async listIssues(params?: { dataset?: number; is_resolved?: boolean }): Promise<Issue[]> {
    const response = await apiClient.get<Issue[]>('issues/', { params });
    return response.data;
  },

  /**
   * Mark issue as resolved or update severity.
   */
  async updateIssue(id: number, data: Partial<Issue>): Promise<Issue> {
    const response = await apiClient.patch<Issue>(`issues/${id}/`, data);
    return response.data;
  },
};
