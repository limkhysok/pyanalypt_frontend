import apiClient from '@/lib/axios';
import axios from 'axios';
import {
  Dataset,
  DatasetDetail,
  RenameDatasetRequest,
  CleanDatasetRequest,
  VisualizeDatasetRequest,
  UpdateCellRequest,
  UpdateCellResponse,
  DatasetExportFormat,
  Issue,
  DiagnoseResponse,
  UpdateIssueRequest,
  IssueSummaryResponse
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
   * Rename dataset display file name.
   */
  async renameDataset(id: number, data: RenameDatasetRequest): Promise<Dataset> {
    const response = await apiClient.patch<Dataset>(`datasets/${id}/rename/`, data);
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
  async updateCell(id: number, data: UpdateCellRequest): Promise<UpdateCellResponse> {
    const response = await apiClient.post<UpdateCellResponse>(`datasets/${id}/update_cell/`, data);
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
   * Get the first N rows for the table view.
   * API contract: default=10, max=1000.
   */
  async previewDataset(id: number, rows?: number): Promise<any[]> {
    const normalizedRows = rows === undefined ? undefined : Math.min(1000, Math.max(1, rows));
    const response = await apiClient.get<any[]>(`datasets/${id}/preview/`, {
      params: normalizedRows ? { rows: normalizedRows } : undefined,
    });
    return response.data;
  },

  /**
   * Download dataset file in a requested export format.
   */
  async exportDataset(id: number, format?: DatasetExportFormat): Promise<{ blob: Blob; filename: string | null; contentType: string | null }> {
    const requestedFormat = format?.toLowerCase();

    try {
      const response = await apiClient.get<Blob>(`datasets/${id}/export/`, {
        params: requestedFormat ? { format: requestedFormat } : undefined,
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] as string | undefined;
      const filenameMatch = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || filenameMatch?.[2] || null;
      const contentType = (response.headers['content-type'] as string | undefined) ?? null;

      return {
        blob: response.data,
        filename,
        contentType,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Export endpoint not found for format: ${requestedFormat ?? 'default'}`);
      }
      throw error;
    }
  },

  /**
   * Run diagnosis scan for a dataset and create issue records.
   */
  async diagnoseDataset(id: number): Promise<DiagnoseResponse> {
    const response = await apiClient.post<DiagnoseResponse>(`issues/diagnose/${id}/`);
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
  async listIssues(params?: { dataset?: number }): Promise<Issue[]> {
    const response = await apiClient.get<Issue[]>('issues/', { params });
    return response.data;
  },

  /**
   * Get a single issue by ID.
   */
  async getIssue(id: number): Promise<Issue> {
    const response = await apiClient.get<Issue>(`issues/${id}/`);
    return response.data;
  },

  /**
   * Update writable fields on an issue.
   */
  async updateIssue(id: number, data: UpdateIssueRequest): Promise<Issue> {
    const response = await apiClient.patch<Issue>(`issues/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an issue.
   */
  async deleteIssue(id: number): Promise<void> {
    await apiClient.delete(`issues/${id}/`);
  },

  /**
   * Get aggregated issue summary/stats for a dataset.
   */
  async getIssueSummary(datasetId: number): Promise<IssueSummaryResponse> {
    const response = await apiClient.get<IssueSummaryResponse>(`issues/summary/${datasetId}/`);
    return response.data;
  },
};
